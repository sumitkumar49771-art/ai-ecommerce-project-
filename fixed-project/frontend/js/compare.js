// Renders a side-by-side comparison table for the products the user has
// added to their compare list (stored client-side in localStorage — see
// getCompareIds()/toggleCompare() in main.js).

async function loadComparePage() {
  const box = document.getElementById("compare-content");
  const ids = getCompareIds();

  if (!ids.length) {
    box.innerHTML = `
      <div class="admin-card" style="text-align:center; padding:40px;">
        <p style="color:var(--muted); margin-bottom:14px;">You haven't added any products to compare yet.</p>
        <a href="products.html" class="btn">Browse Products</a>
      </div>`;
    return;
  }

  box.innerHTML = "<p>Loading comparison...</p>";

  let products;
  try {
    const results = await Promise.all(ids.map((id) => apiRequest(`/products/${id}`)));
    products = results.map((r) => r.product).filter(Boolean);
  } catch (err) {
    box.innerHTML = `<p>Could not load one or more products. <a href="#" onclick="clearCompare(); return false;">Clear comparison</a></p>`;
    return;
  }

  if (!products.length) {
    box.innerHTML = `<p>Could not load these products. <a href="#" onclick="clearCompare(); return false;">Clear comparison</a></p>`;
    return;
  }

  const rows = [
    { label: "Image", render: (p) => `<img src="${p.image}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');" />` },
    { label: "Name", render: (p) => `<strong>${p.name}</strong>` },
    { label: "Price", render: (p) => priceHtml(p) },
    { label: "Category", render: (p) => p.category },
    { label: "Brand", render: (p) => p.brand || "—" },
    { label: "Rating", render: (p) => `${starRating(p.rating || 0)} (${p.numReviews || 0})` },
    { label: "Stock", render: (p) => (p.stock > 0 ? `${p.stock} available` : `<span style="color:var(--danger);">Out of stock</span>`) },
    { label: "Description", render: (p) => `<span style="font-size:13px; color:var(--muted);">${(p.description || "").slice(0, 140)}${(p.description || "").length > 140 ? "…" : ""}</span>` },
    {
      label: "",
      render: (p) => `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <a href="product-detail.html?id=${p._id}" class="btn" style="text-align:center;">View Product</a>
          <button class="btn btn-outline" onclick="removeFromCompare('${p._id}')">Remove</button>
        </div>`,
    },
  ];

  box.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="admin-table" style="min-width:${Math.max(600, products.length * 220)}px;">
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr>
              <td style="font-weight:600; white-space:nowrap; background:var(--card-bg-alt);">${row.label}</td>
              ${products.map((p) => `<td style="text-align:center; vertical-align:top;">${row.render(p)}</td>`).join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p style="margin-top:14px;"><a href="#" onclick="clearCompare(); return false;" style="color:var(--danger);">Clear all comparisons</a></p>
  `;
}

function removeFromCompare(productId) {
  let ids = getCompareIds().filter((id) => id !== productId);
  localStorage.setItem("compareProductIds", JSON.stringify(ids));
  updateCompareCount();
  loadComparePage();
}

function clearCompare() {
  localStorage.setItem("compareProductIds", JSON.stringify([]));
  updateCompareCount();
  loadComparePage();
}
