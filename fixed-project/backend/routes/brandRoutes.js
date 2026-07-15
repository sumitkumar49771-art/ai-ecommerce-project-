const express = require("express");
const router = express.Router();
const { getBrands, createBrand, deleteBrand } = require("../controllers/brandController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getBrands);
router.post("/", protect, admin, createBrand);
router.delete("/:id", protect, admin, deleteBrand);

module.exports = router;
