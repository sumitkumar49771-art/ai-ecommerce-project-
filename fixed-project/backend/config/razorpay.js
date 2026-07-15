const Razorpay = require("razorpay");

// Reads keys from backend/.env — see .env.example for where to get test keys
// (https://dashboard.razorpay.com/app/keys, free test-mode keys, no business
// verification needed to start testing).
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
