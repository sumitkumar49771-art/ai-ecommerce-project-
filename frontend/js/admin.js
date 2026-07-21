// Guard: only logged-in admins can view this page
if (!isLoggedIn() || !isAdmin()) {
  window.location.href = "login.html";
}

// Chart.js defaults — tuned for the light admin theme
if (typeof Chart !== "undefined") {
  Chart.defaults.color = "#64748b";
  Chart.defaults.borderColor = "#e6e9f0";
  Chart.defaults.font.family = "'Segoe UI', Roboto, Arial, sans-serif";
}

let allProducts = [];
let allOrders = [];
let allUsers = [];

document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setTopbarUser();
  loadProducts();
  loadOrders();
  loadUsers();
  loadAnalytics(); // also feeds the dashboard overview charts
  populateBrandDatalist();
});

function setTopbarUser() {
  const name = (typeof getUserName === "function" && getUserName()) || "Admin";
  const label = document.getElementById("admin-username-label");
  const avatar = document.getElementById("admin-avatar-initial");
  if (label) label.textContent = name;
  if (avatar) avatar.textContent = name.trim().charAt(0).toUpperCase() || "A";
}

/* ---------------- SIDEBAR NAVIGATION ---------------- */

function setupSidebar() {
  document.querySelectorAll(".admin-link[data-panel]").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".admin-link").forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      closeMobileSidebar(); // tapping a link on mobile should close the drawer

      const panelKey = link.dataset.panel;
      showPanel(panelKey);

      const titleEl = document.getElementById("admin-topbar-title");

      if (panelKey === "soon") {
        document.getElementById("soon-title").textContent = link.dataset.title || "Coming Soon";
        document.getElementById("soon-page-title").textContent = link.dataset.title || "Coming Soon";
        document.getElementById("soon-desc").textContent = link.dataset.desc || "This module isn't wired up yet.";
        document.getElementById("soon-page-sub").textContent = "";
        if (titleEl) titleEl.textContent = "☰ " + (link.dataset.title || "Coming Soon");
        return;
      }

      if (panelKey === "orders") {
        const status = link.dataset.status || "";
        document.getElementById("orders-page-title").textContent = status
          ? status.charAt(0).toUpperCase() + status.slice(1) + " Orders"
          : "All Orders";
        renderOrdersTable(status);
        if (titleEl) titleEl.textContent = "☰ Orders";
        return;
      }

      if (panelKey === "users") {
        const role = link.dataset.role || "";
        document.getElementById("users-page-title").textContent = role
          ? role.charAt(0).toUpperCase() + role.slice(1) + "s"
          : "All Users";
        renderUsersTable(role);
        if (titleEl) titleEl.textContent = "☰ Users";
        return;
      }

      if (panelKey === "products") {
        if (titleEl) titleEl.textContent = "☰ Products";
        if (link.dataset.focus) {
          setTimeout(() => document.getElementById(link.dataset.focus)?.focus(), 50);
        }
        return;
      }

      if (panelKey === "analytics") {
        if (titleEl) titleEl.textContent = "☰ Sales Analytics";
        loadAnalytics();
        return;
      }

      if (panelKey === "categories") {
        if (titleEl) titleEl.textContent = "☰ Categories";
        loadCategories();
        return;
      }

      if (panelKey === "brands") {
        if (titleEl) titleEl.textContent = "☰ Brands";
        loadBrands();
        return;
      }

      if (panelKey === "reviews") {
        if (titleEl) titleEl.textContent = "☰ Reviews";
        loadReviews();
        return;
      }

      if (panelKey === "product-analytics") {
        if (titleEl) titleEl.textContent = "☰ Product Analytics";
        loadProductAnalytics();
        return;
      }

      if (panelKey === "search-analytics") {
        if (titleEl) titleEl.textContent = "☰ Search Analytics";
        loadSearchAnalytics();
        return;
      }

      if (panelKey === "chat-logs") {
        if (titleEl) titleEl.textContent = "☰ AI Chat Logs";
        loadChatLogs();
        return;
      }

      if (panelKey === "contact-messages") {
        if (titleEl) titleEl.textContent = "☰ Contact Messages";
        loadContactMessages();
        return;
      }

      if (panelKey === "coupons") {
        if (titleEl) titleEl.textContent = "☰ Coupons";
        loadCoupons();
        return;
      }

      if (panelKey === "general-settings") {
        if (titleEl) titleEl.textContent = "☰ General Settings";
        loadGeneralSettings();
        return;
      }

      if (panelKey === "payment-settings") {
        if (titleEl) titleEl.textContent = "☰ Payment Settings";
        loadPaymentSettings();
        return;
      }

      if (panelKey === "shipping-settings") {
        if (titleEl) titleEl.textContent = "☰ Shipping Settings";
        loadShippingSettings();
        return;
      }

      if (panelKey === "dashboard") {
        if (titleEl) titleEl.textContent = "☰ Dashboard Overview";
        if (link.dataset.scroll) {
          setTimeout(() => document.getElementById(link.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        }
        return;
      }
    });
  });
}

function showPanel(key) {
  document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
  document.getElementById(`panel-${key}`)?.classList.add("active");
}

/* ---------------- MOBILE SIDEBAR DRAWER ---------------- */

function toggleMobileSidebar() {
  document.querySelector(".admin-side")?.classList.toggle("open");
  document.querySelector(".admin-backdrop")?.classList.toggle("open");
}

function closeMobileSidebar() {
  document.querySelector(".admin-side")?.classList.remove("open");
  document.querySelector(".admin-backdrop")?.classList.remove("open");
}

/* ---------------- STAT CARDS ---------------- */

function renderStats({ products = 0, orders = 0, users = 0, revenue = 0, commission = 0 } = {}) {
  const el = document.getElementById("stat-cards");
  if (!el) return;
  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon green">₹</div><span class="stat-trend up">▲ +12.5%</span></div>
      <div class="num">₹${revenue.toLocaleString("en-IN")}</div>
      <div class="label">Total Sales <span style="color:#94a3b8;">from last 7 days</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon purple">🧾</div><span class="stat-trend up">▲ +18.7%</span></div>
      <div class="num">${orders}</div>
      <div class="label">Total Orders <span style="color:#94a3b8;">from last 7 days</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon blue">👤</div><span class="stat-trend up">▲ +8.4%</span></div>
      <div class="num">${users}</div>
      <div class="label">Total Users <span style="color:#94a3b8;">from last 7 days</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon pink">📦</div><span class="stat-trend up">▲ +3.2%</span></div>
      <div class="num">${products}</div>
      <div class="label">Total Products <span style="color:#94a3b8;">from last 7 days</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-top"><div class="stat-icon green">💰</div></div>
      <div class="num">₹${commission.toLocaleString("en-IN")}</div>
      <div class="label">Platform Commission <span style="color:#94a3b8;">from seller sales</span></div>
    </div>
  `;
}

let statCache = { products: 0, orders: 0, users: 0, revenue: 0, commission: 0 };
function updateStat(key, value) {
  statCache[key] = value;
  renderStats(statCache);
}

/* ---------------- PRODUCTS ---------------- */

async function loadProducts() {
  try {
    const data = await apiRequest("/products?limit=200");
    allProducts = data.products;
    updateStat("products", allProducts.length);
    const body = document.getElementById("products-table-body");
    body.innerHTML = allProducts
      .map(
        (p) => `
      <tr>
        <td><img src="${p.image}" onerror="this.onerror=null;this.src=placeholderImage('${escJs(p.name)}','${escJs(p.category)}');"/></td>
        <td style="font-size:20px;">${p.icon || "-"}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.seller ? `<span style="background:var(--primary-light); color:var(--primary-dark); font-size:11.5px; font-weight:700; padding:4px 9px; border-radius:6px; white-space:nowrap;">👤 ${p.seller.name}</span>` : `<span style="color:var(--muted); font-size:12.5px;">Admin (Catalog)</span>`}</td>
        <td>
          <span class="action-link" onclick="editProduct('${p._id}')">Edit</span>
          <span class="action-link danger" onclick="deleteProduct('${p._id}')">Delete</span>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    const body = document.getElementById("products-table-body");
    if (body) body.innerHTML = `<tr><td colspan="8">Could not load products.</td></tr>`;
  }
}

function editProduct(id) {
  const p = allProducts.find((x) => x._id === id);
  if (!p) return;
  document.querySelector('.admin-link[data-panel="products"]')?.click();
  document.getElementById("product-id").value = p._id;
  document.getElementById("p-name").value = p.name;
  document.getElementById("p-category").value = p.category;
  document.getElementById("p-price").value = p.price;
  document.getElementById("p-original-price").value = p.originalPrice || "";
  document.getElementById("p-stock").value = p.stock;
  document.getElementById("p-image").value = p.image;
  document.getElementById("p-tags").value = (p.tags || []).join(", ");
  document.getElementById("p-brand").value = p.brand || "";
  document.getElementById("p-icon").value = p.icon || "";
  document.getElementById("p-description").value = p.description;
  document.getElementById("product-form-title").textContent = "Edit Product";
  document.getElementById("product-save-btn").textContent = "Update Product";
  document.getElementById("product-cancel-btn").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetProductForm() {
  document.getElementById("product-id").value = "";
  ["p-name", "p-category", "p-price", "p-original-price", "p-stock", "p-image", "p-tags", "p-brand", "p-icon", "p-description"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  document.getElementById("product-form-title").textContent = "Add New Product";
  document.getElementById("product-save-btn").textContent = "Add Product";
  document.getElementById("product-cancel-btn").style.display = "none";
}

async function saveProduct() {
  const alertBox = document.getElementById("product-alert");
  const id = document.getElementById("product-id").value;

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
      alertBox.innerHTML = `<div class="alert alert-success">Product updated!</div>`;
    } else {
      await apiRequest("/products", "POST", payload, true);
      alertBox.innerHTML = `<div class="alert alert-success">Product added!</div>`;
    }
    resetProductForm();
    loadProducts();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    await apiRequest(`/products/${id}`, "DELETE", null, true);
    loadProducts();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ---------------- ORDERS ---------------- */

async function loadOrders() {
  try {
    const orders = await apiRequest("/orders", "GET", null, true);
    allOrders = orders;
    updateStat("orders", orders.length);
    updateStat(
      "revenue",
      orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    );
    renderOrdersTable("");
    renderRecentOrders();
  } catch (err) {
    const body = document.getElementById("orders-table-body");
    if (body) body.innerHTML = `<tr><td colspan="5">Could not load orders.</td></tr>`;
  }
}

function statusPillHtml(status) {
  return `<span class="status-pill ${status}">${status}</span>`;
}

function renderOrdersTable(statusFilter) {
  const body = document.getElementById("orders-table-body");
  if (!body) return;
  const filtered = statusFilter ? allOrders.filter((o) => o.status === statusFilter) : allOrders;
  body.innerHTML = filtered.length
    ? filtered
        .map(
          (o) => `
      <tr>
        <td>#${o._id.slice(-6)}</td>
        <td>${o.user ? `${o.user.name}<br><small>${o.user.email}</small>` : "N/A"}</td>
        <td>₹${o.totalAmount}</td>
        <td>
          <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)">
            ${["pending", "processing", "shipped", "delivered", "cancelled", "returned"]
              .map((s) => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`)
              .join("")}
          </select>
        </td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>${returnCellHtml(o)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6">No orders in this category yet.</td></tr>`;
}

function returnCellHtml(o) {
  // Cancelled orders that were auto-refunded (paid Card/UPI orders cancelled
  // before shipping) don't go through the return flow, so returnStatus stays
  // "none" — check refundStatus separately to catch those too.
  if (o.status === "cancelled" && o.refundStatus === "refunded") {
    return `<span class="status-pill approved">Refunded ₹${o.refundAmount ?? o.totalAmount}</span>`;
  }
  if (o.status === "cancelled" && o.refundStatus === "pending") {
    return `<span class="status-pill requested">Refund Pending</span>`;
  }
  if (!o.returnStatus || o.returnStatus === "none") {
    return `<span style="color:var(--muted); font-size:12.5px;">—</span>`;
  }
  if (o.returnStatus === "requested") {
    return `
      <span class="status-pill requested" title="${(o.returnReason || "").replace(/"/g, "&quot;")}">Requested</span>
      <div style="margin-top:6px; display:flex; gap:6px;">
        <button class="btn" style="padding:4px 10px; font-size:12px;" onclick="decideReturn('${o._id}', 'approve')">Approve</button>
        <button class="btn btn-outline" style="padding:4px 10px; font-size:12px;" onclick="decideReturn('${o._id}', 'reject')">Reject</button>
      </div>
    `;
  }
  if (o.returnStatus === "approved") {
    return `<span class="status-pill approved">Refunded ₹${o.refundAmount ?? o.totalAmount}</span>`;
  }
  if (o.returnStatus === "rejected") {
    return `<span class="status-pill rejected">Rejected</span>`;
  }
  return "";
}

async function decideReturn(id, decision) {
  const label = decision === "approve" ? "approve this return and refund the customer" : "reject this return request";
  if (!confirm(`Are you sure you want to ${label}?`)) return;
  try {
    const updated = await apiRequest(`/orders/${id}/return-decision`, "PUT", { decision }, true);
    const order = allOrders.find((o) => o._id === id);
    if (order) Object.assign(order, updated);
    renderOrdersTable("");
    renderRecentOrders();
    showToast(decision === "approve" ? "Return approved & refund processed" : "Return request rejected", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderRecentOrders() {
  const body = document.getElementById("recent-orders-table-body");
  if (!body) return;
  const recent = [...allOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);
  body.innerHTML = recent.length
    ? recent
        .map(
          (o) => `
      <tr>
        <td>#${o._id.slice(-6)}</td>
        <td>${o.user ? o.user.name : "N/A"}</td>
        <td>₹${o.totalAmount}</td>
        <td>${statusPillHtml(o.status)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4">No orders yet.</td></tr>`;
}

async function updateOrderStatus(id, status) {
  try {
    await apiRequest(`/orders/${id}/status`, "PUT", { status }, true);
    const order = allOrders.find((o) => o._id === id);
    if (order) order.status = status;
    renderRecentOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ---------------- USERS ---------------- */

async function loadUsers() {
  try {
    const users = await apiRequest("/auth/users", "GET", null, true);
    allUsers = users;
    updateStat("users", users.length);
    renderUsersTable("");
    renderCustomerGrowthChart();
  } catch (err) {
    const body = document.getElementById("users-table-body");
    if (body) body.innerHTML = `<tr><td colspan="4">Could not load users.</td></tr>`;
  }
}

function renderUsersTable(roleFilter) {
  const body = document.getElementById("users-table-body");
  if (!body) return;
  const filtered = roleFilter ? allUsers.filter((u) => u.role === roleFilter) : allUsers;
  body.innerHTML = filtered.length
    ? filtered
        .map(
          (u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4">No users in this category yet.</td></tr>`;
}

/* ---------------- ANALYTICS + DASHBOARD CHARTS ---------------- */
let chartInstances = {};

async function loadAnalytics() {
  if (typeof Chart === "undefined") return;
  try {
    const data = await apiRequest("/orders/analytics", "GET", null, true);
    renderRevenueChart(data.revenueByDay);
    renderStatusChart(data.statusBreakdown);
    renderCategoryChart(data.topCategories);
    renderCategoryPie(data.topCategories);
    renderTopSellingProducts(data.topSellingProducts);
    renderAiRecommendations(data.topCategories, data.topSellingProducts);
    updateStat("commission", data.platformCommission?.totalCommission || 0);
  } catch (err) {
    // Non-fatal — dashboard still shows stat cards and tables from other endpoints
  }
}

function renderTopSellingProducts(products) {
  [document.getElementById("top-products-table-body"), document.getElementById("top-products-table-body-2")].forEach((body) => {
    if (!body) return;
    body.innerHTML =
      products && products.length
        ? products
            .map(
              (p) =>
                body.id === "top-products-table-body"
                  ? `<tr><td>${p.name || "Unknown"}</td><td>₹${p.price || "-"}</td><td>${p.unitsSold}</td><td>₹${p.revenue}</td></tr>`
                  : `<tr><td>${p.name || "Unknown"}</td><td>${p.unitsSold}</td><td>₹${p.revenue}</td></tr>`
            )
            .join("")
        : `<tr><td colspan="4">No sales data yet.</td></tr>`;
  });
}

function renderAiRecommendations(topCategories, topSellingProducts) {
  const list = document.getElementById("ai-rec-list");
  if (!list) return;
  const tips = [];
  if (topSellingProducts && topSellingProducts[0]) {
    tips.push(`Increase stock for <strong>${topSellingProducts[0].name}</strong> — it's your top seller.`);
  }
  if (topCategories && topCategories[0]) {
    tips.push(`Launch more offers on <strong>${topCategories[0]._id || "your top category"}</strong>.`);
  }
  tips.push("Promote your Electronics category — historically strong conversion.");
  tips.push("Create bundle deals to lift average order value.");
  list.innerHTML = tips.map((t) => `<li><span class="dot">◆</span> ${t}</li>`).join("");
}

function destroyChart(key) {
  if (chartInstances[key]) chartInstances[key].destroy();
}

function renderRevenueChart(revenueByDay) {
  ["chart-revenue", "chart-revenue-2"].forEach((canvasId) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: revenueByDay.map((d) => d._id.slice(5)),
        datasets: [
          {
            label: "Revenue (₹)",
            data: revenueByDay.map((d) => d.revenue),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.12)",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  });
}

function renderStatusChart(statusBreakdown) {
  const colors = { pending: "#f59e0b", processing: "#6366f1", shipped: "#2563eb", delivered: "#16a34a", cancelled: "#dc2626" };
  ["chart-status", "chart-status-2"].forEach((canvasId) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    destroyChart(canvasId);
    chartInstances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: statusBreakdown.map((s) => s._id),
        datasets: [
          {
            data: statusBreakdown.map((s) => s.count),
            backgroundColor: statusBreakdown.map((s) => colors[s._id] || "#999"),
          },
        ],
      },
      options: { responsive: true },
    });
  });
}

function renderCategoryChart(topCategories) {
  destroyChart("categories");
  const ctx = document.getElementById("chart-categories");
  if (!ctx) return;
  chartInstances.categories = new Chart(ctx, {
    type: "bar",
    data: {
      labels: topCategories.map((c) => c._id || "Other"),
      datasets: [
        {
          label: "Revenue (₹)",
          data: topCategories.map((c) => c.revenue),
          backgroundColor: "#2563eb",
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

function renderCategoryPie(topCategories) {
  destroyChart("categories-pie");
  const ctx = document.getElementById("chart-categories-pie");
  if (!ctx) return;
  const palette = ["#2563eb", "#16a34a", "#f59e0b", "#6366f1", "#dc2626", "#06b6d4"];
  chartInstances["categories-pie"] = new Chart(ctx, {
    type: "pie",
    data: {
      labels: topCategories.map((c) => c._id || "Other"),
      datasets: [
        {
          data: topCategories.map((c) => c.revenue),
          backgroundColor: topCategories.map((_, i) => palette[i % palette.length]),
        },
      ],
    },
    options: { responsive: true },
  });
}

function renderCustomerGrowthChart() {
  destroyChart("customer-growth");
  const ctx = document.getElementById("chart-customer-growth");
  if (!ctx || !allUsers.length) return;

  const monthly = {};
  allUsers.forEach((u) => {
    const d = new Date(u.createdAt);
    const key = d.toLocaleString("en-US", { month: "short" });
    monthly[key] = (monthly[key] || 0) + 1;
  });
  const labels = Object.keys(monthly);
  let running = 0;
  const cumulative = labels.map((k) => (running += monthly[k]));

  chartInstances["customer-growth"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Total Users",
          data: cumulative,
          backgroundColor: "#6366f1",
          borderRadius: 4,
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

/* ================= CATEGORIES ================= */
let allCategories = [];

async function loadCategories() {
  const body = document.getElementById("categories-table-body");
  try {
    const data = await apiRequest("/categories", "GET", null, true);
    allCategories = data.categories;
    renderCategoriesTable();
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="5">Could not load categories.</td></tr>`;
  }
}

function renderCategoriesTable() {
  const body = document.getElementById("categories-table-body");
  if (!body) return;
  body.innerHTML = allCategories.length
    ? allCategories
        .map(
          (c) => `
      <tr>
        <td style="font-size:20px;">${c.icon || "🏷️"}</td>
        <td>${c.name}</td>
        <td>${c.description || "-"}</td>
        <td>${c.productCount}</td>
        <td><span class="action-link danger" onclick="deleteCategory('${c._id}')">Delete</span></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5">No categories yet. Add one above.</td></tr>`;
}

async function saveCategory() {
  const alertBox = document.getElementById("category-alert");
  const name = document.getElementById("cat-name").value.trim();
  const icon = document.getElementById("cat-icon").value.trim();
  const description = document.getElementById("cat-desc").value.trim();

  if (!name) {
    alertBox.innerHTML = `<div class="alert alert-error">Category name is required.</div>`;
    return;
  }
  try {
    await apiRequest("/categories", "POST", { name, icon, description }, true);
    alertBox.innerHTML = `<div class="alert alert-success">Category added!</div>`;
    document.getElementById("cat-name").value = "";
    document.getElementById("cat-icon").value = "";
    document.getElementById("cat-desc").value = "";
    loadCategories();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function deleteCategory(id) {
  if (!confirm("Delete this category?")) return;
  try {
    await apiRequest(`/categories/${id}`, "DELETE", null, true);
    loadCategories();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ================= BRANDS ================= */
let allBrands = [];

async function loadBrands() {
  const body = document.getElementById("brands-table-body");
  try {
    const data = await apiRequest("/brands", "GET", null, true);
    allBrands = data.brands;
    renderBrandsTable();
    populateBrandDatalist();
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="3">Could not load brands.</td></tr>`;
  }
}

function renderBrandsTable() {
  const body = document.getElementById("brands-table-body");
  if (!body) return;
  body.innerHTML = allBrands.length
    ? allBrands
        .map(
          (b) => `
      <tr>
        <td>${b.name}</td>
        <td>${b.productCount}</td>
        <td><span class="action-link danger" onclick="deleteBrand('${b._id}')">Delete</span></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="3">No brands yet. Add one above.</td></tr>`;
}

async function populateBrandDatalist() {
  try {
    if (!allBrands.length) {
      const data = await apiRequest("/brands");
      allBrands = data.brands;
    }
    const list = document.getElementById("brand-list");
    if (list) list.innerHTML = allBrands.map((b) => `<option value="${b.name}"></option>`).join("");
  } catch (err) {
    // non-critical
  }
}

async function saveBrand() {
  const alertBox = document.getElementById("brand-alert");
  const name = document.getElementById("brand-name").value.trim();
  const logo = document.getElementById("brand-logo").value.trim();

  if (!name) {
    alertBox.innerHTML = `<div class="alert alert-error">Brand name is required.</div>`;
    return;
  }
  try {
    await apiRequest("/brands", "POST", { name, logo }, true);
    alertBox.innerHTML = `<div class="alert alert-success">Brand added!</div>`;
    document.getElementById("brand-name").value = "";
    document.getElementById("brand-logo").value = "";
    loadBrands();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function deleteBrand(id) {
  if (!confirm("Delete this brand?")) return;
  try {
    await apiRequest(`/brands/${id}`, "DELETE", null, true);
    loadBrands();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ================= REVIEWS ================= */
let allReviews = [];

async function loadReviews() {
  const body = document.getElementById("reviews-table-body");
  try {
    const data = await apiRequest("/reviews", "GET", null, true);
    allReviews = data.reviews;
    renderReviewsTable();
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="6">Could not load reviews.</td></tr>`;
  }
}

function renderReviewsTable() {
  const body = document.getElementById("reviews-table-body");
  if (!body) return;
  body.innerHTML = allReviews.length
    ? allReviews
        .map(
          (r) => `
      <tr>
        <td>${r.product?.name || "Deleted product"}</td>
        <td>${r.user?.name || "Unknown"}</td>
        <td>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</td>
        <td>${(r.comment || "").slice(0, 80)}</td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td><span class="action-link danger" onclick="deleteReviewAdmin('${r._id}')">Delete</span></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6">No reviews submitted yet.</td></tr>`;
}

async function deleteReviewAdmin(id) {
  if (!confirm("Delete this review?")) return;
  try {
    await apiRequest(`/reviews/${id}`, "DELETE", null, true);
    loadReviews();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ================= PRODUCT ANALYTICS ================= */
async function goToEditProduct(id) {
  document.querySelector('.admin-link[data-panel="products"]')?.click();
  if (!allProducts.length) await loadProducts();
  editProduct(id);
}

async function loadProductAnalytics() {
  const body = document.getElementById("product-analytics-table-body");
  try {
    const data = await apiRequest("/admin/product-analytics", "GET", null, true);
    body.innerHTML = data.products.length
      ? data.products
          .map(
            (p) => `
        <tr>
          <td><span class="action-link" onclick="goToEditProduct('${p._id}')">${p.name}</span></td>
          <td>${p.category}</td>
          <td>${p.views}</td>
          <td>${p.unitsSold}</td>
          <td>₹${p.revenue}</td>
          <td>${p.rating ? p.rating.toFixed(1) : "-"} (${p.numReviews})</td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="6">No product data yet.</td></tr>`;
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="6">Could not load product analytics.</td></tr>`;
  }
}

/* ================= SEARCH ANALYTICS ================= */
async function loadSearchAnalytics() {
  const topBody = document.getElementById("top-queries-table-body");
  const recentBody = document.getElementById("recent-searches-table-body");
  try {
    const data = await apiRequest("/admin/search-logs", "GET", null, true);
    topBody.innerHTML = data.topQueries.length
      ? data.topQueries
          .map((q) => `<tr><td>${q._id}</td><td>${q.count}</td><td>${Math.round(q.avgResults)}</td></tr>`)
          .join("")
      : `<tr><td colspan="3">No searches logged yet.</td></tr>`;

    recentBody.innerHTML = data.logs.length
      ? data.logs
          .slice(0, 50)
          .map(
            (l) =>
              `<tr><td>${l.query}</td><td>${l.resultsCount}${l.noExactMatch ? " (popular picks)" : ""}</td><td>${new Date(
                l.createdAt
              ).toLocaleString()}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="3">No searches logged yet.</td></tr>`;
  } catch (err) {
    if (topBody) topBody.innerHTML = `<tr><td colspan="3">Could not load search analytics.</td></tr>`;
    if (recentBody) recentBody.innerHTML = "";
  }
}

/* ================= AI CHAT LOGS ================= */
async function loadChatLogs() {
  const body = document.getElementById("chat-logs-table-body");
  try {
    const data = await apiRequest("/admin/chat-logs", "GET", null, true);
    body.innerHTML = data.logs.length
      ? data.logs
          .map(
            (l) =>
              `<tr><td>${escapeHtml(l.message)}</td><td>${escapeHtml(l.reply)}</td><td>${new Date(
                l.createdAt
              ).toLocaleString()}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="3">No chat conversations logged yet.</td></tr>`;
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="3">Could not load chat logs.</td></tr>`;
  }
}

/* ================= CONTACT MESSAGES ================= */
async function loadContactMessages() {
  const body = document.getElementById("contact-messages-table-body");
  try {
    const data = await apiRequest("/contact", "GET", null, true);
    const messages = data.messages || [];
    body.innerHTML = messages.length
      ? messages
          .map((m) => {
            const statusLabel = m.read
              ? `<span class="badge-tag badge-top" style="position:static;">Read</span>`
              : `<span class="badge-tag badge-lowstock" style="position:static;">New</span>`;
            return `
        <tr style="${m.read ? "" : "font-weight:600;"}">
          <td>${statusLabel}</td>
          <td>${escapeHtml(m.name)}</td>
          <td>${escapeHtml(m.email)}</td>
          <td>${escapeHtml(m.subject)}</td>
          <td style="max-width:280px; white-space:normal;">${escapeHtml(m.message)}</td>
          <td>${new Date(m.createdAt).toLocaleString()}</td>
          <td>
            <span class="action-link" onclick="toggleContactMessageRead('${m._id}', ${!m.read})">${m.read ? "Mark Unread" : "Mark Read"}</span>
            &nbsp;|&nbsp;
            <span class="action-link danger" onclick="deleteContactMessage('${m._id}')">Delete</span>
          </td>
        </tr>`;
          })
          .join("")
      : `<tr><td colspan="7">No messages received yet.</td></tr>`;
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="7">Could not load contact messages.</td></tr>`;
  }
}

async function toggleContactMessageRead(id, newReadState) {
  try {
    await apiRequest(`/contact/${id}/read`, "PUT", { read: newReadState }, true);
    loadContactMessages();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteContactMessage(id) {
  if (!confirm("Delete this message? This cannot be undone.")) return;
  try {
    await apiRequest(`/contact/${id}`, "DELETE", null, true);
    loadContactMessages();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ================= COUPONS ================= */
async function loadCoupons() {
  const body = document.getElementById("coupons-table-body");
  try {
    const coupons = await apiRequest("/coupons", "GET", null, true);
    body.innerHTML = coupons.length
      ? coupons
          .map((c) => {
            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const statusLabel = !c.active
              ? `<span class="badge-tag badge-lowstock" style="position:static;">Disabled</span>`
              : isExpired
              ? `<span class="badge-tag badge-lowstock" style="position:static;">Expired</span>`
              : `<span class="badge-tag badge-top" style="position:static;">Active</span>`;
            return `
        <tr>
          <td><strong>${escapeHtml(c.code)}</strong></td>
          <td>${c.discountType === "percent" ? c.discountValue + "%" : "₹" + c.discountValue}</td>
          <td>₹${c.minOrderValue || 0}</td>
          <td>${c.usedCount || 0}${c.usageLimit ? " / " + c.usageLimit : ""}</td>
          <td>${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
          <td>${statusLabel}</td>
          <td>
            <span class="action-link" onclick="toggleCouponActive('${c._id}', ${!c.active})">${c.active ? "Disable" : "Enable"}</span>
            &nbsp;|&nbsp;
            <span class="action-link danger" onclick="deleteCoupon('${c._id}')">Delete</span>
          </td>
        </tr>`;
          })
          .join("")
      : `<tr><td colspan="7">No coupons created yet.</td></tr>`;
  } catch (err) {
    if (body) body.innerHTML = `<tr><td colspan="7">Could not load coupons.</td></tr>`;
  }
}

async function createCoupon() {
  const alertBox = document.getElementById("coupon-alert");
  const payload = {
    code: document.getElementById("cpn-code").value.trim().toUpperCase(),
    discountType: document.getElementById("cpn-type").value,
    discountValue: parseFloat(document.getElementById("cpn-value").value) || 0,
    minOrderValue: parseFloat(document.getElementById("cpn-min-order").value) || 0,
    maxDiscountAmount: document.getElementById("cpn-max-discount").value
      ? parseFloat(document.getElementById("cpn-max-discount").value)
      : undefined,
    usageLimit: document.getElementById("cpn-usage-limit").value
      ? parseInt(document.getElementById("cpn-usage-limit").value, 10)
      : undefined,
    expiresAt: document.getElementById("cpn-expiry").value || undefined,
  };

  if (!payload.code || !payload.discountValue) {
    alertBox.innerHTML = `<div class="alert alert-error">Code and discount value are required.</div>`;
    return;
  }

  try {
    await apiRequest("/coupons", "POST", payload, true);
    alertBox.innerHTML = `<div class="alert alert-success">Coupon created!</div>`;
    ["cpn-code", "cpn-value", "cpn-min-order", "cpn-max-discount", "cpn-usage-limit", "cpn-expiry"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
    loadCoupons();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function toggleCouponActive(id, newActiveState) {
  try {
    await apiRequest(`/coupons/${id}`, "PUT", { active: newActiveState }, true);
    loadCoupons();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteCoupon(id) {
  try {
    await apiRequest(`/coupons/${id}`, "DELETE", null, true);
    loadCoupons();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ================= GENERAL SETTINGS ================= */
async function loadGeneralSettings() {
  try {
    const settings = await apiRequest("/settings");
    document.getElementById("set-store-name").value = settings.storeName || "";
    document.getElementById("set-currency").value = settings.currency || "";
    document.getElementById("set-support-email").value = settings.supportEmail || "";
    document.getElementById("set-support-phone").value = settings.supportPhone || "";
    document.getElementById("set-support-address").value = settings.supportAddress || "";
    document.getElementById("set-support-hours").value = settings.supportHours || "";
    document.getElementById("set-free-delivery").value = settings.freeDeliveryAbove || 0;
    document.getElementById("set-return-days").value = settings.returnPolicyDays || 7;
    document.getElementById("set-commission-rate").value = settings.sellerCommissionRate ?? 10;
    document.getElementById("set-sale-duration").value = settings.saleEnabled ? String(settings.saleDurationDays || 3) : "0";
  } catch (err) {
    showToast("Could not load settings", "error");
  }
}

async function saveGeneralSettings() {
  const alertBox = document.getElementById("general-settings-alert");
  const saleDays = parseInt(document.getElementById("set-sale-duration").value, 10) || 0;
  const payload = {
    storeName: document.getElementById("set-store-name").value.trim(),
    currency: document.getElementById("set-currency").value.trim(),
    supportEmail: document.getElementById("set-support-email").value.trim(),
    supportPhone: document.getElementById("set-support-phone").value.trim(),
    supportAddress: document.getElementById("set-support-address").value.trim(),
    supportHours: document.getElementById("set-support-hours").value.trim(),
    freeDeliveryAbove: parseFloat(document.getElementById("set-free-delivery").value) || 0,
    returnPolicyDays: parseInt(document.getElementById("set-return-days").value, 10) || 7,
    sellerCommissionRate: parseFloat(document.getElementById("set-commission-rate").value) || 0,
    // Picking any duration other than "Off" automatically turns the sale on;
    // picking "Off" turns it off. No separate toggle needed.
    saleEnabled: saleDays > 0,
    saleDurationDays: saleDays > 0 ? saleDays : 3,
  };
  try {
    await apiRequest("/settings", "PUT", payload, true);
    alertBox.innerHTML = `<div class="alert alert-success">Settings saved!</div>`;
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

/* ================= PAYMENT SETTINGS ================= */
async function loadPaymentSettings() {
  try {
    const settings = await apiRequest("/settings");
    const payment = settings.payment || {};
    document.getElementById("set-cod").checked = !!payment.codEnabled;
    document.getElementById("set-upi").checked = !!payment.upiEnabled;
    document.getElementById("set-card").checked = !!payment.cardEnabled;
  } catch (err) {
    showToast("Could not load payment settings", "error");
  }
}

async function savePaymentSettings() {
  const alertBox = document.getElementById("payment-settings-alert");
  const payload = {
    payment: {
      codEnabled: document.getElementById("set-cod").checked,
      upiEnabled: document.getElementById("set-upi").checked,
      cardEnabled: document.getElementById("set-card").checked,
    },
  };
  try {
    await apiRequest("/settings", "PUT", payload, true);
    alertBox.innerHTML = `<div class="alert alert-success">Settings saved!</div>`;
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

/* ================= SHIPPING SETTINGS ================= */
let shippingZonesCache = [];

async function loadShippingSettings() {
  try {
    const settings = await apiRequest("/settings");
    shippingZonesCache = settings.shippingZones || [];
    renderShippingZonesTable();
  } catch (err) {
    showToast("Could not load shipping settings", "error");
  }
}

function renderShippingZonesTable() {
  const body = document.getElementById("shipping-zones-table-body");
  if (!body) return;
  body.innerHTML = shippingZonesCache.length
    ? shippingZonesCache
        .map(
          (z, i) => `
      <tr>
        <td><input value="${z.name || ""}" onchange="shippingZonesCache[${i}].name=this.value" /></td>
        <td><input value="${(z.cities || []).join(", ")}" placeholder="e.g. Mumbai, Delhi (leave blank for catch-all)"
              onchange="shippingZonesCache[${i}].cities=this.value.split(',').map(c=>c.trim()).filter(Boolean)" /></td>
        <td><input type="number" value="${z.rate || 0}" onchange="shippingZonesCache[${i}].rate=parseFloat(this.value)||0" /></td>
        <td><input type="number" value="${z.etaDays || 0}" onchange="shippingZonesCache[${i}].etaDays=parseInt(this.value,10)||0" /></td>
        <td><span class="action-link danger" onclick="removeShippingZoneRow(${i})">Remove</span></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5">No shipping zones yet. Add one below.</td></tr>`;
}

function addShippingZoneRow() {
  shippingZonesCache.push({ name: "New Zone", rate: 0, etaDays: 3, cities: [] });
  renderShippingZonesTable();
}

function removeShippingZoneRow(index) {
  shippingZonesCache.splice(index, 1);
  renderShippingZonesTable();
}

async function saveShippingSettings() {
  const alertBox = document.getElementById("shipping-settings-alert");
  try {
    await apiRequest("/settings", "PUT", { shippingZones: shippingZonesCache }, true);
    alertBox.innerHTML = `<div class="alert alert-success">Shipping settings saved!</div>`;
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

/* ================= EMOJI PICKER (used for Category & Product icon fields) ================= */
const EMOJI_PICKER_LIST = [
  "🛍️","👟","👗","👕","👖","🧥","🧦","👜","👛","👠",
  "📱","💻","🎧","⌚","📷","🖥️","🖨️","🔌","🔋","💡",
  "🍎","🍞","🥛","☕","🍫","🍕","🍔","🥤","🧃","🍪",
  "🏠","🛋️","🪑","🛏️","🧴","🧹","🍳","🔪","🧺","🪞",
  "💄","🧼","🪒","🧽","🧴","💅","🧖","🧊","🌸","✨",
  "⚽","🏀","🏋️","🚴","🧘","🏸","🥊","🎯","🩱","🥇",
  "🧸","🎮","🎲","🧩","🚗","🎁","📚","✏️","🎨","🎵",
  "🏷️","⭐","❤️","🔥","🆕","💯","📦","🛒","💳","🎉",
];

let emojiPickerTargetId = null;

function openEmojiPicker(targetInputId, anchorEl) {
  emojiPickerTargetId = targetInputId;
  let popup = document.getElementById("emoji-picker-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "emoji-picker-popup";
    popup.style.cssText =
      "position:absolute; z-index:9999; background:var(--card,#fff); border:1px solid var(--border,#ddd); " +
      "border-radius:10px; padding:8px; box-shadow:0 8px 24px rgba(0,0,0,0.18); display:grid; " +
      "grid-template-columns:repeat(10, 28px); gap:4px; max-width:320px;";
    document.body.appendChild(popup);
    document.addEventListener("click", closeEmojiPickerOnOutsideClick);
  }

  popup.innerHTML = EMOJI_PICKER_LIST.map(
    (e) => `<span style="cursor:pointer; font-size:18px; text-align:center; line-height:28px; border-radius:6px;"
      onmouseover="this.style.background='rgba(0,0,0,0.08)'" onmouseout="this.style.background='transparent'"
      onclick="selectEmoji('${e}')">${e}</span>`
  ).join("");

  const rect = anchorEl.getBoundingClientRect();
  popup.style.top = window.scrollY + rect.bottom + 6 + "px";
  popup.style.left = window.scrollX + rect.left + "px";
  popup.style.display = "grid";
}

function selectEmoji(emoji) {
  if (emojiPickerTargetId) {
    const input = document.getElementById(emojiPickerTargetId);
    if (input) input.value = emoji;
  }
  const popup = document.getElementById("emoji-picker-popup");
  if (popup) popup.style.display = "none";
}

function closeEmojiPickerOnOutsideClick(e) {
  const popup = document.getElementById("emoji-picker-popup");
  if (!popup) return;
  if (e.target.id === "emoji-picker-popup" || popup.contains(e.target) || e.target.dataset.emojiTrigger) return;
  popup.style.display = "none";
}
