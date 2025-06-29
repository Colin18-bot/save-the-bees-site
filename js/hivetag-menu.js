document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".member-nav-menu");

  // Toggle main menu on mobile
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });
  }

  // Dropdown toggle (for mobile only)
  const dropdowns = document.querySelectorAll(".member-navbar .dropdown");

  dropdowns.forEach((dropdown) => {
    const toggleBtn = dropdown.querySelector(".dropdown-toggle");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function (e) {
        // Prevent desktop hover conflict
        if (window.innerWidth < 768) {
          e.preventDefault();
          dropdown.classList.toggle("open");
        }
      });
    }
  });
});
