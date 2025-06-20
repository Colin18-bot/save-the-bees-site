document.addEventListener('DOMContentLoaded', function () {
  // ✅ Toggle hamburger menu
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ✅ Toggle dropdowns on small screens
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpening = !dropdown.classList.contains('open');

      // Optional: Close other open dropdowns
      document.querySelectorAll('.dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });

      dropdown.classList.toggle('open');

      // Scroll into view when opened (helps when submenu is off-screen)
      if (isOpening) {
        const menuRect = dropdown.getBoundingClientRect();
        const isOffScreen = menuRect.bottom > window.innerHeight;

        if (isOffScreen) {
          dropdown.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
          });
        }
      }
    });
  });

  // ✅ Close dropdowns on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
});
