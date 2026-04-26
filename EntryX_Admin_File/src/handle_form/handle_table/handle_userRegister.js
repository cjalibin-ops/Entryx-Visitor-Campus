/**
 * @function showToast for verification
 * @class adding user
 * @class missing update button
 * 
 */

const API_URL = "http://localhost/Entryx-Visitor-Campus/EntryX_Admin_File/backend/handle_server/handle_userRegistration.php";
const API_TOKEN = "SuperSecretToken123";

let allUsers = [];
let currentPage = 1;


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


window.openModal = function () {
    document.getElementById("add_Modal")?.classList.add("show");
};

window.closeModal = function () {
    document.getElementById("add_Modal")?.classList.remove("show");
};

const rowsSelect = document.getElementById("rowsSelect");
let rowsPerPage = parseInt(rowsSelect?.value || 10);

// ================= HEADERS =================
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_TOKEN
    };
}

// ================= REGISTER =================
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
    registerBtn.addEventListener("click", registerUser);
}

async function registerUser(e) {
    e.preventDefault();

    const btn = registerBtn;
    btn.disabled = true;
    btn.innerText = "Registering...";

    const userData = {
        action: "register_user", // REQUIRED
        userId: document.getElementById("userId")?.value.trim(),
        userName: document.getElementById("userName")?.value.trim(),
        password: document.getElementById("password")?.value.trim(),
        userType: document.getElementById("userType")?.value
    };

    // VALIDATION
    if (!userData.userId || !userData.userName || !userData.password || !userData.userType) {
        showToast("All fields are required", "warning");
        return resetBtn();
    }

    if (userData.password.length < 6) {
        showToast("Password must be at least 6 characters", "warning");
        return resetBtn();
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        if (data.success) {
            showToast(data.message, "success");
            clearForm();
            closeModal();
            loadUsers();
        } else {
            showToast(data.message, "error");
        }

    } catch (err) {
        console.error(err);
        showToast("Request failed", "error");
    }

    resetBtn();
}

function resetBtn() {
    registerBtn.disabled = false;
    registerBtn.innerText = "Register User";
}

// ================= LOAD USERS =================
async function loadUsers() {

    const table = document.getElementById("visitor-table");
    const total = document.getElementById("total_Register_Visitors");

    table.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ action: "get_users" })
        });

        const data = await res.json();

        if (data.success) {
            allUsers = data.data;
            currentPage = 1;
            renderTable();
            renderPagination();
            total.textContent = allUsers.length;
        } else {
            table.innerHTML = `<tr><td colspan="6">No data</td></tr>`;
        }

    } catch (err) {
        console.error(err);
        table.innerHTML = `<tr><td colspan="6">Error loading</td></tr>`;
    }
}

// ================= TABLE =================
function renderTable() {

    const table = document.getElementById("visitor-table");
    table.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = allUsers.slice(start, start + rowsPerPage);

    paginated.forEach((user, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${start + index + 1}</td>
            <td>${user.user_id}</td>
            <td>${user.user_name}</td>
            <td>${user.user_type}</td>
            <td>••••••••</td>
            <td>
                <div class="action-buttons"> 
                    <button class="update-btn">Update</button> 
                    <button class="delete-btn" onclick="deleteUser('${user.user_id}')">
                        Delete
                    </button>
                </div>
            </td>
        `;

        table.appendChild(tr);
    });
}

    // REMOVE THIS
    async function deleteUser(id) {

    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This user will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                action: "delete_user",
                id: id
            })
        });

        const data = await res.json();

        if (data.success) {
            showToast("User deleted successfully", "success");

            loadUsers();
        } else {
            Swal.fire("Error", data.message, "error");
        }

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Delete failed", "error");
    }
}

//PAGINATION
function renderPagination() {

    const container = document.getElementById("numericPages");
    container.innerHTML = "";

    const totalPages = Math.ceil(allUsers.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {

        const btn = document.createElement("button");
        btn.textContent = i;

        if (i === currentPage) btn.classList.add("active");

        btn.onclick = () => {
            currentPage = i;
            renderTable();
            renderPagination();
        };

        container.appendChild(btn);
    }

    document.getElementById("prevPage").onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPagination();
        }
    };

    document.getElementById("nextPage").onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            renderPagination();
        }
    };
}

function clearForm() {
    document.getElementById("userId").value = "";
    document.getElementById("userName").value = "";
    document.getElementById("password").value = "";
    document.getElementById("userType").value = "";
}

// ================= INIT =================
loadUsers();