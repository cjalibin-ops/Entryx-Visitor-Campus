  // Handle TOGGLE SIDEBAR
  const menuBar = document.querySelector("#content nav .bx.bx-menu");
  const sidebar = document.getElementById("sidebar");

  menuBar.addEventListener("click", function () {
    sidebar.classList.toggle("hide");
  });

// AUTO CLOSE SIDEBAR WHEN CLICKING MENU ITEM
const sidebarLinks = document.querySelectorAll("#sidebar .side-menu a");

sidebarLinks.forEach(link => {
  link.addEventListener("click", function () {
    
    // Only apply on small screens (optional but recommended)
    if (window.innerWidth < 768) {
      sidebar.classList.add("hide");
    }

  });
});
