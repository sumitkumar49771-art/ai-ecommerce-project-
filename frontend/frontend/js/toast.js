// Lightweight toast notification system — replaces jarring browser alert()
// popups with non-blocking, auto-dismissing notifications (industrial UX standard).

function ensureToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = "info", duration = 3000) {
  const container = ensureToastContainer();

  // If this exact message is already showing, don't stack a second copy —
  // just let the existing one keep running (this is what was causing two
  // identical "Free delivery..." / "Easy Returns..." toasts to appear
  // together when a click fired more than once in quick succession).
  const existing = Array.from(container.children).find((el) => el.dataset.message === message);
  if (existing) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.dataset.message = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
