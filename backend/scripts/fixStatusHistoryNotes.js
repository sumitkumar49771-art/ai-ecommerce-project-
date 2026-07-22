// One-off fix script — replaces the old generic "Updated by admin" note
// inside existing orders' statusHistory with the new, more descriptive
// status-specific notes (matches what updateOrderStatus now writes for
// future updates). Only touches entries whose note is exactly the old
// generic text — nothing else about the order or its history is changed.
//
// Usage (from the backend/ folder):
//   node scripts/fixStatusHistoryNotes.js

require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");

const STATUS_UPDATE_NOTES = {
  pending: "Order confirmed and awaiting processing.",
  processing: "Your order is being packed by our team.",
  shipped: "Order has been handed over to the courier partner.",
  delivered: "Order has been delivered successfully.",
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const orders = await Order.find({ "statusHistory.note": "Updated by admin" });
  console.log(`Found ${orders.length} order(s) with the old generic note.`);

  let updatedEntries = 0;
  for (const order of orders) {
    order.statusHistory.forEach((entry) => {
      if (entry.note === "Updated by admin") {
        entry.note = STATUS_UPDATE_NOTES[entry.status] || "Order status updated by our team.";
        updatedEntries++;
      }
    });
    await order.save();
  }

  console.log(`✅ Rewrote ${updatedEntries} timeline entr${updatedEntries === 1 ? "y" : "ies"} across ${orders.length} order(s).`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
