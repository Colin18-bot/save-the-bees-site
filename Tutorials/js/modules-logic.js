// Tutorials/js/modules-logic.js
// Logic extracted from modules.html + new SPA-only toggle wiring.
// Shared by Modules overview + Progress summary + sidebar dots.

export function initModulesLogic() {
  // Storage keys used by the existing training JS files
  const ANSWERS_STORAGE_KEY = "bk_exam_answers_v1";   // original key
  const NOTES_STORAGE_KEY   = "bk_notes_main";        // original key
  const EXAM_PROGRESS_KEY   = "bk_exam_progress_v2";  // original key

  // 🔹 Training progress key (per-module training sections)
  const TRAINING_PROGRESS_KEY = "bk_training_progress_v1";

  // Question counts per module (adjust if your papers change)
  const MODULE_QUESTION_COUNTS = {
    module1: 30,
    module2: 30,
    module3: 30,
    module5: 30,
    module6: 30,
    module7: 30,
    module8: 30,
  };

  // File slug fragment used in the stored answer keys for each module
  // (answers are stored against the question page pathname, e.g. "...module1.html::Question 1 – ...")
  const MODULE_SLUGS = {
    module1: "#/module1",
    module2: "#/module2",
    module3: "#/module3",
    module5: "#/module5",
    module6: "#/module6",
    module7: "#/module7",
    module8: "#/module8",
  };

  // ---------- STORAGE HELPERS (EXAM / NOTES) ----------

  function loadAnswers() {
    try {
      const raw = localStorage.getItem(ANSWERS_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function loadExamProgress() {
    try {
      const raw = localStorage.getItem(EXAM_PROGRESS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function saveExamProgress(state) {
    localStorage.setItem(EXAM_PROGRESS_KEY, JSON.stringify(state));
  }

  // ---------- TRAINING PROGRESS HELPERS ----------

  function loadTrainingProgress() {
    try {
      const raw = localStorage.getItem(TRAINING_PROGRESS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function saveTrainingProgress(state) {
    localStorage.setItem(TRAINING_PROGRESS_KEY, JSON.stringify(state));
  }

  /**
   * Get training status for a single module (e.g. "module1").
   * totalSections = how many training sections that module has (e.g. 10).
   * Returns { completedSections: number[], percent: number }
   */
  function getModuleTrainingStatus(moduleKey, totalSections) {
    const all = loadTrainingProgress();
    const moduleData = all[moduleKey] || { completedSections: [] };
    const completedArray = Array.isArray(moduleData.completedSections)
      ? moduleData.completedSections
      : [];

    const uniqueCompleted = [...new Set(completedArray)].filter((n) => {
      return typeof n === "number" && n >= 1 && n <= totalSections;
    });

    const percent =
      totalSections > 0
        ? Math.round((uniqueCompleted.length / totalSections) * 100)
        : 0;

    return {
      completedSections: uniqueCompleted,
      percent,
    };
  }

  /**
   * Toggle a single training section as complete/incomplete for a module.
   * sectionNumber is 1-based (1..totalSections).
   * Returns the updated status for that module.
   */
  function markTrainingSectionComplete(moduleKey, sectionNumber, totalSections) {
    if (!sectionNumber || sectionNumber < 1 || sectionNumber > totalSections) {
      return getModuleTrainingStatus(moduleKey, totalSections);
    }

    const all = loadTrainingProgress();
    const existing = all[moduleKey] || { completedSections: [], lastSection: null };
    const completedSet = new Set(existing.completedSections || []);

    // 🔁 Toggle behaviour: click again to unmark
    if (completedSet.has(sectionNumber)) {
      completedSet.delete(sectionNumber);
    } else {
      completedSet.add(sectionNumber);
    }

    const updated = {
      completedSections: Array.from(completedSet),
      lastSection: sectionNumber,
    };

    all[moduleKey] = updated;
    saveTrainingProgress(all);

    return getModuleTrainingStatus(moduleKey, totalSections);
  }

  /**
   * Wire a training page:
   * - Reads current status and updates progress label/bar + section + button styles
   * - Handles "Mark section complete" buttons via data attributes
   *
   * Expected data attributes in the training view:
   *   - [data-training-progress] – element that shows "X% complete"
   *   - [data-progress-bar-inner] – optional bar fill element
   *   - [data-training-section="1"] – wrapper for each section
   *   - [data-mark-complete="1"] – button to mark that section complete
   */
  function initTrainingProgressForModule(container, moduleKey, totalSections) {
    const PROGRESS_SELECTOR = "[data-training-progress]";
    const SECTION_SELECTOR = "[data-training-section]";
    const COMPLETE_BTN_SELECTOR = "[data-mark-complete]";

    function renderFromStatus() {
      const status = getModuleTrainingStatus(moduleKey, totalSections);

      // Progress label
      const progressEl = container.querySelector(PROGRESS_SELECTOR);
      if (progressEl) {
        progressEl.textContent = `${status.percent}% complete`;
        progressEl.setAttribute("data-training-percent", String(status.percent));
      }

      // Progress bar
      const bar = container.querySelector("[data-progress-bar-inner]");
      if (bar) {
        bar.style.width = `${status.percent}%`;
      }

      // Sections – add/remove tk-section-complete
      const sections = container.querySelectorAll(SECTION_SELECTOR);
      sections.forEach((sectionEl) => {
        const numAttr = sectionEl.getAttribute("data-training-section");
        const num = Number(numAttr);
        const isComplete = status.completedSections.includes(num);
        sectionEl.classList.toggle("tk-section-complete", isComplete);
      });

      // Buttons – drive .is-complete so CSS can make them yellow
      const buttons = container.querySelectorAll(COMPLETE_BTN_SELECTOR);
      buttons.forEach((btn) => {
        const sectionStr = btn.getAttribute("data-mark-complete");
        const num = Number(sectionStr);
        const isComplete = status.completedSections.includes(num);

        btn.classList.toggle("is-complete", isComplete);
        btn.setAttribute("aria-pressed", isComplete ? "true" : "false");
      });
    }

    // Initial render
    renderFromStatus();

    // Click handler for "mark complete" buttons (toggle on/off)
    container.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const btn = target.closest(COMPLETE_BTN_SELECTOR);
      if (!btn) return;

      const sectionStr = btn.getAttribute("data-mark-complete");
      const sectionNumber = Number(sectionStr);
      if (!sectionNumber || sectionNumber < 1 || sectionNumber > totalSections) return;

      // Update storage + re-render UI
      markTrainingSectionComplete(moduleKey, sectionNumber, totalSections);
      renderFromStatus();
    });
  }

  // ---------- EXPORT / RESET ----------

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Build .txt export content from real keys
  function buildExportContent() {
    const lines = [];
    lines.push("BeezKnees Training – Exported Answers & Notes");
    lines.push("Date: " + new Date().toLocaleString());
    lines.push("------------------------------------------------------------");
    lines.push("");

    // 1) Typed answers from all modules
    const allAnswers = loadAnswers();
    const answerKeys = Object.keys(allAnswers).filter((k) => {
      const v = allAnswers[k];
      return v && String(v).trim() !== "";
    });

    if (answerKeys.length) {
      lines.push("=== Typed answers by question ===");
      lines.push("");
      answerKeys.forEach((key) => {
        const value = String(allAnswers[key] || "").trim();
        if (!value) return;
        lines.push("Question key: " + key);
        lines.push(value);
        lines.push("");
      });
    } else {
      lines.push("No typed answers were found.");
      lines.push("");
    }

    // 2) Main notes page
    const notes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (notes && notes.trim() !== "") {
      lines.push("=== My notes (#/notes) ===");
      lines.push(notes.trim());
      lines.push("");
    }

    // 3) Manual completion toggles (module / exam status)
    const progress = loadExamProgress();
    const progressKeys = Object.keys(progress);
    if (progressKeys.length) {
      lines.push("=== Completion toggles (modules / exams) ===");
      progressKeys.forEach((k) => {
        lines.push(k + ": " + (progress[k] ? "Completed" : "Not completed"));
      });
      lines.push("");
    }

    return lines.join("\n");
  }

  function handleExportAll() {
    const content = buildExportContent();
    downloadTextFile("beezknees-training-export.txt", content);
  }

  // Reset: clear everything for this training pack
  function handleResetAll() {
    const confirmed = window.confirm(
      "Are you sure you want to reset ALL BeezKnees training progress?\n\n" +
        "This will clear ALL saved typed answers, notes, exam/module completion toggles " +
        "and training-section completions stored in this browser for the training pack.\n\n" +
        "It will not touch anything stored on the BeezKnees members-area server."
    );
    if (!confirmed) return;

    // 🔹 Clear only the keys we actually use for this training pack
    localStorage.removeItem(ANSWERS_STORAGE_KEY);
    localStorage.removeItem(NOTES_STORAGE_KEY);
    localStorage.removeItem(EXAM_PROGRESS_KEY);
    localStorage.removeItem(TRAINING_PROGRESS_KEY);

    updateAllModuleProgress();
    updateSidebarDots();

    // Also uncheck all toggles
    const toggles = document.querySelectorAll("[data-module-toggle]");
    toggles.forEach((cb) => {
      cb.checked = false;
      const wrapper = cb.closest(".tk-exam-toggle");
      if (wrapper) {
        setToggleLabel(wrapper, false);
      }
    });
    alert("All BeezKnees training progress stored in this browser has been reset.");
  }

  // ---------- PROGRESS CALCULATION (EXAM PRACTICE) ----------

  // Friendly status text for the progress bar
  function getStatusDescriptor(percent) {
    if (percent >= 99) return "Exam ready";
    if (percent >= 50) return "Halfway there";
    if (percent > 0)  return "Module starter";
    return "Not started";
  }

  // Work out % for a single module based on:
  //  - how many questions for that module have a non-empty answer
  //  - whether the module is manually toggled as "Completed"
  function getModuleProgressPercent(moduleKey) {
    const total = MODULE_QUESTION_COUNTS[moduleKey] || 0;
    if (!total) return 0;

    const slug = MODULE_SLUGS[moduleKey];
    if (!slug) return 0;

    const answers      = loadAnswers();
    const examProgress = loadExamProgress();

    // Count answered questions for this module based on the slug in the stored question key
    const answeredKeys = Object.keys(answers).filter((key) => {
      if (!key.includes(slug)) return false;
      const value = String(answers[key] || "").trim();
      return value.length > 0;
    });

    const answeredCount = answeredKeys.length;

    // If there are no typed answers but the module has been marked "Completed", treat as 100%
    if (answeredCount === 0) {
      return examProgress[moduleKey] === true ? 100 : 0;
    }

    let rawPercent = (answeredCount / total) * 100;
    if (rawPercent > 100) rawPercent = 100;

    // Manual toggle always wins
    if (examProgress[moduleKey] === true) {
      rawPercent = 100;
    }

    // Snap to friendly steps
    if (rawPercent >= 99) return 100;
    if (rawPercent >= 75) return 75;
    if (rawPercent >= 50) return 50;
    if (rawPercent >= 25) return 25;
    if (rawPercent > 0)  return 10;
    return 0;
  }

  // ---------- SIDEBAR DOTS ----------

  // For sidebar, we care about the manual completion toggle, not partial %
  function updateSidebarDots() {
    const progress = loadExamProgress();

    Object.keys(MODULE_QUESTION_COUNTS).forEach((moduleKey) => {
      const completed = progress[moduleKey] === true;
      const dot = document.querySelector(
        '[data-module-nav-dot="' + moduleKey + '"]'
      );
      if (!dot) return;

      if (completed) {
        dot.classList.add("tk-nav-dot-complete");
      } else {
        dot.classList.remove("tk-nav-dot-complete");
      }
    });
  }

  // ---------- UI UPDATE FOR EXAM MODULE CARDS ----------

  function updateAllModuleProgress() {
    Object.keys(MODULE_QUESTION_COUNTS).forEach((moduleKey) => {
      const percent = getModuleProgressPercent(moduleKey);

      // Fills – update ALL matching elements (modules grid, progress page, etc.)
      const fills = document.querySelectorAll(
        '[data-module-progress-fill="' + moduleKey + '"]'
      );
      fills.forEach((fill) => {
        fill.style.width = percent + "%";
        if (percent === 100) {
          fill.classList.add("is-complete");
        } else {
          fill.classList.remove("is-complete");
        }
      });

      // Labels – "0%" / "50%" / "100%"
      const labels = document.querySelectorAll(
        '[data-module-progress-label="' + moduleKey + '"]'
      );
      labels.forEach((label) => {
        label.textContent = percent + "%";
      });

      // Descriptors – "Module starter" / "Halfway there" / "Exam ready"
      const descs = document.querySelectorAll(
        '[data-module-progress-desc="' + moduleKey + '"]'
      );
      descs.forEach((desc) => {
        desc.textContent = getStatusDescriptor(percent);
      });

      // Card outline – highlight completed cards
      const cards = document.querySelectorAll(
        '.tk-card[data-exam-id="' + moduleKey + '"]'
      );
      cards.forEach((card) => {
        if (percent === 100) {
          card.classList.add("tk-card-complete");
        } else {
          card.classList.remove("tk-card-complete");
        }
      });
    });

    // keep sidebar dots in sync whenever we recompute progress
    updateSidebarDots();
  }

  // ---------- TOGGLE WIRING (EXAM MODULES) ----------

  function setToggleLabel(wrapper, completed) {
    const labelSpan = wrapper.querySelector(".tk-exam-toggle-label");
    if (!labelSpan) return;
    labelSpan.textContent = completed
      ? "Status: Completed"
      : "Status: Not completed";
  }

  function wireModuleToggles() {
    const progress = loadExamProgress();
    const wrappers = document.querySelectorAll(".tk-exam-toggle");

    wrappers.forEach((wrapper) => {
      const checkbox = wrapper.querySelector(
        'input[type="checkbox"][data-module-toggle]'
      );
      if (!checkbox) return;

      const moduleKey = checkbox.getAttribute("data-module-toggle");
      if (!moduleKey) return;

      const completed = progress[moduleKey] === true;
      checkbox.checked = completed;
      setToggleLabel(wrapper, completed);

      // Avoid stacking multiple listeners if this gets called again
      if (checkbox._bkTrainingBound) {
        checkbox.removeEventListener("change", checkbox._bkTrainingBound);
      }

      const handler = () => {
        const current = loadExamProgress();
        current[moduleKey] = checkbox.checked;
        saveExamProgress(current);
        setToggleLabel(wrapper, checkbox.checked);

        // Immediately refresh progress bars, card borders + sidebar dots
        updateAllModuleProgress();
      };

      checkbox.addEventListener("change", handler);
      checkbox._bkTrainingBound = handler;
    });
  }

  // ---------- GLOBAL LISTENERS ----------

  // When you come back to this tab, refresh module progress
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      updateAllModuleProgress();
      wireModuleToggles();
    }
  });

  // If answers or completion toggles change in another tab, refresh the bars + sidebar
  window.addEventListener("storage", function (event) {
    if (
      event.key === ANSWERS_STORAGE_KEY ||
      event.key === EXAM_PROGRESS_KEY ||
      event.key === NOTES_STORAGE_KEY ||
      event.key === TRAINING_PROGRESS_KEY // 🔹 refresh if training progress changes
    ) {
      updateAllModuleProgress();
      wireModuleToggles();
    }
  });

  // ---------- INITIAL HOOK-UP FOR CURRENT VIEW ----------

  const btnExport = document.getElementById("btn-export-all");
  const btnReset  = document.getElementById("btn-reset-all");

  if (btnExport) btnExport.addEventListener("click", handleExportAll);
  if (btnReset)  btnReset.addEventListener("click", handleResetAll);

  updateAllModuleProgress();
  wireModuleToggles();

  // 🔹 Expose training helpers globally so training views can use them
  window.BKTraining = {
    getModuleTrainingStatus,
    markTrainingSectionComplete,
    initTrainingProgressForModule,
  };
}
