const API_URL = "http://localhost/Entryx-Visitor-Campus/EntryX-Security-dashboard/backend/registration/backend-handle-top.php";

async function loadVisitors() {

    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer SuperSecretToken123"
        },
        body: JSON.stringify({
            action: "load_visitors"
        })
    });

    const data = await res.json();

    if(data.status !== "success") return;

    const table = document.getElementById("visitor-table");
    table.innerHTML = "";

    data.data.forEach((visitor, index) => {

        const status = visitor.checkout 
            ? `<span class="status-out">Checked Out</span>`
            : `<span class="status-in">Inside</span>`;

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${visitor.rfidcards}</td>
                <td>${visitor.fullName}</td>
                <td>${visitor.personToVisit}</td>
                <td>${visitor.purpose}</td>
                <td>${visitor.checkin}</td>
                <td>${visitor.checkout ?? "-"}</td>
                <td>${visitor.date_today}</td>
                <td>${status}</td>
            </tr>
        `;
    });

}

loadVisitors();