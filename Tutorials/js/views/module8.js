// tutorials-js/views/module8.js
// SPA view for "Module 8 – Management, Health & History" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule8(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Management, Health &amp; History</h2>
        <p class="tk-content-subtitle">
          Use these questions to revise the development of modern beekeeping, the impact of disease, and how history shapes current practice.
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
          Work through the questions first, then open
          <strong>module8-answers</strong> to compare with the model answers and notes.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – History of hive design &amp; early management</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Questions on skeps, early hive development, Langstroth, bee space and how historic practices shaped modern beekeeping.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – Skeps vs modern hives</h4>
        <p>
          Describe the main differences between traditional skepp beekeeping and modern movable-frame beekeeping.
        </p>
      </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – Langstroth’s contribution</h4>
        <p>
          Explain the role of Rev. L. L. Langstroth in the development of modern hive design.
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – Bee space</h4>
        <p>
          Why was the discovery of “bee space” a significant moment in beekeeping history?
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Skeps: pros and cons</h4>
        <p>
          List three advantages and three disadvantages of historic straw skeps.
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Pre-frame honey harvest</h4>
        <p>
          Describe how honey was harvested before the introduction of framed hives and explain why this method is now unsuitable.
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Colony health</h4>
        <p>
          What is meant by the term “colony health”? Give four indicators of a healthy colony.
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Stress factors</h4>
        <p>
          Outline three common stress factors that can weaken honey bee colonies.
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Apiary hygiene</h4>
        <p>
          Explain the role of good apiary hygiene in preventing disease spread.
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Queen excluders</h4>
        <p>
          How did the development of queen excluders change the way honey is produced and harvested?
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Swarm control</h4>
        <p>
          Compare early methods of swarm control with modern techniques such as artificial swarms.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Health, disease and changing practices</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Focus on colony health, stress factors, disease control and how equipment, associations and methods evolved.
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Major historical influence</h4>
        <p>
          What historical event or period had the biggest impact on modern beekeeping practices? Explain why.
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Use of smoke</h4>
        <p>
          Describe how smoke has traditionally been used in hive management and how its use has evolved.
        </p>
      </section>

      <!-- Q13 -->
      <section>
        <h4>Question 13 – Varroa’s impact</h4>
        <p>
          Explain how the introduction of varroa changed beekeeping practices from the 1990s onward.
        </p>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – Hive materials</h4>
        <p>
          What were the typical materials used for hives in the 1800s, and how do these compare to modern materials?
        </p>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – Historic breeding aims</h4>
        <p>
          Give three examples of historic aims of bee breeding by beekeepers and explain whether these aims still apply today.
        </p>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Beekeeping associations</h4>
        <p>
          Describe the role of beekeeping associations in the development of education and good practice.
        </p>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Winter feeding</h4>
        <p>
          How and why have recommended winter feeding practices evolved over the last century?
        </p>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Skep-making</h4>
        <p>
          Explain the traditional process of skep-making and its cultural significance.
        </p>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Extraction methods</h4>
        <p>
          What were the limitations of early honey extraction techniques, and how did the centrifugal extractor improve the process?
        </p>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Observation hives</h4>
        <p>
          Describe the historical use of observation hives and their educational value.
        </p>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Modern lessons from historical practice</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Questions on regulation, climate, record-keeping and what today’s beekeepers can learn from past approaches.
        </p>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Drone culling</h4>
        <p>
          How have attitudes toward drone culling changed over time, and why?
        </p>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Record-keeping</h4>
        <p>
          Explain why record-keeping is now considered an essential management tool whereas many historical beekeepers kept minimal records.
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – Early naturalists and authors</h4>
        <p>
          Describe the influence of early naturalists and authors such as Huber or Cheshire on beekeeping understanding.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Disease control and hive design</h4>
        <p>
          How did the movement from fixed-comb to movable-comb hives affect disease control?
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Protective clothing</h4>
        <p>
          Outline the historical development of protective clothing and how it contrasts with modern PPE.
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Queen-rearing methods</h4>
        <p>
          Describe early queen-rearing methods and compare them to modern systems such as grafting.
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – World wars and honey</h4>
        <p>
          What role did world wars play in shaping honey production in the UK?
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Honey adulteration</h4>
        <p>
          Explain why honey adulteration became a historic issue and how regulation evolved to address it.
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – Climate change awareness</h4>
        <p>
          Discuss how climate change awareness is influencing modern beekeeping compared with historic approaches.
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Lessons from historic practice</h4>
        <p>
          What lessons can a modern beekeeper or bee farmer still learn from historic practices that are still relevant today?
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module8-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      <a href="#/modules" class="tk-btn tk-btn-primary">
        Back to module overview<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module8.html");
}
