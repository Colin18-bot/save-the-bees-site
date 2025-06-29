document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // Toggle hamburger menu
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Dropdown functionality for each top-level link
  const dropdownToggles = document.querySelectorAll('.member-dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
      const dropdownMenu = this.nextElementSibling;
      const arrow = this.querySelector('.member-arrow');

      // Close all other dropdowns first
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdownMenu) {
          menu.style.display = 'none';
        }
      });

      // Reset all other arrows
      document.querySelectorAll('.member-arrow').forEach(arw => {
        if (arw !== arrow) {
          arw.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle current dropdown
      if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      } else {
        dropdownMenu.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      }
    });
  });
});
