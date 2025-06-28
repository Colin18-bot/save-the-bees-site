const toggleBtn = document.getElementById('menuToggle');
const navMenu = document.querySelector('.member-nav-menu');

if (toggleBtn && navMenu) {
  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

dropdownToggles.forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();
    const parent = button.closest('.dropdown');
    parent.classList.toggle('open');
  });
});
