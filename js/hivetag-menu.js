document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".member-nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });
  }

  const dropdowns = document.querySelectorAll(".member-navbar .dropdown");

  dropdowns.forEach((dropdown) => {
    const toggleBtn = dropdown.querySelector(".dropdown-toggle");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function (e) {
        if (window.innerWidth < 768) {
          e.preventDefault();
          dropdown.classList.toggle("open");
        }
      });
    }
  });
});
