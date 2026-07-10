// Re-fetches a real product photo (via Pexels/Pixabay, same logic used at
// seed time) for every product ALREADY in the database, and updates ONLY
// the `image` field. Nothing else is touched — orders, users, cart, prices,
// stock, reviews, etc. are all left exactly as they are.
//
// Use this whenever product images are broken/missing/blank and you don't
// want to re-run the full seed (which would wipe and recreate everything).
//
// Run with:  npm run images:refresh   (from the backend folder)
//
// Make sure backend/.env has a valid PEXELS_API_KEY and/or PIXABAY_API_KEY
// before running this — otherwise every product will fall back to the
// generated placeholder card instead of a real photo.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const { getRealProductImage, resetUsedImages } = require("../utils/imageMatcher");

// Small delay between requests so we don't hit Pexels/Pixabay rate limits
// when a catalog has many products.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  await connectDB();

  if (!process.env.PEXELS_API_KEY && !process.env.PIXABAY_API_KEY) {
    console.log(
      "⚠️  No PEXELS_API_KEY or PIXABAY_API_KEY found in backend/.env — every product will get the generated placeholder card instead of a real photo. Add a key and re-run if you want real photos."
    );
  }

  const products = await Product.find({});
  if (!products.length) {
    console.log("No products found in the database. Run `npm run seed` first.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${products.length} product(s). Refreshing images...\n`);
  resetUsedImages(); // so this run doesn't skip photos as "already used" from a previous run

  let realPhotoCount = 0;
  let placeholderCount = 0;
  let failedCount = 0;

  for (const product of products) {
    try {
      const image = await getRealProductImage(product.name, product.category);
      product.image = image;
      await product.save();

      if (image.startsWith("data:image/svg")) {
        placeholderCount++;
        console.log(`◻️  Placeholder card: ${product.name}`);
      } else {
        realPhotoCount++;
        console.log(`✅ Real photo: ${product.name}`);
      }
    } catch (err) {
      failedCount++;
      console.log(`❌ Failed for "${product.name}": ${err.message}`);
    }

    await sleep(300); // be gentle with the free-tier rate limits
  }

  console.log("\n---- Done ----");
  console.log(`Real photos:   ${realPhotoCount}`);
  console.log(`Placeholders:  ${placeholderCount}`);
  console.log(`Failed:        ${failedCount}`);
  console.log("Refresh your site (hard-refresh: Ctrl+Shift+R) to see the updated images.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Script crashed:", err);
  process.exit(1);
});
