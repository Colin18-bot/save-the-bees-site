// -------------------- BeezKnees Member Dashboard JS --------------------
// Handles: Loading screen, Cookie consent, Google Analytics, Back to top, Dropdowns, Hamburger menu

document.addEventListener('DOMContentLoaded', function () {

  /* -------------------- 🕒 Loading Fallback -------------------- */
  setTimeout(() => {
    const loading = document.getElementById('member-loading-screen');
    if (loading) loading.style.display = 'none';
  }, 5000);

  /* -------------------- 🔝 Back to Top Button -------------------- */
  const backToTop = document.getElementById("member-backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.style.display = window.scrollY > 300 ? "block" : "none";
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -------------------- 🍪 Cookie Consent + GA4 -------------------- */
  const popup = document.getElementById('member-cookie-consent');
  const acceptAllBtn = document.getElementById('accept-all');
  const acceptSelectedBtn = document.getElementById('accept-selected');
  const analyticsCheckbox = document.getElementById('analytics');
  const marketingCheckbox = document.getElementById('marketing');

  function applyConsent(consent) {
    if (consent.analytics) {
      const gaScript = document.createElement('script');
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-7C99K0XQKV';
      gaScript.async = true;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-7C99K0XQKV');
    }

    if (consent.marketing) {
      // Add any future marketing scripts here
    }
  }

  function savePreferences(analytics, marketing) {
    const consent = {
      essential: true,
      analytics: analytics,
      marketing: marketing
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    if (popup) popup.style.display = 'none';
    applyConsent(consent);
  }

  if (popup && !localStorage.getItem('cookieConsent')) {
    popup.style.display = 'block';
  }

  if (acceptAllBtn && acceptSelectedBtn) {
    acceptAllBtn.addEventListener('click', () => {
      savePreferences(true, true);
    });

    acceptSelectedBtn.addEventListener('click', () => {
      savePreferences(analyticsCheckbox?.checked, marketingCheckbox?.checked);
    });
  }

  const stored = localStorage.getItem('cookieConsent');
  if (stored) {
    const consent = JSON.parse(stored);
    applyConsent(consent);
  }

  /* -------------------- 📱 Dropdown Toggle -------------------- */
  document.querySelectorAll('.member-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function () {
      const parent = this.closest('.member-dropdown');
      parent?.classList.toggle('open');
    });
  });

  /* -------------------- 🍔 Hamburger Menu Toggle -------------------- */
  const toggleBtn = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.member-nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  /* -------------------- ⏱️ Final Loading Fail-Safe -------------------- */
  setTimeout(() => {
    const loading = document.getElementById('member-loading-screen');
    if (loading && loading.style.display !== 'none') {
      loading.style.display = 'none';
    }
  }, 10000);
});
