const express = require("express");
const router = express.Router();
const { createRazorpayOrder, createCashfreeOrder } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createRazorpayOrder);
router.post("/create-cashfree-order", protect, createCashfreeOrder);

module.exports = router;
