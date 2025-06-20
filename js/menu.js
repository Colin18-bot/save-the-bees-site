document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // Toggle hamburger menu
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  } else {
    console.error('menuToggle or navMenu not found.');
  }

  // Handle dropdown toggle
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = button.closest('.dropdown');

      // ✅ Allow toggle on same menu (open/close)
      dropdown.classList.toggle('open');
    });
  });

  // Close all dropdowns if clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
