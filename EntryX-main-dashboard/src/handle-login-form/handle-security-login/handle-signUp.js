import { login } from "../../backend-controller/server/connection.js";

// ================= TOAST =================
function showToast(message, type = "success") {

    const icons = {
        success: "✔",
        error: "✖",
        warning: "⚠",
        scan: "📡",
        tag: "🏷️",
        blocked: "🚫"
    };

    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toastEl = document.createElement("div");
    toastEl.className = `toast-msg toast-${type}`;

    toastEl.innerHTML = `
        <span class="toast-icon">${icons[type] || "❓"}</span>
        <span class="toast-text">${message}</span>
        <button class="toast-close">&times;</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toastEl);

    const progress = toastEl.querySelector(".toast-progress");
    progress.style.transition = "width 5s linear";
    setTimeout(() => (progress.style.width = "0%"), 50);

    const timeout = setTimeout(() => toastEl.remove(), 5000);

    toastEl.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(timeout);
        toastEl.remove();
    });
}

// ================= MAIN =================
document.addEventListener("DOMContentLoaded", () => {

    const signinForm = document.getElementById("signin-form");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const togglePassword = document.getElementById("togglePassword");

    function showError(input, errorSpan, message) {
        errorSpan.textContent = message;
        errorSpan.style.display = "block";
        input.classList.add("input-error");
    }

    function hideError(input, errorSpan) {
        errorSpan.style.display = "none";
        input.classList.remove("input-error");
    }

    username.addEventListener("input", () => {
        if (username.value.trim() === "") {
            showError(username, usernameError, "Username is required");
        } else {
            hideError(username, usernameError);
        }
    });

    password.addEventListener("input", () => {
        if (password.value.length < 6) {
            showError(password, passwordError, "Password must be at least 6 characters");
        } else {
            hideError(password, passwordError);
        }
    });

    togglePassword?.addEventListener("click", () => {
        password.type = password.type === "password" ? "text" : "password";
    });
    signinForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user_id = username.value.trim();
        const pass = password.value.trim();

        let isValid = true;

        if (user_id === "") {
            showError(username, usernameError, "User ID is required");
            isValid = false;
        }

        if (pass.length < 6) {
            showError(password, passwordError, "Password must be at least 6 characters");
            isValid = false;
        }

        if (!isValid) {
            showToast("Fix errors before logging in", "warning");
            return;
        }

        const submitBtn = signinForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = "Logging in...";

        try {
            const res = await login(user_id, pass);

            if (!res.success) {
                showToast(res.message || "Login failed", "error");
                return;
            }

            const user = res.user;
            const role = user.user_type?.toLowerCase();

            showToast("Login successful!", "success");

            setTimeout(() => {

                if (role === "admin") {
                    window.location.href = "../../../../EntryX_Admin_File/index.html";
                } 
                else if (role === "guard") {
                    window.location.href = "../../../../EntryX-Security-dashboard/index.html";
                } 
                else {
                    showToast("Invalid user role", "blocked");
                }

            }, 800);

        } catch (err) {
            console.log(err);
            showToast("Server error. Try again.", "error");

        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    });
});