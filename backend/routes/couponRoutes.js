const express = require("express");
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, checkCoupon } = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);
router.post("/validate", protect, checkCoupon);

module.exports = router;
