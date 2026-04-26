const API_URL = "http://localhost/Entryx-Visitor-Campus/EntryX-main-dashboard/src/backend-controller/controller/user-connection.php";
const API_TOKEN = "SuperSecretToken123";

// ================= LOGIN SUBMIT =================
const signinForm = document.getElementById('signin-form');

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = signinForm.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;

        const user_id = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!user_id || !password) {
            alert("Please enter username and password");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>`;

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + API_TOKEN
                },
                body: JSON.stringify({
                    action: "login",
                    user_id,
                    password
                })
            });

            const data = await res.json();

            if (data.success) {

                // SAVE USER SESSION
                localStorage.setItem("user", JSON.stringify(data.user));

                // ROLE-BASED REDIRECT (admin / guard username)
                if (data.user.user_id === "admin") {
                    window.location.href = "../../../EntryX_Admin_File/index.html";
                } else if (data.user.user_id === "guard") {
                    window.location.href = "../../../EntryX-Security-dashboard/index.html";
                } else {
                    window.location.href = "index.html";
                }

            } else {
                alert(data.message || "Login failed");
            }

        } catch (err) {
            console.error(err);
            alert("Server error");
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
    });
}

// ================= VALIDATION & UI =================
document.addEventListener("DOMContentLoaded", () => {

    const username = document.getElementById("username");
    const password = document.getElementById("password");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    const togglePassword = document.getElementById("togglePassword");

    // USERNAME VALIDATION
    username.addEventListener("input", () => {
        if (username.value.trim() === "") {
            usernameError?.classList.remove("hidden");
            username.classList.add("border-red-500");
        } else {
            usernameError?.classList.add("hidden");
            username.classList.remove("border-red-500");
        }
    });

    // PASSWORD VALIDATION
    password.addEventListener("input", () => {
        if (password.value.length < 6) {
            passwordError?.classList.remove("hidden");
            password.classList.add("border-red-500");
        } else {
            passwordError?.classList.add("hidden");
            password.classList.remove("border-red-500");
        }
    });

    // TOGGLE PASSWORD
    togglePassword?.addEventListener("click", () => {
        password.type = password.type === "password" ? "text" : "password";
    });
});