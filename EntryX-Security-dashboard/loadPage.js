import { registerVisitor, loadVisitors, openModal, closeModal  } from "./src/handle_Form/handle-input-value-visitor/handle_visitor_registration.js";

// Open modal
document.getElementById("openRegister").addEventListener("click", openModal);

// Close modal
document.querySelector(".modal .close").addEventListener("click", closeModal);

// Register visitor button
document.getElementById("registerBtn").addEventListener("click", registerVisitor);

// Load visitors on page load
window.addEventListener("DOMContentLoaded", loadVisitors);

