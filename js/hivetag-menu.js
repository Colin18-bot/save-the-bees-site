document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle'); // Optional, for mobile menu toggle
  const memberNav = document.getElementById('member-navbar');

  if (menuToggle && memberNav) {
    menuToggle.addEventListener('click', () => {
      memberNav.classList.toggle('active');
    });
  }

  document.querySelectorAll('#member-navbar .dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // Close all others
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      dropdown.classList.toggle('open', !isOpen);
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#member-navbar .dropdown')) {
      document.querySelectorAll('#member-navbar .dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
