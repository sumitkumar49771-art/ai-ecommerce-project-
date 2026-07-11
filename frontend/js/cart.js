async function loadCart() {
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");

  if (!isLoggedIn()) {
    container.innerHTML = `<p>Please <a href="login.html">login</a> to view your cart.</p>`;
    summary.innerHTML = "";
    return;
  }

  try {
    const cart = await apiRequest("/cart", "GET", null, true);

    if (!cart.items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet. Let's fix that!</p>
          <a class="btn" href="products.html">Browse Products</a>
        </div>`;
      summary.innerHTML = "";
      return;
    }

    container.innerHTML = cart.items
      .map(
        (item) => `
      <div class="cart-item">
        <img src="${item.product.image}" onerror="this.onerror=null;this.src=placeholderImage('${escJs(item.product.name)}','${escJs(item.product.category)}');" />
        <div class="cart-item-info">
          <h3>${item.product.name}</h3>
          <p>₹${item.product.price}</p>
        </div>
        <div class="qty-controls">
          <button onclick="changeQty('${item.product._id}', ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty('${item.product._id}', ${item.quantity + 1})">+</button>
        </div>
        <button class="btn btn-outline" onclick="removeItem('${item.product._id}')">Remove</button>
      </div>
    `
      )
      .join("");

    const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    summary.innerHTML = `
      <h3>Order Summary</h3>
      <p style="margin:12px 0;">Total: <strong>₹${total}</strong></p>
      <button class="btn" style="width:100%" onclick="window.location.href='checkout.html'">Proceed to Checkout</button>
    `;
  } catch (err) {
    container.innerHTML = `<p>Could not load cart.</p>`;
  }
}

async function changeQty(productId, quantity) {
  if (quantity < 1) return removeItem(productId);
  try {
    await apiRequest(`/cart/${productId}`, "PUT", { quantity }, true);
    loadCart();
    updateCartCount();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function removeItem(productId) {
  try {
    await apiRequest(`/cart/${productId}`, "DELETE", null, true);
    loadCart();
    updateCartCount();
  } catch (err) {
    showToast(err.message, "error");
  }
}

const ORDER_STEPS = ["pending", "processing", "shipped", "delivered"];

function orderTrackingHTML(order) {
  if (order.status === "cancelled") {
    const refundLine =
      order.refundStatus === "refunded"
        ? ` — Refund of ₹${order.refundAmount ?? order.totalAmount} completed`
        : order.refundStatus === "pending"
        ? ` — Refund pending, our team will process it shortly`
        : "";
    return `<div class="tracking-cancelled">❌ Order Cancelled ${order.cancelReason ? `— ${order.cancelReason}` : ""}${refundLine}</div>`;
  }
  if (order.status === "returned") {
    return `<div class="tracking-cancelled">↩️ Order Returned — Refund of ₹${order.refundAmount ?? order.totalAmount} completed</div>`;
  }
  const currentIndex = ORDER_STEPS.indexOf(order.status);
  const labels = { pending: "Order Placed", processing: "Processing", shipped: "Shipped", delivered: "Delivered" };
  return `
    <div class="tracking-bar">
      ${ORDER_STEPS.map((step, i) => `
        <div class="tracking-step ${i <= currentIndex ? "done" : ""}">
          <div class="tracking-dot">${i <= currentIndex ? "✓" : i + 1}</div>
          <span>${labels[step]}</span>
        </div>
        ${i < ORDER_STEPS.length - 1 ? `<div class="tracking-line ${i < currentIndex ? "done" : ""}"></div>` : ""}
      `).join("")}
    </div>`;
}

function returnStatusHTML(order) {
  if (!order.returnStatus || order.returnStatus === "none") return "";
  const map = {
    requested: { label: "Return Requested", cls: "badge-lowstock" },
    approved: { label: "Returned & Refunded", cls: "badge-top" },
    rejected: { label: "Return Rejected", cls: "badge-lowstock" },
  };
  const info = map[order.returnStatus];
  if (!info) return "";
  return `<span class="badge-tag ${info.cls}" style="position:static; display:inline-block; margin-left:8px;">${info.label}</span>`;
}

async function loadOrders() {
  const container = document.getElementById("orders-list");
  if (!isLoggedIn()) {
    container.innerHTML = `<p>Please <a href="login.html">login</a> to view your orders.</p>`;
    return;
  }
  try {
    const orders = await apiRequest("/orders/my", "GET", null, true);
    const highlightId = new URLSearchParams(window.location.search).get("highlight");

    container.innerHTML = orders.length
      ? orders
          .map(
            (o) => `
        <div class="order-card ${o._id === highlightId ? "highlighted" : ""}">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <strong>Order #${o._id.slice(-6)}</strong>
              <span class="badge-tag ${o.status === "cancelled" ? "badge-lowstock" : "badge-top"}" style="position:static; display:inline-block; margin-left:8px;">${o.status}</span>
              ${returnStatusHTML(o)}
            </div>
            <span style="color:var(--muted); font-size:13px;">${new Date(o.createdAt).toLocaleString()}</span>
          </div>

          ${orderTrackingHTML(o)}

          <p style="margin-top:10px;">Items: ${o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>
          <p style="font-size:13px; color:var(--muted);">Payment: ${o.paymentMethod} ${o.isPaid ? "(Paid)" : "(Pending)"}</p>
          ${
            o.shippingCost !== undefined
              ? `<p style="font-size:13px; color:var(--muted);">Subtotal: ₹${o.itemsSubtotal ?? o.totalAmount - o.shippingCost} + Shipping: ${
                  o.shippingCost === 0 ? "FREE" : "₹" + o.shippingCost
                }${o.shippingZoneName ? ` (${o.shippingZoneName})` : ""}</p>`
              : ""
          }
          <p><strong>Total: ₹${o.totalAmount}</strong></p>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a class="btn btn-outline" style="margin-top:8px;" href="invoice.html?id=${o._id}">🧾 Download Invoice</a>
            ${
              ["pending", "processing"].includes(o.status)
                ? `<button class="btn btn-outline" style="margin-top:8px;" onclick="cancelMyOrder('${o._id}')">Cancel Order</button>`
                : ""
            }
            ${
              o.status === "delivered" && (!o.returnStatus || o.returnStatus === "none")
                ? `<button class="btn btn-outline" style="margin-top:8px;" onclick="requestMyReturn('${o._id}')">Return Order</button>`
                : ""
            }
          </div>
        </div>
      `
          )
          .join("")
      : "<p>You haven't placed any orders yet. <a href='products.html'>Start shopping</a></p>";

    if (highlightId) {
      document.querySelector(".highlighted")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (err) {
    container.innerHTML = `<p>Could not load orders.</p>`;
  }
}

async function cancelMyOrder(orderId) {
  if (!confirm("Are you sure you want to cancel this order?")) return;
  try {
    await apiRequest(`/orders/${orderId}/cancel`, "PUT", { reason: "Cancelled by customer" }, true);
    showToast("Order cancelled", "success");
    loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function requestMyReturn(orderId) {
  const reason = prompt("Please tell us why you want to return this order:");
  if (reason === null) return; // user cancelled the prompt
  if (!reason.trim()) {
    showToast("A reason is required to request a return", "error");
    return;
  }
  try {
    await apiRequest(`/orders/${orderId}/return-request`, "PUT", { reason: reason.trim() }, true);
    showToast("Return request submitted. Admin will review it shortly.", "success");
    loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  }
}
