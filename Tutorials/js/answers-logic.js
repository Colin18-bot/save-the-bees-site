// Tutorials/js/answers-logic.js
// Injects "Your answer" textareas under each written question heading.
// Replaces the old tutorial-js/exam-answers.js for the SPA.

const ANSWERS_STORAGE_KEY = "bk_exam_answers_v1";

// Load all saved answers
function loadAllAnswers() {
  try {
    const raw = localStorage.getItem(ANSWERS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Save all answers
function saveAllAnswers(obj) {
  try {
    localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // ignore quota errors etc.
  }
}

/**
 * Initialise answer boxes within a rendered module page.
 *
 * @param {HTMLElement} container - The root container for the view.
 * @param {string} moduleSlug    - A stable slug for this module, e.g. "module1.html".
 */
export function initAnswerBlocks(container, moduleSlug) {
  if (!container) return;

  // All the questions live inside .tk-reading in your module views
  const reading = container.querySelector(".tk-reading");
  if (!reading) return;

  const slug = moduleSlug || "training-module";

  const data = loadAllAnswers();

  // Treat each <h4> as the start of a question,
  // but SKIP any <h4> that lives in a section containing .tk-quick-check-options (MCQ)
  const headings = reading.querySelectorAll("h4");

  headings.forEach((h4) => {
    const questionId = h4.textContent.trim();
    if (!questionId) return;

    // Find the nearest <section> ancestor of this h4
    const parentSection = h4.closest("section");

    // If this section contains a MCQ options block, skip adding a textarea
    if (
      parentSection &&
      parentSection.querySelector(".tk-quick-check-options")
    ) {
      return; // <-- THIS is what stops MCQs from getting boxes
    }

    // Build a stable key: "module1.html::Question 1 – Routine inspection aims"
    const key = `${slug}::${questionId}`;

    // Create the answer block
    const block = document.createElement("section");
    block.className = "tk-answer-block";

    const label = document.createElement("label");
    label.className = "tk-answer-label";
    label.textContent = "Your answer (saved in this browser only):";

    const textarea = document.createElement("textarea");
    textarea.className = "tk-answer-textarea";

    // Restore previous answer if present
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      textarea.value = data[key];
    }

    textarea.addEventListener("input", () => {
      const all = loadAllAnswers();
      const value = textarea.value;
      if (value && value.trim().length > 0) {
        all[key] = value;
      } else {
        delete all[key];
      }
      saveAllAnswers(all);
    });

    const actionsWrap = document.createElement("div");
    actionsWrap.className = "tk-answer-actions";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "tk-answer-clear";
    clearBtn.textContent = "Clear answer";

    clearBtn.addEventListener("click", () => {
      if (!textarea.value) return;
      const confirmed = window.confirm(
        "Clear your typed answer for this question?"
      );
      if (!confirmed) return;

      textarea.value = "";
      const all = loadAllAnswers();
      delete all[key];
      saveAllAnswers(all);
    });

    actionsWrap.appendChild(clearBtn);

    block.appendChild(label);
    block.appendChild(textarea);
    block.appendChild(actionsWrap);

    // Insert after the first paragraph under the heading if it exists,
    // otherwise directly after the heading.
    let insertTarget = h4.nextElementSibling;
    if (insertTarget) {
      insertTarget.insertAdjacentElement("afterend", block);
    } else {
      h4.insertAdjacentElement("afterend", block);
    }
  });
}
