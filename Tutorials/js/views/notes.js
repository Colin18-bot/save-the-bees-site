// Tutorials/js/views/notes.js
// SPA view for "My notes"

export function renderNotes(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Notes</div>
        <h2 class="tk-content-title">My notes</h2>
        <p class="tk-content-subtitle">
          A simple scratchpad for your own revision notes. Stored in this browser only.
        </p>
      </div>
    </header>

    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft); margin-bottom:0.5rem;">
          Use this space for mnemonics, tricky points to revisit, or reminders from your study group.
          These notes never leave your device – they’re not synced with your BeezKnees account.
        </p>

        <textarea id="bk-notes-textarea" class="tk-notes-textarea" placeholder="Type your notes here…"></textarea>

        <div class="tk-notes-actions">
          <button id="bk-notes-clear" class="tk-btn tk-btn-sm tk-btn-secondary" type="button">
            Clear notes
          </button>
        </div>

        <p class="tk-notes-hint">
          Notes are saved automatically in this browser. Clearing notes will remove them straight away.
        </p>
      </div>
    </section>
  `;

  const STORAGE_KEY = "bk_notes_main";
  const textarea = container.querySelector("#bk-notes-textarea");
  const clearBtn = container.querySelector("#bk-notes-clear");

  // Load saved notes
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      textarea.value = saved;
    }
  } catch {
    // ignore
  }

  // Save on input
  textarea.addEventListener("input", () => {
    try {
      localStorage.setItem(STORAGE_KEY, textarea.value);
    } catch {
      // ignore quota errors
    }
  });

  // Clear notes immediately + from storage
  clearBtn.addEventListener("click", () => {
    if (!textarea.value) return;
    const confirmed = window.confirm("Clear all notes on this page? This cannot be undone.");
    if (!confirmed) return;

    textarea.value = "";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  });
}
