const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    reply: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatLog", chatLogSchema);
