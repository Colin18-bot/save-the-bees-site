document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // ✅ Toggle main nav menu
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // ✅ Toggle dropdown menus (only one open at a time)
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      const isOpen = dropdown.classList.contains('open');

      // ✅ Close all other open dropdowns
      document.querySelectorAll('.dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      // ✅ Toggle this dropdown
      if (!isOpen) {
        dropdown.classList.add('open');
      } else {
        dropdown.classList.remove('open'); // ✅ Allow collapse when clicked again
      }
    });
  });

  // ✅ Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
