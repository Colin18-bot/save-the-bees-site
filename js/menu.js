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

  // Dropdown toggle (mobile)
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = button.closest('.dropdown');

      // 🟡 Toggle dropdown open/close
      if (dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
      } else {
        // 🔴 Close others first
        document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
        dropdown.classList.add('open');
      }
    });
  });

  // Close dropdowns if you click outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
