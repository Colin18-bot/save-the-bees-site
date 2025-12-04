// Tutorials/js/views/modules.js
// SPA view for "Written exam modules – overview"
// Uses ONLY the original <section class="tk-content"> content from modules.html
// plus the status toggles under each progress bar.

import { initModulesLogic } from "../modules-logic.js";

export function renderModules(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Overview</div>
        <h2 class="tk-content-title">Practice question sets</h2>
        <p class="tk-content-subtitle">
          Each module has a full practice paper and a separate “tutor view” page with model answers
          and marking notes. Ideal for self-study or association study groups.
        </p>
      </div>
    </header>

    <!-- Quick actions + Study Tips row -->
    <section class="tk-grid tk-grid-2" style="margin-top:8px;">
      <!-- Quick actions card -->
      <article class="tk-card">
        <div class="tk-card-header">
          <h3 class="tk-card-title">Quick actions</h3>
        </div>
        <div class="tk-card-body">
          <p style="font-size:0.86rem; color:var(--text-soft);">
            Export everything you’ve typed into BeezKnees, or reset your training progress
            if you want to start again from a clean slate.
          </p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <button id="btn-export-all" class="tk-btn tk-btn-sm tk-btn-secondary">
              Export all answers
            </button>
            <button id="btn-reset-all" class="tk-btn tk-btn-sm tk-btn-danger">
              Reset all progress
            </button>
          </div>
          <p style="margin-top:8px; font-size:0.78rem; color:var(--text-softer);">
            Reset will clear saved answers, notes and any exam attempts stored in this browser
            for BeezKnees Training. It will not affect your main BeezKnees account.
          </p>
        </div>
      </article>

      <!-- Study Tips card -->
      <article class="tk-card">
        <div class="tk-card-header">
          <h3 class="tk-card-title">Study Tips</h3>
        </div>
        <div class="tk-card-body">
          <p style="font-size:0.86rem; color:var(--text-soft);">
            Short on time or feeling overwhelmed? The Study Tips section gives simple,
            practical ideas for how to tackle each module without getting lost.
          </p>
          <ul style="font-size:0.84rem; color:var(--text-soft); padding-left:1.2rem; margin-top:6px;">
            <li>Break modules into small, focused revision sessions.</li>
            <li>Use your own apiary records and photos as real-world examples.</li>
            <li>Combine these practice papers with your association’s study groups.</li>
          </ul>
          <!-- CHANGED: use SPA hash route instead of study-tips.html -->
          <a href="#/study-tips" class="tk-btn tk-btn-sm tk-btn-primary" style="margin-top:10px;">
            Open Study Tips
          </a>
        </div>
      </article>
    </section>

    <!-- Intro card -->
    <section class="tk-card" style="margin-top:12px;">
      <div class="tk-card-body">
        <p style="font-size:0.9rem; color:var(--text-soft); margin-bottom:0.5rem;">
          How to use this section:
        </p>
        <ul style="font-size:0.86rem; color:var(--text-soft); padding-left:1.2rem;">
          <li>Pick a module and open the <strong>Questions</strong> page.</li>
          <li>Answer on paper, in your notebook, or directly in BeezKnees (later you can add typed answer boxes).</li>
          <li>Then open the matching <strong>Model answers</strong> page to compare and self-mark.</li>
          <li>Record your scores in your own notes or the main app’s Progress section.</li>
        </ul>
      </div>
    </section>

    <!-- Exam info panel -->
    <section class="tk-card" style="margin-top:12px;">
      <div class="tk-card-body">
        <h3 class="tk-card-title" style="margin-top:0;">About these practice modules</h3>
        <p style="font-size:0.88rem; color:var(--text-soft);">
          The practice questions in this section are written exclusively for BeezKnees Training.
          They are <strong>original revision sets</strong> designed to mirror the style and themes
          of written beekeeping exams, but they are <strong>not official exam papers from any exam board or association</strong>.
        </p>

        <ul style="font-size:0.85rem; color:var(--text-soft); padding-left:1.2rem; margin-top:8px;">
          <li>All questions are written from scratch and do not reproduce copyrighted exam wording.</li>
          <li>They follow similar learning outcomes and difficulty styles to support your preparation.</li>
          <li>Always check your association’s latest official syllabus for definitive requirements.</li>
          <li>Ideal for personal study, club workshops, or pre-exam practice.</li>
        </ul>

        <p style="font-size:0.85rem; color:var(--text-soft); margin-top:10px;">
          BeezKnees aims to support your learning journey with clear, simple revision tools while
          respecting all copyright rules.
        </p>
      </div>
    </section>

    <!-- Local styles for progress bar + toggle (kept close to modules grid) -->
    <style>
      .tk-progress {
        margin-top: 8px;
      }

      .tk-progress-track {
        position: relative;
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.9);
        overflow: hidden;
      }

      .tk-progress-fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 0%;
        background: linear-gradient(90deg, var(--accent), var(--accent-strong));
        transition: width 0.25s ease-out;
      }

      .tk-progress-label {
        margin-top: 4px;
        font-size: 0.78rem;
        color: var(--text-soft);
      }

      .tk-progress-desc {
        margin-left: 4px;
        color: var(--text-softer, var(--text-soft));
      }

      .tk-progress-fill.is-complete {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
      }

      .tk-exam-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
        font-size: 0.8rem;
        color: var(--text-soft);
      }

      .tk-exam-switch {
        position: relative;
        display: inline-block;
        width: 34px;
        height: 18px;
      }

      .tk-exam-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .tk-exam-switch .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(15, 23, 42, 0.5);
        transition: 0.2s;
        border-radius: 999px;
      }

      .tk-exam-switch .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background-color: #fff;
        transition: 0.2s;
        border-radius: 999px;
      }

      .tk-exam-switch input:checked + .slider {
        background: linear-gradient(90deg, var(--accent), var(--accent-strong));
      }

      .tk-exam-switch input:checked + .slider:before {
        transform: translateX(16px);
      }
    </style>

    <!-- Modules grid -->
    <section style="margin-top:10px;">
      <header class="tk-content-heading">
        <div class="tk-content-eyebrow">Modules</div>
        <h2 class="tk-content-title">Available written modules</h2>
      </header>

      <div class="tk-grid tk-grid-2" style="margin-top:8px;">
        <!-- Module 1 -->
        <article class="tk-card" data-exam-id="module1">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 1 – Honey Bee Management</h3>
              <p class="tk-card-subtitle">
                Day-to-day colony management, equipment and practical apiary work.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions covering management principles, seasonal tasks,
              swarming, queen management and apiary organisation.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module1"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module1">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module1"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module1">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED: use SPA hash routes -->
            <a href="#/module1" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module1-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Module 2 -->
        <article class="tk-card" data-exam-id="module2">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 2 – Honey Bee Products &amp; Forage</h3>
              <p class="tk-card-subtitle">
                Honey, wax, pollen, propolis, forage plants and honey handling.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions on bee products and the plants that support them, including
              honey quality, labelling, wax uses and planning forage.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module2"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module2">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module2"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module2">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/module2" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module2-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Module 3 -->
        <article class="tk-card" data-exam-id="module3">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 3 – Pests, Diseases &amp; Poisoning</h3>
              <p class="tk-card-subtitle">
                Brood and adult diseases, varroa, hive pests and pesticide incidents.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions, from recognising healthy brood through to dealing with
              foulbrood, varroa strategies and suspected poisoning incidents.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module3"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module3">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module3"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module3">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/module3" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module3-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Module 5 -->
        <article class="tk-card" data-exam-id="module5">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 5 – Honey Bee Biology</h3>
              <p class="tk-card-subtitle">
                Anatomy, development, genetics, communication and colony life cycle.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions covering bee anatomy, caste biology, development times,
              communication and the colony as a superorganism.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module5"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module5">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module5"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module5">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/module5" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module5-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Module 6 -->
        <article class="tk-card" data-exam-id="module6">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 6 – Honey Bee Behaviour</h3>
              <p class="tk-card-subtitle">
                Communication, navigation, division of labour, defence and behavioural ecology.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions covering communication signals, waggle dances,
              defence behaviour, temperature regulation, nest-site selection and colony-level coordination.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module6"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module6">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module6"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module6">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/module6" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module6-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Module 7 -->
        <article class="tk-card" data-exam-id="module7">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 7 – Selection &amp; Breeding</h3>
              <p class="tk-card-subtitle">
                Choosing breeding stock, desirable traits, mating systems and maintaining lines.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions on breeding aims, genetic diversity, trait selection,
              mating control and practical queen improvement strategies.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module7"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module7">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module7"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module7">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/module7" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module7-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Module 8 -->
        <article class="tk-card" data-exam-id="module8">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Module 8 – Management, Health &amp; History</h3>
              <p class="tk-card-subtitle">
                Historic methods, modern hive practice, colony health and how beekeeping has evolved.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Question set ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              30 original practice questions linking traditional approaches with modern standards in hive
              management, welfare, honey production and bee health.
            </p>

            <!-- Progress bar -->
            <div class="tk-progress">
              <div class="tk-progress-track">
                <div class="tk-progress-fill" data-module-progress-fill="module8"></div>
              </div>
              <p class="tk-progress-label">
                <span data-module-progress-label="module8">0%</span> complete
                <span class="tk-progress-desc" data-module-progress-desc="module8"></span>
              </p>
            </div>

            <!-- Status toggle -->
            <div class="tk-exam-toggle">
              <span class="tk-exam-toggle-label">Status: Not completed</span>
              <label class="tk-exam-switch">
                <input type="checkbox" data-module-toggle="module8">
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/module8" class="tk-btn tk-btn-sm tk-btn-primary">
              Open questions<span class="arrow">→</span>
            </a>
            <a href="#/module8-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>

        <!-- Final mock exam -->
        <article class="tk-card" data-exam-id="final-exam">
          <div class="tk-card-header">
            <div>
              <h3 class="tk-card-title">Final mock exam – all modules</h3>
              <p class="tk-card-subtitle">
                One combined paper drawing questions from Modules 1, 2, 3, 5, 6, 7 &amp; 8.
              </p>
            </div>
            <span class="tk-pill-status is-complete">
              <span class="dot"></span> Mock paper ready
            </span>
          </div>
          <div class="tk-card-body">
            <p>
              A exam styled practice exam with 14 structured questions covering the full range
              of written modules. Ideal as a final check before a real exam or association
              assessment session.
            </p>
          </div>
          <div class="tk-card-footer">
            <!-- CHANGED -->
            <a href="#/final-exam" class="tk-btn tk-btn-sm tk-btn-primary">
              Open mock exam<span class="arrow">→</span>
            </a>
            <a href="#/final-exam-answers" class="tk-btn tk-btn-sm tk-btn-secondary">
              View model answers
            </a>
          </div>
        </article>
      </div>
    </section>
  `;

  // Wire up export, reset, progress bars, status toggles
  initModulesLogic();
}
