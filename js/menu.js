document.addEventListener('DOMContentLoaded', function () {
  // ✅ Toggle hamburger menu
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ✅ Toggle dropdowns (on small screens only)
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      if (dropdown) {
        dropdown.classList.toggle('open');
      }
    });
  });

  // ✅ Close dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => {
        d.classList.remove('open');
      });
    }
  });
});
