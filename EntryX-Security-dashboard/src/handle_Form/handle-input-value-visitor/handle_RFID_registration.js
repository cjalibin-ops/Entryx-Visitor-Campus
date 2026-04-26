// handle-RFID-top.js

//rfidservice.js
// import rfid service for checking the API
import { rfidTapAPI, checkinSubmitAPI, checkoutSubmitAPI } from "../../services/rfidservice.js";

//controllToast.js
// import TOAST FUNCTION
import { showToast } from "../function/controllToast.js";

let currentRfid = "";
let currentRecordId = null;
let rfidQueue = [];
let isProcessing = false;

// MODAL FUNCTIONS
export function showCheckinModal(data) {
    const modal = document.getElementById("visitorModal");
    modal.style.display = "block";

    document.getElementById("displayFullName").innerText = data.fullName;
    document.getElementById("checkInFields").style.display = "block";
    document.getElementById("statusMessage").innerText = "Please enter visit details";

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.innerText = "Confirm Check-In";
    submitBtn.onclick = submitCheckin;

    currentRfid = data.rfidcards; // determing the dat of RFID

    // Focus the first input inside the modal
    const personInput = document.getElementById("personToVisit");
    if (personInput) {
        personInput.focus();
    }

    //console.log(`[${new Date().toLocaleTimeString()}] Showing check-in modal for RFID: ${currentRfid}`, data);

}

export function showCheckoutModal(data) {
    const modal = document.getElementById("visitorModal");
    modal.style.display = "block";

    document.getElementById("displayFullName").innerText = data.fullName;
    document.getElementById("checkInFields").style.display = "none";
    document.getElementById("statusMessage").innerText = "Confirm Check-out?";

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.innerText = "Confirm Check-Out";
    submitBtn.onclick = submitCheckout;

    currentRecordId = data.record_id;

    //Focus on submit button for checkout
    if (submitBtn) {
        submitBtn.focus();
    }
     console.log(`[${new Date().toLocaleTimeString()}] Showing checkout modal for record ID: ${currentRecordId}`, data);
}

export function closeModal() {
    const modal = document.getElementById("visitorModal");
    modal.style.display = "none";

    document.getElementById("personToVisit").value = "";
    document.getElementById("purpose").value = "";

    const rfidInput = document.getElementById("visitor-uid");
    if (rfidInput) {
        rfidInput.focus();
        console.log(`Modal closed, focus returned to RFID input`);
    } 
}

// PROCESS RFID QUEUE
async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    while (rfidQueue.length > 0) {
        const nextRfid = rfidQueue.shift();
        //console.log(`[${new Date().toLocaleTimeString()}] Processing RFID from queue: ${nextRfid}`); // log queue item
        await handleRfidTap(nextRfid);
    }

    isProcessing = false;
}

// HANDLE RFID TAP
async function handleRfidTap(rfid) {
    try {
        const response = await rfidTapAPI(rfid);

        console.log("Backend response by RFID : ", response);

        // PHP backend returns JSON directly
        const data = response;

        if (data.status === "need_details") {
            showCheckinModal(data);
        } else if (data.status === "confirm_checkout") {
            console.log("RFID requires check-in details :", data);
            showCheckoutModal(data);
        } else {
            console.warn("RFID returned unknown status:", data);
            showToast(data.message || "Unknown status", "warning");
        }
    } catch (error) {
        console.error("Error handling RFID top : ", error);
        showToast("Failed to process RFID", "error");
    }
}

// CHECKIN SUBMIT
export async function submitCheckin() {
    const personToVisit = document.getElementById("personToVisit").value.trim();
    const purpose = document.getElementById("purpose").value.trim();

    if (!personToVisit || !purpose) {
        console.warn("Check-in attempted with missing fields");
        showToast("Please complete all fields", "warning");
        return;
    }

    try {
        console.log("Submitting check-in for RFID:", currentRfid, { personToVisit, purpose });
        const response = await checkinSubmitAPI(currentRfid, personToVisit, purpose);
        console.log("Check-in response:", response); // log backend response
        showToast(response.message || "Check-in successful", "success");
        closeModal();
        currentRfid = "";
    }catch (error) {
        console.error("Check-in failed:", error);
        showToast("Failed to check-in", "error");
    }
}

// CHECKOUT SUBMIT
export async function submitCheckout() {
    try {
        console.log("Submitting checkout for record ID:", currentRecordId);
        const response = await checkoutSubmitAPI(currentRecordId);
        console.log("Checkout response:", response); // log backend response
        showToast(response.message || "Checked out", "success");
        closeModal();
        currentRecordId = null;
        currentRfid = "";
    } catch (error) {
        console.error("Checkout failed:", error);
        showToast("Failed to check-out", "error");
    }
}

// SETUP LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    const rfidInput = document.getElementById("visitor-uid");
    const cancelBtn = document.getElementById("cancelVisitor");

    if (rfidInput) {
        rfidInput.focus();

        // Listen for Enter key (RFID scan)
        rfidInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const scannedRfid = rfidInput.value.trim();
                if (!scannedRfid) return;
                //console.log(`[${new Date().toLocaleTimeString()}] RFID scanned: ${scannedRfid}`);
                rfidInput.value = "";
                rfidQueue.push(scannedRfid);
                processQueue();
            }
        });
    }

    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
});
