// ================= EDIT MODAL CONTROL =================

// --- Open modal ---
function openEditModal() {
    console.log("Modal opened");

    const modal = document.getElementById("edit_Modal");
    if (!modal) return;

    modal.style.display = "flex";
}

// --- Close modal ---
function closeEditModal() {
    console.log("Modal closed");

    const modal = document.getElementById("edit_Modal");
    if (!modal) return;

    modal.style.display = "none";
}

// --- Always hide on page load ---
window.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("edit_Modal");
    if (modal) {
        modal.style.display = "none";
    }
});

// --- Expose to HTML ---
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;