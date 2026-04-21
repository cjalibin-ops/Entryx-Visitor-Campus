// handle-RFID-api.js
import { showToast } from "../handle_Form/handle-input-value-visitor/handle_RFID_registration.js";

const API_TOKEN = "SuperSecretToken123";

export const apiClient = axios.create({
  baseURL: "http://localhost/Entryx-Visitor-Campus/EntryX-Security-dashboard/backend/registration/backend-handle-top.php",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_TOKEN}` 
  },
  timeout: 6000
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error("API ERROR:", error);
    showToast("Server error occurred", "danger");
    return Promise.reject(error);
  }
);