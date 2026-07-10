// One-off fix script — run this ONCE to patch your existing Settings document
// with proper city lists for each shipping zone, without touching any other
// data (products, orders, reviews, users all stay untouched).
//
// Usage (from the backend/ folder):
//   node scripts/fixShippingZones.js

require("dotenv").config();
const mongoose = require("mongoose");
const Settings = require("../models/Settings");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let settings = await Settings.findOne();
  if (!settings) {
    console.log("No Settings document found — creating one with defaults...");
    settings = await Settings.create({});
  }

  settings.shippingZones = [
    {
      name: "Local (Punjab & nearby)",
      rate: 0,
      etaDays: 2,
      cities: ["Ludhiana", "Chandigarh", "Amritsar", "Jalandhar", "Patiala"],
    },
    {
      name: "Metro cities",
      rate: 49,
      etaDays: 3,
      cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"],
    },
    {
      name: "Rest of India",
      rate: 79,
      etaDays: 5,
      cities: [], // catch-all — keep empty
    },
  ];

  await settings.save();
  console.log("✅ Shipping zones updated with city lists!");
  console.log(JSON.stringify(settings.shippingZones, null, 2));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
