// MEMBER NAVIGATION TOGGLE LOGIC

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const memberNavMenu = document.querySelector(".member-nav-menu");

  if (menuToggle && memberNavMenu) {
    menuToggle.addEventListener("click", function () {
      memberNavMenu.classList.toggle("show");
    });
  }

  const dropdownToggles = document.querySelectorAll(".member-nav-menu .dropdown-toggle");

  dropdownToggles.forEach((toggle) => {
    const parentLi = toggle.closest("li");
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();

      // Close other open dropdowns
      document.querySelectorAll(".member-nav-menu .dropdown.open").forEach((openItem) => {
        if (openItem !== parentLi) {
          openItem.classList.remove("open");
        }
      });

      // Toggle this one
      parentLi.classList.toggle("open");
    });
  });

  // Optional: Close all dropdowns when clicking outside
  document.addEventListener("click", function () {
    document.querySelectorAll(".member-nav-menu .dropdown.open").forEach((openItem) => {
      openItem.classList.remove("open");
    });
  });
});
