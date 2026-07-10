const Coupon = require("../models/Coupon");
const { validateCoupon } = require("../utils/couponValidator");

// @route GET /api/coupons (admin) — list all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/coupons (admin) — create a coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, active, expiresAt, usageLimit } =
      req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ message: "Code and discount value are required." });
    }
    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      active,
      expiresAt: expiresAt || undefined,
      usageLimit: usageLimit || undefined,
    });
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "A coupon with this code already exists." });
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/coupons/:id (admin) — update a coupon
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/coupons/:id (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/coupons/validate (logged-in customer) — checkout preview
exports.checkCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await validateCoupon(code, subtotal || 0);
    if (!result) return res.status(400).json({ message: "Please enter a coupon code." });
    res.json({
      valid: true,
      discountAmount: result.discountAmount,
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
