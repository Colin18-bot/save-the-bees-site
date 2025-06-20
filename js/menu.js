document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu'); // 💡 Fix: use ID instead of class

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  } else {
    console.error('menuToggle or navMenu not found.');
  }

  // Dropdown toggle
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = button.closest('.dropdown');
      dropdown.classList.toggle('open');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }
  });
});
