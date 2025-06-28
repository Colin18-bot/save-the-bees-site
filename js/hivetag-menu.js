document.addEventListener('DOMContentLoaded', function () {
  // Toggle dropdowns in member nav
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close all others
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });

      // Toggle this
      dropdown.classList.toggle('open', !isOpen);
    });
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#member-navbar .dropdown')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
});
