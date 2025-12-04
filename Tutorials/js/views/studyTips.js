// Tutorials/js/views/studyTips.js
// SPA view for "BeezKnees Training – Exam Study Tips"

export function renderStudyTips(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Guidance</div>
        <h2 class="tk-content-title">Make the most of your revision time</h2>
        <p class="tk-content-subtitle">
          These are suggestions only – always follow your association’s official syllabus and guidance.
        </p>
      </div>
    </header>

    <section class="tk-card">
      <div class="tk-card-body tk-reading">
        <h3>1. Plan your route through the modules</h3>
        <p>
          Start by looking at the <strong>Written exam modules – overview</strong> page. Decide which
          modules you are aiming to sit and when. Use the small completion toggle on each module card
          to keep track of what you’ve already revised.
        </p>

        <h3>2. Use the questions before the model answers</h3>
        <p>
          On each module page, read the question, then use the <strong>Your answer</strong> box to write
          your own response before looking at the model answer. Try to work without notes the first time;
          you can always repeat with your notes open later.
        </p>

        <h3>3. Treat the mock exam as a “dress rehearsal”</h3>
        <p>
          The final mock exam combines questions across all modules. Set aside some quiet time, use a
          timer, and answer as many questions as you can in one sitting. Afterwards, compare your
          answers with the model solutions and note any weak areas.
        </p>

        <h3>4. Build your own summary notes</h3>
        <p>
          After marking your practice answers, jot down short bullet points on anything you missed or
          were unsure about. Over time this becomes a personalised “cheat sheet” of topics to revisit.
        </p>

        <h3>5. Mix written work with practical experience</h3>
        <p>
          Where possible, connect written topics with what you see in your own colonies or training
          apiary sessions. For example, when revising swarm control, make notes during or after a
          real artificial swarm operation.
        </p>

        <h3>6. Study in small, regular chunks</h3>
        <p>
          Little and often usually works better than one long cram session. Even 15–20 minutes on a
          couple of questions, several times a week, will add up quickly.
        </p>

        <h3>7. Talk through answers with other beekeepers</h3>
        <p>
          If you’re part of a study group, try answering a question independently, then compare
          approaches. Different explanations can help to “click” tricky topics into place.
        </p>

        <h3>8. Before the real exam</h3>
        <ul>
          <li>Revisit questions you found difficult and see if your answers have improved.</li>
          <li>Skim your summary notes rather than trying to re-read everything from scratch.</li>
          <li>Use the mock exam again as a quick confidence check.</li>
        </ul>
      </div>
    </section>
  `;
}
