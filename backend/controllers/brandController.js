const Brand = require("../models/Brand");
const Product = require("../models/Product");

// @route GET /api/brands (public)
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 }).lean();
    const counts = await Product.aggregate([
      { $match: { brand: { $ne: "" } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });
    const withCounts = brands.map((b) => ({ ...b, productCount: countMap[b.name] || 0 }));
    res.json({ brands: withCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/brands (admin)
exports.createBrand = async (req, res) => {
  try {
    const { name, logo } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Brand name is required" });

    const exists = await Brand.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "This brand already exists" });

    const brand = await Brand.create({ name: name.trim(), logo: logo || "" });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/brands/:id (admin)
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    await brand.deleteOne();
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
