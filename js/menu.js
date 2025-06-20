document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  } else {
    console.error('menuToggle or navMenu not found.');
  }

  // Dropdown toggle with toggle state support
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = button.closest('.dropdown');

      // ✅ Toggle only the current dropdown
      if (dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
      } else {
        // Optionally close all others:
        document.querySelectorAll('.dropdown.open').forEach(dd => {
          if (dd !== dropdown) dd.classList.remove('open');
        });
        dropdown.classList.add('open');
      }
    });
  });

  // ✅ Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
