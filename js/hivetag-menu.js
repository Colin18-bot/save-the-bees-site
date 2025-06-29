// Member Navigation Toggle Script – from original site
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const dropdownToggles = document.querySelectorAll(".member-navbar .dropdown-toggle");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const parent = this.parentElement;
      const isOpen = parent.classList.contains("show");

      // Close all other dropdowns
      document.querySelectorAll(".member-navbar .dropdown").forEach((item) => {
        item.classList.remove("show");
      });

      // Toggle current dropdown
      if (!isOpen) {
        parent.classList.add("show");
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    const isClickInside = e.target.closest(".member-navbar");
    if (!isClickInside) {
      document.querySelectorAll(".member-navbar .dropdown").forEach((item) => {
        item.classList.remove("show");
      });
    }
  });
});
