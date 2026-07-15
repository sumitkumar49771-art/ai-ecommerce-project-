const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    resultsCount: { type: Number, default: 0 },
    noExactMatch: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SearchLog", searchLogSchema);
