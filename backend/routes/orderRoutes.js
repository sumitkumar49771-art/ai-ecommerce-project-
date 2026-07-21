const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
  getSellerEarnings,
  requestReturn,
  decideReturn,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/analytics", protect, admin, getAnalytics);
router.get("/seller/earnings", protect, getSellerEarnings); // must come before /:id
router.get("/", protect, admin, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.put("/:id/return-request", protect, requestReturn);
router.put("/:id/return-decision", protect, admin, decideReturn);

module.exports = router;
