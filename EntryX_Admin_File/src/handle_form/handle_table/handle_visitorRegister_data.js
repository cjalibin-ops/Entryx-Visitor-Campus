/**
 * handle_register_data.js
 * This file manages the registration of new visitors, including form handling, validation, and communication with the backend server to save visitor data.
 * It uses the same API endpoint as the visitor table but focuses on creating new entries rather than fetching existing ones.
 * The form includes fields for RFID, name, and address details, and provides real-time feedback on the registration process through toast notifications.
 * Shows a toast notification
 * @param {*} message 
 * @param {*} type 
 * 
 */
// TOAST FUNCTION
export function showToast(message, type = "success") {

  const icons = {
    success: "✔",
    error: "✖",
    warning: "⚠",
    Unknown: "❓",
    scan: "📡",
    tag: "🏷️",
    blocked: "🚫"
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

  // Animate progress bar for auto-dismiss
  const progress = toastEl.querySelector(".toast-progress");
  progress.style.transition = "width 5s linear";
  setTimeout(() => { progress.style.width = "0%"; }, 50);

  // Remove toast after 5s or when close button is clicked
  const timeout = setTimeout(() => toastEl.remove(), 5000)

  // Close button event
  toastEl.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(timeout);
    toastEl.remove();
  });
}

// DOM Elements
const visitorTable = document.getElementById("visitor-table");
const totalVisitor = document.getElementById("total_Register_Visitors");
const pageNumbers = document.getElementById("pageNumbers");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const searchInput = document.getElementById("searchVisitor");
const rowsSelect = document.getElementById("rowsSelect");

// Address Inputs (UPDATED for datalist)
const provinceInput = document.getElementById("province");
const provinceList = document.getElementById("provinceList");

const muniInput = document.getElementById("municipality");
const muniList = document.getElementById("municipalityList");

const brgyInput = document.getElementById("barangay");
const brgyList = document.getElementById("barangayList");

const zipInput = document.getElementById("zipcode");

// API Endpoint
const API_URL = "http://localhost/project_EntryX_File/EntryX_Admin_File/backend/hanlde_server/handle_visitors_register.php";
const API_TOKEN = "SuperSecretToken123";

// --- Table & Pagination State ---
let visitorsData = [];
let originalVisitorData = {};
let filteredData = [];
let currentPage = 1;
let rowsPerPage = parseInt(rowsSelect.value);

// --- Open modal and fill values for update ---
function editVisitor(
    rfid,
    lastName,
    firstName,
    middleName,
    province,
    municipality,
    barangay,
    zipcode
) {

    openModal();

    document.getElementById("rfidcards").value = rfid;
    document.getElementById("last_name").value = lastName;
    document.getElementById("first_name").value = firstName;
    document.getElementById("middle_name").value = middleName;

    provinceInput.value = province || "";
    muniInput.value = municipality;

    // rebuild municipality/barangay first
    updateBarangays();

    // wait for DOM update, then force value
    setTimeout(() => {
        brgyInput.value = barangay || "";
    }, 0);

    zipInput.value = zipcode || "";

    // SAVE ORIGINAL VALUES
    originalVisitorData = {
        rfidcards: rfid,
        lastName,
        firstName,
        middleName,
        province: province || "",
        municipality,
        barangay,
        zipcode
    };
}

// Update barangays based on selected municipality
function updateBarangays(selectedBarangay = "") {

    const selectedMuni = muniInput.value.trim();

    brgyList.innerHTML = "";
    zipInput.value = "";

    const matchedKey = Object.keys(locations).find(
        key => key.toLowerCase().includes(selectedMuni.toLowerCase())
    );

    if (!matchedKey) return;

    const data = locations[matchedKey];

    // set ZIP immediately
    zipInput.value = data.zip;

    // populate barangay list
    data.barangays.forEach(brgy => {
        const option = document.createElement("option");
        option.value = brgy;
        brgyList.appendChild(option);
    });

    // FORCE SHOW VALUE (NO TYPING NEEDED)
    if (selectedBarangay) {
        brgyInput.value = selectedBarangay;

        // optional: ensure it's visually selected in datalist
        brgyInput.setAttribute("value", selectedBarangay);
    }
}


// Close modal function
function closeModal() {
    document.getElementById("edit_Modal").style.display = "none";
}

function openModal() {
    const modal = document.getElementById("edit_Modal");
    modal.style.display = "flex";
}


// Update visitor on form submit
document.getElementById("   ").addEventListener("click", async () => {
    

    // Get current values from form
 const currentData = {
    rfidcards: document.getElementById("rfidcards").value.trim(),
    lastName: document.getElementById("last_name").value.trim(),
    firstName: document.getElementById("first_name").value.trim(),
    middleName: document.getElementById("middle_name").value.trim(),
    province: document.getElementById("province").value.trim(),
    municipality: document.getElementById("municipality").value.trim(),
    barangay: document.getElementById("barangay").value.trim(),
    zipcode: document.getElementById("zipcode").value.trim()
};

    // Log the payload before sending
    console.log("Attempting to update visitor with payload:", currentData);

    // REQUIRED FIELD VALIDATION
    const requiredFields = [
    "rfidcards",
    "lastName",
    "firstName",
    "province",
    "municipality",
    "barangay",
    "zipcode"
];
    const emptyFields = requiredFields.filter(field => !currentData[field]);

    if (emptyFields.length > 0) {
        showToast("All required fields must have a value.", "warning");
        console.warn("Update canceled. Empty fields:", emptyFields);
        return; // stop update
    }

    // CHECK IF NO CHANGES WERE MADE
    const noChanges = Object.keys(currentData).every(
        key => currentData[key] === originalVisitorData[key]
    );

    if (noChanges) {
        showToast("No changes detected.", "warning");
        console.info("Update canceled. No changes made.", currentData);
        return; // stop update
    }

    // SEND UPDATE REQUEST
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                action: "update_visitor",
                ...currentData
            })
        });

        // Parse JSON response
        const data = await res.json();

        // Log response for debugging & Postman-like view
        console.log("Server Response:", data);

        // Show appropriate toast
        if (data.status === "success") {
            showToast(data.message, "success");
            await loadVisitors();
            clearForm();
            closeModal();
        } else if (data.status === "error") {
            showToast(data.message, "error");
        } else {
            // fallback / unexpected status
            showToast(data.message || "Unknown response from server.", "warning");
        }

    } catch (error) {
        // Catch network or parsing errors
        showToast("Update failed. Check console for details.", "error");
        console.error("Update Visitor Exception:", error);
    }
});

// --- Delete visitor ---
async function deleteVisitor(rfid) {
    // Show confirmation popup
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this visitor?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) {
        console.info("Delete canceled by user for RFID:", rfid);
        return; // user cancelled
    }

    // Send delete request
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
                action: "delete_visitor",
                rfidcards: rfid
            })
        });

        const data = await res.json();

        // Log server response
        console.log("Delete Visitor Response:", data);

        // Show toast based on response
        if (data.status === "success") {
            showToast(data.message, "success");
            await loadVisitors();
        } else {
            showToast(data.message || "Failed to delete visitor.", "error");
        }

    } catch (error) {
        showToast("Delete failed. Check console for details.", "error");
        console.error("Delete Visitor Exception:", error);
    }
}




// --- Helper for headers ---
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_TOKEN  
    };
}

// --- Load visitors from backend ---
async function loadVisitors() {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "load_visitors" })
    });

    const data = await res.json();
    if (data.status === "success") {
        visitorsData = data.data;
        filteredData = [...visitorsData]; // initially all
        currentPage = 1;
        renderTable();
    }
    // RUN ONLY ONCE
    for (let muni in locations) {
        let option = document.createElement("option");
        option.value = muni;
        muniList.appendChild(option);
    }
}

// --- Render table with pagination ---
function renderTable() {
    const table = document.getElementById("visitor-table");
    table.innerHTML = ""; // clear previous rows

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach((visitor, index) => {
        const tr = document.createElement("tr");
        // Handle missing fields gracefully
        const uid = visitor.rfidcards || "";
        const address = `${visitor.province || ""}, ${visitor.municipality || ""}, ${visitor.barangay || ""}, ${visitor.zipcode || ""}`;
        const fullname = `${visitor.firstName || ""} ${visitor.middleName || ""} ${visitor.lastName || ""}`;
        // Set row HTML
        tr.innerHTML = `
            <td>${start + index + 1}</td>
            <td>${uid}</td>
            <td>${fullname}</td>
            <td>${address}</td>
            <td>Registered Visitor</td>
            <td>
                <div class="action-buttons">
                    <button class="icon-btn edit-btn"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="icon-btn delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </td>
        `;

        // Add event listeners properly
        tr.querySelector(".edit-btn").addEventListener("click", () => {
            editVisitor(
                uid,
                visitor.lastName || "",
                visitor.firstName || "",
                visitor.middleName || "",
                visitor.province || "",
                visitor.municipality || "",
                visitor.barangay || "",
                visitor.zipcode || ""
            );
        });

        tr.querySelector(".delete-btn").addEventListener("click", () => {
            deleteVisitor(uid);
        });

        table.appendChild(tr); // append each row
    });

    totalVisitor.textContent = filteredData.length;
    renderPagination();
}


// --- Smooth Search with Debounce ---
let searchTimeout = null;
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout); // Clear previous timeout
    searchTimeout = setTimeout(() => {
        const term = searchInput.value.toLowerCase();
        filteredData = visitorsData.filter(v =>
            v.rfidcards.toLowerCase().includes(term) ||
            v.lastName.toLowerCase().includes(term) ||
            v.firstName.toLowerCase().includes(term) ||
            v.middleName.toLowerCase().includes(term) ||
            v.province.toLowerCase().includes(term) ||
            v.municipality.toLowerCase().includes(term) ||
            v.barangay.toLowerCase().includes(term) ||
            v.zipcode.toLowerCase().includes(term)
        );
        currentPage = 1;
        renderTable();
    }, 300); // wait 300ms after typing stops
});

// --- Rows per page ---
function renderPagination() {
    pageNumbers.innerHTML = "";

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const maxPagesToShow = 5; // Max page numbers visible (besides first/last)
    
    // Previous button
    const prevBtnEl = document.createElement("button");
    prevBtnEl.textContent = "‹";
    prevBtnEl.disabled = currentPage === 1;
    prevBtnEl.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    pageNumbers.appendChild(prevBtnEl);

    // Smart pagination logic
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust if near the start or end
    if (currentPage <= 3) endPage = Math.min(totalPages, maxPagesToShow);
    if (currentPage > totalPages - 2) startPage = Math.max(1, totalPages - maxPagesToShow + 1);

    // First page + dots
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) addDots();
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }

    // Last page + dots
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) addDots();
        addPageButton(totalPages);
    }

    // Next button
    const nextBtnEl = document.createElement("button");
    nextBtnEl.textContent = "›";
    nextBtnEl.disabled = currentPage === totalPages;
    nextBtnEl.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    pageNumbers.appendChild(nextBtnEl);

    function addPageButton(num) {
        const btn = document.createElement("button");
        btn.textContent = num;
        if (num === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = num;
            renderTable();
        });
        pageNumbers.appendChild(btn);
    }

    function addDots() {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.style.padding = "6px 10px";
        pageNumbers.appendChild(dots);
    }
}

// --- Hide modal on page load ---
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("edit_Modal");
    if (modal) modal.style.display = "none";

    const closeSpan = modal.querySelector(".close");
    if (closeSpan) closeSpan.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    loadVisitors();
    clearForm();
});

// AUTO REFRESH 30 MINUTES
setInterval(() => {
    const modal = document.getElementById("edit_Modal");

    if (searchInput.value === "" && modal.style.display !== "flex") {
        loadVisitors();
    }
}, 3000);// 3000 ms = 3 second

// clear the input if the user registered
export function clearForm() {
  document.getElementById("rfidcards").value = "";
  document.getElementById("last_name").value = "";
  document.getElementById("first_name").value = "";
  document.getElementById("middle_name").value = "";
  document.getElementById("municipality").value = "";
  document.getElementById("barangay").value = "";
  document.getElementById("zipcode").value = "";

  brgyList.innerHTML = "";
}

// INITIAL LOAD
loadVisitors();