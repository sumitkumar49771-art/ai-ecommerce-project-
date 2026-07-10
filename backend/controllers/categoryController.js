const Category = require("../models/Category");
const Product = require("../models/Product");

// @route GET /api/categories (public — powers admin table + could power storefront filters)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const counts = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });
    const withCounts = categories.map((c) => ({ ...c, productCount: countMap[c.name] || 0 }));
    res.json({ categories: withCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/categories (admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Category name is required" });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "This category already exists" });

    const category = await Category.create({
      name: name.trim(),
      icon: icon || "🏷️",
      description: description || "",
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/categories/:id (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
