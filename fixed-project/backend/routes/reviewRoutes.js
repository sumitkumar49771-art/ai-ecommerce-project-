const express = require("express");
const router = express.Router();
const { getAllReviews, getProductReviews, createReview, deleteReview } = require("../controllers/reviewController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", protect, admin, getAllReviews);
router.get("/product/:productId", getProductReviews);
router.post("/", protect, createReview);
router.delete("/:id", protect, admin, deleteReview);

module.exports = router;
