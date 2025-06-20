document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu'); // Refers to the main nav <ul>

  // ✅ Hamburger toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  } else {
    console.error('menuToggle or navMenu not found.');
  }

  // ✅ Dropdown toggle (expand/collapse)
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = button.closest('.dropdown');

      // Toggle open state
      const isOpen = dropdown.classList.contains('open');
      
      // Close all others
      document.querySelectorAll('.dropdown.open').forEach(dd => {
        if (dd !== dropdown) dd.classList.remove('open');
      });

      // Toggle current
      if (isOpen) {
        dropdown.classList.remove('open');
      } else {
        dropdown.classList.add('open');
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
