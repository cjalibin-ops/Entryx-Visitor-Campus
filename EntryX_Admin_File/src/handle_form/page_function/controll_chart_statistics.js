const API_URL =
  "http://localhost/project_EntryX_File/EntryX_Admin_File/backend/hanlde_server/hanlde_info.php";

let visitorBarChart;
let registerChart;
let todayChart;
let weekChart;
let monthChart;

// ================= LOAD VISITORS =================
async function loadVisitors() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer SuperSecretToken123",
      },
      body: JSON.stringify({ action: "load_visitors" }),
    });

    const data = await res.json();

    if (data.status !== "success") return;

    const visitorsData = data.data;

    // UPDATE STATISTICS
    updateDashboardStats(visitorsData);

    // UPDATE CHARTS
    renderVisitorCharts(visitorsData);
  } catch (err) {
    console.error("Error loading visitors:", err);
  }
}

// ================= UPDATE STATISTICS =================
function updateDashboardStats(visitorsData) {
  const totalRegister = document.getElementById("total_Register_Visitors");
  const totalDay = document.getElementById("total_day");
  const totalWeek = document.getElementById("total_week");
  const totalMonth = document.getElementById("total_month");

  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];

  visitorsData.forEach((visitor) => {
    if (!visitor.date_today) return;

    const visitDate = new Date(visitor.date_today);

    // TODAY
    if (visitor.date_today === todayDate) {
      todayCount++;
    }

    // WEEK
    const diffTime = today - visitDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      weekCount++;
    }

    // MONTH
    if (
      visitDate.getMonth() === today.getMonth() &&
      visitDate.getFullYear() === today.getFullYear()
    ) {
      monthCount++;
    }
  });

  // UPDATE UI
  totalRegister.textContent = visitorsData.length;
  totalDay.textContent = todayCount;
  totalWeek.textContent = weekCount;
  totalMonth.textContent = monthCount;
}

// ================= RENDER CHARTS =================
function renderVisitorCharts(visitorsData) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let insideMonthly = new Array(12).fill(0);
  let checkoutMonthly = new Array(12).fill(0);

  let insideCount = 0;
  let checkoutCount = 0;

  visitorsData.forEach((visitor) => {
    if (visitor.date_today) {
      const month = new Date(visitor.date_today).getMonth();

      if (visitor.status === "Inside") {
        insideMonthly[month]++;
        insideCount++;
      }

      if (visitor.status === "Checked Out") {
        checkoutMonthly[month]++;
        checkoutCount++;
      }
    }
  });

  // ================= BAR CHART =================
  const barCanvas = document.getElementById("visitorBarChart");

  if (barCanvas) {
    if (visitorBarChart) {
      visitorBarChart.destroy();
    }

    visitorBarChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Inside Visitors",
            data: insideMonthly,
            backgroundColor: "#4cc9f0",
            borderRadius: 6,
          },
          {
            label: "Checked Out",
            data: checkoutMonthly,
            backgroundColor: "#f72585",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#ccc",
            },
          },
        },
      },
    });
  }

  // ================= SMALL CHARTS =================

  createDonutChart("registerChart", visitorsData.length);
  createDonutChart("todayChart", insideCount);
  createDonutChart("weekChart", checkoutCount);
  createDonutChart("monthChart", insideCount + checkoutCount);
}

// ================= DONUT CHART FUNCTION =================
function createDonutChart(canvasId, value) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) return;

  if (canvas.chart) {
    canvas.chart.destroy();
  }

  canvas.chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Visitors", "Empty"],
      datasets: [
        {
          data: [value, 100 - value],
          backgroundColor: ["#4361ee", "#1f2937"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// ================= AUTO REFRESH =================
setInterval(() => {
  loadVisitors();
}, 3000);

// ================= INITIAL LOAD =================
loadVisitors();
