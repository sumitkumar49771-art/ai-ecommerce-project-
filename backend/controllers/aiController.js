const Product = require("../models/Product");
const User = require("../models/User");
const SearchLog = require("../models/SearchLog");
const ChatLog = require("../models/ChatLog");
const {
  getPersonalizedRecommendations,
  parseSmartQuery,
  computeDealScores,
} = require("../utils/aiRecommendation");

// @route GET /api/ai/recommendations
// Personalized "Recommended For You" powered by content-based AI filtering
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("browsingHistory");
    const allProducts = await Product.find();

    const recommendations = getPersonalizedRecommendations(
      user,
      user.browsingHistory,
      allProducts,
      8
    );

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/ai/recently-viewed
// Raw browsing history (most recent first) — used for the "Recently Viewed"
// row on the home page. Unlike /recommendations, this shows the actual
// products the user looked at, not AI-suggested similar ones.
exports.getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("browsingHistory");
    res.json({ products: user.browsingHistory.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/ai/track-view
// Records that a logged-in user viewed a product, feeding the AI engine
exports.trackView = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    user.browsingHistory = user.browsingHistory.filter(
      (id) => id.toString() !== productId
    );
    user.browsingHistory.unshift(productId);
    user.browsingHistory = user.browsingHistory.slice(0, 20); // keep last 20

    await user.save();
    res.json({ message: "View tracked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/ai/smart-search
// Natural language search assistant, e.g. "shoes under 2000"
exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const filters = parseSmartQuery(query);

    const mongoFilter = {};
    if (filters.keywords.length > 0) {
      mongoFilter.$text = { $search: filters.keywords.join(" ") };
    }
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      mongoFilter.price = {};
      if (filters.minPrice !== null) mongoFilter.price.$gte = filters.minPrice;
      if (filters.maxPrice !== null) mongoFilter.price.$lte = filters.maxPrice;
    }

    let products = await Product.find(mongoFilter);

    // Fallback 1: if the text search finds nothing, retry keyword-only regex match
    if (products.length === 0 && filters.keywords.length > 0) {
      const regex = new RegExp(filters.keywords.join("|"), "i");
      const priceFilter = mongoFilter.price ? { price: mongoFilter.price } : {};
      products = await Product.find({
        ...priceFilter,
        $or: [{ name: regex }, { description: regex }, { category: regex }, { tags: regex }],
      });
    }

    let noExactMatch = false;

    // Fallback 2: still nothing (e.g. product genuinely isn't in the catalog) —
    // never show a blank page. Show popular/top-rated picks instead, honoring
    // any price range the person mentioned, so search always feels useful.
    if (products.length === 0) {
      noExactMatch = true;
      const priceFilter = mongoFilter.price ? { price: mongoFilter.price } : {};
      products = await Product.find(priceFilter).sort({ rating: -1, numReviews: -1 }).limit(8);
    }

    res.json({ interpretedFilters: filters, results: products, noExactMatch });

    // Fire-and-forget log — never blocks or breaks the search response
    SearchLog.create({
      query,
      resultsCount: products.length,
      noExactMatch,
      user: req.user?._id,
    }).catch(() => {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/ai/deals
// AI Deal Score: ranks the whole catalog by price-vs-category-average and
// rating, surfacing genuinely well-priced, well-rated products — no fake
// "was ₹X" discounts, just real comparative pricing analysis.
exports.getDeals = async (req, res) => {
  try {
    const allProducts = await Product.find().lean();
    const scored = computeDealScores(allProducts)
      .filter((p) => ["Excellent Deal", "Good Value"].includes(p.dealLabel))
      .sort((a, b) => b.dealScore - a.dealScore)
      .slice(0, parseInt(req.query.limit, 10) || 8);

    res.json({ deals: scored });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/ai/deal-score/:productId
// Deal Score + reasoning for a single product (used on the product detail page)
exports.getProductDealScore = async (req, res) => {
  try {
    const categoryProducts = await Product.find().lean();
    const scoredProduct = computeDealScores(categoryProducts).find(
      (p) => p._id.toString() === req.params.productId
    );
    if (!scoredProduct) return res.status(404).json({ message: "Product not found" });

    res.json(scoredProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Calls OpenAI's chat completion API for a natural-language shopping assistant.
// Returns null on any failure so the caller can fall back to the rule-based bot.
async function callLLM(message, contextProduct, catalogSample) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = `You are ShopAI's friendly shopping assistant for an e-commerce store.
Keep replies short (1-3 sentences), helpful, and focused on shopping — products, orders, returns, pricing.
${
  contextProduct
    ? `The shopper is currently viewing this product: "${contextProduct.name}" — ₹${contextProduct.price}, category: ${contextProduct.category}, rating: ${contextProduct.rating || "N/A"}/5, stock: ${contextProduct.stock > 0 ? "in stock" : "out of stock"}. Description: ${contextProduct.description || "N/A"}.`
    : `Some products currently in the catalog: ${catalogSample.map((p) => `${p.name} (₹${p.price})`).join(", ")}.`
}
For order tracking, tell them to check the "My Orders" page. Returns are accepted within 7 days of delivery via the Orders page.
Never invent prices, stock, or facts not given to you above.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 150,
        temperature: 0.6,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[chatbot] OpenAI API error: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply || null;
  } catch (err) {
    console.warn(`[chatbot] LLM call failed, falling back to rule-based: ${err.message}`);
    return null;
  }
}

// AI shopping assistant. Uses a real LLM (OpenAI) when OPENAI_API_KEY is
// configured; otherwise falls back to the built-in rule-based responder below
// so the chatbot always works, even with zero setup.
exports.chatbot = async (req, res) => {
  try {
    const { message, productId } = req.body;
    const lower = (message || "").toLowerCase();

    let contextProduct = null;
    if (productId) {
      contextProduct = await Product.findById(productId).lean();
    }

    // Try the real LLM first (only if an API key is configured).
    if (process.env.OPENAI_API_KEY) {
      const catalogSample = contextProduct
        ? []
        : await Product.find().sort({ views: -1 }).limit(6).select("name price").lean();
      const llmReply = await callLLM(message, contextProduct, catalogSample);
      if (llmReply) {
        res.json({ reply: llmReply, source: "llm" });
        ChatLog.create({ message, reply: llmReply, user: req.user?._id }).catch(() => {});
        return;
      }
    }

    // Fallback: rule-based assistant (also used when no API key is set).
    let reply =
      "I'm your shopping assistant! You can ask me things like 'show me shoes under 2000' or 'what's trending?'";

    if (contextProduct && /price|cost|kitna|how much/.test(lower)) {
      reply = `${contextProduct.name} is priced at ₹${contextProduct.price}${
        contextProduct.originalPrice && contextProduct.originalPrice > contextProduct.price
          ? ` (originally ₹${contextProduct.originalPrice})`
          : ""
      }.`;
    } else if (contextProduct && /stock|available|in stock|left/.test(lower)) {
      reply =
        contextProduct.stock > 0
          ? `Yes, ${contextProduct.name} is in stock — ${contextProduct.stock} unit(s) available right now.`
          : `Sorry, ${contextProduct.name} is currently out of stock.`;
    } else if (contextProduct && /rating|review|good|worth/.test(lower)) {
      reply = contextProduct.numReviews
        ? `${contextProduct.name} has a rating of ${contextProduct.rating?.toFixed(1) || "N/A"} out of 5, based on ${contextProduct.numReviews} review(s).`
        : `${contextProduct.name} doesn't have any reviews yet — you could be the first to review it!`;
    } else if (contextProduct && /describe|about|what is|feature|spec|detail/.test(lower)) {
      reply = contextProduct.description
        ? `${contextProduct.name}: ${contextProduct.description}`
        : `${contextProduct.name} is a ${contextProduct.category} product from ShopAI.`;
    } else if (contextProduct && /brand/.test(lower)) {
      reply = contextProduct.brand
        ? `${contextProduct.name} is from the brand ${contextProduct.brand}.`
        : `${contextProduct.name} doesn't have a specific brand listed.`;
    } else if (/order|track/.test(lower)) {
      reply = "You can check your order status from the 'My Orders' page after logging in.";
    } else if (/return|refund/.test(lower)) {
      reply = "Returns are accepted within 7 days of delivery. Please visit the Orders page to request one.";
    } else if (/trending|popular|best seller/.test(lower)) {
      const topProducts = await Product.find().sort({ views: -1 }).limit(3);
      reply = `Trending right now: ${topProducts.map((p) => p.name).join(", ") || "no data yet"}.`;
    } else if (/under|below|between|cheap|price/.test(lower)) {
      const filters = parseSmartQuery(lower);
      const mongoFilter = {};
      if (filters.maxPrice || filters.minPrice) {
        mongoFilter.price = {};
        if (filters.minPrice) mongoFilter.price.$gte = filters.minPrice;
        if (filters.maxPrice) mongoFilter.price.$lte = filters.maxPrice;
      }
      const matches = await Product.find(mongoFilter).limit(3);
      reply =
        matches.length > 0
          ? `Here are some options: ${matches.map((p) => `${p.name} (₹${p.price})`).join(", ")}`
          : "I couldn't find matching products, try a different price range.";
    } else if (/hi|hello|hey/.test(lower)) {
      reply = contextProduct
        ? `Hello! 👋 Ask me anything about ${contextProduct.name} — price, stock, rating, or details.`
        : "Hello! 👋 How can I help you shop today?";
    } else if (contextProduct) {
      reply = `I'm not sure about that, but feel free to ask me about ${contextProduct.name}'s price, stock, rating, or description!`;
    }

    res.json({ reply });

    // Fire-and-forget log — never blocks or breaks the chat response
    ChatLog.create({ message, reply, user: req.user?._id }).catch(() => {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
