// Tutorials/js/views/home.js
// Training home view (SPA). Sidebar + topbar come from index.html shell.

export function renderHome(container) {
  container.innerHTML = `
    <!-- Inline home progress bar styles (unchanged) -->
    <style>
      .tk-home-progress {
        margin-top: 10px;
      }
      .tk-home-progress-track {
        position: relative;
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.9);
        overflow: hidden;
      }
      .tk-home-progress-fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 0%;
        background: linear-gradient(90deg, var(--accent), var(--accent-strong));
        transition: width 0.25s ease-out;
      }
      .tk-home-progress-label {
        margin-top: 4px;
        font-size: 0.8rem;
        color: var(--text-soft);
      }
      .tk-home-badges-row {
        margin-top: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    </style>

    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Dashboard</div>
        <h2 class="tk-content-title">BeezKnees Training overview</h2>
        <p class="tk-content-subtitle">
          A simple training hub for written beekeeping modules – with space for your own notes
          and progress tracking.
        </p>
        <div class="tk-content-meta">
          <span class="tk-meta-pill"><strong>Tip:</strong> use My notes while you revise</span>
          <span class="tk-meta-pill"><strong>Privacy:</strong> answers stay in your browser</span>
        </div>
      </div>
    </header>

    <section class="tk-grid tk-grid-2">
      <!-- Left column -->
      <article class="tk-card">
        <div class="tk-card-header">
          <div>
            <h3 class="tk-card-title">Get started with written modules</h3>
            <p class="tk-card-subtitle">
              Pick a module, answer the questions, then compare with the model answers.
            </p>
          </div>
        </div>
        <div class="tk-card-body">
          <p>
            This training pack gives you structured practice questions for the main written
            beekeeping modules, plus a combined mock exam. Use them with your local association
            study group or for solo revision.
          </p>
          <ul style="padding-left:1.2rem; margin-top:0.4rem; font-size:0.86rem; color:var(--text-soft);">
            <li>Work through modules in any order – or focus on the one you plan to sit next.</li>
            <li>Use the “Completed” toggle on each module card when you’ve fully worked through it.</li>
            <li>Keep extra notes in the <strong>My notes</strong> section for quick reference.</li>
          </ul>
          <div class="tk-next-row">
            <a href="#/modules" class="tk-btn tk-btn-primary tk-btn-sm">
              Go to written modules<span class="arrow">→</span>
            </a>
            <a href="#/study-tips" class="tk-btn tk-btn-secondary tk-btn-sm">
              Study tips
            </a>
          </div>
        </div>
      </article>

      <!-- Right column -->
      <article class="tk-card">
        <div class="tk-card-header">
          <div>
            <h3 class="tk-card-title">Your written modules progress</h3>
            <p class="tk-card-subtitle" id="tk-home-progress-summary">
              Checking your modules…
            </p>
          </div>
        </div>
        <div class="tk-card-body">
          <div class="tk-home-progress">
            <div class="tk-home-progress-track">
              <div id="tk-home-progress-fill" class="tk-home-progress-fill"></div>
            </div>
            <div id="tk-home-progress-label" class="tk-home-progress-label">
              0% complete
            </div>
          </div>
          <div id="tk-home-badges" class="tk-home-badges-row">
            <!-- Badges injected by JS -->
          </div>
        </div>
      </article>
    </section>

    <!-- Second row: notes, glossary, progress -->
    <section class="tk-grid tk-grid-3" style="margin-top:10px;">
      <article class="tk-card">
        <div class="tk-card-header">
          <h3 class="tk-card-title">My notes</h3>
        </div>
        <div class="tk-card-body">
          <p style="font-size:0.86rem; color:var(--text-soft);">
            Keep key reminders, mnemonics and “lightbulb moments” in one place while you revise.
          </p>
          <ul style="font-size:0.84rem; color:var(--text-soft); padding-left:1.2rem;">
            <li>Quickly jot down things your tutor emphasises.</li>
            <li>Summarise tricky topics in your own words.</li>
            <li>Copy over useful snippets from your association’s handouts.</li>
          </ul>
          <div class="tk-next-row">
            <a href="#/notes" class="tk-btn tk-btn-secondary tk-btn-sm">
              Open my notes
            </a>
          </div>
        </div>
      </article>

      <article class="tk-card">
        <div class="tk-card-header">
          <h3 class="tk-card-title">Glossary &amp; key terms</h3>
        </div>
        <div class="tk-card-body">
          <p style="font-size:0.86rem; color:var(--text-soft);">
            A quick-reference glossary for common beekeeping and exam terms.
          </p>
          <p style="font-size:0.84rem; color:var(--text-soft);">
            Ideal when you’re revising late at night and can’t quite remember the
            wording of a definition or a piece of legislation.
          </p>
          <div class="tk-next-row">
            <a href="#/glossary" class="tk-btn tk-btn-secondary tk-btn-sm">
              Open glossary
            </a>
          </div>
        </div>
      </article>

      <article class="tk-card">
        <div class="tk-card-header">
          <h3 class="tk-card-title">Progress &amp; mock exam</h3>
        </div>
        <div class="tk-card-body">
          <p style="font-size:0.86rem; color:var(--text-soft); margin-bottom:0.4rem;">
            Use the Progress page to see which modules you’ve marked as “Completed” and when
            you’re ready, try the combined mock exam.
          </p>
          <ul style="font-size:0.84rem; color:var(--text-soft); padding-left:1.2rem;">
            <li>Mark each module as completed once you’ve worked through the questions and answers.</li>
            <li>Use the mock exam like a timed paper for extra challenge.</li>
          </ul>
          <div class="tk-next-row">
            <a href="#/progress" class="tk-btn tk-btn-secondary tk-btn-sm">
              View my written progress
            </a>
            <a href="#/final-exam" class="tk-btn tk-btn-primary tk-btn-sm">
              Open mock exam<span class="arrow">→</span>
            </a>
          </div>
        </div>
      </article>
    </section>
  `;

  // --- NEW: drive the "Your written modules progress" card ---

  const EXAM_PROGRESS_KEY = "bk_exam_progress_v2";
  const MODULE_KEYS = ["module1", "module2", "module3", "module5", "module6", "module7", "module8"];

  function loadExamProgress() {
    try {
      const raw = localStorage.getItem(EXAM_PROGRESS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function updateHomeModulesProgress() {
    const progress = loadExamProgress();
    const total = MODULE_KEYS.length;
    const completed = MODULE_KEYS.filter((k) => progress[k] === true).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    const summaryEl = container.querySelector("#tk-home-progress-summary");
    const fillEl = container.querySelector("#tk-home-progress-fill");
    const labelEl = container.querySelector("#tk-home-progress-label");
    const badgesEl = container.querySelector("#tk-home-badges");

    if (summaryEl) {
      if (!total) {
        summaryEl.textContent = "No written modules available yet.";
      } else if (completed === 0) {
        summaryEl.textContent = "You haven’t marked any modules as completed yet.";
      } else {
        summaryEl.textContent = `${completed} of ${total} written modules marked as completed.`;
      }
    }

    if (fillEl) {
      fillEl.style.width = percent + "%";
    }

    if (labelEl) {
      labelEl.textContent = `${percent}% complete`;
    }

    if (badgesEl) {
      badgesEl.innerHTML = "";
      const badge = document.createElement("span");
      badge.className = "tk-badge-soft";

      let label;
      if (percent >= 99) label = "Exam ready";
      else if (percent >= 50) label = "Halfway there";
      else if (percent > 0) label = "Getting started";
      else label = "Not started yet";

      badge.innerHTML = `<strong>${label}</strong>`;
      badgesEl.appendChild(badge);
    }
  }

  updateHomeModulesProgress();

  window.addEventListener("storage", (event) => {
    if (event.key === EXAM_PROGRESS_KEY) {
      updateHomeModulesProgress();
    }
  });
}
