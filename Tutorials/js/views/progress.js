// Tutorials/js/views/progress.js
// SPA view for "My written progress"

import { initModulesLogic } from "../modules-logic.js";

export function renderProgress(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
       <div class="tk-content-eyebrow">Exam practice</div>
<h2 class="tk-content-title">My exam progress</h2>
<p class="tk-content-subtitle">
  This page tracks your progress with the written module practice papers and final mock exam.
  It does <strong>not</strong> include the separate training-module section completions.
</p>
      </div>
    </header>

    <section class="tk-grid tk-grid-2">
      <!-- Summary card -->
      <article class="tk-card">
        <div class="tk-card-body">
          <h3 class="tk-card-title" style="margin-top:0;">Written module completion at a glance</h3>
<p style="font-size:0.86rem; color:var(--text-soft); margin-bottom:0.4rem;">
  This checklist shows which <strong>written module practice papers</strong> you’ve marked as “Completed”
  using the toggles on the Module overview page.
</p>
          <div id="bk-progress-summary" class="bk-progress-overview">
            <p style="color:var(--text-soft); font-size:0.84rem;">
              Loading your module progress…
            </p>
          </div>
        </div>
      </article>

      <!-- Hint card -->
      <article class="tk-card">
        <div class="tk-card-body">
          <h3 class="tk-card-title" style="margin-top:0;">How this page works</h3>
          <p style="font-size:0.86rem; color:var(--text-soft);">
  This page only looks at your <strong>written exam practice</strong>:
  the “Completed” toggles on the <strong>Module overview</strong> page and your
  use of the written question sets. It does not track the separate training
  pages where you mark individual sections as complete.
</p>
<ul style="font-size:0.84rem; color:var(--text-soft); padding-left:1.2rem;">
  <li>Use it as a simple revision checklist for the written modules.</li>
  <li>Revisit modules that you haven’t marked as completed yet.</li>
  <li>Combine with the final mock exam for an end-to-end practice run.</li>
</ul>

        </div>
      </article>
    </section>

    <!-- The modules overview grid reused below for quick access -->
    <section style="margin-top:12px;">
      <header class="tk-content-heading">
  <div class="tk-content-eyebrow">Written modules</div>
  <h2 class="tk-content-title">Written module practice overview</h2>
  <p class="tk-content-subtitle">
    This section reuses the <strong>Module overview</strong> grid. The “Completed” toggles here
    are the same ones used to track your written exam practice – they do not affect the
    training-module section completion bars.
  </p>
</header>

      <div id="bk-progress-modules-host"></div>
    </section>
  `;

  // Reuse the Modules overview grid inside this page
  // (we just mount the same modules.js renderer into bk-progress-modules-host)
  const host = container.querySelector("#bk-progress-modules-host");
  if (host) {
    // We can reuse the same render as the main Modules overview by importing it,
    // but to keep things simple you already have that layout in views/modules.js.
    // Here we just call initModulesLogic so the toggles + progress bars keep working.
    initModulesLogic();
  }

  // --- NEW: progress summary logic (ported from old progress-summary.js) ---

  const EXAM_PROGRESS_KEY = "bk_exam_progress_v2";

  const MODULES = [
    { id: "module1", label: "Module 1 – Management" },
    { id: "module2", label: "Module 2 – Products & Forage" },
    { id: "module3", label: "Module 3 – Pests & Diseases" },
    { id: "module5", label: "Module 5 – Biology" },
    { id: "module6", label: "Module 6 – Behaviour" },
    { id: "module7", label: "Module 7 – Selection & Breeding" },
    { id: "module8", label: "Module 8 – Management, Health & History" }
  ];

  function loadExamProgress() {
    try {
      const raw = localStorage.getItem(EXAM_PROGRESS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  function renderProgressSummary() {
    const wrapper = container.querySelector("#bk-progress-summary");
    if (!wrapper) return;

    const progress = loadExamProgress();
    const total = MODULES.length;
    const completed = MODULES.filter((m) => progress[m.id] === true).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    wrapper.innerHTML = "";

    const summary = document.createElement("p");
    summary.style.fontSize = "0.86rem";
    summary.style.color = "var(--text-soft)";
    if (total === 0) {
      summary.textContent = "No written modules available yet.";
    } else {
      summary.textContent = `${completed} of ${total} modules marked as completed (${percent}%).`;
    }
    wrapper.appendChild(summary);

    // Progress bar
    const barWrap = document.createElement("div");
    barWrap.className = "bk-progress-bar-wrap";
    const barFill = document.createElement("div");
    barFill.className = "bk-progress-bar-fill";
    barFill.style.width = `${percent}%`;
    barWrap.appendChild(barFill);
    wrapper.appendChild(barWrap);

    // Per-module list
    const list = document.createElement("ul");
    list.className = "bk-progress-list";

    MODULES.forEach((m) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = m.label;

      const pill = document.createElement("span");
      pill.className = "bk-progress-status-pill";
      if (progress[m.id] === true) {
        pill.classList.add("is-completed");
        pill.textContent = "Completed";
      } else {
        pill.classList.add("is-incomplete");
        pill.textContent = "Not completed";
      }

      li.appendChild(label);
      li.appendChild(pill);
      list.appendChild(li);
    });

    wrapper.appendChild(list);
  }

  renderProgressSummary();

  window.addEventListener("storage", (event) => {
    if (event.key === EXAM_PROGRESS_KEY) {
      renderProgressSummary();
    }
  });
}
