const {
  buildFeatureVector,
  cosineSimilarity,
  getSimilarProducts,
  parseSmartQuery,
  computeDealScores,
} = require("../utils/aiRecommendation");

// Minimal fake products — just enough shape for the AI engine to work with,
// without needing a real MongoDB connection.
function makeProduct(overrides) {
  return {
    _id: { toString: () => overrides.id },
    name: overrides.name,
    category: overrides.category,
    tags: overrides.tags || [],
    price: overrides.price,
    rating: overrides.rating,
    views: overrides.views || 0,
    ...overrides,
  };
}

describe("buildFeatureVector", () => {
  it("builds a word-count vector from tags, category and name", () => {
    const product = makeProduct({
      id: "1",
      name: "Running Shoes",
      category: "Footwear",
      tags: ["shoes", "sports"],
    });

    const vector = buildFeatureVector(product);

    // "shoes" appears once in tags AND once in the name ("Running Shoes"),
    // so its count should be 2 — everything else appears once.
    expect(vector.shoes).toBe(2);
    expect(vector.sports).toBe(1);
    expect(vector.footwear).toBe(1);
    expect(vector.running).toBe(1);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const vecA = { shoes: 1, sports: 1 };
    const vecB = { shoes: 1, sports: 1 };
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1);
  });

  it("returns 0 for completely unrelated vectors", () => {
    const vecA = { shoes: 1, sports: 1 };
    const vecB = { kitchen: 1, spoon: 1 };
    expect(cosineSimilarity(vecA, vecB)).toBe(0);
  });

  it("returns a value between 0 and 1 for partially overlapping vectors", () => {
    const vecA = { shoes: 1, sports: 1, running: 1 };
    const vecB = { shoes: 1, sports: 1, casual: 1 };
    const score = cosineSimilarity(vecA, vecB);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe("getSimilarProducts", () => {
  const target = makeProduct({ id: "1", name: "Running Shoes", category: "Footwear", tags: ["shoes", "running"] });
  const sameCategory = makeProduct({ id: "2", name: "Hiking Boots", category: "Footwear", tags: ["shoes", "outdoor"] });
  const unrelated = makeProduct({ id: "3", name: "Cotton T-Shirt", category: "Clothing", tags: ["tshirt", "casual"] });

  it("ranks a product from the same category higher than an unrelated one", () => {
    const results = getSimilarProducts(target, [target, sameCategory, unrelated], 2);
    expect(results[0]._id.toString()).toBe("2");
  });

  it("never includes the target product itself in the results", () => {
    const results = getSimilarProducts(target, [target, sameCategory, unrelated], 5);
    expect(results.find((p) => p._id.toString() === "1")).toBeUndefined();
  });

  it("respects the topN limit", () => {
    const results = getSimilarProducts(target, [target, sameCategory, unrelated], 1);
    expect(results.length).toBe(1);
  });
});

describe("parseSmartQuery (AI smart search NLU)", () => {
  it("extracts a max price from an 'under X' query", () => {
    const filters = parseSmartQuery("shoes under 2000");
    expect(filters.maxPrice).toBe(2000);
    expect(filters.keywords).toContain("shoes");
  });

  it("extracts a min price from an 'above X' query", () => {
    const filters = parseSmartQuery("headphones above 1500");
    expect(filters.minPrice).toBe(1500);
  });

  it("extracts both bounds from a 'between X and Y' query", () => {
    const filters = parseSmartQuery("headphones between 1000 and 3000");
    expect(filters.minPrice).toBe(1000);
    expect(filters.maxPrice).toBe(3000);
  });

  it("strips filler words and keeps meaningful keywords", () => {
    const filters = parseSmartQuery("show me formal shirts for men");
    expect(filters.keywords).toEqual(expect.arrayContaining(["formal", "shirts", "men"]));
    expect(filters.keywords).not.toContain("show");
  });
});

describe("computeDealScores", () => {
  it("scores a below-average-price, above-average-rating product as an Excellent Deal", () => {
    const products = [
      makeProduct({ id: "1", name: "Budget Headphones", category: "Electronics", price: 500, rating: 4.8 }),
      makeProduct({ id: "2", name: "Premium Headphones", category: "Electronics", price: 3000, rating: 4.2 }),
    ];

    const scored = computeDealScores(products);
    const budget = scored.find((p) => p._id.toString() === "1");

    expect(budget.dealLabel).toBe("Excellent Deal");
    expect(budget.dealScore).toBeGreaterThan(50);
  });

  it("attaches a dealScore and dealLabel to every product", () => {
    const products = [makeProduct({ id: "1", name: "Item", category: "Misc", price: 100, rating: 4 })];
    const scored = computeDealScores(products);
    expect(scored[0]).toHaveProperty("dealScore");
    expect(scored[0]).toHaveProperty("dealLabel");
  });
});
