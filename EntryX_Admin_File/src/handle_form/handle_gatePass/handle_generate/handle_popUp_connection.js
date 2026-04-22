// --- Open modal ---
function openModal() {
    console.log("Modal opened");
    const modal = document.getElementById("edit_Modal");
    modal.style.display = "flex";

}

// --- Close modal ---
function closeModal() {
    console.log("Modal closed");
    const modal = document.getElementById("edit_Modal");
    modal.style.display = "none";
}

window.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("edit_Modal");
    modal.style.display = "none"; // always hide on refresh
});


