/**
 * AI RECOMMENDATION ENGINE
 * -------------------------------------------------------------
 * This module implements a lightweight Content-Based Filtering
 * algorithm (a real, explainable AI/ML technique used widely in
 * e-commerce recommendation systems like Amazon/Flipkart) using
 * TF-style tag vectors + cosine similarity.
 *
 * Why this approach for a training project:
 *  - No external paid API key needed (works fully offline).
 *  - Still genuinely "AI" — vectorization + similarity scoring,
 *    the same math behind many production recommender systems.
 *  - Easy to explain in your project report/viva.
 * -------------------------------------------------------------
 */

// Build a "bag of words" vector from a product's tags + category + name
function buildFeatureVector(product) {
  const words = [
    ...(product.tags || []),
    product.category,
    ...product.name.toLowerCase().split(" "),
  ]
    .filter(Boolean)
    .map((w) => w.toString().toLowerCase().trim());

  const vector = {};
  words.forEach((w) => {
    vector[w] = (vector[w] || 0) + 1;
  });
  return vector;
}

// Cosine similarity between two sparse vectors (objects)
function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  allKeys.forEach((key) => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Given a target product and a pool of candidate products,
 * returns the top N most similar products (AI-powered
 * "Recommended For You" / "Similar Products" feature).
 */
function getSimilarProducts(targetProduct, candidateProducts, topN = 4) {
  const targetVector = buildFeatureVector(targetProduct);

  const scored = candidateProducts
    .filter((p) => p._id.toString() !== targetProduct._id.toString())
    .map((p) => ({
      product: p,
      score: cosineSimilarity(targetVector, buildFeatureVector(p)),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map((s) => s.product);
}

/**
 * Personalized recommendations based on a user's browsing history.
 * Averages the feature vectors of everything the user has viewed,
 * then ranks the full catalog against that "preference profile".
 */
function getPersonalizedRecommendations(user, historyProducts, allProducts, topN = 6) {
  if (!historyProducts || historyProducts.length === 0) {
    // Cold start: fall back to top-rated / most-viewed products
    return [...allProducts].sort((a, b) => b.views - a.views).slice(0, topN);
  }

  // Merge vectors from everything the user has browsed
  const combinedVector = {};
  historyProducts.forEach((p) => {
    const vec = buildFeatureVector(p);
    Object.entries(vec).forEach(([key, val]) => {
      combinedVector[key] = (combinedVector[key] || 0) + val;
    });
  });

  const historyIds = historyProducts.map((p) => p._id.toString());

  const scored = allProducts
    .filter((p) => !historyIds.includes(p._id.toString()))
    .map((p) => ({
      product: p,
      score: cosineSimilarity(combinedVector, buildFeatureVector(p)),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map((s) => s.product);
}

/**
 * AI Smart Search Assistant.
 * Parses a natural-language query like:
 *   "show me shoes under 2000"
 *   "wireless headphones between 1000 and 3000"
 * and extracts intent: keywords + price constraints + category.
 * This mimics simple NLU (Natural Language Understanding).
 */
function parseSmartQuery(query) {
  const lower = query.toLowerCase();
  const filters = { keywords: [], minPrice: null, maxPrice: null, category: null };

  // "under 2000" / "below 2000" / "less than 2000"
  const underMatch = lower.match(/(?:under|below|less than)\s*(\d+)/);
  if (underMatch) filters.maxPrice = parseInt(underMatch[1], 10);

  // "above 500" / "over 500" / "more than 500"
  const overMatch = lower.match(/(?:above|over|more than)\s*(\d+)/);
  if (overMatch) filters.minPrice = parseInt(overMatch[1], 10);

  // "between 1000 and 3000"
  const betweenMatch = lower.match(/between\s*(\d+)\s*(?:and|-|to)\s*(\d+)/);
  if (betweenMatch) {
    filters.minPrice = parseInt(betweenMatch[1], 10);
    filters.maxPrice = parseInt(betweenMatch[2], 10);
  }

  // Strip filler / numeric phrases to leave behind keywords
  const stripped = lower
    .replace(/(?:under|below|less than|above|over|more than|between)\s*\d+\s*(?:and|-|to)?\s*\d*/g, "")
    .replace(/(show me|find|search for|i want|i need|please)/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  filters.keywords = stripped.split(/\s+/).filter((w) => w.length > 1);

  return filters;
}

/**
 * AI Deal Score Engine.
 * -------------------------------------------------------------
 * Compares each product's price and rating against the average
 * for its own category, then scores how good a "deal" it is.
 * This is a genuine statistical technique (z-score-style relative
 * comparison) — it never invents fake "was ₹X" discount prices,
 * it only reasons over real price/rating data already in the DB.
 *
 *   priceRatio = product.price / categoryAveragePrice
 *   ratingDelta = product.rating - categoryAverageRating
 *
 * A product priced below its category average AND rated at or
 * above the category average scores highest.
 * -------------------------------------------------------------
 */
function computeDealScores(products) {
  const categoryStats = {};
  products.forEach((p) => {
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { totalPrice: 0, totalRating: 0, count: 0 };
    }
    categoryStats[p.category].totalPrice += p.price;
    categoryStats[p.category].totalRating += p.rating || 0;
    categoryStats[p.category].count += 1;
  });

  Object.values(categoryStats).forEach((s) => {
    s.avgPrice = s.totalPrice / s.count;
    s.avgRating = s.totalRating / s.count;
  });

  return products.map((p) => {
    const stats = categoryStats[p.category] || { avgPrice: p.price, avgRating: p.rating };
    const priceRatio = stats.avgPrice ? p.price / stats.avgPrice : 1;
    const ratingDelta = (p.rating || 0) - stats.avgRating;

    // Weighted score out of 100: cheaper-than-average price counts most,
    // an above-average rating adds the rest.
    const priceComponent = Math.max(0, Math.min(1, 1.4 - priceRatio)) * 60;
    const ratingComponent = Math.max(0, Math.min(1, (ratingDelta + 1) / 2)) * 40;
    const dealScore = Math.round(priceComponent + ratingComponent);

    let dealLabel = "Fair Price";
    if (priceRatio <= 0.8 && ratingDelta >= 0) dealLabel = "Excellent Deal";
    else if (priceRatio <= 1.0 && ratingDelta >= 0) dealLabel = "Good Value";
    else if ((p.rating || 0) >= 4.6 && priceRatio > 1.15) dealLabel = "Premium Pick";

    return {
      ...(p.toObject ? p.toObject() : p),
      dealScore,
      dealLabel,
      categoryAvgPrice: Math.round(stats.avgPrice),
      pricePercentVsCategory: Math.round((priceRatio - 1) * 100), // + = pricier, - = cheaper than average
    };
  });
}

module.exports = {
  buildFeatureVector,
  cosineSimilarity,
  getSimilarProducts,
  getPersonalizedRecommendations,
  parseSmartQuery,
  computeDealScores,
};
