// handle-visitor-registration.js
import { countVisitorsAPI, addVisitorAPI, loadVisitorsAPI } from "../../services/visitorService.js";
import { showToast } from "../function/controllToast.js";


// MODAL OPEN
export function openModal() {
    document.getElementById("registerModal").style.display = "block";
}

// MODAL CLOSE
export function closeModal() {
    document.getElementById("registerModal").style.display = "none";
    clearForm();
}


// CLOSE BUTTON INIT
document.addEventListener("DOMContentLoaded", () => {
    const registerModal = document.getElementById("registerModal");
    const closeSpan = document.querySelector("#registerModal .close");

    if (registerModal) registerModal.style.display = "none";

    if (closeSpan) {
        closeSpan.addEventListener("click", closeModal);
    }
});


// CLEAR FORM
export function clearForm() {
    document.getElementById("rfidcards").value = "";
    document.getElementById("last_name").value = "";
    document.getElementById("first_name").value = "";
    document.getElementById("middle_name").value = "";
    document.getElementById("province").value = "";
    document.getElementById("municipality").value = "";

    const barangay = document.getElementById("barangay");
    barangay.value = "";
    barangay.innerHTML = '<option value="">-- Select Municipality First --</option>';
    barangay.disabled = true;

    document.getElementById("zipcode").value = "";
}


// REGISTER VISITOR
export async function registerVisitor() {

    const rfidcards = document.getElementById("rfidcards").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const firstName = document.getElementById("first_name").value.trim();
    const middleName = document.getElementById("middle_name").value.trim();

    const province = document.getElementById("province").value.trim();
    const municipality = document.getElementById("municipality").value.trim();
    const barangay = document.getElementById("barangay").value.trim();
    const zipcode = document.getElementById("zipcode").value.trim();

    // VALIDATION
    if (!rfidcards || !lastName || !firstName || !middleName ||
        !province || !municipality || !barangay) {
        showToast("Please fill all required fields", "warning");
        return;
    }

    if (!/^\d+$/.test(rfidcards)) {
        showToast("RFID must be numbers only", "warning");
        return;
    }

    try {
        const response = await addVisitorAPI({
            rfidcards,
            lastName,
            firstName,
            middleName,
            province,
            municipality,
            barangay,
            zipcode
        });

        if (response.data.status === "success") {
            showToast(
                `${firstName} ${middleName} ${lastName} successfully registered!`,
                "success"
            );

            clearForm();
            closeModal();

            loadTotalVisitors();
            loadVisitors();

        } else {
            showToast(response.data.message, "warning");
        }

    } catch (error) {
        console.error(error);
        showToast("Failed to register visitor", "danger");
    }
}


// LOAD VISITORS
export const loadVisitors = async () => {
    try {
        const response = await loadVisitorsAPI();
        console.log("Visitors:", response.data);
        // TODO: Render visitors in the UI
    } catch (error) {
        console.error(error);
        showToast("Failed to load visitors", "error");
    }
};


// COUNT VISITORS
const countTotalElement = document.getElementById("count-total");

export const loadTotalVisitors = async () => {
    try {
        const response = await countVisitorsAPI();
        if (response.data.status === "success") {
            countTotalElement.textContent = response.data.total;
        } else {
            countTotalElement.textContent = "0";
        }
    } catch (err) {
        console.error("Error fetching total visitors:", err);
        countTotalElement.textContent = "Error";
    }
};
// Load total visitors on page load
document.addEventListener("DOMContentLoaded", loadTotalVisitors);
document.addEventListener("DOMContentLoaded", () => {
    const barangay = document.getElementById("barangay");
    const municipality = document.getElementById("municipality");

    if (barangay) {
        barangay.disabled = true; // lock barangay until municipality is selected
    }
    // Enable barangay when municipality is selected
    if (municipality) {
        municipality.addEventListener("change", () => {
            if (municipality.value) {
                barangay.disabled = false; // unlock when municipality is selected
            } else {
                barangay.disabled = true;  // lock if municipality is deselected
                barangay.value = "";
            }
        });
    }
});
