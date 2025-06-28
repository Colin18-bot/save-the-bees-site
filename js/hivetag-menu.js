const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.member-nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show');
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

document.addEventListener('click', e => {
  document.querySelectorAll('.dropdown').forEach(drop => {
    if (!drop.contains(e.target)) drop.classList.remove('open');
  });
});
