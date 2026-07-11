let selectedAddressId = null;
let savedAddresses = [];
let cartSubtotal = 0;
let storeSettings = null;
let currentShippingCost = 0;
let appliedDiscount = 0;
let appliedCouponCode = null;

async function initCheckoutPage() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  try {
    storeSettings = await apiRequest("/settings", "GET");
  } catch (err) {
    storeSettings = null;
  }
  await Promise.all([loadCheckoutSummary(), loadSavedAddresses()]);
  applyPaymentSettings();
  setupPaymentToggles();
  updateShippingEstimate();
}

/* ---------- PAYMENT METHODS (admin-controlled) ---------- */
function applyPaymentSettings() {
  const methodMap = { COD: "codEnabled", UPI: "upiEnabled", Card: "cardEnabled" };
  const payment = (storeSettings && storeSettings.payment) || { codEnabled: true, upiEnabled: true, cardEnabled: true };

  document.querySelectorAll("#payment-options .payment-option").forEach((label) => {
    const method = label.dataset.method;
    const enabled = !!payment[methodMap[method]];
    label.style.display = enabled ? "" : "none";
    label.querySelector('input[type="radio"]').disabled = !enabled;
  });

  const enabledInputs = Array.from(document.querySelectorAll('#payment-options input[name="payment"]')).filter(
    (i) => !i.disabled
  );
  const placeOrderBtn = document.getElementById("place-order-btn");
  if (!enabledInputs.length) {
    document.getElementById("mock-payment-fields").innerHTML =
      `<p style="color:var(--muted); font-size:14px;">No payment methods are currently available. Please contact support.</p>`;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    return;
  }
  if (!enabledInputs.some((i) => i.checked)) {
    enabledInputs[0].checked = true;
  }
}

/* ---------- SHIPPING ESTIMATE (admin-controlled zones) ---------- */
function updateShippingEstimate() {
  const shippingBox = document.getElementById("checkout-shipping");
  const etaBox = document.getElementById("checkout-eta");
  if (!shippingBox) return;

  const address = savedAddresses.find((a) => a._id === selectedAddressId);
  if (!address || !storeSettings) {
    shippingBox.textContent = "Select an address";
    etaBox.textContent = "";
    currentShippingCost = 0;
    refreshTotal();
    return;
  }

  const zones = storeSettings.shippingZones || [];
  const freeDeliveryAbove = storeSettings.freeDeliveryAbove || 0;
  const cityNorm = (address.city || "").trim().toLowerCase();

  let matchedZone = null;
  for (const zone of zones) {
    const cities = (zone.cities || []).map((c) => (c || "").trim().toLowerCase()).filter(Boolean);
    if (cities.includes(cityNorm)) {
      matchedZone = zone;
      break;
    }
  }
  if (!matchedZone && zones.length) matchedZone = zones[zones.length - 1];

  const qualifiesForFree = freeDeliveryAbove > 0 && cartSubtotal >= freeDeliveryAbove;
  const baseRate = matchedZone ? matchedZone.rate || 0 : 0;
  const shippingCost = qualifiesForFree ? 0 : baseRate;
  const etaDays = matchedZone ? matchedZone.etaDays : 5;

  currentShippingCost = shippingCost;
  shippingBox.textContent = shippingCost === 0 ? "FREE" : `₹${shippingCost}`;
  etaBox.textContent = matchedZone
    ? `Estimated delivery in ${etaDays} day${etaDays === 1 ? "" : "s"} (${matchedZone.name})${
        qualifiesForFree && baseRate > 0 ? " — free delivery applied" : ""
      }`
    : "";
  refreshTotal();
}

function refreshTotal() {
  const totalBox = document.getElementById("checkout-total");
  if (!totalBox) return;
  const total = Math.max(0, cartSubtotal + currentShippingCost - appliedDiscount);
  totalBox.textContent = `₹${total}`;
}

/* ---------- COUPONS ---------- */
async function applyCouponCode() {
  const input = document.getElementById("coupon-input");
  const messageBox = document.getElementById("coupon-message");
  const discountRow = document.getElementById("checkout-discount-row");
  const discountBox = document.getElementById("checkout-discount");
  const code = input.value.trim();

  if (!code) {
    messageBox.textContent = "Please enter a coupon code.";
    messageBox.style.color = "var(--danger)";
    return;
  }

  try {
    const result = await apiRequest("/coupons/validate", "POST", { code, subtotal: cartSubtotal }, true);
    appliedDiscount = result.discountAmount;
    appliedCouponCode = result.code;
    discountRow.style.display = "flex";
    document.getElementById("checkout-discount-label").textContent = `Discount (${result.code})`;
    discountBox.textContent = `-₹${appliedDiscount}`;
    messageBox.style.color = "var(--success)";
    messageBox.textContent = `Coupon applied! You saved ₹${appliedDiscount}.`;
    refreshTotal();
  } catch (err) {
    appliedDiscount = 0;
    appliedCouponCode = null;
    discountRow.style.display = "none";
    messageBox.style.color = "var(--danger)";
    messageBox.textContent = err.message;
    refreshTotal();
  }
}

/* ---------- ORDER SUMMARY ---------- */
async function loadCheckoutSummary() {
  try {
    const cart = await apiRequest("/cart", "GET", null, true);
    const itemsBox = document.getElementById("checkout-items");

    if (!cart.items.length) {
      itemsBox.innerHTML = "<p>Your cart is empty.</p>";
      document.getElementById("place-order-btn").disabled = true;
      return;
    }

    itemsBox.innerHTML = cart.items
      .map(
        (i) => `
      <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px;">
        <span>${i.product.name} × ${i.quantity}</span>
        <span>₹${i.product.price * i.quantity}</span>
      </div>`
      )
      .join("");

    const subtotalBox = document.getElementById("checkout-subtotal");
    cartSubtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    if (subtotalBox) subtotalBox.textContent = `₹${cartSubtotal}`;
    refreshTotal();
  } catch (err) {
    showToast("Could not load cart", "error");
  }
}

/* ---------- ADDRESSES ---------- */
async function loadSavedAddresses() {
  try {
    savedAddresses = await apiRequest("/auth/addresses", "GET", null, true);
    renderAddresses();
  } catch (err) {
    document.getElementById("saved-addresses").innerHTML = "<p>Could not load saved addresses.</p>";
  }
}

function renderAddresses() {
  const box = document.getElementById("saved-addresses");
  if (!savedAddresses.length) {
    box.innerHTML = `<p style="color:var(--muted); font-size:14px;">No saved addresses yet — add one below.</p>`;
    return;
  }
  if (!selectedAddressId) {
    const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    selectedAddressId = def._id;
  }
  box.innerHTML = savedAddresses
    .map(
      (a) => `
    <label class="address-option ${a._id === selectedAddressId ? "selected" : ""}">
      <input type="radio" name="saved-address" value="${a._id}" ${a._id === selectedAddressId ? "checked" : ""} onchange="selectAddress('${a._id}')" />
      <div>
        <strong>${a.label}</strong> — ${a.fullName} (${a.phone})<br />
        <span style="color:var(--muted); font-size:13px;">${a.addressLine}, ${a.city}, ${a.state} - ${a.pincode}</span>
      </div>
      <span class="action-link danger" onclick="event.preventDefault(); deleteSavedAddress('${a._id}')">Remove</span>
    </label>`
    )
    .join("");
}

function selectAddress(id) {
  selectedAddressId = id;
  renderAddresses();
  updateShippingEstimate();
}

async function saveNewAddress() {
  const payload = {
    fullName: document.getElementById("addr-fullName").value.trim(),
    phone: document.getElementById("addr-phone").value.trim(),
    addressLine: document.getElementById("addr-line").value.trim(),
    city: document.getElementById("addr-city").value.trim(),
    state: document.getElementById("addr-state").value.trim(),
    pincode: document.getElementById("addr-pincode").value.trim(),
  };

  if (Object.values(payload).some((v) => !v)) {
    showToast("Please fill in all address fields", "error");
    return;
  }

  try {
    savedAddresses = await apiRequest("/auth/addresses", "POST", payload, true);
    selectedAddressId = savedAddresses[savedAddresses.length - 1]._id;
    renderAddresses();
    updateShippingEstimate();
    ["addr-fullName", "addr-phone", "addr-line", "addr-city", "addr-state", "addr-pincode"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
    showToast("Address saved!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteSavedAddress(id) {
  try {
    savedAddresses = await apiRequest(`/auth/addresses/${id}`, "DELETE", null, true);
    if (selectedAddressId === id) selectedAddressId = null;
    renderAddresses();
    updateShippingEstimate();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ---------- PAYMENT (real Razorpay gateway) ---------- */
function setupPaymentToggles() {
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", renderMockPaymentFields);
  });
  renderMockPaymentFields();
}

function renderMockPaymentFields() {
  const checkedInput = document.querySelector('input[name="payment"]:checked');
  const box = document.getElementById("mock-payment-fields");
  if (!checkedInput) return; // no enabled payment method — message already shown by applyPaymentSettings
  const method = checkedInput.value;
  if (method === "UPI" || method === "Card") {
    // No manual card/UPI input here on purpose — Razorpay's own secure
    // checkout popup collects payment details when you click "Place Order".
    box.innerHTML = `<p style="font-size:13px; color:var(--muted); margin-top:10px;">
      🔒 You'll pay securely via Razorpay's own checkout window after clicking "Place Order".
    </p>`;
  } else {
    box.innerHTML = "";
  }
}

/* ---------- PLACE ORDER ---------- */
async function handleCheckout() {
  const alertBox = document.getElementById("alert-box");
  const btn = document.getElementById("place-order-btn");

  if (!selectedAddressId) {
    showToast("Please select or add a delivery address", "error");
    return;
  }

  const address = savedAddresses.find((a) => a._id === selectedAddressId);
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  const shippingAddress = {
    fullName: address.fullName,
    phone: address.phone,
    address: address.addressLine,
    city: address.city,
    state: address.state,
    postalCode: address.pincode,
    country: "India",
  };

  btn.disabled = true;

  let razorpayPaymentData = {};

  // Real payment: for UPI/Card, open the actual Razorpay Checkout popup and
  // wait for a real payment before placing the order. No simulation here —
  // if the user closes the popup or the payment fails, the order is not placed.
  if (paymentMethod !== "COD") {
    btn.textContent = "Opening payment...";
    try {
      razorpayPaymentData = await payWithRazorpay(shippingAddress.city, appliedCouponCode);
    } catch (err) {
      const msg = err.message || "Payment was cancelled or failed.";
      alertBox.innerHTML = `<div class="alert alert-error">${msg}</div>`;
      alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast(msg, "error");
      btn.disabled = false;
      btn.textContent = "Place Order";
      return;
    }
  }

  btn.textContent = "Placing order...";

  try {
    const order = await apiRequest(
      "/orders",
      "POST",
      { shippingAddress, paymentMethod, couponCode: appliedCouponCode || undefined, ...razorpayPaymentData },
      true
    );
    alertBox.innerHTML = `<div class="alert alert-success">Order placed successfully! Redirecting...</div>`;
    showToast("Order placed!", "success");
    setTimeout(() => (window.location.href = `orders.html?highlight=${order._id}`), 1000);
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
}

// Opens the real Razorpay Checkout popup. Resolves with
// { razorpayOrderId, razorpayPaymentId, razorpaySignature } on a successful
// payment, or rejects if the user cancels or the gateway isn't configured.
function payWithRazorpay(city, couponCode) {
  return new Promise(async (resolve, reject) => {
    // On slower mobile connections the Razorpay <script> tag can still be
    // loading when the user taps "Place Order" for the first time. Instead
    // of failing immediately, wait up to ~4s for it to become available.
    if (typeof Razorpay === "undefined") {
      const scriptReady = await new Promise((res) => {
        let waited = 0;
        const interval = setInterval(() => {
          waited += 200;
          if (typeof Razorpay !== "undefined") {
            clearInterval(interval);
            res(true);
          } else if (waited >= 4000) {
            clearInterval(interval);
            res(false);
          }
        }, 200);
      });
      if (!scriptReady) {
        reject(new Error("Payment gateway script failed to load. Check your internet connection and try again."));
        return;
      }
    }

    let orderData;
    try {
      orderData = await apiRequest("/payments/create-order", "POST", { city, couponCode }, true);
    } catch (err) {
      reject(new Error(err.message || "Could not start payment. Please try again."));
      return;
    }

    const rzp = new Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ShopAI",
      description: "Order payment",
      order_id: orderData.razorpayOrderId,
      handler: function (response) {
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error("Payment popup was closed before completing payment."));
        },
      },
      theme: { color: "#2563eb" },
    });

    rzp.on("payment.failed", function (response) {
      reject(new Error(response.error?.description || "Payment failed."));
    });

    rzp.open();
  });
}
