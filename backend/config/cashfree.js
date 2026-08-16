// Cashfree Payment Gateway — lightweight REST wrapper (no SDK dependency,
// uses Node's built-in fetch). Get free test-mode keys with no business
// verification needed at: https://merchant.cashfree.com/merchants/signup
// Dashboard → Developers → API Keys → Test Mode.
// See backend/.env.example for the exact env vars this file reads.

const CASHFREE_ENV = process.env.CASHFREE_ENV === "PRODUCTION" ? "PRODUCTION" : "TEST";

const BASE_URL =
  CASHFREE_ENV === "PRODUCTION" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

function isConfigured() {
  return !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_APP_ID,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    "x-api-version": "2023-08-01",
  };
}

// Thin fetch wrapper that throws a readable Error on non-2xx responses,
// mirroring how the Razorpay SDK surfaces failures.
async function cashfreeRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = data?.message || data?.error_description || `Cashfree request failed (${res.status})`;
    const err = new Error(reason);
    err.cashfreeResponse = data;
    throw err;
  }
  return data;
}

module.exports = { CASHFREE_ENV, BASE_URL, isConfigured, cashfreeRequest };
