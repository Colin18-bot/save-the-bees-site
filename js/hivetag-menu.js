document.addEventListener('DOMContentLoaded', function () {
  // Toggle submenus
  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close all
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });

      // Toggle current
      dropdown.classList.toggle('open', !isOpen);
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#member-navbar .dropdown')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(d => {
        d.classList.remove('open');
      });
    }
  });
});
