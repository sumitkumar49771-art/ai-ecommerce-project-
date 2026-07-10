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
  nav.className = "navbar";
  nav.innerHTML = `
    <a href="index.html" class="logo">Shop<span>AI</span></a>
    <form class="nav-search" onsubmit="handleSmartSearch(event)">
      <input id="smart-search-input" placeholder="Search for products, brands and more..." autocomplete="off" />
      <button type="submit">🔍 Search</button>
    </form>
    <div class="nav-links">
      <a href="#" onclick="toggleDarkMode(); return false;" title="Toggle dark mode" id="dark-mode-toggle">🌙</a>
      ${
        loggedIn
          ? `<a href="wishlist.html">♡ Wishlist <span class="badge" id="wishlist-count" style="display:none;">0</span></a>`
          : ""
      }
      <a href="cart.html">🛒 Cart</a>
      ${
        loggedIn
          ? `<a href="orders.html">👤 My Orders</a>
             ${isAdmin() ? `<a href="admin.html" class="badge">⚙ Admin</a>` : ""}
             <span>Hi, ${getUserName()}</span>
             <a href="#" onclick="logout()" class="btn btn-outline">Logout</a>`
          : `<a href="login.html" class="btn btn-outline">Login</a>
             <a href="register.html" class="btn">Sign Up</a>`
      }
    </div>
  `;

  if (!nav.dataset.categoryRowAdded) {
    const catRow = document.createElement("div");
    catRow.className = "navbar-categories";
    catRow.innerHTML = `
      <div class="all-cat-wrap" style="position:relative; display:inline-block;">
        <a href="#" class="all-cat" onclick="toggleAllCategoriesMenu(event)">☰ All Categories</a>
        <div id="all-categories-dropdown" class="all-categories-dropdown" style="display:none;">
          ${NAV_CATEGORIES.map((c) => `<a href="products.html?category=${encodeURIComponent(c)}">${c}</a>`).join("")}
        </div>
      </div>
      <a href="index.html">Home</a>
      ${NAV_CATEGORIES.slice(0, 7)
        .map((c) => `<a href="products.html?category=${encodeURIComponent(c)}">${c}</a>`)
        .join("")}
    `;
    nav.insertAdjacentElement("afterend", catRow);
    nav.dataset.categoryRowAdded = "true";
  }

  if (loggedIn) updateWishlistCount();
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

function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="site-footer">
      <div class="footer-top">
        <div class="footer-col">
          <h4>Shop<span style="color:#60a5fa">AI</span></h4>
          <p>ShopAI is your smart shopping destination. We use AI to personalize your experience and bring you the best products.</p>
          <div class="footer-social">
            <a href="#" title="Facebook">📘</a>
            <a href="#" title="Instagram">📷</a>
            <a href="#" title="Twitter">🐦</a>
            <a href="#" title="YouTube">▶️</a>
            <a href="https://github.com/sumitkumar49771-art" title="GitHub" target="_blank" rel="noopener">🐙</a>
            <a href="https://www.linkedin.com/in/sumit-kumar-957356266/" title="LinkedIn" target="_blank" rel="noopener">💼</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Customer Service</h4>
          <a href="#">Help Center</a>
          <a href="orders.html">Track Your Order</a>
          <a href="#">Returns &amp; Refunds</a>
          <a href="#">Shipping Info</a>
          <a href="#">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div class="footer-col">
          <h4>AI Features</h4>
          <a href="products.html">AI Recommendations</a>
          <a href="products.html">Smart Search</a>
          <a href="#" onclick="toggleChat(); return false;">AI Shopping Assistant</a>
          <a href="products.html">Personalized Deals</a>
        </div>
        <div class="footer-col">
          <h4>Contact Us</h4>
          <p>Golden Avenue,<br/>Amritsar, Punjab, India - 143001</p>
          <p>+91 62806 43874<br/>support@shopai.com</p>
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
  renderChatWidget();
  document.getElementById("ai-chat-button")?.addEventListener("click", toggleChat);
});
