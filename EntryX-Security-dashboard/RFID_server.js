import { loadVisitors } from "./src/handle_Form/handle-input-value-visitor/handle_visitor_registration.js";
import { closeModal } from "./src/handle_Form/handle-input-value-visitor/handle_RFID_registration.js";

// PAGE INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {

    // Cancel button inside visitor modal
    document.getElementById("cancelVisitor")?.addEventListener("click", closeModal);

    // Load visitors table
    loadVisitors();
});
