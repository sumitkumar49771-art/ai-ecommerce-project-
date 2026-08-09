const nodemailer = require("nodemailer");

// --- Brevo (HTTP API) -------------------------------------------------
// Render's free tier blocks all outbound SMTP ports (25/465/587), so any
// SMTP-based sender (Gmail included) hangs or fails there — it works fine
// locally because your own internet isn't blocked. Brevo sends over plain
// HTTPS instead, which Render's free tier does allow, so this is what
// actually delivers email in production. Free plan: 300 emails/day, no
// card required. Set BREVO_API_KEY and BREVO_SENDER_EMAIL in the .env (and
// in Render's Environment tab) to use it.
async function sendViaBrevo({ to, subject, html }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "ShopAI", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body.slice(0, 200)}`);
  }
}

// --- Gmail SMTP (local-dev fallback) -----------------------------------
// Only used when Brevo isn't configured. Fine on your own machine; will
// hang/fail on Render's free tier (see note above), so short timeouts are
// set to fail fast rather than block a request forever.
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
  return transporter;
}

async function sendViaSmtp({ to, subject, html }) {
  const t = getTransporter();
  if (!t) throw new Error("not configured");
  await t.sendMail({ from: `"ShopAI" <${process.env.EMAIL_USER}>`, to, subject, html });
}

// Sends a real email. Prefers Brevo (works on Render); falls back to Gmail
// SMTP (works locally). Silently no-ops (with a console warning) if neither
// is configured, so the rest of the app (orders, password reset) keeps
// working even before email is set up.
async function sendEmail({ to, subject, html }) {
  if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
    try {
      await sendViaBrevo({ to, subject, html });
      return { sent: true };
    } catch (err) {
      console.error(`[email] Brevo failed to send "${subject}" to ${to}:`, err.message);
      return { sent: false, error: err.message };
    }
  }

  try {
    await sendViaSmtp({ to, subject, html });
    return { sent: true };
  } catch (err) {
    if (err.message === "not configured") {
      console.warn(`[email] Not configured — skipped sending "${subject}" to ${to}. Add BREVO_API_KEY+BREVO_SENDER_EMAIL (works on Render) or EMAIL_USER+EMAIL_PASS (local only) to backend/.env.`);
    } else {
      console.error(`[email] SMTP failed to send "${subject}" to ${to}:`, err.message);
    }
    return { sent: false, error: err.message };
  }
}

module.exports = { sendEmail };
