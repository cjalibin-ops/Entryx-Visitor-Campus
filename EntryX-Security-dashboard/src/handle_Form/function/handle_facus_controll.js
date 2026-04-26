const visitorUid = document.getElementById("visitor-uid");
const registerModal = document.getElementById("registerModal");
const visitorModal = document.getElementById("visitorModal");

const searchInput = document.getElementById("searchVisitor");
const rowsSelect = document.getElementById("rowsSelect");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");

let allowTemporaryFocus = false;

// Elements allowed to receive temporary focus
const allowedElements = [searchInput, rowsSelect, prevBtn, nextBtn];

// Handle temporary focus
allowedElements.forEach(el => {
    if (!el) return;

    el.addEventListener("mousedown", () => allowTemporaryFocus = true);
    el.addEventListener("blur", () => {
        setTimeout(() => {
            allowTemporaryFocus = false;
            if (!isAnyModalOpen()) visitorUid?.focus();
        }, 200);
    });
});

// Helper: Check if any modal is open
function isAnyModalOpen() {
    const registerOpen = registerModal && (registerModal.style.display === "block" || registerModal.classList.contains("show"));
    const visitorOpen = visitorModal && (visitorModal.style.display === "flex" || visitorModal.style.display === "block");
    return registerOpen || visitorOpen;
}

// Global click handler to maintain focus on visitorUid
document.addEventListener("click", (event) => {
    if (isAnyModalOpen()) return; // Skip if modal is open

    const clickedAllowed = allowedElements.some(el => el && event.target.closest(`#${el.id}`));
    if (clickedAllowed) return;

    if (!allowTemporaryFocus && visitorUid) visitorUid.focus();
});

// Handle accidental blur of visitorUid
visitorUid?.addEventListener("blur", () => {
    setTimeout(() => {
        const active = document.activeElement;
        const isAllowed = allowedElements.some(el => el === active);
        if (!allowTemporaryFocus && !isAllowed && !isAnyModalOpen()) {
            visitorUid.focus();
        }
    }, 150);
});

// Automatically refocus visitorUid when a modal closes
function setupModalCloseFocus(modal) {
    if (!modal) return;

    const observer = new MutationObserver(() => {
        const isOpen = modal.style.display === "block" || modal.style.display === "flex" || modal.classList.contains("show");
        if (!isOpen) {
            setTimeout(() => visitorUid?.focus(), 100);
        }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ["style", "class"] });
}

// Apply to both modals
setupModalCloseFocus(registerModal);
setupModalCloseFocus(visitorModal);

// Close buttons inside modals
document.querySelectorAll(".modal .close, #cancelVisitor").forEach(btn => {
    btn.addEventListener("click", () => {
        visitorUid?.focus();
    });
});

// Initial focus on page load
window.addEventListener("DOMContentLoaded", () => {
    if (!isAnyModalOpen()) {
        setTimeout(() => visitorUid?.focus(), 400);
    }
});
