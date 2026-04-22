import { showToast } from "../handle_Form/function/controllToast.js";

// handle-API.js
export const apiClient = axios.create({
  baseURL: "http://localhost/Entryx-Visitor-Campus/EntryX-main-Page/EntryX-Security-dashboard/backend/registration/visitor-register.php",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer SuperSecretToken123"
  },
  timeout: 6000
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error("API Error:", error);
        showToast("API request failed", "danger");
        return Promise.reject(error);
    }
);