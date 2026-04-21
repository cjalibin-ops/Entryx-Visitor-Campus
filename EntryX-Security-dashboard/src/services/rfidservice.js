// rfidservice.js
const API_URL = "http://localhost/Entryx-Visitor-Campus/EntryX-Security-dashboard/backend/registration/backend-handle-top.php";
const API_TOKEN = "SuperSecretToken123";

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_TOKEN}`
    };
}

export async function rfidTapAPI(rfid) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "rfid_tap", rfidcards: rfid })
    });
    return await res.json(); // <-- returns JSON directly
}

export async function checkinSubmitAPI(rfid, personToVisit, purpose) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            action: "checkin_submit",
            rfidcards: rfid,
            personToVisit,
            purpose
        })
    });
    return await res.json();
}

export async function checkoutSubmitAPI(recordId) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ action: "confirm_checkout", record_id: recordId })
    });
    return await res.json();
}