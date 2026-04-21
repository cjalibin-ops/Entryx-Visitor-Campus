// visitorService.js
import { apiClient } from "./../api/handle-API.js";

// Insert visitor
export const addVisitorAPI = (visitor) => {
  return apiClient.post("", { action: "insert", ...visitor });
};

// Load all visitors
export const loadVisitorsAPI = () => {
  return apiClient.post("", { action: "load" });
};

/** 
export const updateVisitorAPI =  (visitorData) => {
    return apiClient.post("", {action: "update", ...visitor });
};

//export const deleteVisitorAPI = rfidcards => apiClient.post("", { action: "delete", rfidcards });
*/
// Count total visitors
export const countVisitorsAPI = () => {
    return apiClient.post("", { action: "count" });
};