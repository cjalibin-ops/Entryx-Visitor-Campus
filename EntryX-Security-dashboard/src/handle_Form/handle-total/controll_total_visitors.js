const countTotalElement = document.getElementById("");

const loadTotalVisitors = () => {
    fetch('http://localhost/project_EntryX_File/EntryX_Main_File/backend/registration/visitor-register.php', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "count" })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            countTotalElement.textContent = data.total;
        } else {
            countTotalElement.textContent = "0";
        }
    })
    .catch(err => {
        console.error("Error fetching total visitors:", err);
        countTotalElement.textContent = "Error";
    });
};

// Load the total visitors when the page loads
loadTotalVisitors();