const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const { isConfigured: cashfreeConfigured, cashfreeRequest, CASHFREE_ENV } = require("../config/cashfree");
const Cart = require("../models/Cart");
const { getShippingQuote } = require("../utils/shippingCalculator");
const { validateCoupon } = require("../utils/couponValidator");

// Shared helper — given a user + cart, computes the same server-trusted total
// used by both the Razorpay and Cashfree order-creation routes below (never
// trust an amount sent by the client).
async function computeCartTotal(req) {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    const err = new Error("Cart is empty");
    err.status = 400;
    throw err;
  }
  const itemsSubtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const { shippingCost } = await getShippingQuote(req.body.city, itemsSubtotal);

  let discountAmount = 0;
  if (req.body.couponCode) {
    try {
      const result = await validateCoupon(req.body.couponCode, itemsSubtotal);
      discountAmount = result.discountAmount;
    } catch (err) {
      // invalid coupon at this stage just means no discount, checkout will re-validate again
    }
  }
  return Math.max(0, itemsSubtotal + shippingCost - discountAmount);
}

// @route POST /api/payments/create-order
// Creates a real Razorpay order for the CURRENT logged-in user's cart total
// (server computes the amount itself — never trust an amount sent by the
// client) so the Razorpay Checkout popup can open on the frontend.
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message:
          "Payment gateway is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env (see .env.example).",
      });
    }

    const totalAmount = await computeCartTotal(req);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    // Razorpay's SDK throws a non-standard error shape ({ statusCode, error: { description } } )
    // rather than a plain Error, so error.message is usually empty — dig out the real reason.
    const reason = error?.error?.description || error?.message || "Unknown error";
    console.error("Razorpay order creation failed:", error);
    res.status(error.status || 500).json({ message: error.status ? reason : `Failed to create payment order: ${reason}` });
  }
};

// Shared helper — verifies the HMAC-SHA256 signature Razorpay sends back
// after a successful checkout, proving the payment actually happened and
// wasn't forged client-side. Used by orderController.placeOrder.
exports.verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return expected === razorpaySignature;
};

// @route POST /api/payments/create-cashfree-order
// Same idea as createRazorpayOrder above, but for Cashfree: creates a
// Cashfree order for the current cart total and returns the
// payment_session_id the frontend needs to open Cashfree's Checkout.
exports.createCashfreeOrder = async (req, res) => {
  try {
    if (!cashfreeConfigured()) {
      return res.status(500).json({
        message:
          "Cashfree is not configured yet. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to backend/.env (see .env.example).",
      });
    }

    const totalAmount = await computeCartTotal(req);
    const orderId = `order_${req.user._id.toString().slice(-6)}_${Date.now()}`;

    const cfOrder = await cashfreeRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(totalAmount.toFixed(2)),
        order_currency: "INR",
        customer_details: {
          customer_id: req.user._id.toString(),
          customer_email: req.user.email || "guest@example.com",
          customer_phone: req.body.phone || "9999999999",
        },
        order_meta: {
          // Modal checkout (opened via the JS SDK) doesn't navigate away, but
          // Cashfree still requires a return_url on the order.
          return_url: `${req.protocol}://${req.get("host")}/order-status.html?cf_order_id={order_id}`,
        },
      }),
    });

    res.json({
      cashfreeOrderId: cfOrder.order_id,
      paymentSessionId: cfOrder.payment_session_id,
      env: CASHFREE_ENV, // "TEST" or "PRODUCTION" — tells the frontend SDK which mode to run in
    });
  } catch (error) {
    const reason = error?.cashfreeResponse?.message || error.message || "Unknown error";
    console.error("Cashfree order creation failed:", error);
    res.status(error.status || 500).json({ message: `Failed to create payment order: ${reason}` });
  }
};

// Shared helper — used by orderController.placeOrder. Unlike Razorpay's
// HMAC signature (verified locally), Cashfree's recommended server-side
// check is to call back to their API and confirm a payment actually
// succeeded for that order, rather than trust anything the client sends.
exports.verifyCashfreePayment = async ({ cashfreeOrderId }) => {
  if (!cashfreeOrderId) return { verified: false };
  try {
    const payments = await cashfreeRequest(`/orders/${cashfreeOrderId}/payments`, { method: "GET" });
    const successfulPayment = Array.isArray(payments)
      ? payments.find((p) => p.payment_status === "SUCCESS")
      : null;
    if (!successfulPayment) return { verified: false };
    return { verified: true, cashfreePaymentId: String(successfulPayment.cf_payment_id) };
  } catch (err) {
    console.error("Cashfree payment verification failed:", err);
    return { verified: false };
  }
};
