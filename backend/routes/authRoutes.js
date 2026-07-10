const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  getAddresses,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.get("/users", protect, admin, getAllUsers);
router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);

module.exports = router;
