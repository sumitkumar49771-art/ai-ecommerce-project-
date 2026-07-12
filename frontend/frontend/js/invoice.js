async function loadInvoice() {
  const box = document.getElementById("invoice-box");
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");

  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  if (!orderId) {
    box.innerHTML = "<p>No order specified.</p>";
    return;
  }

  try {
    const order = await apiRequest(`/orders/${orderId}`, "GET", null, true);
    const itemsSubtotal = order.itemsSubtotal ?? order.totalAmount - (order.shippingCost || 0);
    const orderDate = new Date(order.createdAt).toLocaleString();

    box.innerHTML = `
      <div class="invoice-header">
        <div>
          <h1 style="margin-bottom:4px;">Shop<span style="color:var(--primary);">AI</span></h1>
          <p style="color:var(--muted); font-size:13px;">Golden Avenue, Amritsar, Punjab, India - 143001</p>
          <p style="color:var(--muted); font-size:13px;">support@shopai.com</p>
        </div>
        <div style="text-align:right;">
          <h2>Invoice</h2>
          <p style="color:var(--muted); font-size:13px;">Order #${order._id.slice(-8)}</p>
          <p style="color:var(--muted); font-size:13px;">${orderDate}</p>
          <p style="color:var(--muted); font-size:13px;">Status: ${order.status || "pending"}</p>
        </div>
      </div>

      <hr style="margin:24px 0; border-color:var(--border);" />

      <div>
        <strong>Billed / Shipped To</strong>
        <p>${order.shippingAddress?.fullName || ""} — ${order.shippingAddress?.phone || ""}</p>
        <p>${order.shippingAddress?.address || ""}</p>
        <p>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.postalCode || ""}</p>
      </div>

      <table>
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (i) => `
            <tr>
              <td>${i.name}</td>
              <td>${i.quantity}</td>
              <td>₹${i.price}</td>
              <td>₹${i.price * i.quantity}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div style="margin-top:20px; max-width:280px; margin-left:auto;">
        <p style="display:flex; justify-content:space-between;"><span>Subtotal</span><span>₹${itemsSubtotal}</span></p>
        <p style="display:flex; justify-content:space-between;">
          <span>Shipping${order.shippingZoneName ? ` (${order.shippingZoneName})` : ""}</span>
          <span>${order.shippingCost ? `₹${order.shippingCost}` : "FREE"}</span>
        </p>
        ${
          order.discountAmount
            ? `<p style="display:flex; justify-content:space-between; color:var(--success);"><span>Discount${order.couponCode ? ` (${order.couponCode})` : ""}</span><span>-₹${order.discountAmount}</span></p>`
            : ""
        }
        <hr style="margin:10px 0; border-color:var(--border);" />
        <p style="display:flex; justify-content:space-between; font-weight:700; font-size:18px;"><span>Total</span><span>₹${order.totalAmount}</span></p>
        <p style="color:var(--muted); font-size:13px; margin-top:6px;">Payment: ${order.paymentMethod} (${order.isPaid ? "Paid" : "Pending"})</p>
        ${
          order.refundStatus === "refunded"
            ? `<p style="color:var(--success); font-size:13px; margin-top:4px;">↩️ Refunded: ₹${order.refundAmount ?? order.totalAmount} on ${order.refundedAt ? new Date(order.refundedAt).toLocaleDateString() : ""}</p>`
            : ""
        }
      </div>

      <p style="text-align:center; color:var(--muted); font-size:12px; margin-top:40px;">Thank you for shopping with ShopAI!</p>
    `;
  } catch (err) {
    box.innerHTML = `<p>Could not load this invoice: ${err.message}</p>`;
  }
}
