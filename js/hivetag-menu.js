document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });

  dropdownToggles.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = button.closest('.dropdown');
      parent.classList.toggle('open');
    });
  });
});
