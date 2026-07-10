const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percent", "flat"], default: "percent" },
    discountValue: { type: Number, required: true }, // e.g. 10 (%) or 100 (₹)
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // optional cap for percent coupons
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
    usageLimit: { type: Number }, // optional total redemption cap
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
