/**
 * handle_table_data.js
 * This file manages the visitor table data, including fetching visitor records from the server, rendering the table, and implementing pagination and search functionality.
 * It uses the same API endpoint as the total counts but focuses on retrieving and displaying individual visitor entries.
 * The table is designed to refresh every 30 minutes to ensure it reflects the latest visitor data without requiring a manual page refresh.
 * Author: Cj Alibin
 * Version: 1.0
 * 
 */
// API Endpoint
const API_URL = "http://localhost/project_EntryX_File/EntryX_Admin_File/backend/hanlde_server/hanlde_info.php";
// DOM Elements
const visitorTable = document.getElementById("visitor-table");
const totalVisitor = document.getElementById("totalVisitors");
const pageNumbers = document.getElementById("pageNumbers");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const searchInput = document.getElementById("searchVisitor");
const rowsSelect = document.getElementById("rowsSelect");
// State Variables
let visitorsData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = parseInt(rowsSelect.value);

// LOAD VISITORS
async function loadVisitors() {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer SuperSecretToken123"
            },
            body: JSON.stringify({ action: "load_visitors" })
        });

        const data = await res.json();
        if (data.status !== "success") return;

        visitorsData = data.data;
        filteredData = [...visitorsData];
        totalVisitor.textContent = visitorsData.length;

        currentPage = 1;
        renderTable();

    } catch (err) {
        console.error("Error loading visitors:", err);
    }
}

// RENDER TABLE FUNCTION
function renderTable() {
    visitorTable.innerHTML = "";
    // Calculate start and end index for current page
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);
    // Render rows
    pageData.forEach((visitor, index) => {
        const checkinTime = visitor.checkin
            ? new Date(visitor.checkin).toLocaleTimeString('en-PH', { hour12: true })
            : "-";
        const checkoutTime = visitor.checkout
            ? new Date(visitor.checkout).toLocaleTimeString('en-PH', { hour12: true })
            : "-";

        let status = "";
        switch(visitor.status) {
            case "Inside": status = `<span class="status-in">Inside</span>`; break;
            case "Checked Out": status = `<span class="status-out">Checked Out</span>`; break;
            case "Not Checked Out": status = `<span class="status-warning">Not Checked Out</span>`; break;
            default: status = `<span>-</span>`;
        }
        // Append row to table
        visitorTable.innerHTML += `
        <tr>
            <td>${start + index + 1}</td>
            <td>${visitor.rfidcards}</td>
            <td>${visitor.fullName}</td>
            <td>${visitor.personToVisit}</td>
            <td>${visitor.purpose}</td>
            <td>${checkinTime}</td>
            <td>${checkoutTime}</td>
            <td>${visitor.date_today}</td>
            <td>${status}</td>
        </tr>
        `;
    });

    updatePagination();
}

// PAGINATION CONTROLS
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    pageNumbers.innerHTML = "";
    pageNumbers.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = i;
            renderTable();
        });
        pageNumbers.appendChild(btn);
    }

    pageNumbers.appendChild(nextBtn);
}

// SEARCH FUNCTIONALITY
searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    filteredData = visitorsData.filter(v =>
        v.rfidcards.toLowerCase().includes(filter) ||
        v.fullName.toLowerCase().includes(filter) ||
        v.personToVisit.toLowerCase().includes(filter) ||
        v.purpose.toLowerCase().includes(filter)
    );
    currentPage = 1;
    renderTable();
});

// ROWS PER PAGE SELECTION
rowsSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(rowsSelect.value);
    currentPage = 1;
    renderTable();
});

// PREV / NEXT BUTTONS EVENTS
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});
// NEXT BUTTON
nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});



// AUTO REFRESH 30 MINUTES
setInterval(() => {
    const searchInput = document.getElementById("searchVisitor");

    if (searchInput.value === "") {
        loadVisitors();
    }
}, 1800000);  // 30 minutes

// INITIAL LOAD
loadVisitors();