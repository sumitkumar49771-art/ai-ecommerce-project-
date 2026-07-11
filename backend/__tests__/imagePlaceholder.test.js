const { generatePlaceholderImage, CATEGORY_STYLES } = require("../utils/imagePlaceholder");

describe("generatePlaceholderImage", () => {
  it("returns a valid inline SVG data URI", () => {
    const result = generatePlaceholderImage("Running Shoes", "Footwear");
    expect(result.startsWith("data:image/svg+xml,")).toBe(true);
  });

  it("falls back gracefully for a category with no defined style", () => {
    expect(() => generatePlaceholderImage("Mystery Item", "Unknown Category")).not.toThrow();
  });

  it("has a defined style for every category actually used in the seed data", () => {
    const expectedCategories = [
      "Footwear",
      "Electronics",
      "Clothing",
      "Accessories",
      "Home & Kitchen",
      "Beauty & Personal Care",
      "Books",
    ];
    expectedCategories.forEach((cat) => {
      expect(CATEGORY_STYLES).toHaveProperty(cat);
    });
  });
});
