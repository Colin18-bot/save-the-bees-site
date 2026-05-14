document.addEventListener("DOMContentLoaded", function () {

  // =========================
  // ELEMENTS
  // =========================
  const openSearch = document.getElementById("openSearch");
  const searchPanel = document.getElementById("searchPanel");
  const searchOverlay = document.getElementById("searchOverlay");

  const searchForm = document.querySelector(".search-form");
  const searchInput = searchForm?.querySelector('input[type="search"]');
 
  const heroSearchForm = document.querySelector(".hero-search");

  const openMobile = document.getElementById("openMobileMain");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileMenuOverlay");
  const closeMobile = document.getElementById("closeMobileMenu");

  const backToTop = document.getElementById("backToTop");

  const cookieBanner = document.getElementById("cookieBanner");
  const acceptCookies = document.getElementById("acceptCookies");
  const rejectCookies = document.getElementById("rejectCookies");
  const openCookieSettings = document.getElementById("openCookieSettings");
  const cookieIntroPanel = document.getElementById("cookieIntroPanel");
  const cookieSettingsPanel = document.getElementById("cookieSettingsPanel");
  const cookieIntroActions = document.getElementById("cookieIntroActions");
  const cookieSettingsActions = document.getElementById("cookieSettingsActions");
  const backToCookieIntro = document.getElementById("backToCookieIntro");
  const saveCookieSettings = document.getElementById("saveCookieSettings");
  const analyticsCookiesToggle = document.getElementById("analyticsCookiesToggle");

  const openModalBtn = document.getElementById("openHiveTagInfo");
  const modal = document.getElementById("hivetag-modal");
  const closeModalBtn = document.getElementById("closeHiveTagInfo");

  const moreToggle = document.getElementById("moreToggle");
  const moreWrapper = document.querySelector(".nav-more");

  const sectionNavToggle = document.getElementById("sectionNavToggle");
  const sectionNavMobile = document.getElementById("sectionNavMobile");

  const faqButtons = document.querySelectorAll(".faq-question");

  // =========================
  // GOOGLE ANALYTICS SETTINGS
  // =========================
  const GA_MEASUREMENT_ID = "G-T1974NZN05";
  const COOKIE_CHOICE_KEY = "beezknees_cookie_choice";

  // =========================
  // HELPERS
  // =========================
  function closeSearch() {
    if (searchPanel) searchPanel.classList.remove("open");
    if (searchOverlay) searchOverlay.classList.remove("open");
  }

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove("open");
    if (mobileOverlay) mobileOverlay.classList.remove("open");
  }

  function closeModal() {
    if (modal) modal.classList.remove("active");
  }

  function setMobileSectionNavState(isOpen) {
    if (!sectionNavToggle || !sectionNavMobile) return;

    sectionNavMobile.classList.toggle("open", isOpen);
    sectionNavToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    const openLabel = sectionNavToggle.dataset.openLabel || "Menu ▲";
    const closedLabel = sectionNavToggle.dataset.closedLabel || "Menu ▼";

    sectionNavToggle.innerHTML = isOpen ? openLabel : closedLabel;
  }

  // =========================
  // GOOGLE ANALYTICS LOADER
  // Loads GA only when user has accepted cookies
  // =========================
 function loadGoogleAnalytics() {
  if (window.gaLoaded) return;
  window.gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true
  });
}

  // =========================
  // COOKIE CONSENT HELPERS
  // =========================
  function hideCookieBanner() {
    cookieBanner?.classList.remove("show");
  }

  function showCookieBanner() {
    cookieBanner?.classList.add("show");
  }

  function showCookieIntroView() {
    cookieIntroPanel?.removeAttribute("hidden");
    cookieIntroActions?.removeAttribute("hidden");
    cookieSettingsPanel?.setAttribute("hidden", "");
    cookieSettingsActions?.setAttribute("hidden", "");
  }

  function showCookieSettingsView() {
    cookieSettingsPanel?.removeAttribute("hidden");
    cookieSettingsActions?.removeAttribute("hidden");
    cookieIntroPanel?.setAttribute("hidden", "");
    cookieIntroActions?.setAttribute("hidden", "");
  }

  function resetCookieChoice() {
    try {
      localStorage.removeItem(COOKIE_CHOICE_KEY);
    } catch (e) {}

    withdrawAnalyticsConsent();
    syncCookieUIFromSavedChoice();
    showCookieIntroView();

    if (!cookieBanner) return;

    cookieBanner.classList.remove("show");
    void cookieBanner.offsetWidth;
    cookieBanner.classList.add("show");
  }

  function getSavedCookieChoice() {
    try {
      return localStorage.getItem(COOKIE_CHOICE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveCookieChoice(choice) {
    try {
      localStorage.setItem(COOKIE_CHOICE_KEY, choice);
    } catch (e) {}
  }

  function syncCookieUIFromSavedChoice() {
    const savedChoice = getSavedCookieChoice();
    if (!analyticsCookiesToggle) return;

    analyticsCookiesToggle.checked = savedChoice === "accepted";
  }

  function applyCookieChoice(choice) {
    if (choice === "accepted") {
      loadGoogleAnalytics();
    } else {
      withdrawAnalyticsConsent();
    }
  }

  function withdrawAnalyticsConsent() {
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }
  }

    // =========================
  // SEARCH
  // =========================
  const MIN_SEARCH_LENGTH = 2;
  const MAX_SEARCH_RESULTS = 8;

  function escapeHtml(value = "") {
    return value.replace(/[&<>"']/g, function (char) {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return map[char];
    });
  }

  function normaliseSearchText(value = "") {
    return value.toLowerCase().trim();
  }

  function getSearchData() {
    return Array.isArray(window.searchData) ? window.searchData : [];
  }

  function ensureSearchUi() {
    if (!searchPanel) return;

    if (!searchPanel.querySelector(".search-panel-header")) {
      const header = document.createElement("div");
      header.className = "search-panel-header";
      header.innerHTML = `
        <h2 class="search-panel-title">Search the site</h2>
        <button type="button" class="search-close" aria-label="Close search">×</button>
      `;
      searchPanel.insertBefore(header, searchPanel.firstChild);
    }

    if (!searchPanel.querySelector(".search-results")) {
      const results = document.createElement("div");
      results.className = "search-results";
      results.setAttribute("id", "searchResults");
      searchPanel.appendChild(results);
    }

    const closeButton = searchPanel.querySelector(".search-close");
    if (closeButton && !closeButton.dataset.bound) {
      closeButton.addEventListener("click", closeSearch);
      closeButton.dataset.bound = "true";
    }
  }

  function scoreSearchResult(item, query) {
    const q = normaliseSearchText(query);
    const title = normaliseSearchText(item.title || "");
    const description = normaliseSearchText(item.description || "");
    const keywords = normaliseSearchText(item.keywords || "");
    const url = normaliseSearchText(item.url || "");

    let score = 0;

    if (title.startsWith(q)) score += 100;
    if (title.includes(q)) score += 60;
    if (description.includes(q)) score += 30;
    if (keywords.includes(q)) score += 20;
    if (url.includes(q)) score += 10;

    return score;
  }

  function searchPages(query) {
    return getSearchData()
      .map((item) => ({
        ...item,
        score: scoreSearchResult(item, query)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, MAX_SEARCH_RESULTS);
  }

  function renderSearchResults(query) {
    ensureSearchUi();

    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      resultsContainer.innerHTML = `
        <p class="search-hint">Type at least ${MIN_SEARCH_LENGTH} characters to search.</p>
      `;
      return;
    }

    const matches = searchPages(trimmedQuery);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <p class="search-empty">No results found for “${escapeHtml(trimmedQuery)}”.</p>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <span class="search-match-count">${matches.length} result${matches.length === 1 ? "" : "s"} found</span>
      ${matches.map((item) => `
        <a class="search-result-item" href="${item.url}">
          <span class="search-result-title">${escapeHtml(item.title || "")}</span>
          <span class="search-result-url">${escapeHtml(item.url || "")}</span>
          <span class="search-result-desc">${escapeHtml(item.description || "")}</span>
        </a>
      `).join("")}
    `;
  }

  function openSearchPanel(prefillValue = "") {
    ensureSearchUi();

    searchPanel?.classList.add("open");
    searchOverlay?.classList.add("open");

    if (searchInput) {
      searchInput.value = prefillValue;
      renderSearchResults(prefillValue);

      setTimeout(() => {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      }, 0);
    }
  }

  if (openSearch) {
    openSearch.addEventListener("click", (e) => {
      e.preventDefault();
      openSearchPanel(searchInput?.value || "");
    });
  }

  searchOverlay?.addEventListener("click", closeSearch);

  searchInput?.addEventListener("input", (e) => {
    renderSearchResults(e.target.value);
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const query = searchInput?.value || "";
    renderSearchResults(query);

    const firstResult = document.querySelector(".search-result-item");
    if (firstResult && query.trim().length >= MIN_SEARCH_LENGTH) {
      window.location.href = firstResult.getAttribute("href");
    }
  });

  heroSearchForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const heroInput = heroSearchForm.querySelector('input[type="search"]');
    const query = heroInput?.value || "";
    openSearchPanel(query);
  });

  // =========================
  // MOBILE MENU
  // =========================
  openMobile?.addEventListener("click", () => {
    mobileMenu?.classList.add("open");
    mobileOverlay?.classList.add("open");
  });

  closeMobile?.addEventListener("click", closeMobileMenu);
  mobileOverlay?.addEventListener("click", closeMobileMenu);

  // =========================
  // MORE DROPDOWN / ACCORDION
  // Desktop: hover + click + keyboard
  // Mobile: click accordion
  // =========================
  if (moreToggle && moreWrapper) {
    const desktopBreakpoint = 1100;

    function isDesktopView() {
      return window.innerWidth > desktopBreakpoint;
    }

    function openMoreMenu() {
      moreWrapper.classList.add("open");
      moreToggle.setAttribute("aria-expanded", "true");
    }

    function closeMoreMenu() {
      moreWrapper.classList.remove("open");
      moreToggle.setAttribute("aria-expanded", "false");
    }

    function toggleMoreMenu() {
      const isOpen = moreWrapper.classList.contains("open");
      if (isOpen) {
        closeMoreMenu();
      } else {
        openMoreMenu();
      }
    }

    moreToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMoreMenu();
    });

    moreWrapper.addEventListener("mouseenter", () => {
      if (isDesktopView()) openMoreMenu();
    });

    moreWrapper.addEventListener("mouseleave", () => {
      if (isDesktopView()) closeMoreMenu();
    });

    moreToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMoreMenu();
      }

      if (e.key === "Escape") {
        closeMoreMenu();
      }
    });

    document.addEventListener("click", (e) => {
      if (!moreWrapper.contains(e.target)) {
        closeMoreMenu();
      }
    });

    window.addEventListener("resize", () => {
      closeMoreMenu();
    });
  }

  // =========================
  // MOBILE MORE ACCORDION
  // =========================
  const mobileMoreToggle = document.getElementById("mobileMoreToggle");
  const mobileMorePanel = document.getElementById("mobileMorePanel");

  if (mobileMoreToggle && mobileMorePanel) {
    mobileMoreToggle.addEventListener("click", () => {
      const isOpen = mobileMorePanel.classList.contains("open");

      mobileMorePanel.classList.toggle("open", !isOpen);
      mobileMoreToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  }

  // =========================
  // BACK TO TOP
  // =========================
  window.addEventListener("scroll", () => {
    if (!backToTop) return;

    if (window.scrollY > 400) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

   // =========================
  // COOKIE BANNER + CONSENT LOGIC
  // =========================
  const savedChoice = getSavedCookieChoice();
  syncCookieUIFromSavedChoice();
  showCookieIntroView();

  if (!savedChoice) {
    showCookieBanner();
  } else {
    hideCookieBanner();
    applyCookieChoice(savedChoice);
  }

  acceptCookies?.addEventListener("click", () => {
    saveCookieChoice("accepted");
    syncCookieUIFromSavedChoice();
    applyCookieChoice("accepted");
    hideCookieBanner();
  });

  rejectCookies?.addEventListener("click", () => {
    saveCookieChoice("rejected");
    syncCookieUIFromSavedChoice();
    applyCookieChoice("rejected");
    hideCookieBanner();
  });

  openCookieSettings?.addEventListener("click", () => {
    syncCookieUIFromSavedChoice();
    showCookieSettingsView();
  });

  backToCookieIntro?.addEventListener("click", () => {
    showCookieIntroView();
  });

  saveCookieSettings?.addEventListener("click", () => {
    const analyticsAccepted = !!analyticsCookiesToggle?.checked;
    const choice = analyticsAccepted ? "accepted" : "rejected";

    saveCookieChoice(choice);
    syncCookieUIFromSavedChoice();
    applyCookieChoice(choice);
    hideCookieBanner();
  });
  
  // =========================
  // HIVETAG MODAL
  // Opens the HiveTag info modal from the homepage button,
  // closes it via the close button, clicking the overlay,
  // or pressing the Escape key.
  // Safe to keep in the global JS because it exits quietly
  // on pages where the modal/button do not exist.
  // =========================
  if (modal && openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });

    closeModalBtn?.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // =========================
  // FAQ ACCORDION
  // =========================
  faqButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    const item = this.closest(".faq-item");
    const icon = this.querySelector("span:last-child");
    const isOpen = item?.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("open");

      const faqButton = faq.querySelector(".faq-question");
      const faqIcon = faq.querySelector(".faq-question span:last-child");

      if (faqButton) {
        faqButton.setAttribute("aria-expanded", "false");
      }

      if (faqIcon) {
        faqIcon.textContent = "+";
      }
    });

    if (!isOpen && item) {
      item.classList.add("open");

      this.setAttribute("aria-expanded", "true");

      if (icon) {
        icon.textContent = "−";
      }
    }
  });
});

  // =========================
  // SECTION NAV (HUB PAGES)
  // =========================
  if (sectionNavToggle && sectionNavMobile) {
    const defaultExpanded = sectionNavToggle.dataset.defaultExpanded !== "false";

    if (window.innerWidth <= 1100) {
      setMobileSectionNavState(defaultExpanded);
    } else {
      setMobileSectionNavState(false);
    }

    sectionNavToggle.addEventListener("click", () => {
      const expanded = sectionNavToggle.getAttribute("aria-expanded") === "true";
      setMobileSectionNavState(!expanded);

      const detailsElements = sectionNavMobile.querySelectorAll("details");
      detailsElements.forEach((details) => {
        details.open = !expanded;
      });
    });
  }

  // =========================
// UNIVERSAL HUB NAVIGATION
// Opens the active group, keeps others closed (NO SHUFFLING)
// =========================
function setupHubNav(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const groups = container.querySelectorAll("details");
  if (groups.length === 0) return;

  const activeGroup = container.getAttribute("data-active-group");
  
  if (!activeGroup) return; // Exit if no active group defined
  
  // Find the group that contains an element with aria-current="page"
  let activeGroupElement = null;
  groups.forEach(group => {
    if (group.querySelector('[aria-current="page"]')) {
      activeGroupElement = group;
    }
  });
  
  // If no aria-current="page" found, fall back to matching the activeGroup data attribute
  // (useful for hub pages themselves)
  if (!activeGroupElement) {
    groups.forEach(group => {
      const summaryText = group.querySelector("summary").textContent.trim();
      if (summaryText === activeGroup) {
        activeGroupElement = group;
      }
    });
  }
  
  // Set only active group as open, others closed
  groups.forEach(group => {
    group.open = (group === activeGroupElement);
  });
  
  // Add toggle listener - keep only one open at a time
  groups.forEach((group) => {
    group.addEventListener("toggle", () => {
      if (group.open) {
        groups.forEach((other) => {
          if (other !== group) other.open = false;
        });
      }
    });
  });
}

// Apply to all hub containers that have the data-active-group attribute
setupHubNav(".hub-sidebar");
setupHubNav(".section-mobile-nav");

  // =========================
  // ESC KEY CLOSE EVERYTHING
  // =========================
  document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-open-cookie-settings]");
  if (!trigger) return;

  e.preventDefault();
  resetCookieChoice();
});

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearch();
      closeMobileMenu();

      if (modal && openModalBtn && modal.classList.contains("active")) {
        closeModal();
      }

      if (moreWrapper) moreWrapper.classList.remove("open");
      if (moreToggle) moreToggle.setAttribute("aria-expanded", "false");
    }
  });

});