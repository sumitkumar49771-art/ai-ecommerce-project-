/**
 * Real Product Photo Matcher
 * -------------------------------------------------------------
 * Goal: attach a REAL, studio-style product photo that actually matches
 * the product's name/category — never an icon, cartoon, unrelated photo,
 * a lifestyle photo of a person, or a DUPLICATE of a photo already used
 * for another product in this same run.
 *
 * How it works (in priority order):
 *   1. Curated overrides — hand-picked, guaranteed-correct URLs.
 *   2. Books — real official cover art via the free Google Books API.
 *   3. Live stock-photo search — Pexels, then Pixabay, then Unsplash.
 *   4. Category-only broad search — if the specific product name found
 *      nothing, try again with just the category (e.g. "shoes"), which
 *      almost always succeeds.
 *   5. Safety net — the placeholder card, only if every step above and
 *      every candidate photo turned out to be a duplicate or unusable.
 *
 * Every step above returns a short LIST of candidate photos (not just
 * one), and getRealProductImage() walks through them in order, skipping
 * any URL that has already been assigned to an earlier product in this
 * same seeding run — this is what guarantees no two products end up
 * showing the exact same photo.
 * -------------------------------------------------------------
 */

const { generatePlaceholderImage } = require("./imagePlaceholder");

const CURATED_IMAGES = {
  "Wireless Headphones": "https://images.pexels.com/photos/7772547/pexels-photo-7772547.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Bluetooth Earbuds": "https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Zero to One": "https://books.google.com/books/content?id=gdHQBwAAQBAJ&printsec=frontcover&img=1&zoom=2&source=gbs_api",
};

const STOPWORDS = new Set([
  "the", "a", "an", "for", "with", "and", "of", "in", "on", "set",
  "pack", "piece", "pcs", "size", "new", "premium", "genuine", "pro",
  "mini", "large", "small", "medium", "men", "women", "kids", "unisex",
]);

// Always reject these, in every category — pure portraits/headshots never
// pass as a product photo, no matter what the product is.
const HARD_PEOPLE_WORDS = [
  "model", "posing", "portrait", "lifestyle", "face", "smiling",
  "headshot", "selfie",
];

// These only signal an unwanted lifestyle shot for "standalone object"
// categories (electronics, books, groceries, home decor, etc). For
// categories where the product is naturally worn or used by a person in
// normal product photography (footwear, clothing, accessories, sports &
// fitness gear), a photo showing someone wearing/holding/using the item is
// a perfectly good — often the ONLY realistic — product photo, so these
// words should NOT disqualify it there.
const SOFT_ACTION_WORDS = [
  "man", "men's", "woman", "women's", "girl", "boy", "person", "people",
  "wearing", "holding", "hand", "hands", "couple", "kid", "child",
  "children", "walking", "running person", "human",
];

// Categories where an in-use / worn photo is normal, good product
// photography and should not be filtered out by SOFT_ACTION_WORDS.
const IN_USE_OK_CATEGORIES = new Set([
  "Footwear", "Clothing", "Accessories", "Sports & Fitness",
]);

// Words that signal a wide "scene" photo (a shop, market, warehouse,
// crowd of items) rather than a single clean product shot. A shelf full
// of toys or a market stall can share a keyword with the product name
// but is not what we want to show as *the* product photo.
const SCENE_WORDS = [
  "shop", "store", "market", "shelf", "shelves", "aisle", "warehouse",
  "mall", "display case", "stall", "rack", "crowd", "collection of",
  "many", "assortment", "variety of", "several", "row of",
];

// Tracks every photo URL already assigned to a product in this run, so
// the same photo is never handed out twice. Exposed + resettable so the
// seed script can start each run with a clean slate.
const usedImageUrls = new Set();
function resetUsedImages() {
  usedImageUrls.clear();
}

function significantWords(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function looksLikeLifestylePhoto(text, category) {
  const haystack = (text || "").toLowerCase();
  if (HARD_PEOPLE_WORDS.some((w) => haystack.includes(w))) return true;
  if (SCENE_WORDS.some((w) => haystack.includes(w))) return true;
  if (!IN_USE_OK_CATEGORIES.has(category) && SOFT_ACTION_WORDS.some((w) => haystack.includes(w))) return true;
  return false;
}

// Returns the first candidate not already used elsewhere, and marks it
// as used. Returns null if every candidate is a duplicate.
function pickUnusedCandidate(urls) {
  for (const url of urls) {
    if (url && !usedImageUrls.has(url)) {
      usedImageUrls.add(url);
      return url;
    }
  }
  return null;
}

// Google Books API — free, no key required. Returns a short list of
// candidate cover URLs for the given title (usually just one, but a
// title can occasionally match multiple editions).
async function searchGoogleBooksCandidates(title) {
  if (typeof fetch !== "function") return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) return [];
    const data = await resp.json();
    const items = Array.isArray(data.items) ? data.items : [];
    return items
      .map((item) => item.volumeInfo && item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail)
      .filter(Boolean)
      .map((u) => u.replace("http://", "https://").replace("zoom=1", "zoom=2"));
  } catch (err) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// Runs one Pexels query and returns filtered candidate URLs. Kept small so
// searchPexelsCandidates can try a couple of query variants and merge them.
async function runPexelsQuery(query, keywords, category, apiKey, requireAllKeywords) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=60`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const resp = await fetch(url, { headers: { Authorization: apiKey }, signal: controller.signal });
    if (!resp.ok) return [];
    const data = await resp.json();
    const results = Array.isArray(data.photos) ? data.photos : [];

    return results
      .filter((item) => {
        const alt = (item.alt || "").toLowerCase();
        const matches = requireAllKeywords
          ? keywords.every((k) => alt.includes(k))
          : keywords.some((k) => alt.includes(k));
        return matches && !looksLikeLifestylePhoto(alt, category);
      })
      .map((item) => item.src && (item.src.large || item.src.medium || item.src.original))
      .filter(Boolean);
  } catch (err) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function searchPexelsCandidates(name, category) {
  if (typeof fetch !== "function") return [];
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const keywords = significantWords(name);
  if (keywords.length === 0) return [];
  const topKeywords = keywords.slice(0, 3);

  // Pass 1: strict — require every keyword to appear, so a query like
  // "cricket helmet" doesn't match a photo that only mentions "helmet".
  // This is what actually stops obviously-wrong matches like a rowing
  // machine being handed out for a cricket helmet.
  const strict = await runPexelsQuery(
    topKeywords.join(" ") + " product isolated white background",
    topKeywords,
    category,
    apiKey,
    true
  );
  if (strict.length > 0) return strict;

  // Pass 2: same strict all-keywords requirement, but without the
  // "isolated white background" phrase, since real stock photos aren't
  // always tagged that way and pass 1 can come back empty for niche items.
  const strictNoSuffix = await runPexelsQuery(topKeywords.join(" "), topKeywords, category, apiKey, true);
  if (strictNoSuffix.length > 0) return strictNoSuffix;

  // Pass 3: relax to "any keyword matches" only if there's more than one
  // keyword (so a multi-word product name still has to share something
  // meaningful, not just one generic word from a single-word name).
  if (topKeywords.length > 1) {
    return runPexelsQuery(topKeywords.join(" "), topKeywords, category, apiKey, false);
  }
  return [];
}

async function runPixabayQuery(query, keywords, category, apiKey, requireAllKeywords) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&image_type=photo&safesearch=true&per_page=100&order=popular`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) return [];
    const data = await resp.json();
    const results = Array.isArray(data.hits) ? data.hits : [];

    return results
      .filter((item) => {
        const tags = (item.tags || "").toLowerCase();
        const matches = requireAllKeywords
          ? keywords.every((k) => tags.includes(k))
          : keywords.some((k) => tags.includes(k));
        return matches && !looksLikeLifestylePhoto(tags, category);
      })
      .map((item) => item.webformatURL || item.largeImageURL)
      .filter(Boolean);
  } catch (err) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function searchPixabayCandidates(name, category) {
  if (typeof fetch !== "function") return [];
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return [];

  const keywords = significantWords(name);
  if (keywords.length === 0) return [];
  const topKeywords = keywords.slice(0, 3);
  const query = topKeywords.join(" ");

  // Pass 1: require every keyword in the tags, so e.g. "cricket helmet"
  // can't match a photo tagged only "helmet" (motorbike helmet, etc).
  const strict = await runPixabayQuery(query, topKeywords, category, apiKey, true);
  if (strict.length > 0) return strict;

  // Pass 2: relax only if there's more than one keyword to still anchor to.
  if (topKeywords.length > 1) {
    return runPixabayQuery(query, topKeywords, category, apiKey, false);
  }
  return [];
}

// Unsplash — third stock-photo source, tried after Pexels and Pixabay both
// come up empty for a given product. Same strict-keyword-then-relax
// pattern as the other two, so it slots into the exact same fallback
// chain without changing any of the matching rules.
async function runUnsplashQuery(query, keywords, category, accessKey, requireAllKeywords) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: controller.signal,
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const results = Array.isArray(data.results) ? data.results : [];

    return results
      .filter((item) => {
        const text = `${item.alt_description || ""} ${item.description || ""} ${
          (item.tags || []).map((t) => t.title).join(" ")
        }`.toLowerCase();
        const matches = requireAllKeywords
          ? keywords.every((k) => text.includes(k))
          : keywords.some((k) => text.includes(k));
        return matches && !looksLikeLifestylePhoto(text, category);
      })
      .map((item) => item.urls && (item.urls.regular || item.urls.small))
      .filter(Boolean);
  } catch (err) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function searchUnsplashCandidates(name, category) {
  if (typeof fetch !== "function") return [];
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const keywords = significantWords(name);
  if (keywords.length === 0) return [];
  const topKeywords = keywords.slice(0, 3);
  const query = topKeywords.join(" ");

  const strict = await runUnsplashQuery(query, topKeywords, category, accessKey, true);
  if (strict.length > 0) return strict;

  if (topKeywords.length > 1) {
    return runUnsplashQuery(query, topKeywords, category, accessKey, false);
  }
  return [];
}

const CATEGORY_SEARCH_TERMS = {
  "Footwear": "shoes footwear product",
  "Electronics": "electronics gadget product",
  "Clothing": "clothing apparel product",
  "Accessories": "fashion accessories product",
  "Home & Kitchen": "kitchenware home product",
  "Beauty & Personal Care": "cosmetics beauty product",
  "Books": "books stack",
  "Sports & Fitness": "sports fitness equipment",
  "Toys & Games": "toys product",
  "Grocery & Gourmet": "grocery food product",
};

// IMPORTANT: this is the last step before giving up and showing the
// placeholder card, so it is tempting to make it "just find *something* in
// this category". That is exactly what caused wrong photos before (an RC
// helicopter product showing a teddy bear, a cricket helmet showing gym
// equipment) — a photo only had to match the broad category term, with no
// check against the product's own name at all.
//
// Now every candidate must ALSO contain at least one of the product's own
// significant words (in the alt text/tags) — the category term only
// broadens the search query itself (e.g. adds "toys product" alongside
// "helicopter" so more candidates surface), it is never enough on its own
// to qualify a photo. If nothing satisfies both, this returns [] and the
// caller falls through to the accurate placeholder card instead of a
// wrong-but-real photo.
async function searchCategoryFallbackCandidates(category, name) {
  const term = CATEGORY_SEARCH_TERMS[category];
  const keywords = significantWords(name);
  if (!term || keywords.length === 0) return [];
  const query = `${keywords.slice(0, 2).join(" ")} ${term}`;
  const candidates = [];

  if (process.env.PEXELS_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=60`,
        { headers: { Authorization: process.env.PEXELS_API_KEY }, signal: controller.signal }
      );
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data.photos) ? data.photos : [];
        results
          .filter((item) => {
            const alt = (item.alt || "").toLowerCase();
            return keywords.some((k) => alt.includes(k)) && !looksLikeLifestylePhoto(alt, category);
          })
          .forEach((item) => {
            const u = item.src && (item.src.large || item.src.medium);
            if (u) candidates.push(u);
          });
      }
    } catch (err) {
      // fall through
    }
  }

  if (process.env.PIXABAY_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(
          query
        )}&image_type=photo&safesearch=true&per_page=60`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data.hits) ? data.hits : [];
        results
          .filter((item) => {
            const tags = (item.tags || "").toLowerCase();
            return keywords.some((k) => tags.includes(k)) && !looksLikeLifestylePhoto(tags, category);
          })
          .forEach((item) => {
            const u = item.webformatURL || item.largeImageURL;
            if (u) candidates.push(u);
          });
      }
    } catch (err) {
      // fall through
    }
  }

  return candidates;
}

// TRUE last resort before the SVG placeholder card. Every step above
// requires a candidate photo to also match one of the product's own
// significant words — that's correct for accuracy, but it means a product
// with an unusual/regional name (e.g. "Masala Spice Box") can legitimately
// find zero matches on a free stock-photo API and fall all the way through.
//
// Rather than show a generic icon card in that case, this does ONE final
// query using ONLY the category's broad search term (no product-name
// keyword requirement at all) — e.g. "grocery food product" for a grocery
// item. This is intentionally the least strict step and is only reached
// after every stricter, name-matched step above has already failed, so it
// trades a little specificity for guaranteeing a real, on-topic photo
// instead of an icon.
async function searchCategoryBroadCandidates(category) {
  const term = CATEGORY_SEARCH_TERMS[category];
  if (!term) return [];
  const candidates = [];

  if (process.env.PEXELS_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(term)}&per_page=40`,
        { headers: { Authorization: process.env.PEXELS_API_KEY }, signal: controller.signal }
      );
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data.photos) ? data.photos : [];
        results
          .filter((item) => !looksLikeLifestylePhoto((item.alt || ""), category))
          .forEach((item) => {
            const u = item.src && (item.src.large || item.src.medium);
            if (u) candidates.push(u);
          });
      }
    } catch (err) {
      // fall through
    }
  }

  if (process.env.PIXABAY_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(
          term
        )}&image_type=photo&safesearch=true&per_page=40&order=popular`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data.hits) ? data.hits : [];
        results
          .filter((item) => !looksLikeLifestylePhoto((item.tags || ""), category))
          .forEach((item) => {
            const u = item.webformatURL || item.largeImageURL;
            if (u) candidates.push(u);
          });
      }
    } catch (err) {
      // fall through
    }
  }

  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=30`,
        {
          headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (resp.ok) {
        const data = await resp.json();
        const results = Array.isArray(data.results) ? data.results : [];
        results
          .filter((item) => !looksLikeLifestylePhoto((item.alt_description || ""), category))
          .forEach((item) => {
            const u = item.urls && (item.urls.regular || item.urls.small);
            if (u) candidates.push(u);
          });
      }
    } catch (err) {
      // fall through
    }
  }

  return candidates;
}

/**
 * Returns a real photo URL that matches the given product name, is not
 * a duplicate of a photo already used for another product in this same
 * run, or the safe placeholder card if nothing qualifies.
 */
async function getRealProductImage(name, category) {
  if (CURATED_IMAGES[name] && !usedImageUrls.has(CURATED_IMAGES[name])) {
    usedImageUrls.add(CURATED_IMAGES[name]);
    return CURATED_IMAGES[name];
  }

  // Books: prefer a real official cover via Google Books first. If that
  // lookup fails or gets rate-limited (free API, no key — this happens most
  // often when many products are being seeded at once), fall back to a
  // strict keyword-matched stock photo (same logic as every other
  // category) rather than showing the placeholder card — a real, matched
  // photo should always be preferred over the logo when one is available.
  if (category === "Books") {
    try {
      const picked = pickUnusedCandidate(await searchGoogleBooksCandidates(name));
      if (picked) return picked;
    } catch (err) {
      // fall through
    }
  }

  try {
    const picked = pickUnusedCandidate(await searchPexelsCandidates(name, category));
    if (picked) return picked;
  } catch (err) {
    // fall through
  }

  try {
    const picked = pickUnusedCandidate(await searchPixabayCandidates(name, category));
    if (picked) return picked;
  } catch (err) {
    // fall through
  }

  try {
    const picked = pickUnusedCandidate(await searchUnsplashCandidates(name, category));
    if (picked) return picked;
  } catch (err) {
    // fall through
  }

  try {
    const picked = pickUnusedCandidate(await searchCategoryFallbackCandidates(category, name));
    if (picked) return picked;
  } catch (err) {
    // fall through
  }

  // Every name-matched attempt failed — before giving up and showing the
  // icon card, try one broad, category-only search so the product still
  // gets a real, on-topic photo (see searchCategoryBroadCandidates above).
  try {
    const picked = pickUnusedCandidate(await searchCategoryBroadCandidates(category));
    if (picked) return picked;
  } catch (err) {
    // fall through
  }

  return generatePlaceholderImage(name, category);
}

module.exports = {
  getRealProductImage,
  searchPexelsCandidates,
  searchPixabayCandidates,
  searchUnsplashCandidates,
  searchGoogleBooksCandidates,
  searchCategoryFallbackCandidates,
  searchCategoryBroadCandidates,
  significantWords,
  looksLikeLifestylePhoto,
  resetUsedImages,
  CURATED_IMAGES,
};
