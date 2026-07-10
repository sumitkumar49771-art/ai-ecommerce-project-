const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Cart = require("../models/Cart");
const { getShippingQuote } = require("../utils/shippingCalculator");
const { validateCoupon } = require("../utils/couponValidator");

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

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const itemsSubtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    const { shippingCost } = await getShippingQuote(req.body.city, itemsSubtotal);

    let discountAmount = 0;
    if (req.body.couponCode) {
      try {
        const result = await validateCoupon(req.body.couponCode, itemsSubtotal);
        discountAmount = result.discountAmount;
      } catch (err) {
        // invalid coupon at this stage just means no discount, checkout will
        // re-validate again anyway
      }
    }

    const totalAmount = Math.max(0, itemsSubtotal + shippingCost - discountAmount);

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
    res.status(500).json({ message: `Failed to create payment order: ${reason}` });
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
