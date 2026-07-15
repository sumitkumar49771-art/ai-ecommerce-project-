const Coupon = require("../models/Coupon");

/**
 * Validates a coupon code against the current order subtotal and returns the
 * discount to apply. Throws an Error with a user-friendly message if the
 * coupon can't be used, so callers can just try/catch and surface err.message.
 */
async function validateCoupon(code, subtotal) {
  if (!code) return null;

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) throw new Error("Invalid coupon code.");
  if (!coupon.active) throw new Error("This coupon is no longer active.");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("This coupon has expired.");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon has reached its usage limit.");
  }
  if (subtotal < (coupon.minOrderValue || 0)) {
    throw new Error(`This coupon requires a minimum order of ₹${coupon.minOrderValue}.`);
  }

  let discountAmount =
    coupon.discountType === "percent" ? Math.round((subtotal * coupon.discountValue) / 100) : coupon.discountValue;

  if (coupon.discountType === "percent" && coupon.maxDiscountAmount) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  }
  discountAmount = Math.min(discountAmount, subtotal); // never discount more than the order itself

  return { coupon, discountAmount };
}

module.exports = { validateCoupon };
