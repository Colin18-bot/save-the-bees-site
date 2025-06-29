document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const memberNavbar = document.querySelector('.member-navbar');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  // Toggle mobile menu visibility
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      memberNavbar.classList.toggle('active');
    });
  }

  // Dropdown toggles
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      const parent = toggle.parentElement;
      const currentlyOpen = document.querySelector('.dropdown.open');

      // Close other open dropdowns
      if (currentlyOpen && currentlyOpen !== parent) {
        currentlyOpen.classList.remove('open');
      }

      // Toggle this dropdown
      parent.classList.toggle('open');
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(drop => {
        drop.classList.remove('open');
      });
    }
  });
});
