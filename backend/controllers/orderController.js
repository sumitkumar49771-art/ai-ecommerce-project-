const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Settings = require("../models/Settings");
const { getShippingQuote } = require("../utils/shippingCalculator");
const { validateCoupon } = require("../utils/couponValidator");
const { verifyRazorpaySignature } = require("./paymentController");
const razorpay = require("../config/razorpay");
const { sendEmail } = require("../utils/emailService");

// Small shared formatter for order confirmation / status update emails.
function orderEmailHtml(order, heading, extraLine = "") {
  const itemsHtml = order.items
    .map((i) => `<li>${i.name} × ${i.quantity} — ₹${i.price * i.quantity}</li>`)
    .join("");
  return `
    <h2>${heading}</h2>
    <p>Order #${order._id.toString().slice(-6)}</p>
    ${extraLine ? `<p>${extraLine}</p>` : ""}
    <ul>${itemsHtml}</ul>
    <p><strong>Total: ₹${order.totalAmount}</strong></p>
    <p>Payment: ${order.paymentMethod}${order.isPaid ? " (Paid)" : " (Pending)"}</p>
    <p>Shipping to: ${order.shippingAddress?.addressLine || ""}, ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}</p>
  `;
}

// @route POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      couponCode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Guard against out-of-stock items sneaking through to checkout
    for (const i of cart.items) {
      if (!i.product || i.product.stock < i.quantity) {
        return res.status(400).json({ message: `${i.product?.name || "An item"} is out of stock` });
      }
    }

    const settings = await Settings.findOne().lean();
    const commissionRate = settings?.sellerCommissionRate ?? 10;

    const items = cart.items.map((i) => {
      const lineTotal = i.product.price * i.quantity;
      const hasSeller = !!i.product.seller;
      const commissionAmount = hasSeller ? Math.round(lineTotal * (commissionRate / 100) * 100) / 100 : 0;
      return {
        product: i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
        seller: i.product.seller || null,
        commissionRate: hasSeller ? commissionRate : 0,
        commissionAmount,
        sellerEarning: hasSeller ? Math.round((lineTotal - commissionAmount) * 100) / 100 : 0,
      };
    });

    const itemsSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const { shippingCost, etaDays, zoneName } = await getShippingQuote(shippingAddress.city, itemsSubtotal);

    // Coupon is re-validated here server-side (never trust a discount amount sent from the client)
    let discountAmount = 0;
    let appliedCouponCode;
    if (couponCode) {
      const result = await validateCoupon(couponCode, itemsSubtotal);
      discountAmount = result.discountAmount;
      appliedCouponCode = result.coupon.code;
    }

    const totalAmount = Math.max(0, itemsSubtotal + shippingCost - discountAmount);

    // COD stays unpaid until delivery, as before. UPI/Card orders must come
    // with a real Razorpay payment that we verify server-side — never trust
    // an "isPaid" flag sent from the client.
    let isPaid = false;
    if (paymentMethod && paymentMethod !== "COD") {
      const verified = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
      if (!verified) {
        return res.status(400).json({ message: "Payment verification failed. Please try again." });
      }
      isPaid = true;
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      itemsSubtotal,
      shippingCost,
      shippingZoneName: zoneName,
      estimatedDeliveryDays: etaDays,
      couponCode: appliedCouponCode,
      discountAmount,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      isPaid,
      paidAt: isPaid ? new Date() : undefined,
      razorpayOrderId: isPaid ? razorpayOrderId : undefined,
      razorpayPaymentId: isPaid ? razorpayPaymentId : undefined,
      razorpaySignature: isPaid ? razorpaySignature : undefined,
      statusHistory: [{ status: "pending", note: "Order placed successfully" }],
    });

    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate({ code: appliedCouponCode }, { $inc: { usedCount: 1 } });
    }

    // Decrement stock
    await Promise.all(
      items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } }))
    );

    cart.items = [];
    await cart.save();

    // Fire-and-forget: don't make the customer wait on email delivery, and
    // don't fail the order if the email bounces or isn't configured yet.
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed — #${order._id.toString().slice(-6)}`,
      html: orderEmailHtml(order, `Thanks for your order, ${req.user.name}!`, "We've received your order and it's now being processed."),
    }).catch(() => {});

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/cancel (user — only own, only if not shipped/delivered yet)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: `Order already ${order.status}, cannot be cancelled` });
    }

    order.status = "cancelled";
    order.cancelReason = req.body.reason || "Cancelled by customer";
    order.statusHistory.push({ status: "cancelled", note: order.cancelReason });

    // Real refund: if this order was actually paid online via Razorpay
    // (UPI/Card), refund it automatically the moment it's cancelled — the
    // customer already paid, so cancelling shouldn't leave their money
    // stuck waiting for a separate return/refund step. COD orders were
    // never charged through a gateway, so there is nothing to refund.
    if (order.paymentMethod !== "COD" && order.isPaid && order.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.totalAmount * 100), // paise
          speed: "optimum",
        });
        order.razorpayRefundId = refund.id;
        order.refundStatus = "refunded";
        order.refundAmount = order.totalAmount;
        order.refundedAt = new Date();
        order.statusHistory.push({
          status: "cancelled",
          note: `₹${order.totalAmount} refunded via Razorpay (refund id: ${refund.id}).`,
        });
      } catch (err) {
        // Gateway call failed — do NOT claim the money was refunded.
        // Leave it pending so the admin can see it needs manual follow-up.
        order.refundStatus = "pending";
        order.statusHistory.push({
          status: "cancelled",
          note: `Order cancelled, but the Razorpay refund call failed: ${err.message || err}. Needs manual follow-up.`,
        });
      }
    }

    await order.save();

    // Restock the cancelled items
    await Promise.all(
      order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } }))
    );

    // Notify the customer that their cancellation went through
    sendEmail({
      to: req.user.email,
      subject: `Order Cancelled — #${order._id.toString().slice(-6)}`,
      html: orderEmailHtml(order, "Your order was cancelled", order.cancelReason),
    }).catch(() => {});

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/return-request (user — only own order, only if delivered)
exports.requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to return this order" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    if (order.returnStatus !== "none") {
      return res.status(400).json({ message: `A return has already been ${order.returnStatus} for this order` });
    }

    const reason = (req.body.reason || "").trim();
    if (!reason) {
      return res.status(400).json({ message: "Please provide a reason for the return" });
    }

    order.returnStatus = "requested";
    order.returnReason = reason;
    order.returnRequestedAt = new Date();
    order.refundStatus = "pending";
    order.statusHistory.push({ status: "delivered", note: `Return requested by customer: ${reason}` });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/return-decision (admin — approve or reject a return request)
exports.decideReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.returnStatus !== "requested") {
      return res.status(400).json({ message: "No pending return request for this order" });
    }

    const { decision, note } = req.body; // decision: "approve" | "reject"
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approve' or 'reject'" });
    }

    if (decision === "approve") {
      order.returnStatus = "approved";
      order.status = "returned";
      order.returnDecisionAt = new Date();
      order.returnDecisionNote = note || "";

      // Real refund: if this order was actually paid online via Razorpay
      // (UPI/Card), call Razorpay's Refunds API for real — no simulation.
      // COD orders were never charged through a gateway, so there is
      // nothing to call; the admin is expected to hand back the cash and
      // this just records that the refund is complete on our side.
      if (order.paymentMethod !== "COD" && order.isPaid && order.razorpayPaymentId) {
        try {
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.totalAmount * 100), // paise
            speed: "optimum",
          });
          order.razorpayRefundId = refund.id;
          order.refundStatus = "refunded";
          order.refundAmount = order.totalAmount;
          order.refundedAt = new Date();
          order.statusHistory.push({
            status: "returned",
            note: `Return approved by admin. ₹${order.totalAmount} refunded via Razorpay (refund id: ${refund.id}).`,
          });
        } catch (err) {
          // Gateway call failed — do NOT claim the money was refunded.
          // Leave it pending so the admin can see it needs manual follow-up.
          order.refundStatus = "pending";
          order.statusHistory.push({
            status: "returned",
            note: `Return approved, but the Razorpay refund call failed: ${err.message || err}. Needs manual follow-up.`,
          });
        }
      } else {
        // COD order — nothing was collected online, so mark as refunded
        // once the admin has physically returned the cash.
        order.refundStatus = "refunded";
        order.refundAmount = order.totalAmount;
        order.refundedAt = new Date();
        order.statusHistory.push({
          status: "returned",
          note: `Return approved by admin. ₹${order.totalAmount} refund (COD — cash returned) recorded.`,
        });
      }

      // Restock the returned items
      await Promise.all(
        order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } }))
      );
    } else {
      order.returnStatus = "rejected";
      order.refundStatus = "not_applicable";
      order.returnDecisionAt = new Date();
      order.returnDecisionNote = note || "";
      order.statusHistory.push({
        status: order.status,
        note: `Return request rejected by admin${note ? `: ${note}` : ""}`,
      });
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { status } = req.body;
    const wasAlreadyCancelledOrReturned = ["cancelled", "returned"].includes(order.status);
    order.status = status || order.status;

    const STATUS_UPDATE_NOTES = {
      pending: "Order confirmed and awaiting processing.",
      processing: "Your order is being packed by our team.",
      shipped: "Order has been handed over to the courier partner.",
      delivered: "Order has been delivered successfully.",
    };
    order.statusHistory.push({
      status: order.status,
      note: STATUS_UPDATE_NOTES[order.status] || "Order status updated by our team.",
    });
    if (status === "delivered") order.isPaid = true;

    // Admin manually cancelling an order (e.g. out of stock, fraud check)
    // needs the exact same real refund + restock treatment as a
    // customer-initiated cancel — the customer already paid either way.
    if (status === "cancelled" && !wasAlreadyCancelledOrReturned) {
      if (order.paymentMethod !== "COD" && order.isPaid && order.razorpayPaymentId) {
        try {
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.totalAmount * 100), // paise
            speed: "optimum",
          });
          order.razorpayRefundId = refund.id;
          order.refundStatus = "refunded";
          order.refundAmount = order.totalAmount;
          order.refundedAt = new Date();
          order.statusHistory.push({
            status: "cancelled",
            note: `Cancelled by admin. ₹${order.totalAmount} refunded via Razorpay (refund id: ${refund.id}).`,
          });
        } catch (err) {
          order.refundStatus = "pending";
          order.statusHistory.push({
            status: "cancelled",
            note: `Cancelled by admin, but the Razorpay refund call failed: ${err?.error?.description || err.message || err}. Needs manual follow-up.`,
          });
        }
      } else if (order.isPaid) {
        // COD order already marked paid — nothing to call online, just record it.
        order.refundStatus = "refunded";
        order.refundAmount = order.totalAmount;
        order.refundedAt = new Date();
        order.statusHistory.push({
          status: "cancelled",
          note: `Cancelled by admin. ₹${order.totalAmount} refund (COD — cash returned) recorded.`,
        });
      }

      // Restock the cancelled items
      await Promise.all(
        order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } }))
      );
    }

    await order.save();

    // Notify the customer for the statuses they'd actually want to know about.
    if (["shipped", "delivered", "cancelled"].includes(status)) {
      const User = require("../models/User");
      const customer = await User.findById(order.user).select("email name");
      if (customer) {
        const headings = {
          shipped: "Your order has shipped! 🚚",
          delivered: "Your order has been delivered ✅",
          cancelled: "Your order was cancelled",
        };
        sendEmail({
          to: customer.email,
          subject: `${headings[status]} — Order #${order._id.toString().slice(-6)}`,
          html: orderEmailHtml(order, headings[status]),
        }).catch(() => {});
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/analytics (admin) — powers the Admin Dashboard charts
exports.getAnalytics = async (req, res) => {
  try {
    const [statusBreakdown, revenueByDay, topCategories, topSellingProducts, totals, commissionTotals] = await Promise.all([
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$productInfo.category",
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 },
      ]),
      // Top Selling Products — by units sold, across all orders
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
      ]),
      // Platform commission earned from marketplace sellers' items (items with a
      // seller set). This is the "cut" the platform keeps on every third-party sale.
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $match: { "items.seller": { $ne: null } } },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: "$items.commissionAmount" },
            totalSellerSalesValue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            unitsSoldBySellers: { $sum: "$items.quantity" },
          },
        },
      ]),
    ]);

    res.json({
      statusBreakdown,
      revenueByDay,
      topCategories,
      topSellingProducts,
      totalRevenue: totals[0]?.totalRevenue || 0,
      totalOrders: totals[0]?.totalOrders || 0,
      platformCommission: {
        totalCommission: commissionTotals[0]?.totalCommission || 0,
        totalSellerSalesValue: commissionTotals[0]?.totalSellerSalesValue || 0,
        unitsSoldBySellers: commissionTotals[0]?.unitsSoldBySellers || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/seller/earnings (any logged-in user)
// Powers the "Earnings" panel in the Seller Hub — how much this user has
// sold, how much the platform's commission took, and their net payout.
exports.getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const [summary, recentSales] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $match: { "items.seller": sellerId } },
        {
          $group: {
            _id: null,
            totalSalesValue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            totalCommission: { $sum: "$items.commissionAmount" },
            totalEarnings: { $sum: "$items.sellerEarning" },
            unitsSold: { $sum: "$items.quantity" },
            ordersCount: { $addToSet: "$_id" },
          },
        },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.seller": sellerId } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $project: {
            orderId: "$_id",
            createdAt: 1,
            status: 1,
            name: "$items.name",
            quantity: "$items.quantity",
            price: "$items.price",
            commissionAmount: "$items.commissionAmount",
            sellerEarning: "$items.sellerEarning",
          },
        },
      ]),
    ]);

    const s = summary[0];
    res.json({
      totalSalesValue: s?.totalSalesValue || 0,
      totalCommission: s?.totalCommission || 0,
      totalEarnings: s?.totalEarnings || 0,
      unitsSold: s?.unitsSold || 0,
      ordersCount: s?.ordersCount?.length || 0,
      commissionRate: (await Settings.findOne().lean())?.sellerCommissionRate ?? 10,
      recentSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
