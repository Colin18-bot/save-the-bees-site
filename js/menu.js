document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu'); // ✅ ID-based target for nav

  // ✅ Hamburger menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  } else {
    console.error('menuToggle or navMenu not found.');
  }

  // ✅ Dropdown expand/collapse toggle
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = button.closest('.dropdown');

      // ✅ Collapse any other open dropdowns (optional)
      document.querySelectorAll('.dropdown.open').forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove('open');
        }
      });

      // ✅ Toggle current dropdown
      dropdown.classList.toggle('open');
    });
  });

  // ✅ Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
