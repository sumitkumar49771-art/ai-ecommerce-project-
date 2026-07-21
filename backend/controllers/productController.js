const Product = require("../models/Product");
const { getSimilarProducts } = require("../utils/aiRecommendation");

// @route GET /api/products
// @route GET /api/products/suggestions?q=
// Lightweight autocomplete suggestions as the user types in the search box.
// Uses a prefix regex (not $text) so partial words like "sho" match "Shoes"
// immediately, instead of waiting for a complete word like full-text search needs.
exports.getSearchSuggestions = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (q.length < 2) return res.json({ suggestions: [] });

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape regex special chars
    const products = await Product.find({ name: regex })
      .select("name image category price")
      .limit(6)
      .lean();

    res.json({ suggestions: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, minRating } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200); // cap at 200/page

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };
    // "deal=true" -> only products with a genuine discount (at least 15% off), used by the Big Summer Sale banner.
    if (req.query.deal === "true") {
      filter.$expr = {
        $and: [
          { $gt: ["$originalPrice", 0] },
          { $gte: [{ $divide: [{ $subtract: ["$originalPrice", "$price"] }, "$originalPrice"] }, 0.15] },
        ],
      };
    }

    const sortMap = {
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 },
      ratingAsc: { rating: 1 },
      newest: { createdAt: -1 },
    };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("seller", "name") // lets the UI show "Added by <seller>" / "Sold by <seller>"
        .lean(), // .lean() skips Mongoose document overhead — faster for read-only lists
    ]);

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    // increment views (feeds the AI popularity signal) — fire-and-forget, no need to block the response
    Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).catch(() => {});

    // AI feature: fetch similar products using content-based filtering
    const allProducts = await Product.find({ category: product.category }).lean();
    let similar = getSimilarProducts(product, allProducts, 4);

    // If this product's own category is too sparse to fill out recommendations,
    // top up with well-rated/popular products from other categories so this
    // section never looks empty.
    if (similar.length < 4) {
      const excludeIds = new Set([product._id.toString(), ...similar.map((s) => s._id.toString())]);
      const fallback = await Product.find({ _id: { $nin: [...excludeIds] } })
        .sort({ rating: -1, views: -1 })
        .limit(4 - similar.length)
        .lean();
      similar = [...similar, ...fallback];
    }

    res.json({ product, similarProducts: similar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/products (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/products/mine (any logged-in user)
// Lets a regular user list their own product for sale. The product is
// tagged with their user id as `seller`, which is what powers their
// personal "My Products" dashboard and lets them edit/delete it later.
exports.createMyProduct = async (req, res) => {
  try {
    const payload = { ...req.body, seller: req.user._id };
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/products/mine (any logged-in user)
// Returns only the products this user has listed themselves, plus a
// couple of quick aggregate numbers for the dashboard header cards.
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 }).lean();

    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const avgRating = products.length
      ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
      : 0;

    res.json({
      products,
      stats: {
        totalProducts: products.length,
        totalViews,
        totalStock,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/products/:id (admin, or the user who listed this product)
exports.updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const isOwner = existing.seller && existing.seller.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not authorized to edit this product" });
    }

    const payload = { ...req.body };
    delete payload.seller; // a seller can't reassign their product to someone else

    // findByIdAndUpdate skips the model's pre("save") hook, so if the
    // image URL field was left blank (e.g. after renaming the product),
    // fetch a matching real photo here too — otherwise the old image
    // would stay attached to the new name.
    if (!payload.image) {
      const { getRealProductImage } = require("../utils/imageMatcher");
      payload.image = await getRealProductImage(payload.name || existing.name, payload.category || existing.category);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/products/:id (admin, or the user who listed this product)
exports.deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const isOwner = existing.seller && existing.seller.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
