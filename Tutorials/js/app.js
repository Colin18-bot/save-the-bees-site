// Tutorials/js/app.js
// Main SPA router for BeezKnees Training (Tutorials/index.html)

import { renderHome } from "./views/home.js";
import { renderModules } from "./views/modules.js";
import { renderStudyTips } from "./views/studyTips.js";
import { renderGlossary } from "./views/glossary.js";
import { renderNotes } from "./views/notes.js";
import { renderProgress } from "./views/progress.js";

import { renderFinalExam } from "./views/final-exam.js";
import { renderFinalExamAnswers } from "./views/final-exam-answers.js";

import { renderModule1 } from "./views/module1.js";
import { renderModule2 } from "./views/module2.js";
import { renderModule3 } from "./views/module3.js";
import { renderModule5 } from "./views/module5.js";
import { renderModule6 } from "./views/module6.js";
import { renderModule7 } from "./views/module7.js";
import { renderModule8 } from "./views/module8.js";

import { renderModule1Answers } from "./views/module1-answers.js";
import { renderModule2Answers } from "./views/module2-answers.js";
import { renderModule3Answers } from "./views/module3-answers.js";
import { renderModule5Answers } from "./views/module5-answers.js";
import { renderModule6Answers } from "./views/module6-answers.js";
import { renderModule7Answers } from "./views/module7-answers.js";
import { renderModule8Answers } from "./views/module8-answers.js";

// Training views
import { renderModule1Training } from "./views/module1-training.js";
import { renderModule2Training } from "./views/module2-training.js";
import { renderModule3Training } from "./views/module3-training.js";
import { renderModule5Training } from "./views/module5-training.js";
import { renderModule6Training } from "./views/module6-training.js";
import { renderModule7Training } from "./views/module7-training.js";
import { renderModule8Training } from "./views/module8-training.js";

// ROUTE TABLE
const routes = {
  // Core pages
  "/home": {
    label: "Training & exam dashboard",
    render: renderHome,
  },
  "/modules": {
    label: "Module overview",
    render: renderModules,
  },
  "/study-tips": {
    label: "Study tips",
    render: renderStudyTips,
  },
  "/glossary": {
    label: "Glossary",
    render: renderGlossary,
  },
  "/notes": {
    label: "My notes",
    render: renderNotes,
  },
  "/progress": {
    label: "My exam progress",
    render: renderProgress,
  },

  // Final mock exam
  "/final-exam": {
    label: "Final mock exam",
    render: renderFinalExam,
  },
  "/final-exam-answers": {
    label: "Final mock exam – model answers",
    render: renderFinalExamAnswers,
  },

  // Module 1 – Honey Bee Management
  "/module1": {
    label: "Module 1 – Honey Bee Management",
    render: renderModule1,
  },
  "/module1-answers": {
    label: "Module 1 – model answers",
    render: renderModule1Answers,
  },
  "/module1-training": {
    label: "Module 1 – Training",
    render: renderModule1Training,
  },

  // Module 2 – Honey Bee Products & Forage
  "/module2": {
    label: "Module 2 – Honey Bee Products & Forage",
    render: renderModule2,
  },
  "/module2-answers": {
    label: "Module 2 – model answers",
    render: renderModule2Answers,
  },
  "/module2-training": {
    label: "Module 2 – Training",
    render: renderModule2Training,
  },

  // Module 3 – Honey Bee Pests, Diseases & Poisoning
  "/module3": {
    label: "Module 3 – Honey Bee Pests, Diseases & Poisoning",
    render: renderModule3,
  },
  "/module3-answers": {
    label: "Module 3 – model answers",
    render: renderModule3Answers,
  },
  "/module3-training": {
    label: "Module 3 – Training",
    render: renderModule3Training,
  },

  // Module 5 – Honey Bee Biology
  "/module5": {
    label: "Module 5 – Honey Bee Biology",
    render: renderModule5,
  },
  "/module5-answers": {
    label: "Module 5 – model answers",
    render: renderModule5Answers,
  },
  "/module5-training": {
    label: "Module 5 – Training",
    render: renderModule5Training,
  },

  // Module 6 – Honey Bee Behaviour
  "/module6": {
    label: "Module 6 – Honey Bee Behaviour",
    render: renderModule6,
  },
  "/module6-answers": {
    label: "Module 6 – model answers",
    render: renderModule6Answers,
  },
  "/module6-training": {
    label: "Module 6 – Training",
    render: renderModule6Training,
  },

  // Module 7 – Selection & Breeding of Honey Bees
  "/module7": {
    label: "Module 7 – Selection & Breeding of Honey Bees",
    render: renderModule7,
  },
  "/module7-answers": {
    label: "Module 7 – model answers",
    render: renderModule7Answers,
  },
  "/module7-training": {
    label: "Module 7 – Training",
    render: renderModule7Training,
  },

  // Module 8 – Management, Health & History
  "/module8": {
    label: "Module 8 – Management, Health & History",
    render: renderModule8,
  },
  "/module8-answers": {
    label: "Module 8 – model answers",
    render: renderModule8Answers,
  },
  "/module8-training": {
    label: "Module 8 – Training",
    render: renderModule8Training,
  },
};

// Grab the dynamic content area (<section id="app" class="tk-content">)
function getContentContainer() {
  const el = document.getElementById("app");
  if (!el) {
    console.error("Could not find #app container for SPA rendering");
  }
  return el;
}

// Turn a hash like "#/modules" into "/modules"
function getPathFromHash() {
  const hash = window.location.hash || "";
  if (!hash || hash === "#" || hash === "#/") {
    return "/home";
  }
  if (hash.startsWith("#")) {
    return hash.slice(1); // remove leading "#"
  }
  return "/home";
}

// Update the pill text in the topbar and document title
function updateChrome(label) {
  const pillLabel = document.querySelector(".tk-pill-label");
  if (pillLabel && label) {
    pillLabel.textContent = label;
  }
  if (label) {
    document.title = `BeezKnees Training – ${label}`;
  } else {
    document.title = "BeezKnees Training";
  }
}

// Highlight the active nav item in the sidebar
function updateNavActive(path) {
  const links = document.querySelectorAll(".tk-nav-link");

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href === `#${path}`) {
      link.classList.add("is-current");
    } else {
      link.classList.remove("is-current");
    }
  });
}

// Render the current route into #app
function renderCurrentRoute() {
  const container = getContentContainer();
  if (!container) return;

  const path = getPathFromHash();
  const route = routes[path] || routes["/home"];

  route.render(container);
  updateChrome(route.label);
  updateNavActive(path);
}

// Listen for hash changes (e.g. clicking sidebar links)
window.addEventListener("hashchange", () => {
  renderCurrentRoute();
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    window.location.hash = "#/home";
  } else {
    renderCurrentRoute();
  }
});
