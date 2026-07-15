const express = require("express");
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} = require("../controllers/contactController");
const { protect, admin } = require("../middleware/authMiddleware");

// @route POST /api/contact (public) — customer submits the Contact Us form
router.post("/", submitContactMessage);

// @route GET /api/contact (admin only) — list all submitted messages
router.get("/", protect, admin, getContactMessages);

// @route PUT /api/contact/:id/read (admin only) — mark read/unread
router.put("/:id/read", protect, admin, markContactMessageRead);

// @route DELETE /api/contact/:id (admin only) — delete a message
router.delete("/:id", protect, admin, deleteContactMessage);

module.exports = router;

