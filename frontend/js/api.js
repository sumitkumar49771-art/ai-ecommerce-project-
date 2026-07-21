// Central place for API base URL and fetch helper
const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    // 👇 After deploying the backend on Render, replace this with your
    // real backend URL, e.g. "https://shopai-backend.onrender.com/api"
    : "https://YOUR-BACKEND-NAME.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && auth) {
      // Stale/invalid token (e.g. DB was reseeded and the account no longer
      // exists) — clear it and send the user to log in again instead of
      // leaving every button silently broken.
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      if (!location.pathname.endsWith("login.html")) {
        window.location.href = "login.html";
      }
    }
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userRole");
  window.location.href = "index.html";
}

function getUserName() {
  return localStorage.getItem("userName") || "";
}

function getUserRole() {
  return localStorage.getItem("userRole") || "";
}

function isAdmin() {
  return getUserRole() === "admin";
}

// Escapes a string for safe interpolation inside an inline HTML event
// handler's JS string literal (e.g. onerror="...('${escJs(name)}')")
function escJs(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Category styling — mirrors backend/utils/imagePlaceholder.js so the
// fallback shown here (if a real photo URL fails to load) is just as
// accurate as the one generated server-side.
const CATEGORY_PLACEHOLDER_STYLES = {
  "Footwear": {
    color1: "#6366f1", color2: "#818cf8", code: "FW",
    icon: '<path d="M-45,10 Q-45,-8 -30,-8 L20,-8 Q35,-15 48,-5 L58,8 Q62,14 55,18 L-45,18 Z" fill="#fff" opacity="0.95"/><line x1="-45" y1="18" x2="55" y2="18" stroke="#fff" stroke-width="2" opacity="0.6"/>',
  },
  "Electronics": {
    color1: "#06b6d4", color2: "#22d3ee", code: "EL",
    icon: '<path d="M-40,0 A40,40 0 0 1 40,0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.95"/><rect x="-48" y="-2" width="16" height="26" rx="7" fill="#fff" opacity="0.95"/><rect x="32" y="-2" width="16" height="26" rx="7" fill="#fff" opacity="0.95"/>',
  },
  "Clothing": {
    color1: "#f472b6", color2: "#fb7185", code: "CL",
    icon: '<path d="M-25,-30 L-45,-15 L-35,-2 L-25,-10 L-25,32 L25,32 L25,-10 L35,-2 L45,-15 L25,-30 Q0,-18 -25,-30 Z" fill="#fff" opacity="0.95"/>',
  },
  "Accessories": {
    color1: "#f59e0b", color2: "#fbbf24", code: "AC",
    icon: '<path d="M-18,-22 Q-18,-38 0,-38 Q18,-38 18,-22" fill="none" stroke="#fff" stroke-width="6" opacity="0.95"/><rect x="-30" y="-22" width="60" height="55" rx="10" fill="#fff" opacity="0.95"/>',
  },
  "Home & Kitchen": {
    color1: "#10b981", color2: "#34d399", code: "HK",
    icon: '<path d="M-42,0 L0,-38 L42,0 L42,35 L-42,35 Z" fill="#fff" opacity="0.95"/>',
  },
  "Beauty & Personal Care": {
    color1: "#ec4899", color2: "#f472b6", code: "BC",
    icon: '<rect x="-12" y="-42" width="24" height="14" rx="3" fill="#fff" opacity="0.95"/><path d="M-22,-24 Q-22,-30 -14,-30 L14,-30 Q22,-30 22,-24 L22,30 Q22,38 12,38 L-12,38 Q-22,38 -22,30 Z" fill="#fff" opacity="0.95"/>',
  },
  "Books": {
    color1: "#8b5cf6", color2: "#a78bfa", code: "BK",
    icon: '<rect x="-40" y="10" width="80" height="12" rx="2" fill="#fff" opacity="0.9"/><rect x="-35" y="-8" width="70" height="12" rx="2" fill="#fff" opacity="0.95"/><rect x="-30" y="-26" width="60" height="12" rx="2" fill="#fff" opacity="1"/>',
  },
  "Sports & Fitness": {
    color1: "#ef4444", color2: "#f87171", code: "SF",
    icon: '<rect x="-45" y="-10" width="16" height="20" rx="4" fill="#fff" opacity="0.95"/><rect x="29" y="-10" width="16" height="20" rx="4" fill="#fff" opacity="0.95"/><rect x="-29" y="-4" width="58" height="8" rx="4" fill="#fff" opacity="0.95"/>',
  },
  "Toys & Games": {
    color1: "#3b82f6", color2: "#60a5fa", code: "TG",
    icon: '<path d="M0,-40 L11,-13 L40,-13 L17,5 L26,35 L0,17 L-26,35 L-17,5 L-40,-13 L-11,-13 Z" fill="#fff" opacity="0.95"/>',
  },
  "Grocery & Gourmet": {
    color1: "#84cc16", color2: "#a3e635", code: "GG",
    icon: '<path d="M-32,-15 L32,-15 L26,35 Q26,40 20,40 L-20,40 Q-26,40 -26,35 Z" fill="#fff" opacity="0.95"/><rect x="-14" y="-30" width="28" height="18" rx="4" fill="#fff" opacity="0.95"/>',
  },
};

// Self-contained inline "No Image" placeholder — no external service, so it
// never breaks due to network/firewall issues (unlike via.placeholder.com,
// which was discontinued in 2023). Pass name/category for an accurate,
// on-brand card; called with no args it falls back to a plain grey box.
function placeholderImage(name, category) {
  const style = CATEGORY_PLACEHOLDER_STYLES[category];
  if (!style) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f5'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  }
  const words = (name || "Product").split(" ");
  const lines = [];
  let current = "";
  words.forEach((w) => {
    if ((current + " " + w).trim().length > 18) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  });
  if (current) lines.push(current);
  const nameLines = lines.slice(0, 2);
  const esc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
  const textLines = nameLines
    .map((line, i) => `<text x="50%" y="${312 + i * 26}" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#1f2937" text-anchor="middle">${esc(line)}</text>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${style.color1}"/><stop offset="100%" stop-color="${style.color2}"/>
      </linearGradient>
      <filter id="s1" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect width="400" height="400" fill="#f4f5f9"/>
    <rect x="16" y="16" width="368" height="368" rx="16" fill="#ffffff" filter="url(#s1)"/>
    <circle cx="200" cy="155" r="90" fill="url(#g1)"/>
    <g transform="translate(200,155)">${style.icon}</g>
    <text x="50%" y="272" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" letter-spacing="1.5">${esc((category || "").toUpperCase())}</text>
    ${textLines}
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
