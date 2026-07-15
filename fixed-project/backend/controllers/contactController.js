const ContactMessage = require("../models/ContactMessage");

// @route POST /api/contact (public) — customer submits the Contact Us form
exports.submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    const doc = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ message: "Message received.", id: doc._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/contact (admin) — list all submitted messages
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/contact/:id/read (admin) — toggle a message's read status
exports.markContactMessageRead = async (req, res) => {
  try {
    const doc = await ContactMessage.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Message not found." });
    doc.read = req.body.read !== undefined ? !!req.body.read : true;
    await doc.save();
    res.json({ message: "Updated.", contactMessage: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/contact/:id (admin) — remove a message
exports.deleteContactMessage = async (req, res) => {
  try {
    const doc = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Message not found." });
    res.json({ message: "Deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
