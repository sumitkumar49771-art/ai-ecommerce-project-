const Review = require("../models/Review");
const Product = require("../models/Product");

async function recomputeProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  await Product.findByIdAndUpdate(productId, {
    numReviews: reviews.length,
    rating: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4,
  });
}

// @route GET /api/reviews (admin — moderation list, all reviews)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name image")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/reviews/product/:productId (public — shown on product detail page)
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/reviews (protected — logged-in customers only)
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "productId, rating and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const already = await Review.findOne({ product: productId, user: req.user._id });
    if (already) return res.status(400).json({ message: "You already reviewed this product" });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    });

    await recomputeProductRating(productId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/reviews/:id (admin — moderation)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    const productId = review.product;
    await review.deleteOne();
    await recomputeProductRating(productId);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
