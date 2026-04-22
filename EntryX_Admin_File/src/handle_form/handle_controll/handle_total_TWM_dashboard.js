/**
 * EntryX_Admin_File - Dashboard Totals Handler
 * Version: 1.0
 * 
 * This script handles the fetching and animation of total visitor counts for today, this week, and this month on the dashboard.
 * It also includes an increment function to update the counts in real-time when a new visitor registers.
 * The totals are fetched from the server and updated every 10 seconds to ensure the dashboard reflects the latest data.
 * Author: Cj Alibin
 * Date: 2026-06-01
 * 
 */
// API Endpoint
const API_URL = "http://localhost/project_EntryX_File/EntryX_Admin_File/backend/hanlde_server/hanlde_info.php";
// DOM Elements
const totalDay = document.getElementById("total_day");
const totalWeek = document.getElementById("total_week");
const totalMonth = document.getElementById("total_month");
const badgeDay = document.getElementById("badge_day");
const badgeWeek = document.getElementById("badge_week");
const badgeMonth = document.getElementById("badge_month");

// Common headers for fetch requests
const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer SuperSecretToken123"
};

// Function to increment today's count
function incrementToday() {
    let current = parseInt(totalDay.textContent) || 0;
    let newValue = current + 1; 

    animateCount(totalDay, newValue);
    animateCount(badgeDay, newValue);
}
// Function to animate count changes
function animateCount(element, newValue) {
    let start = parseInt(element.textContent) || 0;
    let duration = 500;
    let startTime = null;

    // Animation loop
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
    // Start animation
    requestAnimationFrame(update);
}

// Function to fetch totals
async function fetchTotals() {
    try {
        // TODAY
        const resDay = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ action: "total_today" })
        });
        const dataDay = await resDay.json();
        if (dataDay.status === "success") {
            animateCount(totalDay, dataDay.total);
            animateCount(badgeDay, dataDay.total);
        }

        // WEEK
        const resWeek = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ action: "total_week" })
        });
        const dataWeek = await resWeek.json();
        if (dataWeek.status === "success") {
            animateCount(totalWeek, dataWeek.total);
            animateCount(badgeWeek, dataWeek.total);
        }

        // MONTH
        const resMonth = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ action: "total_month" })
        });
        const dataMonth = await resMonth.json();
        if (dataMonth.status === "success") {
            animateCount(totalMonth, dataMonth.total);
            animateCount(badgeMonth, dataMonth.total);
        }

    } catch (error) {
        console.error("Error loading totals:", error);
    }
}

incrementToday();   //  instant +1
fetchTotals();      // sync with database

// 🔹 Auto load on page load
window.addEventListener("DOMContentLoaded", fetchTotals);

// 🔹 Optional: Refresh every 30 seconds
setInterval(fetchTotals, 10000); // 10,000 ms = 10 seconds 