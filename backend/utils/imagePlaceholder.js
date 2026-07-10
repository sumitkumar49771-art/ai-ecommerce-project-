/**
 * Generated Product Placeholder Images
 * -------------------------------------------------------------
 * Free keyword-based image services (picsum.photos, loremflickr, etc.)
 * cannot guarantee that the photo actually matches the product —
 * a "shirt" search can return a random unrelated photo, since these
 * services match loose tags, not real content.
 *
 * Instead, this generates a clean, on-brand SVG card (category icon +
 * gradient + product name) as a data URI. It is 100% accurate to the
 * product's category, needs no internet access, and never breaks due
 * to network/firewall issues.
 *
 * Admins can still paste a real photo URL in the product form —
 * this generator is only the fallback when no image is provided.
 * -------------------------------------------------------------
 */

const CATEGORY_STYLES = {
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

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

// Wraps a product name onto up to 2 lines so it fits inside the card
function wrapText(name, maxCharsPerLine = 18) {
  const words = name.split(" ");
  const lines = [];
  let current = "";
  words.forEach((w) => {
    if ((current + " " + w).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function generatePlaceholderImage(name, category) {
  const style = CATEGORY_STYLES[category] || { color1: "#6b7280", color2: "#9ca3af", code: "PR" };
  const lines = wrapText(name || "Product");
  const gradientId = "g1";
  const shadowId = "s1";

  const textLines = lines
    .map((line, i) => `<text x="50%" y="${312 + i * 26}" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#1f2937" text-anchor="middle">${escapeXml(line)}</text>`)
    .join("");

  const iconMarkup = style.icon
    ? `<g transform="translate(200,155)">${style.icon}</g>`
    : `<text x="50%" y="173" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff" text-anchor="middle">${style.code}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${style.color1}"/>
        <stop offset="100%" stop-color="${style.color2}"/>
      </linearGradient>
      <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect width="400" height="400" fill="#f4f5f9"/>
    <rect x="16" y="16" width="368" height="368" rx="16" fill="#ffffff" filter="url(#${shadowId})"/>
    <circle cx="200" cy="155" r="90" fill="url(#${gradientId})"/>
    ${iconMarkup}
    <text x="50%" y="272" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" letter-spacing="1.5">${escapeXml((category || "").toUpperCase())}</text>
    ${textLines}
  </svg>`;

  return "data:image/svg+xml," + encodeURIComponent(svg);
}

module.exports = { generatePlaceholderImage, CATEGORY_STYLES };
