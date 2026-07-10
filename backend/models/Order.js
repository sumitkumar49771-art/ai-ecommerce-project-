const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    itemsSubtotal: { type: Number }, // product total, before shipping is added
    shippingCost: { type: Number, default: 0 },
    shippingZoneName: String,
    estimatedDeliveryDays: Number,
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: "India" },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    // Timeline used by the Order Tracking UI
    statusHistory: [
      {
        status: String,
        note: String,
        date: { type: Date, default: Date.now },
      },
    ],
    paymentMethod: { type: String, enum: ["COD", "UPI", "Card"], default: "COD" },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    cancelReason: String,

    // ---- Real Razorpay payment tracking (UPI/Card orders only; COD has none of these) ----
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // ---- Return & Refund workflow ----
    // returnStatus: "none" (default) -> "requested" (customer asked) ->
    // "approved" (admin accepted, item returned + refunded) or "rejected" (admin declined)
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none",
      index: true,
    },
    returnReason: String,
    returnRequestedAt: Date,
    returnDecisionAt: Date,
    returnDecisionNote: String,
    // refundStatus tracks the money side independently of returnStatus
    refundStatus: {
      type: String,
      enum: ["not_applicable", "pending", "refunded"],
      default: "not_applicable",
    },
    refundAmount: Number,
    refundedAt: Date,
    razorpayRefundId: String, // set only when refund was actually issued via Razorpay (UPI/Card orders)
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
