// A real-looking address: something@something.tld — rejects junk like "asdf" or "a@a"
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
// At least 8 chars, one uppercase letter, one lowercase letter, and one digit
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const alertBox = document.getElementById("alert-box");

  if (!name) {
    alertBox.innerHTML = `<div class="alert alert-error">Please enter your name</div>`;
    return;
  }
  if (!EMAIL_REGEX.test(email)) {
    alertBox.innerHTML = `<div class="alert alert-error">Please enter a valid email address (e.g. name@example.com)</div>`;
    return;
  }
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    alertBox.innerHTML = `<div class="alert alert-error">Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number</div>`;
    return;
  }

  try {
    const data = await apiRequest("/auth/register", "POST", { name, email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userRole", data.role);
    window.location.href = "index.html";
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

// Counts down the 10-minute admin OTP window and shows it live next to the
// code input. When it hits zero the code is expired server-side too, so the
// form is disabled and the person is sent back to re-enter password.
let otpCountdownInterval = null;

function startOtpCountdown(seconds) {
  const timerEl = document.getElementById("otp-timer");
  const otpInput = document.getElementById("admin-otp");
  const otpForm = document.getElementById("otp-form");
  let remaining = seconds;

  if (otpCountdownInterval) clearInterval(otpCountdownInterval);

  const render = () => {
    const m = Math.floor(remaining / 60);
    const s = String(remaining % 60).padStart(2, "0");
    timerEl.textContent = remaining > 0 ? `Code expires in ${m}:${s}` : "Code expired";
  };
  render();

  otpCountdownInterval = setInterval(() => {
    remaining -= 1;
    render();
    if (remaining <= 0) {
      clearInterval(otpCountdownInterval);
      otpInput.disabled = true;
      const alertBox = document.getElementById("alert-box");
      alertBox.innerHTML = `<div class="alert alert-error">Code expired. Please log in again to get a new one.</div>`;
      setTimeout(() => {
        otpForm.style.display = "none";
        document.getElementById("login-form").style.display = "block";
        otpInput.disabled = false;
        otpInput.value = "";
      }, 1500);
    }
  }, 1000);
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  // Silently included if this browser has the owner's device key saved
  // (set once, manually, via the browser console — never a visible field).
  const deviceKey = localStorage.getItem("adminDeviceKey") || "";
  const alertBox = document.getElementById("alert-box");

  try {
    const data = await apiRequest("/auth/login", "POST", { email, password, deviceKey });

    // Admin accounts don't get a token yet — a one-time code was just
    // emailed to them. Swap to the code-entry form instead of redirecting.
    if (data.otpRequired) {
      document.getElementById("login-form").style.display = "none";
      document.getElementById("otp-form").style.display = "block";
      document.getElementById("otp-form").dataset.email = data.email;
      alertBox.innerHTML = `<div class="alert alert-success">Code sent! Check the admin inbox.</div>`;
      startOtpCountdown(600); // matches the 10-minute expiry set on the backend
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userRole", data.role);
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    window.location.href = redirect || (data.role === "admin" ? "admin.html" : "index.html");
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function handleAdminOtp(event) {
  event.preventDefault();
  const otpForm = document.getElementById("otp-form");
  const email = otpForm.dataset.email;
  const otp = document.getElementById("admin-otp").value.trim();
  const alertBox = document.getElementById("alert-box");

  try {
    const data = await apiRequest("/auth/verify-admin-otp", "POST", { email, otp });
    if (otpCountdownInterval) clearInterval(otpCountdownInterval);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userRole", data.role);
    window.location.href = "admin.html";
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const alertBox = document.getElementById("alert-box");
  const btn = document.getElementById("forgot-submit-btn");

  btn.disabled = true;
  btn.textContent = "Sending...";
  try {
    const data = await apiRequest("/auth/forgot-password", "POST", { email });
    alertBox.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    btn.textContent = "Link Sent ✓";
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = "Send Reset Link";
  }
}

async function handleResetPassword(event) {
  event.preventDefault();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const alertBox = document.getElementById("alert-box");
  const token = new URLSearchParams(window.location.search).get("token");

  if (!token) {
    alertBox.innerHTML = `<div class="alert alert-error">Invalid or missing reset link. Please request a new one.</div>`;
    return;
  }
  if (password !== confirmPassword) {
    alertBox.innerHTML = `<div class="alert alert-error">Passwords do not match.</div>`;
    return;
  }
  if (!STRONG_PASSWORD_REGEX.test(password)) {
    alertBox.innerHTML = `<div class="alert alert-error">Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number</div>`;
    return;
  }

  try {
    const data = await apiRequest(`/auth/reset-password/${token}`, "PUT", { password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);
    localStorage.setItem("userRole", data.role);
    alertBox.innerHTML = `<div class="alert alert-success">Password reset! Redirecting...</div>`;
    setTimeout(() => (window.location.href = data.role === "admin" ? "admin.html" : "index.html"), 1200);
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}
