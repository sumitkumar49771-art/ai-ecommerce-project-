const express = require("express");
const router = express.Router();
const { getProductAnalytics, getSearchLogs, getChatLogs } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/product-analytics", protect, admin, getProductAnalytics);
router.get("/search-logs", protect, admin, getSearchLogs);
router.get("/chat-logs", protect, admin, getChatLogs);

module.exports = router;
