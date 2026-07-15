// Applies "Big Summer Sale" discounts to a random subset of existing products
// by setting originalPrice higher than the current price (20%–50% off).
// Run with:  npm run sale:apply   (from the backend folder)
//
// Run again anytime to refresh which products are on sale.
// To end the sale later, run:  npm run sale:clear

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const MODE = process.argv[2] || "apply"; // "apply" or "clear"

async function run() {
  await connectDB();

  if (MODE === "clear") {
    const result = await Product.updateMany({}, { $unset: { originalPrice: "" } });
    console.log(`🧹 Sale cleared — removed discount from ${result.modifiedCount} product(s).`);
    await mongoose.disconnect();
    return;
  }

  const products = await Product.find({});
  if (!products.length) {
    console.log("No products found. Run `npm run seed` first.");
    await mongoose.disconnect();
    return;
  }

  // Put ~40% of the catalog on sale, at a random 20%–50% discount each.
  const saleCount = Math.max(1, Math.round(products.length * 0.4));
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  const onSale = shuffled.slice(0, saleCount);

  const ops = onSale.map((p) => {
    const discountPct = 20 + Math.floor(Math.random() * 31); // 20–50%
    const originalPrice = Math.round(p.price / (1 - discountPct / 100));
    return {
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { originalPrice } },
      },
    };
  });

  await Product.bulkWrite(ops);
  console.log(`🔥 Big Summer Sale is live! ${onSale.length} of ${products.length} products now have a discount.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Failed to apply sale:", err.message);
  process.exit(1);
});
