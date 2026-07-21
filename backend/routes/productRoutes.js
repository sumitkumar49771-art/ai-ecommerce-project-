const express = require("express");
const router = express.Router();
const {
  getProducts,
  getSearchSuggestions,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createMyProduct,
  getMyProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.get("/suggestions", getSearchSuggestions); // must come before /:id
router.get("/mine", protect, getMyProducts); // must come before /:id — any logged-in user's own listings
router.post("/mine", protect, createMyProduct); // any logged-in user can list their own product
router.get("/:id", getProductById);
router.post("/", protect, admin, createProduct);
// Ownership (admin OR the user who listed it) is checked inside the controller.
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
