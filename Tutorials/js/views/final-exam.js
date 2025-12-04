// Tutorials/js/views/final-exam.js
// SPA view for the "Final mock exam" questions page
// This is the content from final-exam.html inside <section class="tk-content">…</section>
import { initAnswerBlocks } from "../answers-logic.js";
export function renderFinalExam(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Mock exam</div>
        <h2 class="tk-content-title">Final practice paper – 14 structured questions</h2>
        <p class="tk-content-subtitle">
          Aim to answer in one sitting. Suggested time: approximately 90 minutes.
        </p>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <h3 style="margin-top:0;">How to use this mock paper</h3>
        <ul style="font-size:0.86rem; color:var(--text-soft); padding-left:1.2rem;">
          <li>Work in exam-style conditions if possible (no notes, timed).</li>
          <li>Answer in a separate notebook or document – leave space to add improvements later.</li>
          <li>When finished, mark yourself using <strong>final-exam-answers</strong>.</li>
          <li>Note which <strong>modules</strong> you find hardest and go back to those practice sets.</li>
        </ul>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:16px;">

      <!-- Section 1 -->
      <section>
        <h3>Section 1 – Management &amp; Manipulation (Module 1)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Focus on practical apiary work, inspections and seasonal management.
        </p>
      </section>

      <section>
        <h4>Question 1 – First full inspection of the season</h4>
        <p>
          Describe how you would carry out the first full inspection of a colony in spring.
          Include preparation, the sequence of checking frames, and the main things you are
          looking for.
        </p>
      </section>

      <section>
        <h4>Question 2 – Artificial swarm</h4>
        <p>
          Explain the purpose of an artificial swarm and outline one recognised method
          for carrying it out.
        </p>
      </section>

      <!-- Section 2 -->
      <section>
        <h3>Section 2 – Products &amp; Forage (Module 2)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Honey, wax and forage sources through the season.
        </p>
      </section>

      <section>
        <h4>Question 3 – Nectar flow and apiary management</h4>
        <p>
          What is meant by a “nectar flow”, and how should a beekeeper prepare a colony
          to make best use of it?
        </p>
      </section>

      <section>
        <h4>Question 4 – Honey extraction</h4>
        <p>
          Describe the main steps in extracting ripe honey from supers and preparing it
          for sale or storage.
        </p>
      </section>

      <!-- Section 3 -->
      <section>
        <h3>Section 3 – Pests, Diseases &amp; Poisoning (Module 3)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Diagnosis, statutory controls and routine monitoring.
        </p>
      </section>

      <section>
        <h4>Question 5 – Foulbrood recognition</h4>
        <p>
          Compare and contrast the main clinical signs of European foulbrood (EFB)
          and American foulbrood (AFB).
        </p>
      </section>

      <section>
        <h4>Question 6 – Varroa monitoring</h4>
        <p>
          Describe one method for monitoring varroa levels in a colony and explain how
          you would use the results to decide on treatment.
        </p>
      </section>

      <!-- Section 4 -->
      <section>
        <h3>Section 4 – Honey Bee Biology (Module 5)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Anatomy, brood development and life cycle.
        </p>
      </section>

      <section>
        <h4>Question 7 – Worker development</h4>
        <p>
          Outline the stages in the development of a worker bee from egg to emergence,
          including timescales.
        </p>
      </section>

      <section>
        <h4>Question 8 – Worker anatomy</h4>
        <p>
          Describe three structural features of a worker bee and explain how each is
          adapted to her role in the colony.
        </p>
      </section>

      <!-- Section 5 -->
      <section>
        <h3>Section 5 – Behaviour (Module 6)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Communication, defence and colony organisation.
        </p>
      </section>

      <section>
        <h4>Question 9 – Swarm behaviour</h4>
        <p>
          Describe the behaviour of a colony in the days leading up to swarming and the
          behaviour of the swarm immediately after leaving the hive.
        </p>
      </section>

      <section>
        <h4>Question 10 – Defensive response</h4>
        <p>
          Explain how alarm pheromones and guard bees contribute to the defensive behaviour
          of a colony, and how a beekeeper can minimise triggering this response.
        </p>
      </section>

      <!-- Section 6 -->
      <section>
        <h3>Section 6 – Selection &amp; Breeding (Module 7)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Traits, mating and basic breeding strategies.
        </p>
      </section>

      <section>
        <h4>Question 11 – Choosing breeder colonies</h4>
        <p>
          List the main factors you would consider when selecting colonies to breed
          queens from for your own apiary.
        </p>
      </section>

      <section>
        <h4>Question 12 – Open mating and drone colonies</h4>
        <p>
          In an open mating situation, how can a beekeeper influence which drones
          queens are most likely to mate with?
        </p>
      </section>

      <!-- Section 7 -->
      <section>
        <h3>Section 7 – Management, Health &amp; History (Module 8)</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Historic developments and lessons for modern beekeeping.
        </p>
      </section>

      <section>
        <h4>Question 13 – Movable-frame hives and disease control</h4>
        <p>
          Explain how the introduction of movable-frame hives improved disease
          diagnosis and control compared with earlier fixed-comb systems.
        </p>
      </section>

      <section>
        <h4>Question 14 – Learning from history</h4>
        <p>
          Give two examples of how historical beekeeping practices still influence
          modern management, and briefly explain what we have learned from them.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/final-exam-answers" class="tk-btn tk-btn-secondary">
        View mock exam model answers
      </a>
      <a href="#/modules" class="tk-btn tk-btn-primary">
        Back to module overview<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "final-exam.html");
}
