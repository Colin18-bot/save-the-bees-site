document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // 🔒 Ensure nav is collapsed on page load
  if (navMenu) {
    navMenu.classList.remove('active');
  }

  // 🍔 Toggle hamburger menu
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // 🔽 Toggle dropdown submenu
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');

      // 🧠 Collapse all other dropdowns (optional)
      document.querySelectorAll('.dropdown.open').forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove('open');
        }
      });

      // 🧷 Toggle this one
      dropdown.classList.toggle('open');
    });
  });

  // ❌ Close any open dropdown when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => {
        dd.classList.remove('open');
      });
    }
  });
});
