document.addEventListener('DOMContentLoaded', function () {
  // ✅ Hamburger menu toggle
  const toggleBtn = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ✅ Dropdown toggle
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      dropdown.classList.toggle('open');

      // Scroll dropdown into view when opened
      const menu = dropdown.querySelector('.dropdown-menu');
      if (menu && dropdown.classList.contains('open')) {
        menu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // ✅ Close dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(openItem => {
        openItem.classList.remove('open');
      });
    }
  });
});
