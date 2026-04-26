const API_URL =
  "http://localhost/Entryx-Visitor-Campus/EntryX-main-dashboard/src/backend-controller/controller/user-connection.php";

const API_TOKEN = "SuperSecretToken123";

// ================= CORE REQUEST =================
export async function apiRequest(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        action,
        ...data,
      }),
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Invalid server response");
    }

    return result;

  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function login(user_id, password) {
    return await apiRequest("login", {
        user_id,
        password
    });
}
