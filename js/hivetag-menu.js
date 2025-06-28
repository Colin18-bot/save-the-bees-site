document.addEventListener('DOMContentLoaded', function () {
  // Toggle dropdowns when clicking the top-level buttons
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close all dropdowns
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => {
        dd.classList.remove('open');
      });

      // Open current if it was closed
      if (!isOpen) {
        dropdown.classList.add('open');
      }
    });
  });

  // Close all dropdowns if clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('#member-navbar .dropdown')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => {
        dd.classList.remove('open');
      });
    }
  });
});
