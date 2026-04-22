export function showToast(message, type = "success") {
  const icons = {
    success: "✔",
    error: "✖",
    warning: "⚠",
    Unknown: "❓",
    scan: "📡",
    tag: "🏷️",
    blocked: "🚫",
  };

  const container = document.getElementById("toastContainer");
  const toastEl = document.createElement("div");
  toastEl.className = `toast-msg toast-${type}`;
  toastEl.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-text">${message}</span>
    <button class="toast-close">&times;</button>
    <div class="toast-progress"></div>
  `;
  container.appendChild(toastEl);

  // Animate progress bar
  const progress = toastEl.querySelector(".toast-progress");
  progress.style.transition = "width 5s linear";
  setTimeout(() => {
    progress.style.width = "0%";
  }, 50);

  // Remove toast after 5s
  const timeout = setTimeout(() => toastEl.remove(), 5000);

  // Close button
  toastEl.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(timeout);
    toastEl.remove();
  });
}
