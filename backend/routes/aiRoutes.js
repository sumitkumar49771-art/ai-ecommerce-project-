const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  getRecentlyViewed,
  trackView,
  smartSearch,
  chatbot,
  getDeals,
  getProductDealScore,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.get("/recommendations", protect, getRecommendations);
router.get("/recently-viewed", protect, getRecentlyViewed);
router.post("/track-view", protect, trackView);
router.post("/smart-search", smartSearch); // public - no login required
router.post("/chatbot", chatbot); // public - no login required
router.get("/deals", getDeals); // public - AI Deal Score picks
router.get("/deal-score/:productId", getProductDealScore); // public

module.exports = router;
