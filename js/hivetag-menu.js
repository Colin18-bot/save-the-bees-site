// hivetag-menu.js

document.addEventListener('DOMContentLoaded', function () {
  // Toggle dropdowns when a top-level item is clicked
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const parentDropdown = this.closest('.dropdown');
      const isOpen = parentDropdown.classList.contains('open');

      // Close all other open dropdowns
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(drop => {
        if (drop !== parentDropdown) {
          drop.classList.remove('open');
        }
      });

      // Toggle current dropdown
      parentDropdown.classList.toggle('open', !isOpen);
    });
  });

  // Close dropdowns when clicking outside the nav
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#member-navbar')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(drop => {
        drop.classList.remove('open');
      });
    }
  });
});
