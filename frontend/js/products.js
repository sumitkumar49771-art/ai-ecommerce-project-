/* ---------------- HERO ENHANCEMENTS ---------------- */
const HERO_QUERIES = [
  "shoes under 2000",
  "wireless headphones",
  "formal shirts for men",
  "yoga mat under 700",
  "books on self improvement",
];

function typewriterLoop(input) {
  let queryIndex = 0;

  function typeQuery() {
    const text = HERO_QUERIES[queryIndex];
    let charIndex = 0;
    input.placeholder = "";

    const typeInterval = setInterval(() => {
      input.placeholder += text[charIndex];
      charIndex++;
      if (charIndex === text.length) {
        clearInterval(typeInterval);
        setTimeout(eraseQuery, 1800);
      }
    }, 45);
  }

  function eraseQuery() {
    const eraseInterval = setInterval(() => {
      input.placeholder = input.placeholder.slice(0, -1);
      if (input.placeholder.length === 0) {
        clearInterval(eraseInterval);
        queryIndex = (queryIndex + 1) % HERO_QUERIES.length;
        setTimeout(typeQuery, 300);
      }
    }, 25);
  }

  typeQuery();
}

async function populateHeroCards() {
  const visual = document.getElementById("hero-visual");
  if (!visual) return;
  try {
    const data = await apiRequest("/products?limit=3&sort=rating");
    const cards = visual.querySelectorAll(".float-card");
    data.products.forEach((p, i) => {
      const card = cards[i];
      if (!card) return;
      card.innerHTML = `
        <span class="ai-match-badge">✨ ${Math.round((p.rating / 5) * 100)}% match</span>
        <img src="${p.image}" class="float-card-img" style="object-fit:cover;" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');" />
        <div class="float-card-body">
          <div style="font-size:12px; font-weight:700; color:#1f2937; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
          <div style="font-size:12px; color:#3b82f6; font-weight:700;">₹${p.price}</div>
        </div>`;
    });
  } catch (err) {
    // Hero still looks fine with skeleton cards if this fails
  }
}

function initHero() {
  const input = document.getElementById("hero-search-input");
  if (input) typewriterLoop(input);
  populateHeroCards();
}

/* ---------------- HOME PAGE ---------------- */
const CATEGORY_ICONS = {
  "Footwear": "👟",
  "Electronics": "🎧",
  "Clothing": "👕",
  "Accessories": "🎒",
  "Home & Kitchen": "🏠",
  "Beauty & Personal Care": "💄",
  "Books": "📚",
  "Sports & Fitness": "🏋️",
  "Toys & Games": "🧸",
  "Grocery & Gourmet": "🍯",
};

function starRating(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function productBadge(p) {
  if (p.dealLabel === "Excellent Deal") return `<span class="badge-tag badge-deal">🤖 AI Deal Pick</span>`;
  if (p.rating >= 4.6 && p.numReviews >= 100) return `<span class="badge-tag badge-bestseller">🔥 Bestseller</span>`;
  if (p.stock > 0 && p.stock <= 15) return `<span class="badge-tag badge-lowstock">⚡ Only ${p.stock} left</span>`;
  if (p.rating >= 4.7) return `<span class="badge-tag badge-top">⭐ Top Rated</span>`;
  return "";
}

function discountBadgeHtml(p) {
  if (!p.originalPrice || p.originalPrice <= p.price) return "";
  const pct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  return `<span class="badge-tag badge-discount">-${pct}%</span>`;
}

function priceHtml(p) {
  if (p.originalPrice && p.originalPrice > p.price) {
    return `<span class="product-price">₹${p.price}</span> <span class="price-strike">₹${p.originalPrice}</span>`;
  }
  return `<span class="product-price">₹${p.price}</span>`;
}

function productCard(p) {
  const isWishlisted = currentWishlistIds.has(p._id);
  return `
    <a href="product-detail.html?id=${p._id}" class="product-card">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');" />
        ${productBadge(p)}
        ${discountBadgeHtml(p)}
        ${
          isLoggedIn()
            ? `<span class="wishlist-heart ${isWishlisted ? "active" : ""}" onclick="event.preventDefault(); event.stopPropagation(); toggleWishlistBtn('${p._id}', this);">${isWishlisted ? "♥" : "♡"}</span>`
            : ""
        }
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${starRating(p.rating || 4)}</span>
          <span class="rating-count">(${p.numReviews || 0})</span>
        </div>
        ${priceHtml(p)}
      </div>
    </a>
  `;
}

let currentWishlistIds = new Set();

async function loadWishlistIds() {
  if (!isLoggedIn()) return;
  try {
    const wishlist = await apiRequest("/auth/wishlist", "GET", null, true);
    currentWishlistIds = new Set(wishlist.map((p) => p._id));
  } catch (err) {
    // non-critical
  }
}

async function toggleWishlistBtn(productId, el) {
  try {
    const data = await apiRequest(`/auth/wishlist/${productId}`, "POST", null, true);
    if (data.added) {
      currentWishlistIds.add(productId);
      el.textContent = "♥";
      el.classList.add("active");
      showToast("Added to wishlist", "success");
    } else {
      currentWishlistIds.delete(productId);
      el.textContent = "♡";
      el.classList.remove("active");
      showToast("Removed from wishlist", "info");
    }
    updateWishlistCount();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function toggleDetailWishlist(productId) {
  const btn = document.getElementById("detail-wishlist-btn");
  try {
    const data = await apiRequest(`/auth/wishlist/${productId}`, "POST", null, true);
    if (data.added) {
      currentWishlistIds.add(productId);
      if (btn) btn.textContent = "♥ In Wishlist";
      showToast("Added to wishlist", "success");
    } else {
      currentWishlistIds.delete(productId);
      if (btn) btn.textContent = "♡ Add to Wishlist";
      showToast("Removed from wishlist", "info");
    }
    updateWishlistCount();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadWishlistPage() {
  const grid = document.getElementById("wishlist-grid");
  if (!isLoggedIn()) {
    grid.innerHTML = `<p>Please <a href="login.html">login</a> to view your wishlist.</p>`;
    return;
  }
  try {
    const wishlist = await apiRequest("/auth/wishlist", "GET", null, true);
    currentWishlistIds = new Set(wishlist.map((p) => p._id));
    grid.innerHTML = wishlist.length
      ? wishlist.map(productCard).join("")
      : "<p>Your wishlist is empty. <a href='products.html'>Browse products</a></p>";
  } catch (err) {
    grid.innerHTML = "<p>Could not load wishlist.</p>";
  }
}

function renderCategoryChips() {
  const box = document.getElementById("category-chips");
  if (!box) return;
  box.innerHTML = Object.entries(CATEGORY_ICONS)
    .map(
      ([cat, icon]) =>
        `<div class="category-chip" onclick="filterByCategory('${cat}')"><span class="chip-icon">${icon}</span>${cat}</div>`
    )
    .join("");
}

/* ---------- AI DEAL SCORE (homepage) ---------- */
async function loadDeals() {
  const grid = document.getElementById("deals-grid");
  if (!grid) return;
  try {
    const data = await apiRequest("/ai/deals?limit=4");
    grid.innerHTML = data.deals.length
      ? data.deals.map(productCard).join("")
      : "<p>No standout deals right now — check back soon.</p>";
  } catch (err) {
    grid.innerHTML = "<p>Could not load deals. Is the backend running?</p>";
  }
}

/* ---------- HOME PAGE ---------- */
async function loadHomePage() {
  renderCategoryChips();
  await loadWishlistIds();
  loadDeals();
  loadHomeSaleSection();
  const grid = document.getElementById("featured-grid");
  const recGrid = document.getElementById("recommended-grid");

  try {
    const data = await apiRequest("/products?limit=8&sort=newest");
    if (grid) grid.innerHTML = data.products.map(productCard).join("");
  } catch (err) {
    if (grid) grid.innerHTML = `<p>Could not load products. Is the backend running?</p>`;
  }

  // AI Feature: personalized recommendations (only for logged in users)
  if (recGrid) {
    if (!isLoggedIn()) {
      recGrid.parentElement.style.display = "none";
      return;
    }
    try {
      const data = await apiRequest("/ai/recommendations", "GET", null, true);
      recGrid.innerHTML = data.recommendations.length
        ? data.recommendations.map(productCard).join("")
        : "<p>Browse a few products so our AI can learn your taste!</p>";
    } catch (err) {
      recGrid.parentElement.style.display = "none";
    }
  }
}

async function loadHomeSaleSection() {
  const section = document.getElementById("home-sale-section");
  const grid = document.getElementById("sale-grid");
  if (!section || !grid) return;

  const settings = await getSaleSettings();
  if (!settings || !settings.saleEnabled) {
    section.style.display = "none";
    return;
  }

  try {
    const data = await apiRequest("/products?deal=true&limit=4&sort=newest");
    if (data.products.length) {
      grid.innerHTML = data.products.map(productCard).join("");
      section.style.display = "block";
      startSaleCountdown("home-sale-countdown", settings.saleEndsAt);
    } else {
      section.style.display = "none";
    }
  } catch (err) {
    section.style.display = "none";
  }
}

/* ---------- PRODUCTS PAGE ---------- */
async function loadProductsPage(page = 1) {
  const grid = document.getElementById("products-grid");
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "";
  const deal = params.get("deal") === "true";
  const sort = document.getElementById("sort-select")?.value || "";
  const minPrice = document.getElementById("min-price-input")?.value || "";
  const maxPrice = document.getElementById("max-price-input")?.value || "";
  const minRating = document.getElementById("rating-select")?.value || "";

  showSaleBannerIfNeeded(deal);

  try {
    await loadWishlistIds();
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (deal) query.set("deal", "true");
    if (sort) query.set("sort", sort);
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    if (minRating) query.set("minRating", minRating);
    query.set("page", page);
    query.set("limit", 12);

    const data = await apiRequest(`/products?${query.toString()}`);
    grid.innerHTML = data.products.length
      ? data.products.map(productCard).join("")
      : deal
      ? "<p>No deals live right now — check back soon!</p>"
      : "<p>No products found.</p>";
    renderPagination(data.page, data.totalPages);
  } catch (err) {
    grid.innerHTML = `<p>Could not load products.</p>`;
  }
}

async function showSaleBannerIfNeeded(isDeal) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  let banner = document.getElementById("sale-banner");
  const settings = isDeal ? await getSaleSettings() : null;

  if (isDeal && settings && settings.saleEnabled) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "sale-banner";
      banner.style.cssText =
        "grid-column:1/-1;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:16px 20px;border-radius:12px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;";
      banner.innerHTML = `
        <span style="font-weight:700;font-size:16px;">🔥 Big Summer Sale — Up to 50% OFF, live now!</span>
        <span id="products-sale-countdown" style="font-weight:600;font-size:14px;background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:6px;"></span>
      `;
      grid.parentElement.insertBefore(banner, grid);
      startSaleCountdown("products-sale-countdown", settings.saleEndsAt);
    }
  } else if (banner) {
    banner.remove();
  }
}

function renderPagination(currentPage, totalPages) {
  const box = document.getElementById("pagination");
  if (!box || totalPages <= 1) {
    if (box) box.innerHTML = "";
    return;
  }
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<span class="page-btn ${i === currentPage ? "active" : ""}" onclick="loadProductsPage(${i})">${i}</span>`;
  }
  box.innerHTML = html;
}

function filterByCategory(cat) {
  window.location.href = cat ? `products.html?category=${encodeURIComponent(cat)}` : "products.html";
}

/* ---------- AI SMART SEARCH ---------- */
async function handleSmartSearch(event) {
  event.preventDefault();
  const inputEl = (event.target && event.target.querySelector("input")) || document.getElementById("smart-search-input");
  const query = (inputEl ? inputEl.value : "").trim();
  if (!query) return;

  const resultBox = document.getElementById("smart-search-results") || document.getElementById("products-grid");
  const interpretedBox = document.getElementById("smart-search-interpreted");
  const section = document.getElementById("smart-search-section");
  if (section) section.style.display = "block";

  resultBox.innerHTML = "<p>🤖 AI is thinking...</p>";
  (section || resultBox).scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const data = await apiRequest("/ai/smart-search", "POST", { query });
    if (interpretedBox) {
      const f = data.interpretedFilters;
      if (data.noExactMatch) {
        interpretedBox.innerHTML = `<span class="ai-tag">🤖 No exact match for "${escapeHtml(query)}" — here are some popular picks you might like</span>`;
      } else {
        interpretedBox.innerHTML = `<span class="ai-tag">🤖 AI understood: ${f.keywords.join(" ") || "any product"}${
          f.minPrice ? ` | min ₹${f.minPrice}` : ""
        }${f.maxPrice ? ` | max ₹${f.maxPrice}` : ""}</span>`;
      }
    }
    resultBox.innerHTML = data.results.length
      ? data.results.map(productCard).join("")
      : "<p>No matching products found. Try a different search.</p>";
  } catch (err) {
    resultBox.innerHTML = `<p>Search failed: ${err.message}</p>`;
  }
}

/* ---------- PRODUCT DETAIL PAGE ---------- */
async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("product-detail");
  const similarGrid = document.getElementById("similar-grid");

  if (!id) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  try {
    await loadWishlistIds();
    const data = await apiRequest(`/products/${id}`);
    const p = data.product;

    container.innerHTML = `
      <div style="display:flex; gap:32px; flex-wrap:wrap;">
        <img src="${p.image}" style="width:320px; height:320px; object-fit:cover; border-radius:12px;" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');" />
        <div style="flex:1; min-width:260px;">
          <span class="product-cat">${p.category}</span>
          <h1>${p.name}</h1>
          <p style="margin:12px 0; color:var(--muted);">${p.description}</p>
          <p class="product-price" style="font-size:26px;">₹${p.price}</p>
          <p style="margin:8px 0; color:var(--muted); font-size:14px;"><span class="stars">${starRating(p.rating)}</span> ${p.rating} (${p.numReviews} reviews) · ${p.stock} in stock</p>
          <button class="btn" onclick="addToCartHandler('${p._id}')">Add to Cart</button>
          ${
            isLoggedIn()
              ? `<button class="btn btn-outline" id="detail-wishlist-btn" onclick="toggleDetailWishlist('${p._id}')" style="margin-left:8px;">${currentWishlistIds.has(p._id) ? "♥ In Wishlist" : "♡ Add to Wishlist"}</button>`
              : ""
          }
          <div id="deal-score-panel" style="margin-top:16px;"></div>
        </div>
      </div>
    `;

    loadDealScore(id);
    loadProductReviews(id);
    renderAskAiWidget(id, p.name);

    if (similarGrid) {
      similarGrid.innerHTML = data.similarProducts.length
        ? data.similarProducts.map(productCard).join("")
        : "<p>No similar products found.</p>";
    }

    // AI feature: track this view to personalize future recommendations
    if (isLoggedIn()) {
      apiRequest("/ai/track-view", "POST", { productId: id }, true).catch(() => {});
    }
  } catch (err) {
    container.innerHTML = `<p>Could not load product.</p>`;
  }
}

const DEAL_STYLES = {
  "Excellent Deal": { icon: "🔥", color: "#16a34a", note: "priced well below the category average with a strong rating" },
  "Good Value": { icon: "👍", color: "#3b82f6", note: "priced at or below the category average" },
  "Premium Pick": { icon: "💎", color: "#9333ea", note: "priced above average, but backed by an above-average rating" },
  "Fair Price": { icon: "⭐", color: "#f59e0b", note: "priced in line with similar products in this category" },
};

async function loadDealScore(productId) {
  const panel = document.getElementById("deal-score-panel");
  if (!panel) return;
  try {
    const deal = await apiRequest(`/ai/deal-score/${productId}`);
    const style = DEAL_STYLES[deal.dealLabel] || DEAL_STYLES["Fair Price"];
    const priceDiffText =
      deal.pricePercentVsCategory <= 0
        ? `${Math.abs(deal.pricePercentVsCategory)}% cheaper than the average ${deal.category} product (₹${deal.categoryAvgPrice})`
        : `${deal.pricePercentVsCategory}% above the average ${deal.category} product (₹${deal.categoryAvgPrice})`;

    panel.innerHTML = `
      <div class="deal-score-box" style="border-color:${style.color}22; background:${style.color}0d;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span style="font-size:18px;">${style.icon}</span>
          <strong style="color:${style.color};">AI Deal Score: ${deal.dealLabel} (${deal.dealScore}/100)</strong>
        </div>
        <p style="font-size:13px; color:var(--muted); margin:0;">
          This product is ${priceDiffText} — flagged as ${style.note}, based on our AI pricing model.
        </p>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = "";
  }
}

/* ---------- ASK AI ABOUT THIS PRODUCT ---------- */
function renderAskAiWidget(productId, productName) {
  const box = document.getElementById("ask-ai-section");
  if (!box) return;
  box.innerHTML = `
    <div class="admin-card" style="margin-top:20px;">
      <h3>💬 Ask AI about this product</h3>
      <p style="color:var(--muted); font-size:13px; margin-bottom:10px;">
        Ask about ${escJs(productName)}'s price, stock, rating, brand, or details.
      </p>
      <div id="ask-ai-chat-log" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px; max-height:220px; overflow-y:auto;"></div>
      <div style="display:flex; gap:8px;">
        <input id="ask-ai-input" placeholder="e.g. Is this in stock?" style="flex:1;" onkeydown="if(event.key==='Enter'){event.preventDefault(); sendAskAiMessage('${productId}');}" />
        <button class="btn" onclick="sendAskAiMessage('${productId}')">Ask</button>
      </div>
    </div>
  `;
}

async function sendAskAiMessage(productId) {
  const input = document.getElementById("ask-ai-input");
  const log = document.getElementById("ask-ai-chat-log");
  const message = input.value.trim();
  if (!message) return;

  log.innerHTML += `<div style="align-self:flex-end; background:var(--primary-light); padding:8px 12px; border-radius:10px; max-width:85%; font-size:14px;">${escapeHtmlDetail(message)}</div>`;
  input.value = "";
  log.scrollTop = log.scrollHeight;

  try {
    const data = await apiRequest("/ai/chatbot", "POST", { message, productId });
    log.innerHTML += `<div style="align-self:flex-start; background:var(--card-bg-alt); padding:8px 12px; border-radius:10px; max-width:85%; font-size:14px;">🤖 ${escapeHtmlDetail(data.reply)}</div>`;
  } catch (err) {
    log.innerHTML += `<div style="align-self:flex-start; color:var(--danger); font-size:13px;">Sorry, I couldn't reach the AI assistant right now.</div>`;
  }
  log.scrollTop = log.scrollHeight;
}

function escapeHtmlDetail(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- CUSTOMER REVIEWS ---------- */
async function loadProductReviews(productId) {
  const box = document.getElementById("reviews-section");
  if (!box) return;
  try {
    const data = await apiRequest(`/reviews/product/${productId}`);
    renderReviewsSection(productId, data.reviews || []);
  } catch (err) {
    box.innerHTML = "";
  }
}

function renderReviewsSection(productId, reviews) {
  const box = document.getElementById("reviews-section");
  const myName = localStorage.getItem("userName");
  const alreadyReviewed = isLoggedIn() && reviews.some((r) => (r.user?.name || r.name) === myName);

  const reviewsHtml = reviews.length
    ? reviews
        .map(
          (r) => `
      <div class="admin-card" style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${r.user?.name || r.name || "Anonymous"}</strong>
          <span class="stars">${starRating(r.rating)}</span>
        </div>
        <p style="margin:6px 0 0; color:var(--muted); font-size:14px;">${r.comment}</p>
        <p style="margin:4px 0 0; font-size:12px; color:var(--muted);">${new Date(r.createdAt).toLocaleDateString()}</p>
      </div>`
        )
        .join("")
    : `<p style="color:var(--muted);">No reviews yet — be the first to review this product!</p>`;

  let formHtml;
  if (!isLoggedIn()) {
    formHtml = `<p style="margin-top:14px;"><a href="login.html">Log in</a> to write a review.</p>`;
  } else if (alreadyReviewed) {
    formHtml = `<p style="margin-top:14px; color:var(--muted);">You've already reviewed this product — thanks for the feedback!</p>`;
  } else {
    formHtml = `
      <div class="admin-card" style="margin-top:14px;">
        <h3>Write a Review</h3>
        <div class="form-group">
          <label>Rating</label>
          <select id="review-rating">
            <option value="5">★★★★★ (5 - Excellent)</option>
            <option value="4">★★★★☆ (4 - Good)</option>
            <option value="3">★★★☆☆ (3 - Average)</option>
            <option value="2">★★☆☆☆ (2 - Poor)</option>
            <option value="1">★☆☆☆☆ (1 - Bad)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Comment</label>
          <textarea id="review-comment" rows="3" placeholder="Share your experience with this product..."></textarea>
        </div>
        <button class="btn" onclick="submitReview('${productId}')">Submit Review</button>
        <div id="review-alert"></div>
      </div>`;
  }

  box.innerHTML = `
    <div class="section-title"><h2>⭐ Customer Reviews</h2></div>
    ${reviewsHtml}
    ${formHtml}
  `;
}

async function submitReview(productId) {
  const alertBox = document.getElementById("review-alert");
  const rating = parseInt(document.getElementById("review-rating").value, 10);
  const comment = document.getElementById("review-comment").value.trim();

  if (!comment) {
    alertBox.innerHTML = `<div class="alert alert-error">Please write a comment before submitting.</div>`;
    return;
  }

  try {
    await apiRequest("/reviews", "POST", { productId, rating, comment }, true);
    showToast("Review submitted!", "success");
    // Reload the whole product detail so the average rating/review count
    // shown near the price, and the reviews list, both stay in sync.
    loadProductDetail();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function addToCartHandler(productId) {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  try {
    await apiRequest("/cart", "POST", { productId, quantity: 1 }, true);
    showToast("Added to cart!", "success");
    updateCartCount();
  } catch (err) {
    showToast(err.message, "error");
  }
}
