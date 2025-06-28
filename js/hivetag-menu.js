document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // ✅ Toggle mobile nav menu
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ✅ Toggle dropdowns (one open at a time)
  document.querySelectorAll('.member-nav-menu .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close all others
      document.querySelectorAll('.member-nav-menu .dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      // Toggle current
      dropdown.classList.toggle('open', !isOpen);
    });
  });

  // ✅ Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.member-nav-menu .dropdown')) {
      document.querySelectorAll('.member-nav-menu .dropdown.open').forEach(dd => {
        dd.classList.remove('open');
      });
    }
  });
});
