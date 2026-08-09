const nodemailer = require("nodemailer");

// Reads SMTP creds from backend/.env — see .env.example for setup instructions
// (Gmail App Password is the easiest free option, no business account needed).
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Render's network has no outbound IPv6 route to Gmail, and Node's
    // default DNS resolution can still pick an IPv6 address for
    // smtp.gmail.com first — causing ENETUNREACH. Forcing IPv4 here fixes
    // that without affecting local dev (which works over either).
    family: 4,
  });
  return transporter;
}

// Sends a real email. Silently no-ops (with a console warning) if email isn't
// configured yet, so the rest of the app (orders, password reset) keeps
// working even before EMAIL_USER/EMAIL_PASS are set.
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[email] Not configured — skipped sending "${subject}" to ${to}. Add EMAIL_USER/EMAIL_PASS to backend/.env.`);
    return { sent: false };
  }
  try {
    await t.sendMail({
      from: `"ShopAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendEmail };