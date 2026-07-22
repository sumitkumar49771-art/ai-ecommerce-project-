const Product = require("../models/Product");
const User = require("../models/User");
const SearchLog = require("../models/SearchLog");
const ChatLog = require("../models/ChatLog");
const {
  getPersonalizedRecommendations,
  parseSmartQuery,
  computeDealScores,
  getSimilarProducts,
} = require("../utils/aiRecommendation");

// Generic filler/adjective words that shouldn't be treated as product-search
// keywords — they're too common and cause false matches (e.g. "best" matching
// every product tagged "bestseller", regardless of what was actually asked for).
const FILLER_KEYWORDS = new Set([
  "price", "cheap", "best", "good", "nice", "top", "new", "great", "cool",
  "awesome", "some", "any", "please", "show", "find", "want",
]);

// Finds and ranks products by how many of the given keywords actually match —
// a product matching 2 out of 2 keywords ranks above one matching only 1,
// so multi-word queries ("hair oil", "formal shirt") surface the genuinely
// relevant product instead of anything that matches just one generic word.
async function findBestMatches(keywordWords, limit = 3) {
  const words = keywordWords
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 2 && !FILLER_KEYWORDS.has(w));
  if (words.length === 0) return [];

  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const anyWordRegex = new RegExp(escaped.join("|"), "i");

  // Broad candidate pool: anything matching at least one keyword
  const candidates = await Product.find({
    $or: [
      { name: anyWordRegex },
      { category: anyWordRegex },
      { brand: anyWordRegex },
      { tags: anyWordRegex },
    ],
  })
    .limit(50)
    .lean();

  // Score each candidate: name matches count more than category/brand/tag matches
  const scored = candidates.map((p) => {
    const nameLower = (p.name || "").toLowerCase();
    const otherLower = [p.category, p.brand, ...(p.tags || [])].filter(Boolean).join(" ").toLowerCase();
    let score = 0;
    for (const w of words) {
      if (nameLower.includes(w)) score += 2;
      else if (otherLower.includes(w)) score += 1;
    }
    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || (b.p.rating || 0) - (a.p.rating || 0))
    .slice(0, limit)
    .map((s) => s.p);
}



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

    // AI feature: "Related Products" row (like Flipkart/Amazon show below
    // search results) — content-based filtering (TF-style vectors + cosine
    // similarity) seeded from the top search result, so shoppers discover
    // relevant items beyond the exact keyword match.
    let relatedProducts = [];
    if (products.length > 0) {
      const seed = products[0];
      const shownIds = new Set(products.map((p) => p._id.toString()));
      const pool = await Product.find({ _id: { $nin: [...shownIds] } }).lean();
      relatedProducts = getSimilarProducts(seed, pool, 6);
    }

    res.json({ interpretedFilters: filters, results: products, noExactMatch, relatedProducts });

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
    // Optional category filter — without this, the deal score is computed
    // and ranked across the ENTIRE catalog, then sliced to the top N. A
    // category with genuinely good deals can easily fall outside that
    // global top N (e.g. top 24), so selecting it client-side would show
    // "No deals match these filters" even though real deals exist for it.
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const allProducts = await Product.find(filter).lean();
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
// Calls a chat-completion LLM API for a natural-language shopping assistant.
// Prefers Groq if configured (free-tier, no quota issues); otherwise falls
// back to OpenAI. Returns null on any failure so the caller can fall back
// further to the rule-based bot.
async function callLLM(message, contextProduct, catalogSample) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!openaiKey && !groqKey) return null;

  // Groq's API is OpenAI-format-compatible, so the same request body works
  // for both — only the base URL, auth key, and model name change.
  // Groq is preferred (free-tier, no quota issues); OpenAI is only used as
  // a fallback if no Groq key is configured.
  const provider = groqKey
    ? { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama-3.1-8b-instant", name: "Groq" }
    : { url: "https://api.openai.com/v1/chat/completions", key: openaiKey, model: "gpt-4o-mini", name: "OpenAI" };

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

    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
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
      console.warn(`[chatbot] ${provider.name} API error: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (reply) {
      console.log(`✅ [chatbot] Got a real AI reply from ${provider.name}.`);
    } else {
      console.warn(`⚠️  [chatbot] ${provider.name} responded but with no usable text:`, JSON.stringify(data));
    }
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

    // Try the real LLM first (if either OpenAI or Groq is configured).
    if (process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY) {
      let catalogSample = [];
      if (!contextProduct) {
        // Start with the top viewed products...
        const topViewed = await Product.find().sort({ views: -1 }).limit(6).select("name price").lean();

        // ...but also pull in anything matching keywords from the message
        // itself (e.g. "shoes", "hair oil"), so the AI doesn't wrongly think
        // a category is missing from the catalog just because it's not
        // among the top 6 most-viewed items.
        const words = lower
          .replace(/[^a-z0-9\s]/gi, " ")
          .split(/\s+/)
          .filter((w) => w.length > 2 && !FILLER_KEYWORDS.has(w));
        const keywordMatches = words.length > 0 ? await findBestMatches(words, 6) : [];

        const seen = new Set();
        catalogSample = [...keywordMatches, ...topViewed]
          .filter((p) => {
            const id = p._id.toString();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          })
          .slice(0, 10);
      }
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
    } else if (contextProduct && /rating|review|\bgood\b|worth/.test(lower)) {
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
    } else if (/cancel/.test(lower)) {
      reply = "To cancel an order, go to 'My Orders', open the order, and choose 'Cancel' — this only works before it's shipped.";
    } else if (/return|refund/.test(lower)) {
      reply = "Returns are accepted within 7 days of delivery. Please visit the Orders page to request one.";
    } else if (/deliver|shipping|kab aayega|kab milega|shipping charge/.test(lower)) {
      reply = "Delivery usually takes 2-4 days in metro cities and 4-7 days elsewhere. Delivery is free on orders above ₹499, otherwise it's ₹49.";
    } else if (/payment|upi|\bcod\b|cash on delivery|card accept/.test(lower)) {
      reply = "We accept Visa, Mastercard, RuPay, UPI, and Cash on Delivery on eligible orders.";
    } else if (/coupon|discount|offer|promo|code/.test(lower)) {
      reply = "Use code SHOPAI10 for 10% off your first order! Also check our 'Today's Best Deals' section on the homepage for live discounts.";
    } else if (/wishlist|save.*later|favourite|favorite/.test(lower)) {
      reply = "Tap the ♡ icon on any product to add it to your Wishlist — you can view it anytime from the top navigation bar.";
    } else if (/cart|checkout/.test(lower)) {
      reply = "Add items to your cart using the 🛒 icon on a product, then head to Cart → Checkout to complete your purchase.";
    } else if (/human|agent|support|contact|talk to someone|email/.test(lower)) {
      reply = "You can reach our support team via the Contact Us page, or email support@shopai.com — we usually respond within 24 hours.";
    } else if (/trending|popular|best seller/.test(lower)) {
      const topProducts = await Product.find().sort({ views: -1 }).limit(3);
      reply = `Trending right now: ${topProducts.map((p) => p.name).join(", ") || "no data yet"}.`;
    } else if (/under|below|between|cheap|price/.test(lower)) {
      const filters = parseSmartQuery(lower);
      const priceRange = {};
      if (filters.minPrice !== null) priceRange.min = filters.minPrice;
      if (filters.maxPrice !== null) priceRange.max = filters.maxPrice;
      const hasPriceRange = Object.keys(priceRange).length > 0;

      const keywordWords = filters.keywords.filter((w) => !FILLER_KEYWORDS.has(w));

      let matches = [];
      let reply2 = null; // set when we want a clarifying message instead of a product list
      if (keywordWords.length > 0) {
        matches = await findBestMatches(keywordWords, 6);
        if (hasPriceRange) {
          const withinRange = matches.filter(
            (p) =>
              (priceRange.min === undefined || p.price >= priceRange.min) &&
              (priceRange.max === undefined || p.price <= priceRange.max)
          );
          // Prefer keyword+price matches; if none fit the range, fall back to
          // keyword-only matches rather than showing nothing.
          matches = withinRange.length > 0 ? withinRange : matches;
        }
        matches = matches.slice(0, 3);
      } else if (hasPriceRange) {
        const mongoFilter = { price: {} };
        if (priceRange.min !== undefined) mongoFilter.price.$gte = priceRange.min;
        if (priceRange.max !== undefined) mongoFilter.price.$lte = priceRange.max;
        matches = await Product.find(mongoFilter).sort({ rating: -1 }).limit(3);
      } else if (contextProduct) {
        // Just "price" with no keywords, but we're on a product page — answer directly.
        reply2 = `${contextProduct.name} is priced at ₹${contextProduct.price}${
          contextProduct.originalPrice && contextProduct.originalPrice > contextProduct.price
            ? ` (originally ₹${contextProduct.originalPrice})`
            : ""
        }.`;
      } else {
        // "price" / "cheap" alone with nothing to search for or filter by — ask, don't guess.
        reply2 = "Which product would you like to know the price of? e.g. 'formal shirt price' or 'shoes under 2000'.";
      }


      reply = reply2
        ? reply2
        : matches.length > 0
        ? `Here are some options: ${matches.map((p) => `${p.name} (₹${p.price})`).join(", ")}`
        : "I couldn't find matching products, try a different price range.";
    } else if (/\b(thank|thanks|bye|goodbye)\b/.test(lower)) {
      reply = "You're welcome! Happy shopping 🛍️ — let me know if you need anything else.";
    } else if (/\b(hi|hello|hey)\b/.test(lower)) {
      reply = contextProduct
        ? `Hello! 👋 Ask me anything about ${contextProduct.name} — price, stock, rating, or details.`
        : "Hello! 👋 How can I help you shop today?";
    } else if (contextProduct) {
      reply = `I'm not sure about that, but feel free to ask me about ${contextProduct.name}'s price, stock, rating, or description!`;
    } else {
      // Smart catch-all: try to match the message against product names/categories
      // in the catalog before giving up with the generic default reply.
      const stopWords = new Set([
        "the", "a", "an", "is", "are", "do", "you", "have", "any", "some", "me",
        "show", "find", "get", "want", "looking", "for", "please", "can", "i",
        "hai", "ka", "ke", "ki", "mujhe", "koi", "kuch", "hain", "please", "kya",
        ...FILLER_KEYWORDS,
      ]);
      const words = lower
        .replace(/[^a-z0-9\s]/gi, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w));

      const matches = await findBestMatches(words, 3);

      reply =
        matches.length > 0
          ? `Here's what I found: ${matches.map((p) => `${p.name} (₹${p.price})`).join(", ")}. Want more details on any of these?`
          : "I'm your shopping assistant! You can ask me things like 'show me shoes under 2000', 'what's trending?', or about delivery, payments, and returns.";
    }

    res.json({ reply });

    // Fire-and-forget log — never blocks or breaks the chat response
    ChatLog.create({ message, reply, user: req.user?._id }).catch(() => {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
