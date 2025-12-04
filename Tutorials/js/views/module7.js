// tutorials-js/views/module7.js
// SPA view for "Module 7 – Selection & Breeding" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule7(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Selection &amp; Breeding</h2>
        <p class="tk-content-subtitle">
          Answer these questions in your notebook first, then compare with the model answers to check your understanding.
        </p>
      </div>
      <div class="tk-page-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary tk-print-hide"
          onclick="window.print()">
          Print questions
        </button>

        <a href="#/modules" class="tk-btn tk-btn-secondary">
          Back to modules
        </a>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft);">
          Try to answer without notes if you can. When you are ready, open
          <strong>module7-answers</strong> to compare your responses with the model answers and marking hints.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Breeding goals &amp; basic genetics</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Questions on why we breed bees, key desirable traits, basic genetics and how mating systems affect selection.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – Purpose of selective breeding</h4>
        <p>
          What is the primary purpose of selective breeding in honey bees?
        </p>
      </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – Desirable traits</h4>
        <p>
          List four desirable traits a beekeeper may select for when breeding queens.
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – Genotype and phenotype</h4>
        <p>
          Explain the difference between genotype and phenotype in honey bee selection.
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Temperament</h4>
        <p>
          Why is temperament considered a heritable trait, and why is it important?
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Open mating</h4>
        <p>
          Define “open mating” and describe one limitation of relying on it.
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Instrumental insemination</h4>
        <p>
          What is instrumental insemination, and when might it be used in bee breeding?
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Drone congregation areas</h4>
        <p>
          Describe the role of drone congregation areas (DCAs) in mating success.
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Drone quality</h4>
        <p>
          How can a beekeeper encourage the production of high-quality drones?
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Environment and mating</h4>
        <p>
          What environmental factors influence queen mating success?
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Genetic diversity</h4>
        <p>
          Explain why genetic diversity is important for colony resilience.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Hygienic traits, mating systems &amp; queen rearing</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Focus on hygienic behaviour, inbreeding, mating conditions and practical queen-rearing methods.
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Hygienic behaviour tests</h4>
        <p>
          Describe one method for monitoring inheritance of hygienic behaviour in colonies.
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Breeder queen</h4>
        <p>
          What is a “breeder queen,” and how is she typically evaluated?
        </p>
      </section>

      <!-- Q13 -->
      <section>
        <h4>Question 13 – Inbreeding drawbacks</h4>
        <p>
          List three drawbacks of inbreeding in honey bee populations.
        </p>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – Pin or liquid nitrogen test</h4>
        <p>
          Explain the principle behind the “pin test” or “liquid nitrogen test”.
        </p>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – Weather and mating flights</h4>
        <p>
          Why do queen mating flights usually require several days of good weather?
        </p>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Well-mated queen indicators</h4>
        <p>
          Describe two indicators of a well-mated laying queen.
        </p>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Drone saturation</h4>
        <p>
          How can drone saturation help influence mating outcomes?
        </p>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Closed breeding system</h4>
        <p>
          What is meant by a “closed breeding system” in honey bees?
        </p>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Simple queen-rearing method</h4>
        <p>
          Describe a simple queen-rearing method suitable for beginners.
        </p>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Breeding and treatments</h4>
        <p>
          How can selective breeding help reduce reliance on chemical treatments?
        </p>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Assessing stock &amp; managing a breeding programme</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Questions on temperament, productivity, queen and worker assessment and maintaining breeding lines over time.
        </p>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Temperament in inspections</h4>
        <p>
          Explain why colony temperament is often noticed early in an inspection.
        </p>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Productivity and breeding</h4>
        <p>
          What role does colony productivity play in breeding decisions?
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – Supersedure vs swarming</h4>
        <p>
          Describe the term “supersedure,” and how it differs from swarming.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Nurse bees and queen cells</h4>
        <p>
          Why are nurse bees important during queen cell development?
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Consistency of worker behaviour</h4>
        <p>
          How can a beekeeper assess the consistency of worker behaviour across seasons?
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Assessing virgin queens</h4>
        <p>
          List two morphological qualities evaluated when examining virgin queens.
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – Mating nucs</h4>
        <p>
          What is a mating nuc, and why is it used in queen rearing?
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Culling queen cells</h4>
        <p>
          Explain the purpose of culling poor-quality queen cells.
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – Heritability</h4>
        <p>
          What is meant by “heritability,” and how does it affect trait selection?
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Long-term breeding line challenges</h4>
        <p>
          Describe one challenge of maintaining a controlled breeding line over many years.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module7-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      <a href="#/module8" class="tk-btn tk-btn-primary">
        Continue to Module 8 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module7.html");
}
