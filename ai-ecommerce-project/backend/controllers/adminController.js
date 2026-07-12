const Order = require("../models/Order");
const Product = require("../models/Product");
const SearchLog = require("../models/SearchLog");
const ChatLog = require("../models/ChatLog");

// @route GET /api/admin/product-analytics (admin)
// Per-product performance: views (from Product), units sold + revenue (from real Orders)
exports.getProductAnalytics = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
    ]);
    const salesMap = {};
    sales.forEach((s) => {
      if (s._id) salesMap[s._id.toString()] = s;
    });

    const products = await Product.find().lean();
    const analytics = products
      .map((p) => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        views: p.views || 0,
        rating: p.rating,
        numReviews: p.numReviews,
        unitsSold: salesMap[p._id.toString()]?.unitsSold || 0,
        revenue: salesMap[p._id.toString()]?.revenue || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.views - a.views);

    res.json({ products: analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/search-logs (admin)
exports.getSearchLogs = async (req, res) => {
  try {
    const logs = await SearchLog.find().sort({ createdAt: -1 }).limit(200).lean();
    const topQueries = await SearchLog.aggregate([
      { $group: { _id: { $toLower: "$query" }, count: { $sum: 1 }, avgResults: { $avg: "$resultsCount" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ logs, topQueries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/chat-logs (admin)
exports.getChatLogs = async (req, res) => {
  try {
    const logs = await ChatLog.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
