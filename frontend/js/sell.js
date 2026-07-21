// Powers sell.html — the Flipkart Seller Hub-style dashboard where any
// logged-in user can list their own products and manage them.

// Guard: only logged-in users can view this page
if (!isLoggedIn()) {
  window.location.href = "login.html?redirect=sell.html";
}

let myProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setTopbarUser();
  loadMyProducts();
  loadEarnings();
});

function setTopbarUser() {
  const name = (typeof getUserName === "function" && getUserName()) || "Seller";
  const firstName = name.split(" ")[0];
  const label = document.getElementById("seller-username-label");
  const avatar = document.getElementById("seller-avatar-initial");
  const welcome = document.getElementById("seller-welcome-name");
  if (label) label.textContent = name;
  if (avatar) avatar.textContent = name.trim().charAt(0).toUpperCase() || "S";
  if (welcome) welcome.textContent = `Welcome back, ${firstName}!`;
}

/* ---------------- SIDEBAR NAVIGATION ---------------- */

/* ---------------- MOBILE SIDEBAR DRAWER ---------------- */

function toggleMobileSidebar() {
  document.querySelector(".admin-side")?.classList.toggle("open");
  document.querySelector(".admin-backdrop")?.classList.toggle("open");
}

function closeMobileSidebar() {
  document.querySelector(".admin-side")?.classList.remove("open");
  document.querySelector(".admin-backdrop")?.classList.remove("open");
}

function setupSidebar() {
  document.querySelectorAll(".admin-link[data-panel]").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".admin-link[data-panel]").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      closeMobileSidebar(); // tapping a link on mobile should close the drawer
      showPanel(link.dataset.panel);
    });
  });
}

function showPanel(key) {
  document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
  document.getElementById(`panel-${key}`)?.classList.add("active");

  const titles = { dashboard: "Dashboard", "add-listing": "Add Listing", listings: "My Listings", earnings: "Earnings" };
  const titleEl = document.getElementById("seller-topbar-title");
  if (titleEl) titleEl.textContent = "☰ " + (titles[key] || "Dashboard");
}

// Used by buttons like "Add New Listing" to jump to another panel and
// highlight the matching sidebar link, same as clicking it directly.
function goToPanel(key) {
  document.querySelector(`.admin-link[data-panel="${key}"]`)?.click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- LISTINGS DATA ---------------- */

async function loadMyProducts() {
  const recentBody = document.getElementById("recent-products-table-body");
  const listBody = document.getElementById("my-products-table-body");
  try {
    const data = await apiRequest("/products/mine", "GET", null, true);
    myProducts = data.products || [];

    document.getElementById("stat-total-products").textContent = data.stats.totalProducts;
    document.getElementById("stat-total-views").textContent = data.stats.totalViews;
    document.getElementById("stat-total-stock").textContent = data.stats.totalStock;
    document.getElementById("stat-avg-rating").textContent = data.stats.avgRating || "–";

    if (!myProducts.length) {
      const emptyRow = `<tr><td colspan="8">You haven't listed any products yet. <span class="action-link" onclick="goToPanel('add-listing')">Add your first listing →</span></td></tr>`;
      recentBody.innerHTML = emptyRow;
      listBody.innerHTML = emptyRow;
      return;
    }

    recentBody.innerHTML = myProducts
      .slice(0, 5)
      .map(
        (p) => `
      <tr>
        <td><img src="${p.image}" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');"/></td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.views || 0}</td>
      </tr>`
      )
      .join("");

    listBody.innerHTML = myProducts
      .map(
        (p) => `
      <tr>
        <td><img src="${p.image}" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');"/></td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.views || 0}</td>
        <td>${p.rating || "–"}</td>
        <td>
          <span class="action-link" onclick="editMyProduct('${p._id}')">Edit</span>
          <span class="action-link danger" onclick="deleteMyProduct('${p._id}')">Delete</span>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    const errorRow = `<tr><td colspan="8">Could not load your listings: ${err.message}</td></tr>`;
    if (recentBody) recentBody.innerHTML = errorRow;
    if (listBody) listBody.innerHTML = errorRow;
  }
}

function editMyProduct(id) {
  const p = myProducts.find((x) => x._id === id);
  if (!p) return;
  goToPanel("add-listing");
  document.getElementById("p-id").value = p._id;
  document.getElementById("p-name").value = p.name;
  document.getElementById("p-category").value = p.category;
  document.getElementById("p-price").value = p.price;
  document.getElementById("p-original-price").value = p.originalPrice || "";
  document.getElementById("p-stock").value = p.stock;
  document.getElementById("p-image").value = p.image || "";
  document.getElementById("p-tags").value = (p.tags || []).join(", ");
  document.getElementById("p-brand").value = p.brand || "";
  document.getElementById("p-icon").value = p.icon || "";
  document.getElementById("p-description").value = p.description;
  document.getElementById("listing-form-page-title").textContent = "Edit Listing";
  document.getElementById("product-save-btn").textContent = "Update Listing";
  document.getElementById("product-cancel-btn").style.display = "inline-block";
}

function resetMyProductForm() {
  document.getElementById("p-id").value = "";
  ["p-name", "p-category", "p-price", "p-original-price", "p-stock", "p-image", "p-tags", "p-brand", "p-icon", "p-description"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  document.getElementById("listing-form-page-title").textContent = "Add New Listing";
  document.getElementById("product-save-btn").textContent = "Add Listing";
  document.getElementById("product-cancel-btn").style.display = "none";
  document.getElementById("product-alert").innerHTML = "";
}

async function saveMyProduct() {
  const alertBox = document.getElementById("product-alert");
  const id = document.getElementById("p-id").value;

  const payload = {
    name: document.getElementById("p-name").value.trim(),
    category: document.getElementById("p-category").value.trim(),
    price: parseFloat(document.getElementById("p-price").value),
    originalPrice: document.getElementById("p-original-price").value
      ? parseFloat(document.getElementById("p-original-price").value)
      : undefined,
    stock: parseInt(document.getElementById("p-stock").value, 10) || 0,
    image: document.getElementById("p-image").value.trim() || undefined,
    tags: document
      .getElementById("p-tags")
      .value.split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    brand: document.getElementById("p-brand").value.trim() || undefined,
    icon: document.getElementById("p-icon").value.trim() || undefined,
    description: document.getElementById("p-description").value.trim(),
  };

  if (!payload.name || !payload.category || !payload.price || !payload.description) {
    alertBox.innerHTML = `<div class="alert alert-error">Please fill in name, category, price and description.</div>`;
    return;
  }

  try {
    if (id) {
      await apiRequest(`/products/${id}`, "PUT", payload, true);
      alertBox.innerHTML = `<div class="alert alert-success">Listing updated!</div>`;
    } else {
      await apiRequest("/products/mine", "POST", payload, true);
      alertBox.innerHTML = `<div class="alert alert-success">Listing added! It's now live in the store.</div>`;
    }
    resetMyProductForm();
    loadMyProducts();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function deleteMyProduct(id) {
  if (!confirm("Delete this listing? This can't be undone.")) return;
  try {
    await apiRequest(`/products/${id}`, "DELETE", null, true);
    showToast("Listing deleted", "success");
    loadMyProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ---------------- EARNINGS ---------------- */

async function loadEarnings() {
  const body = document.getElementById("earnings-table-body");
  try {
    const data = await apiRequest("/orders/seller/earnings", "GET", null, true);

    document.getElementById("earn-total-sales").textContent = `₹${data.totalSalesValue.toLocaleString("en-IN")}`;
    document.getElementById("earn-total-commission").textContent = `₹${data.totalCommission.toLocaleString("en-IN")}`;
    document.getElementById("earn-total-net").textContent = `₹${data.totalEarnings.toLocaleString("en-IN")}`;
    document.getElementById("earn-units-sold").textContent = data.unitsSold;
    document.getElementById("earn-commission-rate-label").textContent = `${data.commissionRate}% deducted per sale`;
    document.getElementById("earn-orders-count-label").textContent = `Across ${data.ordersCount} order${data.ordersCount === 1 ? "" : "s"}`;
    document.getElementById("earnings-commission-note").textContent =
      `ShopAI keeps a ${data.commissionRate}% commission on each sale — the rest is paid out to you.`;

    if (!data.recentSales.length) {
      body.innerHTML = `<tr><td colspan="7">No sales yet. Once a customer buys one of your products, it'll show up here with your earnings breakdown.</td></tr>`;
      return;
    }

    body.innerHTML = data.recentSales
      .map(
        (s) => `
      <tr>
        <td>${new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
        <td>${s.name}</td>
        <td>${s.quantity}</td>
        <td>₹${(s.price * s.quantity).toLocaleString("en-IN")}</td>
        <td style="color:var(--danger);">−₹${s.commissionAmount.toLocaleString("en-IN")}</td>
        <td style="color:var(--fk-green,#388e3c); font-weight:700;">₹${s.sellerEarning.toLocaleString("en-IN")}</td>
        <td><span class="status-pill ${s.status}">${s.status}</span></td>
      </tr>`
      )
      .join("");
  } catch (err) {
    body.innerHTML = `<tr><td colspan="7">Could not load earnings: ${err.message}</td></tr>`;
  }
}
