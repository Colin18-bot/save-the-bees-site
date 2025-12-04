// Tutorials/js/training-logic.js
// Shared logic for training pages (moduleX-training)
// Tracks which sections are complete per module and updates the % label / bar.

(function () {
  const STORAGE_KEY = "bk_training_progress_v1";

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (err) {
      console.warn("BKTraining: failed to load training progress", err);
      return {};
    }
  }

  function saveAll(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("BKTraining: failed to save training progress", err);
    }
  }

  function getModuleState(moduleKey) {
    const all = loadAll();
    return all[moduleKey] || {};
  }

  function setModuleState(moduleKey, moduleState) {
    const all = loadAll();
    all[moduleKey] = moduleState;
    saveAll(all);
  }

  /**
   * Wire up training sections on a module training page.
   * @param {HTMLElement} container - The root container for the page.
   * @param {string} moduleKey - e.g. "module1", "module2", "module5".
   * @param {number} totalSections - e.g. 10.
   */
  function initTrainingProgressForModule(container, moduleKey, totalSections) {
    if (!container) return;

    const sectionButtons = container.querySelectorAll("[data-mark-complete]");
    const progressLabel = container.querySelector("[data-training-progress]");
    const progressBarInner = container.querySelector("[data-progress-bar-inner]");

    // Load existing state for this module
    let moduleState = getModuleState(moduleKey); // { "1": true, "2": false, ... }

    function updateUI() {
      // Update button styles & aria
      sectionButtons.forEach((btn) => {
        const sectionId = btn.getAttribute("data-mark-complete");
        if (!sectionId) return;

        const isComplete = !!moduleState[sectionId];
        btn.classList.toggle("is-complete", isComplete);
        btn.setAttribute("aria-pressed", isComplete ? "true" : "false");
      });

      // Calculate percent complete
      const completedCount = Object.keys(moduleState).filter(
        (key) => moduleState[key]
      ).length;

      let percent = 0;
      if (totalSections > 0) {
        percent = Math.round((completedCount / totalSections) * 100);
      }

      // Update label
      if (progressLabel) {
        progressLabel.textContent = `${percent}% complete`;
      }

      // Optional progress bar
      if (progressBarInner) {
        progressBarInner.style.width = `${percent}%`;
      }
    }

    // Wire up click handlers for each section button
    sectionButtons.forEach((btn) => {
      const sectionId = btn.getAttribute("data-mark-complete");
      if (!sectionId) return;

      btn.addEventListener("click", () => {
        const current = !!moduleState[sectionId];
        const next = !current;

        // Toggle local state
        moduleState[sectionId] = next;

        // Immediate visual feedback on this button
        btn.classList.toggle("is-complete", next);
        btn.setAttribute("aria-pressed", next ? "true" : "false");

        // Persist state and re-paint everything
        setModuleState(moduleKey, moduleState);
        updateUI();
      });
    });

    // Initial paint when the page renders
    updateUI();
  }

  // Expose globally so the training views can call it
  window.BKTraining = window.BKTraining || {};
  window.BKTraining.initTrainingProgressForModule = initTrainingProgressForModule;
})();
