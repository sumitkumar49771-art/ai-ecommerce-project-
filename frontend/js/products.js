/* ---------------- HERO BANNER — rotating poster + single search ---------------- */
const HERO_SLIDES = [
  {
    tag: "electronics,gadgets", eyebrow: "Top Electronics Deals", heading: "Gadgets that", accent: "keep you ahead",
    sub: "Headphones, smart watches, speakers and more — curated by AI.",
    grad: "linear-gradient(160deg, #ffffff, #e9e3fc)",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    svg: `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scr1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
        <linearGradient id="body1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2b2640"/><stop offset="100%" stop-color="#181425"/>
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="272" rx="120" ry="14" fill="#4c1d95" opacity="0.12"/>
      <path d="M52 78 h164 a10 10 0 0 1 10 10 v110 a10 10 0 0 1 -10 10 H52 a10 10 0 0 1 -10 -10 V88 a10 10 0 0 1 10 -10 Z" fill="url(#body1)"/>
      <rect x="58" y="86" width="152" height="106" rx="4" fill="url(#scr1)"/>
      <path d="M28 208 h228 l-14 20 a14 14 0 0 1 -11 6 H53 a14 14 0 0 1 -11 -6 Z" fill="#332d4d"/>
      <rect x="18" y="214" width="46" height="58" rx="15" fill="#15121f"/>
      <rect x="26" y="224" width="30" height="38" rx="8" fill="#3b3556"/>
      <rect x="34" y="216" width="14" height="6" rx="2" fill="#15121f"/>
      <rect x="150" y="214" width="76" height="52" rx="14" fill="#f4f1fb" stroke="#ded7f3" stroke-width="2"/>
      <circle cx="176" cy="240" r="12" fill="#fff" stroke="#ded7f3" stroke-width="2"/>
      <circle cx="202" cy="240" r="12" fill="#fff" stroke="#ded7f3" stroke-width="2"/>
      <rect x="246" y="66" width="58" height="122" rx="16" fill="#15121f"/>
      <rect x="251" y="74" width="48" height="98" rx="8" fill="url(#scr1)"/>
      <circle cx="275" cy="180" r="3" fill="#4b4468"/>
    </svg>`,
  },
  {
    tag: "fashion,clothing", eyebrow: "Trending Fashion", heading: "Style that's", accent: "made for you",
    sub: "Fresh looks in clothing, picked to match your taste.",
    grad: "linear-gradient(160deg, #ffffff, #fdefd8)",
    img: "https://images.pexels.com/photos/31961165/pexels-photo-31961165.jpeg?auto=compress&cs=tinysrgb&w=900",
    svg: `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hood1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="278" rx="110" ry="12" fill="#7c2d12" opacity="0.12"/>
      <rect x="150" y="36" width="20" height="30" rx="6" fill="#a3a3a3"/>
      <path d="M110 74 Q160 44 210 74 L236 108 L206 128 L206 250 Q206 262 194 262 H126 Q114 262 114 250 V128 L84 108 Z" fill="url(#hood1)"/>
      <path d="M136 74 Q160 96 184 74" fill="none" stroke="#fde68a" stroke-width="6" stroke-linecap="round"/>
      <circle cx="150" cy="150" r="4" fill="#fff7ed" opacity="0.7"/>
      <circle cx="150" cy="180" r="4" fill="#fff7ed" opacity="0.7"/>
      <rect x="140" y="160" width="40" height="34" rx="8" fill="#c2410c" opacity="0.5"/>
    </svg>`,
  },
  {
    tag: "shoes,fashion", eyebrow: "Footwear Picks", heading: "Every step,", accent: "perfectly matched",
    sub: "From running shoes to formal wear — comfort meets style.",
    img: "https://images.pexels.com/photos/18212364/pexels-photo-18212364.jpeg?auto=compress&cs=tinysrgb&w=900",
    grad: "linear-gradient(160deg, #ffffff, #dff3e6)",
    svg: `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shoe1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#0891b2"/>
        </linearGradient>
      </defs>
      <ellipse cx="165" cy="238" rx="130" ry="14" fill="#065f46" opacity="0.12"/>
      <path d="M40 210 Q40 170 80 160 L110 150 Q140 128 176 132 L220 140 Q260 146 278 176 Q286 192 270 206 L266 214 Q260 224 246 224 H62 Q44 224 40 210 Z" fill="url(#shoe1)"/>
      <path d="M110 150 Q140 128 176 132 L220 140 Q214 158 190 160 Q150 162 118 168 Z" fill="#ecfeff" opacity="0.85"/>
      <path d="M40 210 H270" stroke="#064e3b" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
      <circle cx="140" cy="150" r="3" fill="#fff"/>
      <circle cx="160" cy="146" r="3" fill="#fff"/>
      <circle cx="180" cy="146" r="3" fill="#fff"/>
    </svg>`,
  },
  {
    tag: "home,decor", eyebrow: "Home & Kitchen", heading: "Make your house", accent: "feel like home",
    sub: "Cookware, decor and appliances for everyday living.",
    img: "https://images.pexels.com/photos/6758281/pexels-photo-6758281.jpeg?auto=compress&cs=tinysrgb&w=900",
    grad: "linear-gradient(160deg, #ffffff, #f6e4d8)",
    svg: `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chair1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="270" rx="120" ry="13" fill="#1e293b" opacity="0.12"/>
      <path d="M78 120 Q78 88 110 88 H210 Q242 88 242 120 V172 H78 Z" fill="url(#chair1)"/>
      <rect x="60" y="160" width="200" height="56" rx="18" fill="#64748b"/>
      <rect x="68" y="216" width="26" height="46" rx="6" fill="#334155"/>
      <rect x="226" y="216" width="26" height="46" rx="6" fill="#334155"/>
      <rect x="50" y="150" width="26" height="60" rx="12" fill="#7c8ba1"/>
      <rect x="244" y="150" width="26" height="60" rx="12" fill="#7c8ba1"/>
    </svg>`,
  },
  {
    tag: "beauty,cosmetics", eyebrow: "Beauty & Personal Care", heading: "Look good,", accent: "feel even better",
    sub: "Skincare, grooming and beauty essentials, just for you.",
    grad: "linear-gradient(160deg, #ffffff, #fbe0ea)",
    img: "https://images.pexels.com/photos/4841273/pexels-photo-4841273.jpeg?auto=compress&cs=tinysrgb&w=900",
    svg: `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lip1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#be185d"/>
        </linearGradient>
        <linearGradient id="bottle1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fbcfe8"/><stop offset="100%" stop-color="#f9a8d4"/>
        </linearGradient>
      </defs>
      <ellipse cx="165" cy="272" rx="120" ry="13" fill="#831843" opacity="0.12"/>
      <rect x="70" y="150" width="70" height="110" rx="10" fill="url(#bottle1)"/>
      <rect x="88" y="120" width="34" height="34" rx="4" fill="#fde68a"/>
      <rect x="94" y="104" width="22" height="20" rx="3" fill="#fbbf24"/>
      <path d="M198 90 Q210 60 228 58 Q246 56 250 78 Q252 96 232 110 L232 220 Q232 236 216 236 Q200 236 200 220 L200 110 Q186 100 190 82 Z" fill="url(#lip1)"/>
      <rect x="196" y="220" width="40" height="40" rx="8" fill="#831843"/>
    </svg>`,
  },
];
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

// Crossfades between two stacked background layers so the new poster image
// is fully loaded before it fades in — avoids a blank flash mid-transition.
function initHeroBanner() {
  const banner = document.getElementById("hero-banner");
  if (!banner) return;

  const visualTile = document.getElementById("hero-visual-tile");
  const eyebrowEl = document.getElementById("hero-banner-eyebrow");
  const headingEl = document.getElementById("hero-banner-heading");
  const subEl = document.getElementById("hero-banner-sub");
  const dotsEl = document.getElementById("hero-banner-dots");
  let slideIndex = 0;

  dotsEl.innerHTML = HERO_SLIDES.map(
    (_, i) => `<button class="hero-banner-dot${i === 0 ? " active" : ""}" onclick="goToHeroSlide(${i})" aria-label="Slide ${i + 1}"></button>`
  ).join("");

  function renderVisual(slide, container) {
    if (slide.img) {
      container.innerHTML = "";
      const img = document.createElement("img");
      img.src = slide.img;
      img.alt = slide.eyebrow;
      img.loading = "eager";
      img.onerror = () => {
        container.innerHTML = slide.svg;
      };
      container.appendChild(img);
    } else {
      container.innerHTML = slide.svg;
    }
  }

  function showSlide(i, immediate) {
    const slide = HERO_SLIDES[i];

    if (visualTile) {
      if (immediate) {
        renderVisual(slide, visualTile);
        visualTile.style.background = slide.grad;
        visualTile.style.transform = "scale(1)";
        visualTile.style.opacity = "1";
      } else {
        visualTile.style.transform = "scale(0.85)";
        visualTile.style.opacity = "0";
        setTimeout(() => {
          renderVisual(slide, visualTile);
          visualTile.style.background = slide.grad;
          visualTile.style.transform = "scale(1)";
          visualTile.style.opacity = "1";
        }, 250);
      }
    }

    if (immediate) {
      eyebrowEl.innerHTML = `<span class="pulse-dot"></span> ${slide.eyebrow}`;
      headingEl.innerHTML = `${slide.heading}<br /><span class="accent">${slide.accent}</span>`;
      subEl.textContent = slide.sub;
      [eyebrowEl, headingEl, subEl].forEach((el) => (el.style.opacity = "1"));
    } else {
      [eyebrowEl, headingEl, subEl].forEach((el) => (el.style.opacity = "0"));
      setTimeout(() => {
        eyebrowEl.innerHTML = `<span class="pulse-dot"></span> ${slide.eyebrow}`;
        headingEl.innerHTML = `${slide.heading}<br /><span class="accent">${slide.accent}</span>`;
        subEl.textContent = slide.sub;
        [eyebrowEl, headingEl, subEl].forEach((el) => (el.style.opacity = "1"));
      }, 300);
    }

    dotsEl.querySelectorAll(".hero-banner-dot").forEach((d, idx) => d.classList.toggle("active", idx === i));
    slideIndex = i;
  }

  window.goToHeroSlide = (i) => {
    clearInterval(banner._heroTimer);
    showSlide(i);
    banner._heroTimer = setInterval(() => showSlide((slideIndex + 1) % HERO_SLIDES.length), 4500);
  };

  showSlide(0, true);
  banner._heroTimer = setInterval(() => showSlide((slideIndex + 1) % HERO_SLIDES.length), 4500);
}

function initHero() {
  const input = document.getElementById("smart-search-input");
  if (input) typewriterLoop(input);
  initHeroBanner();
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
  if (p.dealLabel === "Excellent Deal") return `<span class="badge-tag badge-deal">🤖 ${p.dealScore}% Deal Score</span>`;
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

// Short, single-line teaser of what the product actually is/does, shown on
// every product card (home sections, listing page, wishlist, etc.) so
// shoppers don't have to open the detail page just to know what it is.
function productDescSnippet(p) {
  if (!p.description) return "";
  const text = p.description.length > 70 ? p.description.slice(0, 70).trim() + "…" : p.description;
  return `<p class="product-desc">${text}</p>`;
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
        ${productDescSnippet(p)}
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
    el.classList.remove("pop-anim");
    void el.offsetWidth; // restart animation even if clicked repeatedly
    el.classList.add("pop-anim");
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

/* ---------- GENERIC FILTER BAR (used on every product section) ----------
   Renders the same sort/category/price/rating controls used on the
   Products page and wires them up to re-filter a locally-held array of
   products, so sections like Featured/Deals/Sale/Wishlist can each get a
   full filter bar without hitting the API on every change. */
function filterBarHtml(prefix) {
  const catOptions = Object.keys(CATEGORY_ICONS)
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  return `
    <div class="filter-bar">
      <div class="filter-select-wrap">
        <select id="${prefix}-sort-select" class="filter-select" onchange="applySectionFilter('${prefix}')">
          <option value="">Sort: Default</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="ratingAsc">Rating: Low to High</option>
        </select>
      </div>
      <div class="filter-select-wrap">
        <select id="${prefix}-category-select" class="filter-select" onchange="applySectionFilter('${prefix}')">
          <option value="">All Categories</option>
          ${catOptions}
        </select>
      </div>
      <div class="filter-select-wrap price-range-wrap">
        <input type="number" id="${prefix}-min-price" placeholder="Min ₹" min="0" class="filter-select price-input" onchange="applySectionFilter('${prefix}')" />
        <span style="color:var(--muted);">–</span>
        <input type="number" id="${prefix}-max-price" placeholder="Max ₹" min="0" class="filter-select price-input" onchange="applySectionFilter('${prefix}')" />
      </div>
      <div class="filter-select-wrap">
        <select id="${prefix}-rating-select" class="filter-select" onchange="applySectionFilter('${prefix}')">
          <option value="">Any Rating</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
        </select>
      </div>
    </div>`;
}

// Holds the unfiltered product list for every section that has its own
// filter bar, keyed by prefix (e.g. "featured", "deals", "sale", "wishlist").
const sectionRawData = {};

function renderFilteredSection(prefix, gridId, emptyHtml) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const raw = sectionRawData[prefix] || [];

  const category = document.getElementById(`${prefix}-category-select`)?.value || "";
  const minPrice = parseFloat(document.getElementById(`${prefix}-min-price`)?.value) || null;
  const maxPrice = parseFloat(document.getElementById(`${prefix}-max-price`)?.value) || null;
  const minRating = parseFloat(document.getElementById(`${prefix}-rating-select`)?.value) || null;
  const sort = document.getElementById(`${prefix}-sort-select`)?.value || "";

  let list = raw.filter((p) => {
    if (category && p.category !== category) return false;
    if (minPrice !== null && p.price < minPrice) return false;
    if (maxPrice !== null && p.price > maxPrice) return false;
    if (minRating !== null && (p.rating || 0) < minRating) return false;
    return true;
  });

  const sorters = {
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    ratingAsc: (a, b) => (a.rating || 0) - (b.rating || 0),
  };
  if (sorters[sort]) list = [...list].sort(sorters[sort]);

  grid.innerHTML = list.length ? list.map(productCard).join("") : emptyHtml;
}

// Called by every filter control's onchange handler.
// NOTE: the "featured" section only ever holds the 24 *newest* products
// locally (see loadHomePage), so filtering that small cached list by
// category/price/rating on the client will show "No products match" for
// any category that isn't among those 24 newest items — even though the
// store has plenty of matching products. To fix this, "featured" re-queries
// the backend with the selected filters instead of filtering the local cache.
function applySectionFilter(prefix) {
  if (prefix === "featured") {
    applyFeaturedFilter();
    return;
  }
  if (prefix === "deals") {
    applyDealsFilter();
    return;
  }
  const config = SECTION_FILTER_CONFIG[prefix];
  if (!config) return;
  renderFilteredSection(prefix, config.gridId, config.emptyHtml);
}

// "Today's Best Deals" ranks the deal score across the WHOLE catalog and
// keeps only the top 24 — a category can have real deals that simply don't
// make that global top 24. So re-fetch from the backend scoped to the
// chosen category (the backend supports this — see aiController.getDeals),
// instead of filtering the small already-loaded top-24 list on the client.
async function applyDealsFilter() {
  const grid = document.getElementById("deals-grid");
  if (!grid) return;

  const category = document.getElementById("deals-category-select")?.value || "";

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  query.set("limit", 24);

  grid.innerHTML = "<p>Loading…</p>";
  try {
    const data = await apiRequest(`/ai/deals?${query.toString()}`);
    sectionRawData.deals = data.deals;
    renderFilteredSection("deals", "deals-grid", SECTION_FILTER_CONFIG.deals.emptyHtml);
  } catch (err) {
    grid.innerHTML = "<p>Could not load deals.</p>";
  }
}

async function applyFeaturedFilter() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  const category = document.getElementById("featured-category-select")?.value || "";
  const minPrice = document.getElementById("featured-min-price")?.value || "";
  const maxPrice = document.getElementById("featured-max-price")?.value || "";
  const minRating = document.getElementById("featured-rating-select")?.value || "";
  const sort = document.getElementById("featured-sort-select")?.value || "";

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (minPrice) query.set("minPrice", minPrice);
  if (maxPrice) query.set("maxPrice", maxPrice);
  if (minRating) query.set("minRating", minRating);
  query.set("sort", sort || "newest");
  query.set("limit", 24);

  grid.innerHTML = "<p>Loading…</p>";
  try {
    const data = await apiRequest(`/products?${query.toString()}`);
    sectionRawData.featured = data.products;
    grid.innerHTML = data.products.length
      ? data.products.map(productCard).join("")
      : SECTION_FILTER_CONFIG.featured.emptyHtml;
  } catch (err) {
    grid.innerHTML = "<p>Could not load products.</p>";
  }
}

const SECTION_FILTER_CONFIG = {
  featured: { gridId: "featured-grid", emptyHtml: "<p>No products match these filters.</p>" },
  deals: { gridId: "deals-grid", emptyHtml: "<p>No deals match these filters.</p>" },
  sale: { gridId: "sale-grid", emptyHtml: "<p>No sale items match these filters.</p>" },
  wishlist: {
    gridId: "wishlist-grid",
    emptyHtml: `
      <div class="empty-state">
        <span class="empty-icon">🤍</span>
        <h3>No items match these filters</h3>
        <p>Try adjusting or clearing the filters above.</p>
      </div>`,
  },
};

async function loadWishlistPage() {
  const grid = document.getElementById("wishlist-grid");
  const filterBarEl = document.getElementById("wishlist-filter-bar");
  if (filterBarEl) filterBarEl.innerHTML = filterBarHtml("wishlist");
  if (!isLoggedIn()) {
    if (filterBarEl) filterBarEl.style.display = "none";
    grid.innerHTML = `<p>Please <a href="login.html">login</a> to view your wishlist.</p>`;
    return;
  }
  try {
    const wishlist = await apiRequest("/auth/wishlist", "GET", null, true);
    currentWishlistIds = new Set(wishlist.map((p) => p._id));
    sectionRawData.wishlist = wishlist;
    if (wishlist.length === 0) {
      if (filterBarEl) filterBarEl.style.display = "none";
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🤍</span>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love here so you don't lose track of them.</p>
          <a class="btn" href="products.html">Browse Products</a>
        </div>`;
      return;
    }
    if (filterBarEl) filterBarEl.style.display = "";
    renderFilteredSection("wishlist", "wishlist-grid", SECTION_FILTER_CONFIG.wishlist.emptyHtml);
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

/* ---------- RECENTLY VIEWED (homepage) ---------- */
async function loadRecentlyViewed() {
  const section = document.getElementById("recently-viewed-section");
  const row = document.getElementById("recently-viewed-row");
  if (!section || !row || !isLoggedIn()) return;

  try {
    const data = await apiRequest("/ai/recently-viewed", "GET", null, true);
    if (data.products.length === 0) return; // stay hidden until they've viewed something
    row.innerHTML = data.products.map(productCard).join("");
    section.style.display = "block";
  } catch (err) {
    // non-critical — just leave the section hidden
  }
}

/* ---------- AI DEAL SCORE (homepage) ---------- */
async function loadDeals() {
  const grid = document.getElementById("deals-grid");
  if (!grid) return;
  const bar = document.getElementById("deals-filter-bar");
  if (bar) bar.innerHTML = filterBarHtml("deals");
  try {
    const data = await apiRequest("/ai/deals?limit=24");
    sectionRawData.deals = data.deals;
    renderFilteredSection("deals", "deals-grid", SECTION_FILTER_CONFIG.deals.emptyHtml);
  } catch (err) {
    grid.innerHTML = "<p>Could not load deals. Is the backend running?</p>";
  }
}

/* ---------- HOME PAGE ---------- */
async function loadHomePage() {
  renderCategoryChips();
  await loadWishlistIds();
  loadDeals();
  loadRecentlyViewed();
  loadHomeSaleSection();
  const grid = document.getElementById("featured-grid");
  const recGrid = document.getElementById("recommended-grid");
  const featuredBar = document.getElementById("featured-filter-bar");
  if (featuredBar) featuredBar.innerHTML = filterBarHtml("featured");

  try {
    const data = await apiRequest("/products?limit=24&sort=newest");
    sectionRawData.featured = data.products;
    if (grid) renderFilteredSection("featured", "featured-grid", SECTION_FILTER_CONFIG.featured.emptyHtml);
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
    const data = await apiRequest("/products?deal=true&limit=24&sort=newest");
    if (data.products.length) {
      sectionRawData.sale = data.products;
      const saleBar = document.getElementById("sale-filter-bar");
      if (saleBar) saleBar.innerHTML = filterBarHtml("sale");
      renderFilteredSection("sale", "sale-grid", SECTION_FILTER_CONFIG.sale.emptyHtml);
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
  const sortSelectEl = document.getElementById("sort-select");
  if (deal && sortSelectEl && page === 1 && !sortSelectEl.dataset.dealDefaultApplied) {
    sortSelectEl.value = "rating";
    sortSelectEl.dataset.dealDefaultApplied = "true";
  }
  const sort = sortSelectEl?.value || "";
  const minPrice = document.getElementById("min-price-input")?.value || "";
  const maxPrice = document.getElementById("max-price-input")?.value || "";
  const minRating = document.getElementById("rating-select")?.value || "";

  showSaleBannerIfNeeded(deal);

  const titleEl = document.getElementById("products-page-title");
  if (titleEl) {
    titleEl.textContent = deal
      ? "🤖 Personalized Deals for You"
      : category
      ? category
      : "All Products";
  }

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
      ? `<div class="empty-state"><span class="empty-icon">🔥</span><h3>No deals live right now</h3><p>Check back soon for fresh discounts!</p></div>`
      : `<div class="empty-state"><span class="empty-icon">🔍</span><h3>No products found</h3><p>Try adjusting your filters or search term.</p></div>`;
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
  hideSearchSuggestions();
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
          <p style="margin:0 0 14px; font-size:13px; color:var(--muted);">Sold by <strong style="color:var(--text);">${p.seller ? p.seller.name : "ShopAI Retail"}</strong></p>
          <button class="btn" onclick="addToCartHandler('${p._id}', event)">Add to Cart</button>
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

async function addToCartHandler(productId, event) {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  try {
    await apiRequest("/cart", "POST", { productId, quantity: 1 }, true);
    showToast("Added to cart!", "success");
    flyToCartAnimation(event);
    updateCartCount();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Small delightful touch: animates a dot flying from the clicked button
// toward the Cart icon in the navbar, then bumps the cart count badge.
function flyToCartAnimation(event) {
  const cartLink = document.querySelector('.nav-links a[href="cart.html"]');
  if (!event || !event.target || !cartLink) return;

  const btn = event.target.closest("button") || event.target;
  btn.classList.remove("added-anim");
  void btn.offsetWidth;
  btn.classList.add("added-anim");

  const startRect = btn.getBoundingClientRect();
  const endRect = cartLink.getBoundingClientRect();

  const dot = document.createElement("div");
  dot.className = "fly-to-cart";
  dot.style.width = "16px";
  dot.style.height = "16px";
  dot.style.background = "var(--primary, #2563eb)";
  dot.style.left = `${startRect.left + startRect.width / 2 - 8}px`;
  dot.style.top = `${startRect.top + startRect.height / 2 - 8}px`;
  document.body.appendChild(dot);

  // Trigger the transition on the next frame so the browser registers the start position first
  requestAnimationFrame(() => {
    dot.style.left = `${endRect.left + endRect.width / 2 - 8}px`;
    dot.style.top = `${endRect.top + endRect.height / 2 - 8}px`;
    dot.style.transform = "scale(0.3)";
    dot.style.opacity = "0.5";
  });

  setTimeout(() => {
    dot.remove();
    const badge = document.getElementById("cart-count");
    if (badge) {
      badge.classList.remove("bump-anim");
      void badge.offsetWidth;
      badge.classList.add("bump-anim");
    }
  }, 700);
}
