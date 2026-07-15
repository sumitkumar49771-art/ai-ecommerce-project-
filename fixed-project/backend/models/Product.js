const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number }, // optional — set higher than price to show a genuine strikethrough discount
    category: { type: String, required: true, index: true },
    brand: { type: String, default: "", index: true },
    tags: [{ type: String, index: true }], // used for AI content-based similarity
    image: { type: String }, // auto-filled below if left blank when creating/saving
    icon: { type: String, default: "" }, // optional emoji shown in admin product list / cards
    stock: { type: Number, default: 50 },
    rating: { type: Number, default: 4 },
    numReviews: { type: Number, default: 0 },

    // Simple counter the AI module uses to gauge popularity
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index enables the AI-powered smart search feature
productSchema.index({ name: "text", description: "text", tags: "text", category: "text" });

// If no real photo URL was provided, automatically fetch a real photo
// that matches the product's name (see utils/imageMatcher.js). If that
// isn't possible (no internet, no match found), fall back to an accurate,
// on-brand placeholder card instead of leaving the image blank or pointing
// at a "keyword-guessing" image service that can return an unrelated photo.
productSchema.pre("save", async function (next) {
  if (!this.image) {
    try {
      const { getRealProductImage } = require("../utils/imageMatcher");
      this.image = await getRealProductImage(this.name, this.category);
    } catch (err) {
      const { generatePlaceholderImage } = require("../utils/imagePlaceholder");
      this.image = generatePlaceholderImage(this.name, this.category);
    }
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
