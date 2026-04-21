/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

// controll_total_entry.js
const API_URL = "http://localhost/project_EntryX_File/EntryX_Main_File/backend/registration/backend-handle-top.php";

// TABLE & DASHBOARD ELEMENTS
const visitorTable = document.getElementById("visitor-table");
const totalInsideEl = document.getElementById("count-total");
const totalCheckedOutEl = document.getElementById("count-checked");
const totalRecordsEl = document.getElementById("totalRecords");
const totalVisitor = document.getElementById("totalVisitors");

// PAGINATION & SEARCH ELEMENTS
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const rowsSelectElement = document.getElementById("rowsSelect");
const searchInputElement = document.getElementById("searchVisitor");

// DATA & STATE
let visitors = [];
let filteredVisitors = [];
let currentPage = 1;
let rowsPerPage = 10;

// LOAD VISITORS FROM BACKEND
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

        //console.log("Reponse received from the backend : ", res);

        // check the HTTP status
        if (!res.ok){
            console.warn("Barckend with HTTP error : ", res.status, res.statusText);
        }

        const data = await res.json();
        //console.log("Parsed JSON data : ", data );

        // checking the data load
        if (!data || data.status !== "success") {
            console.warn("No data loaded or failed status :", data);

            return;
        }

        visitors = data.data;
        filteredVisitors = [...visitors]; // reset filter
        currentPage = 1;

        renderTable();

    } catch (error) {
        console.error("Error loading visitors :", error);
    }
}

// RENDER TABLE & PAGINATION
function renderTable() {
    const today = new Date().toISOString().split("T")[0];

    let totalInside = 0;
    let totalCheckedOut = 0;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const paginatedVisitors = filteredVisitors.slice(start, end);

    visitorTable.innerHTML = "";

    paginatedVisitors.forEach((visitor, index) => {
        const checkinTime = visitor.checkin ? new Date(visitor.checkin).toLocaleTimeString('en-PH', { hour12: true }) : "-";
        const checkoutTime = visitor.checkout ? new Date(visitor.checkout).toLocaleTimeString('en-PH', { hour12: true }) : "-";

        // auto input status if visitor entered
        let status = "";
        switch(visitor.status) {
            case "Inside":
                status = `<span class="status-in">Inside</span>`;
                totalInside++;
                break;
            case "Checked Out":
                status = `<span class="status-out">Has Checkout</span>`;
                totalCheckedOut++;
                break;
            case "Not Checked Out":
                status = `<span class="status-warning">No Checked</span>`;
                break;
            default:
                status = `<span>-</span>`;
        }

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

    // UPDATE DASHBOARD COUNTERS
    totalInsideEl.textContent = totalInside;
    totalCheckedOutEl.textContent = totalCheckedOut;
    totalRecordsEl.textContent = filteredVisitors.filter(v => v.date_today === today).length;
    totalVisitor.textContent = visitors.length;

    // PAGINATION BUTTON STATE
    const totalPages = Math.ceil(filteredVisitors.length / rowsPerPage);
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    // NUMERIC PAGE BUTTONS
    const numericPagesEl = document.getElementById("numericPages");
    if (!numericPagesEl) return; // in case the span is missing
    numericPagesEl.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === currentPage) btn.classList.add("active");
        btn.addEventListener("click", () => {
            currentPage = i;
            renderTable();
        });
        numericPagesEl.appendChild(btn);
    }
}

// SEARCH FILTER
searchInputElement.addEventListener("input", () => {
    const query = searchInputElement.value.toLowerCase();
    filteredVisitors = visitors.filter(v =>
        (v.rfidcards || "").toLowerCase().includes(query) ||
        (v.fullName || "").toLowerCase().includes(query) ||
        (v.personToVisit || "").toLowerCase().includes(query) ||
        (v.purpose || "").toLowerCase().includes(query)
    );
    currentPage = 1;
    renderTable();
});

// ROWS PER PAGE
rowsSelectElement.addEventListener("change", () => {
    rowsPerPage = parseInt(rowsSelectElement.value);
    currentPage = 1;
    renderTable();
});

// PAGINATION BUTTONS
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) currentPage--;
    renderTable();
});
nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredVisitors.length / rowsPerPage);
    if (currentPage < totalPages) currentPage++;
    renderTable();
});


// AUTO REFRESH in 3 secornd
let autoRefreshInterval = setInterval(() => {
    // Only refresh if we are on the first page
    if (currentPage === 1) {
        loadVisitors();
    }
}, 3000);

// PAGINATION BUTTONS
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) currentPage--;
    renderTable();
    // If back to first page, refresh immediately
    if (currentPage === 1) loadVisitors();
});

nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredVisitors.length / rowsPerPage);
    if (currentPage < totalPages) currentPage++;
    renderTable();
    // Refresh only when back to page 1, otherwise pause
});

function autoCheckoutAtNight() {
    setInterval(async () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (hours === 23 && minutes === 59) {
            // Clear frontend table
            visitorTable.innerHTML = "";
            totalInsideEl.textContent = 0;
            totalCheckedOutEl.textContent = 0;
            totalRecordsEl.textContent = 0;

            console.log("Table cleared at 11:59 PM (frontend only).");

            // Auto-checkout visitors in the database
            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer SuperSecretToken123"
                    },
                    body: JSON.stringify({ action: "auto_checkout" })
                });
                const data = await res.json();
                console.log("Auto-checkout result:", data);
            } catch (error) {
                console.error("Error during auto-checkout:", error);
            }
        }
    }, 1000); // check every second
}

// ─── CLEAR FRONTEND TABLE AT 11:59 PM ───
function clearTableAtNight() {
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (hours === 23 && minutes === 59) {
            // Clear table
            visitorTable.innerHTML = "";

            // Reset counters
            totalInsideEl.textContent = 0;
            totalCheckedOutEl.textContent = 0;
            totalRecordsEl.textContent = 0;

            console.log("Visitor table cleared at 11:59 PM (frontend only).");
        }
    }, 1000); // check every second
}

// Call it
clearTableAtNight();
// Call the function
autoCheckoutAtNight();