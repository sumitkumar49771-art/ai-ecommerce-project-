// Renders the shared header (topbar + navbar + category row) and footer,
// and powers the AI chatbot widget, on every page.

const NAV_CATEGORIES = [
  "Footwear", "Electronics", "Clothing", "Accessories", "Home & Kitchen",
  "Beauty & Personal Care", "Books", "Sports & Fitness", "Toys & Games", "Grocery & Gourmet",
];

function renderTopbar() {
  if (document.getElementById("topbar")) return;
  const bar = document.createElement("div");
  bar.id = "topbar";
  bar.className = "topbar";
  bar.innerHTML = `
    <div class="topbar-left" id="topbar-left">
      <span id="topbar-free-delivery">🚚 Free Delivery on orders above ₹499</span>
    </div>
    <div class="topbar-right">
      <a href="orders.html">📦 Track Order</a>
      <a href="#" onclick="toggleChat(); return false;">🎧 Help &amp; Support</a>
      <a href="#" onclick="showToast('App coming soon! For now, enjoy ShopAI on the web.', 'info'); return false;">⬇ Download App</a>
    </div>
  `;
  document.body.insertBefore(bar, document.body.firstChild);

  getSaleSettings().then((settings) => {
    const el = document.getElementById("topbar-free-delivery");
    if (el && settings && settings.freeDeliveryAbove) {
      el.textContent = `🚚 Free Delivery on orders above ₹${settings.freeDeliveryAbove}`;
    }
    syncHomeFeatureCards(settings);
    syncStoreBranding(settings);
    if (settings && settings.saleEnabled) {
      const left = document.getElementById("topbar-left");
      if (left) {
        const link = document.createElement("a");
        link.href = "products.html?deal=true";
        link.className = "topbar-sale-link";
        link.innerHTML = `<span class="topbar-badge">★ Big Summer Sale is Live!</span> Up to 50% OFF`;
        left.insertBefore(link, left.firstChild);
      }
    }
  });
}

async function renderNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  renderTopbar();

  const loggedIn = isLoggedIn();
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  nav.className = "navbar";
  nav.innerHTML = `
    <a href="index.html" class="logo" id="nav-logo">Shop<span>AI</span></a>
    <div class="nav-search-wrap" style="position:relative;">
      <form class="nav-search" onsubmit="handleSmartSearch(event)">
        <input id="smart-search-input" placeholder="Search for products, brands and more..." autocomplete="off" oninput="handleSearchInput(this.value)" onblur="setTimeout(hideSearchSuggestions, 150)" />
        <button type="submit">🔍 Search</button>
      </form>
      <div id="search-suggestions" class="search-suggestions" style="display:none;"></div>
    </div>
    <div class="nav-links">
      <a href="#" onclick="toggleDarkMode(); return false;" title="Toggle dark mode" id="dark-mode-toggle">🌙</a>
      ${
        loggedIn
          ? `<a href="wishlist.html">♡ Wishlist <span class="badge" id="wishlist-count" style="display:none;">0</span></a>`
          : ""
      }
      <a href="cart.html">🛒 Cart <span class="badge" id="cart-count" style="display:none;">0</span></a>
      ${
        loggedIn
          ? `<a href="sell.html">🏷 Sell</a>
             <a href="orders.html">👤 My Orders</a>
             ${isAdmin() ? `<a href="admin.html" class="badge">⚙ Admin</a>` : ""}
             <a href="#" onclick="logout()" class="btn btn-outline">Logout</a>`
          : `<a href="login.html" class="btn btn-outline">Login</a>
             <a href="register.html" class="btn">Sign Up</a>`
      }
    </div>
  `;

  if (!nav.dataset.categoryRowAdded) {
    // Figure out which section we're currently on, so the matching nav
    // link can be highlighted — makes it obvious at a glance where you are.
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const currentCategory = new URLSearchParams(window.location.search).get("category") || "";

    const catRow = document.createElement("div");
    catRow.className = "navbar-categories";
    catRow.innerHTML = `
      <div class="all-cat-wrap" style="position:relative; display:inline-block;">
        <a href="#" class="all-cat" onclick="toggleAllCategoriesMenu(event)">☰ All Categories</a>
        <div id="all-categories-dropdown" class="all-categories-dropdown" style="display:none;">
          ${NAV_CATEGORIES.map(
            (c) =>
              `<a href="products.html?category=${encodeURIComponent(c)}" class="${
                currentPath === "products.html" && currentCategory === c ? "active" : ""
              }">${c}</a>`
          ).join("")}
        </div>
      </div>
      <a href="index.html" class="${currentPath === "index.html" ? "active" : ""}">Home</a>
      ${NAV_CATEGORIES
        .map(
          (c) =>
            `<a href="products.html?category=${encodeURIComponent(c)}" class="${
              currentPath === "products.html" && currentCategory === c ? "active" : ""
            }">${c}</a>`
        )
        .join("")}
    `;
    nav.insertAdjacentElement("afterend", catRow);
    nav.dataset.categoryRowAdded = "true";
  }

  // Highlight Wishlist / Cart / My Orders in the top nav-links row too,
  // so it's clear which of those sections you're currently viewing.
  nav.querySelectorAll(".nav-links a[href]").forEach((a) => {
    const hrefPage = a.getAttribute("href").split("?")[0];
    if (hrefPage === currentPage && hrefPage !== "#") a.classList.add("active");
  });

  if (loggedIn) {
    updateWishlistCount();
    updateCartCount();
  }
  applyDarkModePreference();
}

function toggleAllCategoriesMenu(event) {
  event.preventDefault();
  event.stopPropagation();
  const menu = document.getElementById("all-categories-dropdown");
  if (!menu) return;
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("all-categories-dropdown");
  if (menu && menu.style.display === "block" && !menu.contains(e.target) && !e.target.closest(".all-cat")) {
    menu.style.display = "none";
  }
});

async function updateWishlistCount() {
  try {
    const wishlist = await apiRequest("/auth/wishlist", "GET", null, true);
    const badge = document.getElementById("wishlist-count");
    if (badge && wishlist.length) {
      badge.textContent = wishlist.length;
      badge.style.display = "inline-block";
    }
  } catch (err) {
    // silently ignore — wishlist count is a non-critical UI enhancement
  }
}

// Shows the total number of items (sum of quantities) in the cart as a
// badge next to the "Cart" link in the navbar. Call this after any
// add/update/remove action so the badge always stays in sync.
async function updateCartCount() {
  try {
    const cart = await apiRequest("/cart", "GET", null, true);
    const totalQty = (cart.items || []).reduce((sum, i) => sum + i.quantity, 0);
    [document.getElementById("cart-count"), document.getElementById("mobile-cart-count")].forEach((badge) => {
      if (!badge) return;
      if (totalQty > 0) {
        badge.textContent = totalQty;
        badge.style.display = "inline-block";
      } else {
        badge.style.display = "none";
      }
    });
  } catch (err) {
    // silently ignore — cart count is a non-critical UI enhancement
  }
}

// App-style bottom navigation bar shown only on small screens (see
// .mobile-bottom-nav CSS media query). Always rendered in the DOM — CSS
// handles hiding it on desktop — so it stays in sync without extra JS.
function renderMobileNav() {
  if (document.getElementById("mobile-bottom-nav")) return;
  const loggedIn = isLoggedIn();
  const path = window.location.pathname.split("/").pop() || "index.html";

  const items = [
    { href: "index.html", icon: "🏠", label: "Home" },
    { href: "products.html", icon: "🔍", label: "Search" },
    ...(loggedIn ? [{ href: "sell.html", icon: "🏷", label: "Sell" }] : []),
    { href: "cart.html", icon: "🛒", label: "Cart", badgeId: "mobile-cart-count" },
    loggedIn
      ? { href: "wishlist.html", icon: "♡", label: "Wishlist" }
      : { href: "login.html", icon: "♡", label: "Wishlist" },
    loggedIn
      ? { href: "orders.html", icon: "👤", label: "Account" }
      : { href: "login.html", icon: "👤", label: "Login" },
  ];

  const nav = document.createElement("div");
  nav.id = "mobile-bottom-nav";
  nav.className = "mobile-bottom-nav";
  nav.innerHTML = items
    .map(
      (item) => `
      <a href="${item.href}" class="${path === item.href ? "active" : ""}">
        <span class="mobile-nav-icon">${item.icon}${
          item.badgeId ? `<span class="badge" id="${item.badgeId}" style="display:none;">0</span>` : ""
        }</span>
        <span>${item.label}</span>
      </a>`
    )
    .join("");
  document.body.appendChild(nav);
}

let searchDebounceTimer = null;

// Debounced as-you-type suggestions dropdown under the navbar search box.
function handleSearchInput(value) {
  clearTimeout(searchDebounceTimer);
  const query = value.trim();
  const box = document.getElementById("search-suggestions");
  if (!box) return;

  if (query.length < 2) {
    hideSearchSuggestions();
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const data = await apiRequest(`/products/suggestions?q=${encodeURIComponent(query)}`);
      renderSearchSuggestions(data.suggestions, query);
    } catch (err) {
      hideSearchSuggestions();
    }
  }, 250); // wait for typing to pause before hitting the API
}

function renderSearchSuggestions(suggestions, query) {
  const box = document.getElementById("search-suggestions");
  if (!box) return;

  if (!suggestions.length) {
    box.innerHTML = `<div class="search-suggestion-empty">No matches for "${query}" — press Enter for AI smart search instead.</div>`;
    box.style.display = "block";
    return;
  }

  box.innerHTML = suggestions
    .map(
      (p) => `
      <a href="product-detail.html?id=${p._id}" class="search-suggestion-item">
        <img src="${p.image}" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');" />
        <div>
          <div class="ss-name">${p.name}</div>
          <div class="ss-meta">${p.category} · ₹${p.price}</div>
        </div>
      </a>`
    )
    .join("");
  box.style.display = "block";
}

function hideSearchSuggestions() {
  const box = document.getElementById("search-suggestions");
  if (box) box.style.display = "none";
}

function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="site-footer">
      <div class="footer-top">
        <div class="footer-col">
          <h4 id="footer-logo">Shop<span style="color:#60a5fa">AI</span></h4>
          <p>ShopAI is your smart shopping destination. We use AI to personalize your experience and bring you the best products.</p>
          <div class="footer-social">
            <a href="https://instagram.com/sumit_4673_" title="Instagram" target="_blank" rel="noopener">📷</a>
            <a href="https://github.com/sumitkumar49771-art" title="GitHub" target="_blank" rel="noopener">🐙</a>
            <a href="https://www.linkedin.com/in/sumit-kumar-957356266/" title="LinkedIn" target="_blank" rel="noopener">💼</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Customer Service</h4>
          <a href="help-center.html">Help Center</a>
          <a href="orders.html">Track Your Order</a>
          <a href="returns.html">Returns &amp; Refunds</a>
          <a href="shipping.html">Shipping Info</a>
          <a href="contact.html">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <a href="about.html">About Us</a>
          <a href="careers.html">Careers</a>
          <a href="blog.html">Blog</a>
          <a href="terms.html">Terms &amp; Conditions</a>
          <a href="privacy.html">Privacy Policy</a>
        </div>
        <div class="footer-col">
          <h4>AI Features</h4>
          <a href="index.html#recommended-section">AI Recommendations</a>
          <a href="#" onclick="focusSmartSearch(event); return false;">Smart Search</a>
          <a href="#" onclick="toggleChat(); return false;">AI Shopping Assistant</a>
          <a href="products.html?deal=true">Personalized Deals</a>
        </div>
        <div class="footer-col">
          <h4>Contact Us</h4>
          <p>Golden Avenue,<br/>Amritsar, Punjab, India - 143001</p>
          <p id="footer-contact-info">+91 62806 43874<br/>support@shopai.com</p>
          <h4 style="margin-top:14px;">Payment Methods</h4>
          <div class="footer-payment">
            <span class="pay-badge" title="VISA">
              <svg viewBox="0 0 48 16" width="42" height="16" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="13" font-family="Arial, sans-serif" font-style="italic" font-weight="800" font-size="15" fill="#1a1f71">VISA</text>
              </svg>
            </span>
            <span class="pay-badge" title="Mastercard">
              <svg viewBox="0 0 38 24" width="34" height="22" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="12" r="10" fill="#eb001b"/>
                <circle cx="25" cy="12" r="10" fill="#f79e1b" fill-opacity="0.9"/>
              </svg>
            </span>
            <span class="pay-badge" title="RuPay">
              <svg viewBox="0 0 48 16" width="42" height="16" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="13" font-family="Arial, sans-serif" font-weight="800" font-style="italic" font-size="13" fill="#0f4c81">Ru<tspan fill="#f7941d">Pay</tspan></text>
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ShopAI Admin. All Rights Reserved.</span>
        <span>Made with ❤️ by ShopAI Team — ksumit08940@gmail.com</span>
      </div>
    </div>
  `;
}

/* ---------------- AI CHATBOT WIDGET ---------------- */
function renderChatWidget() {
  const container = document.createElement("div");
  container.innerHTML = `
    <button id="ai-chat-button">💬</button>
    <div id="ai-chat-window">
      <div class="chat-header">
        <span>🤖 AI Shopping Assistant</span>
        <span style="cursor:pointer" onclick="toggleChat()">✕</span>
      </div>
      <div class="chat-body" id="chat-body">
        <div class="chat-msg bot">Hi! I'm your AI assistant. Try asking "show me shoes under 2000" or "what's trending?"</div>
      </div>
      <div class="chat-input">
        <input id="chat-input-field" placeholder="Ask me anything..." onkeydown="if(event.key==='Enter') sendChatMessage()"/>
        <button onclick="sendChatMessage()">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
}

function focusSmartSearch(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("smart-search-input");
  if (input) {
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus();
    showToast("Type anything — our AI understands natural search like 'shoes under 2000'.", "info");
  } else {
    window.location.href = "index.html#smart-search-input";
  }
}

function toggleChat() {
  document.getElementById("ai-chat-window").classList.toggle("open");
}

async function sendChatMessage() {
  const input = document.getElementById("chat-input-field");
  const message = input.value.trim();
  if (!message) return;

  const body = document.getElementById("chat-body");
  body.innerHTML += `<div class="chat-msg user">${escapeHtml(message)}</div>`;
  input.value = "";
  body.scrollTop = body.scrollHeight;

  try {
    const data = await apiRequest("/ai/chatbot", "POST", { message });
    body.innerHTML += `<div class="chat-msg bot">${escapeHtml(data.reply)}</div>`;
  } catch (err) {
    body.innerHTML += `<div class="chat-msg bot">Sorry, something went wrong. Is the backend running?</div>`;
  }
  body.scrollTop = body.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------- SITE ACCESS GATE (PIN/LOGIN LOCK SCREEN) ---------------- */
// Credentials are stored as a SHA-256 hash of "id:password" — not plain text.
// Default Login ID: admin | Default Password: shopai123
// To change: compute sha256("yourid:yourpassword") and paste the hex below.
const SITE_GATE_HASH = "1a934495cccef01eb7b603f1ddfa531b7a698420cdf185ddfbe06efac4f29846";

const GATE_MAX_ATTEMPTS = 3;
const GATE_LOCK_MS = 30000; // 30 seconds lockout after too many wrong tries

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getGateLockUntil() {
  return parseInt(localStorage.getItem("gateLockUntil") || "0", 10);
}
function getGateAttempts() {
  return parseInt(localStorage.getItem("gateAttempts") || "0", 10);
}

function renderAccessGate() {
  document.body.classList.add("gate-locked");

  const gate = document.createElement("div");
  gate.id = "access-gate";
  gate.className = "access-gate";
  gate.innerHTML = `
    <div class="access-gate-grid"></div>
    <div class="access-gate-orb3"></div>
    <div class="access-gate-card">
      <div class="access-gate-logo">Shop<span style="color:#60a5fa">AI</span></div>
      <p class="access-gate-sub">Enter your credentials to continue</p>
      <form id="access-gate-form" autocomplete="off">
        <div class="access-gate-field">
          <label for="gate-id">Login ID</label>
          <input id="gate-id" type="text" placeholder="Enter Login ID" autocomplete="off" required />
        </div>
        <div class="access-gate-field">
          <label for="gate-pass">Password</label>
          <div class="access-gate-pass-wrap">
            <input id="gate-pass" type="password" placeholder="Enter Password" autocomplete="off" required />
            <button type="button" class="access-gate-eye-btn" id="gate-eye-btn" aria-label="Show password" tabindex="-1">
              <svg id="gate-eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        <p id="gate-error" class="access-gate-error" style="display:none;"></p>
        <button type="submit" class="access-gate-btn" id="gate-submit-btn">Unlock</button>
        <a href="#" class="access-gate-forgot" id="gate-forgot-link">Forgot password?</a>
      </form>
    </div>
  `;
  document.body.appendChild(gate);

  const eyeBtn = gate.querySelector("#gate-eye-btn");
  const eyeIcon = gate.querySelector("#gate-eye-icon");
  const passInput = gate.querySelector("#gate-pass");
  eyeBtn.addEventListener("click", () => {
    const showing = passInput.type === "text";
    passInput.type = showing ? "password" : "text";
    eyeBtn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    eyeIcon.innerHTML = showing
      ? `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"></path><circle cx="12" cy="12" r="3"></circle>`
      : `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.4 21.4 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 5c7 0 11 7 11 7a21.5 21.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  });

  gate.querySelector("#gate-forgot-link").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("gate-id").value = "admin";
    passInput.value = "shopai123";
    passInput.type = "text";
    eyeBtn.setAttribute("aria-label", "Hide password");
    eyeIcon.innerHTML = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.4 21.4 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 5c7 0 11 7 11 7a21.5 21.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    showHint("Default credentials auto-filled below — just click Unlock.");
  });

  const errorEl = gate.querySelector("#gate-error");
  const btnEl = gate.querySelector("#gate-submit-btn");
  let countdownTimer = null;

  function showError(msg) {
    errorEl.classList.remove("access-gate-hint");
    errorEl.textContent = msg;
    errorEl.style.display = "block";
    const card = gate.querySelector(".access-gate-card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }

  function showHint(msg) {
    errorEl.classList.add("access-gate-hint");
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  }

  function startLockCountdown() {
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      const remaining = Math.ceil((getGateLockUntil() - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(countdownTimer);
        btnEl.disabled = false;
        btnEl.textContent = "Unlock";
        errorEl.style.display = "none";
      } else {
        btnEl.disabled = true;
        btnEl.textContent = `Locked (${remaining}s)`;
        showError(`Too many failed attempts. Try again in ${remaining}s.`);
      }
    }, 500);
  }

  if (getGateLockUntil() > Date.now()) startLockCountdown();

  document.getElementById("access-gate-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (getGateLockUntil() > Date.now()) {
      startLockCountdown();
      return;
    }

    const id = document.getElementById("gate-id").value.trim();
    const pass = document.getElementById("gate-pass").value;
    const enteredHash = await sha256Hex(`${id}:${pass}`);

    if (enteredHash === SITE_GATE_HASH) {
      localStorage.removeItem("gateAttempts");
      localStorage.removeItem("gateLockUntil");
      sessionStorage.setItem("siteUnlocked", "true");
      gate.classList.add("access-gate-hide");
      document.body.classList.remove("gate-locked");
      setTimeout(() => gate.remove(), 300);
    } else {
      const attempts = getGateAttempts() + 1;
      localStorage.setItem("gateAttempts", String(attempts));

      if (attempts >= GATE_MAX_ATTEMPTS) {
        const lockUntil = Date.now() + GATE_LOCK_MS;
        localStorage.setItem("gateLockUntil", String(lockUntil));
        localStorage.setItem("gateAttempts", "0");
        startLockCountdown();
      } else {
        showError(`Invalid Login ID or Password. ${GATE_MAX_ATTEMPTS - attempts} attempt(s) left.`);
      }
    }
  });
}

/* ---------------- BIG SUMMER SALE (admin-controlled) ---------------- */
// Whether the sale is on/off and how long it runs is controlled from
// Admin → General Settings, not hardcoded on the frontend.
let _saleSettingsPromise = null;
function getSaleSettings() {
  if (!_saleSettingsPromise) {
    _saleSettingsPromise = apiRequest("/settings").catch(() => null);
  }
  return _saleSettingsPromise;
}

/* Keeps the homepage "Free Delivery" / "Easy Returns" feature cards in sync
   with whatever the admin has configured in General Settings, instead of a
   hardcoded ₹499 / 7 days that never matched what admin actually set. */
/* Pushes Store Name / Support Email / Support Phone (set in Admin → General
   Settings) onto the navbar logo and footer, which previously stayed
   hardcoded as "ShopAI" / the default contact details no matter what the
   admin saved. */
function syncStoreBranding(settings) {
  if (!settings) return;

  function applyLogoText(el, name) {
    if (!el || !name) return;
    const match = name.match(/^(.*?)(AI)$/i);
    el.innerHTML = match
      ? `${match[1]}<span style="color:inherit">${match[2]}</span>`
      : name;
  }

  if (settings.storeName) {
    applyLogoText(document.getElementById("nav-logo"), settings.storeName);
    const footerLogo = document.getElementById("footer-logo");
    if (footerLogo) {
      const match = settings.storeName.match(/^(.*?)(AI)$/i);
      footerLogo.innerHTML = match
        ? `${match[1]}<span style="color:#60a5fa">${match[2]}</span>`
        : settings.storeName;
    }
    document.title = document.title.replace(/ShopAI/g, settings.storeName);
  }

  const contactEl = document.getElementById("footer-contact-info");
  if (contactEl && (settings.supportPhone || settings.supportEmail)) {
    contactEl.innerHTML = `${settings.supportPhone || ""}${
      settings.supportPhone && settings.supportEmail ? "<br/>" : ""
    }${settings.supportEmail || ""}`;
  }
}

function syncHomeFeatureCards(settings) {
  const deliveryEl = document.getElementById("home-free-delivery-text");
  if (deliveryEl && settings && settings.freeDeliveryAbove) {
    deliveryEl.textContent = `On orders above ₹${settings.freeDeliveryAbove}`;
  }
  const returnsEl = document.getElementById("home-returns-text");
  if (returnsEl && settings && settings.returnPolicyDays) {
    returnsEl.textContent = `Within ${settings.returnPolicyDays} day${settings.returnPolicyDays === 1 ? "" : "s"}`;
  }
}

async function showFreeDeliveryInfo() {
  const settings = await getSaleSettings();
  const amount = settings && settings.freeDeliveryAbove ? settings.freeDeliveryAbove : 499;
  showToast(`Free delivery on all orders above ₹${amount}, anywhere in India.`, "info", 4000);
}

async function showReturnsInfo() {
  const settings = await getSaleSettings();
  const days = settings && settings.returnPolicyDays ? settings.returnPolicyDays : 7;
  showToast(`Not happy with a product? Return it within ${days} day${days === 1 ? "" : "s"} of delivery from the Orders page.`, "info", 4000);
}

function startSaleCountdown(elementId, endTimeIso) {
  const el = document.getElementById(elementId);
  if (!el || !endTimeIso) return;
  const end = new Date(endTimeIso).getTime();

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) {
      el.textContent = "Sale has ended";
      clearInterval(timer);
      return;
    }
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    el.textContent = `⏳ Ends in ${h}h ${m}m ${s}s`;
  }
  tick();
  const timer = setInterval(tick, 1000);
}

/* ---------------- DARK MODE ---------------- */
function applyDarkModePreference() {
  const isDark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-mode", isDark);
  const toggleBtn = document.getElementById("dark-mode-toggle");
  if (toggleBtn) toggleBtn.textContent = isDark ? "☀️" : "🌙";
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("darkMode", String(isDark));
  const toggleBtn = document.getElementById("dark-mode-toggle");
  if (toggleBtn) toggleBtn.textContent = isDark ? "☀️" : "🌙";
}

function initPasswordToggles() {
  document.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.dataset.toggleAdded) return;
    input.dataset.toggleAdded = "true";

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    input.style.paddingRight = "40px";
    input.style.boxSizing = "border-box";
    input.style.width = "100%";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.setAttribute("aria-label", "Show password");
    toggleBtn.textContent = "👁️";
    toggleBtn.style.cssText =
      "position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; padding:4px; line-height:1; z-index:2;";

    toggleBtn.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      toggleBtn.textContent = isHidden ? "🙈" : "👁️";
      toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });

    wrapper.appendChild(toggleBtn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();

  // Access gate disabled — site opens directly for all visitors.

  renderNavbar();
  renderFooter();
  renderMobileNav();
  renderChatWidget();
  document.getElementById("ai-chat-button")?.addEventListener("click", toggleChat);

  // Someone was bounced off the admin panel for being on mobile/small screen.
  if (new URLSearchParams(window.location.search).get("admin_desktop_only") && typeof showToast === "function") {
    showToast("Admin panel is only available on desktop.", "info", 4000);
    // Clean the query param out of the URL without adding a history entry.
    window.history.replaceState({}, "", window.location.pathname);
  }
});
