/**
 * handle_total_register_dashboard.js
 * This file manages the total visitors count on the dashboard, fetching data from the server and updating the UI in real-time.
 * It uses the same API endpoint as the visitor table but focuses on counting total entries.
 * Author: Cj Alibin
 * Date: 2026-06-01
 * Version: 1.0
 * 
 */
// API Endpoint
const API_URL = "http://localhost/project_EntryX_File/EntryX_Admin_File/backend/hanlde_server/handle_visitors_register.php";

// DOM Elements
const totalRegister = document.getElementById("total_Register_Visitors");
const badgeRegister = document.getElementById("Register_day");

// Common headers for fetch requests
function animateCount(element, newValue) {
    if (!element) return; // prevent errors if element is null

    let start = parseInt(element.textContent) || 0;
    let duration = 500;
    let startTime = null;

    function update(currentTime) {
        if (!startTime) startTime = currentTime;

        let progress = currentTime - startTime;
        let value = Math.min(
            Math.floor(start + (newValue - start) * (progress / duration)),
            newValue
        );

        element.textContent = value;

        if (progress < duration) {
            requestAnimationFrame(update);
        } else {
            element.textContent = newValue;
        }
    }

    requestAnimationFrame(update);
}
// Function to increment today's count
document.addEventListener("DOMContentLoaded", () => {
    // Ensure elements exist before proceeding
    const totalRegister = document.getElementById("total_Register_Visitors");
    const badgeRegister = document.getElementById("Register_day");

    function incrementRegister() {
        let current = parseInt(totalRegister.textContent) || 0;
        let newValue = current + 1;

        animateCount(totalRegister, newValue);
        animateCount(badgeRegister, newValue);
    }
    // Ensure elements exist before proceeding
    if (!totalRegister || !badgeRegister) {
        console.error("Elements not found!");
        return;
    }
    // Function to fetch total visitors
    async function loadTotalVisitors() {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer SuperSecretToken123"
                },
                body: JSON.stringify({
                    action: "load_visitors"
                })
            });

            const result = await response.json();

            if (result.status === "success") {
                const total = result.data.length;

                animateCount(totalRegister, total);
                animateCount(badgeRegister, total);

            } else {
                console.error("Error loading visitors:", result.message);
            }

        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    // ONLY run AFTER DOM is ready
    loadTotalVisitors();// Initial load
    setInterval(loadTotalVisitors, 5000); // Refresh every 5 seconds

});