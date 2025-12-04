// tutorials-js/views/module3.js
// SPA view for "Module 3 – Pests, Diseases & Poisoning" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule3(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Pests, Diseases & Poisoning</h2>
        <p class="tk-content-subtitle">
          Mix of short-answer, multiple-choice and longer written questions. Check your answers using the
          separate model answers page.
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
          In a live app you could track your scores over time. Here, simply attempt the questions, then
          open <strong>module3-answers</strong> to compare.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Short-answer questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Aim for concise, focused answers covering the key points.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – Healthy brood</h4>
        <p>
          Describe the appearance of healthy sealed worker brood on a comb, and explain why recognising it is important.
        </p>
      </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – Signs of brood disease</h4>
        <p>
          Give four general signs that may make you suspect brood disease during an inspection.
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – Adult bee disease vs brood disease</h4>
        <p>
          Briefly explain the difference between an adult bee disease and a brood disease, giving one example of each.
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Varroa as a parasite</h4>
        <p>
          In simple terms, explain why varroa mites are such a serious threat to honey bee colonies.
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Monitoring varroa</h4>
        <p>
          Describe two methods a beekeeper can use to monitor varroa levels in a colony.
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Integrated pest management (IPM)</h4>
        <p>
          What is meant by “integrated pest management” in the context of varroa control?
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Notifiable disease</h4>
        <p>
          What is a notifiable bee disease, and what should a beekeeper do if they suspect one is present?
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Nosema</h4>
        <p>
          Give two symptoms or signs that might lead you to suspect a Nosema problem in a colony.
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Small hive beetle (general)</h4>
        <p>
          Briefly describe why small hive beetle is a concern to beekeepers, even in countries where it is
          not yet established.
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Wax moth</h4>
        <p>
          How does wax moth damage comb, and what management steps can reduce its impact on stored comb?
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Robbing</h4>
        <p>
          What is robbing, and why can it be a problem in relation to disease spread?
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Pesticide poisoning</h4>
        <p>
          List three signs that might make you suspect pesticide poisoning of a colony.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Choose the best answer in each case.
        </p>
      </section>

      <!-- Q13 -->
      <section>
        <h4>Question 13 – Chalkbrood</h4>
        <p class="tk-quick-check-question">
          Chalkbrood primarily affects:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q13" />Adult bees.</label>
          <label><input type="radio" name="m3q13" />Brood, which becomes mummified and chalk-like.</label>
          <label><input type="radio" name="m3q13" />Only the queen.</label>
        </div>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – American foulbrood (AFB)</h4>
        <p class="tk-quick-check-question">
          Which statement best describes a feature commonly associated with American foulbrood?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q14" />Ropy larval remains and sunken, perforated cappings.</label>
          <label><input type="radio" name="m3q14" />White, chalky mummies in cells.</label>
          <label><input type="radio" name="m3q14" />Adult bees with deformed wings.</label>
        </div>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – European foulbrood (EFB)</h4>
        <p class="tk-quick-check-question">
          European foulbrood is typically found:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q15" />In sealed brood only.</label>
          <label><input type="radio" name="m3q15" />Mostly in unsealed larvae, often twisted in their cells with a patchy brood pattern.</label>
          <label><input type="radio" name="m3q15" />Only in drone brood.</label>
        </div>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Varroa reproduction</h4>
        <p class="tk-quick-check-question">
          Varroa mites reproduce:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q16" />On adult bees only, away from brood.</label>
          <label><input type="radio" name="m3q16" />Inside sealed brood cells, especially drone brood.</label>
          <label><input type="radio" name="m3q16" />On flowers while bees are foraging.</label>
        </div>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Varroa damage</h4>
        <p class="tk-quick-check-question">
          One of the main ways varroa harms colonies is by:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q17" />Increasing the number of drones.</label>
          <label><input type="radio" name="m3q17" />Feeding on bees and spreading harmful viruses.</label>
          <label><input type="radio" name="m3q17" />Making comb brittle.</label>
        </div>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Nosema signs</h4>
        <p class="tk-quick-check-question">
          Nosema problems may show as:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q18" />Abundant solid brood with excellent pattern.</label>
          <label><input type="radio" name="m3q18" />Dysentery-like spotting around hive entrance and weakened colonies.</label>
          <label><input type="radio" name="m3q18" />Only chalky mummies.</label>
        </div>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Tracheal mites (Acarapis woodi)</h4>
        <p class="tk-quick-check-question">
          Tracheal mites primarily infest:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q19" />The queen’s abdomen only.</label>
          <label><input type="radio" name="m3q19" />The airways (tracheae) of adult bees.</label>
          <label><input type="radio" name="m3q19" />Wax comb in supers.</label>
        </div>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Pesticide poisoning sign</h4>
        <p class="tk-quick-check-question">
          Which of the following is most suggestive of acute pesticide poisoning?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q20" />A few old bees crawling due to age.</label>
          <label><input type="radio" name="m3q20" />Large numbers of dead or trembling bees in front of the hive soon after spraying nearby crops.</label>
          <label><input type="radio" name="m3q20" />A completely empty brood nest in mid-winter.</label>
        </div>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Hygienic behaviour</h4>
        <p class="tk-quick-check-question">
          Hygienic bees help control disease by:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q21" />Reducing foraging.</label>
          <label><input type="radio" name="m3q21" />Detecting and removing diseased or dead brood.</label>
          <label><input type="radio" name="m3q21" />Building smaller cells.</label>
        </div>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Equipment disinfection</h4>
        <p class="tk-quick-check-question">
          Why might a beekeeper scorch hive boxes with a blowtorch (following official guidance)?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m3q22" />To change the colour of the hive.</label>
          <label><input type="radio" name="m3q22" />To help disinfect wooden surfaces after disease, where allowed.</label>
          <label><input type="radio" name="m3q22" />To chase bees out before inspection.</label>
        </div>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These call for structured answers using several points and clear explanations.
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – Inspecting for brood disease</h4>
        <p>
          Describe how you would examine brood combs during an inspection specifically to check for serious
          brood diseases. Include what you would look for and how you would handle suspicious comb.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Varroa treatment choices</h4>
        <p>
          Outline the main types of varroa control a beekeeper might use as part of an integrated approach
          (chemical and non-chemical), and explain why relying on a single treatment repeatedly can be risky.
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Suspected foulbrood</h4>
        <p>
          You suspect foulbrood in one of your colonies. Explain the steps you should take from the point of
          suspicion through to working with the bee inspector or authority, including how you would protect your
          other colonies and other beekeepers.
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Disease spread between apiaries</h4>
        <p>
          Discuss the main ways that diseases and pests can spread between colonies and apiaries, and list
          practical steps a beekeeper can take to reduce those risks.
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – Recognising chronic problems</h4>
        <p>
          A beekeeper reports that their colonies “never really thrive”, often dwindling or failing to build up.
          Describe several possible underlying disease or pest-related reasons and how you would investigate.
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Recording disease incidents</h4>
        <p>
          Explain why accurate records of disease, treatments and colony losses are important, and how they can
          help both the individual beekeeper and the wider beekeeping community.
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – After a pesticide incident</h4>
        <p>
          If you strongly suspect that your bees have suffered pesticide poisoning, describe the actions you
          should take and how you might work with farmers, beekeeping associations and authorities afterwards.
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Biosecurity plan</h4>
        <p>
          Write a brief “biosecurity plan” for your apiary, listing simple day-to-day practices that support
          good disease control and early detection of problems.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module3-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      <a href="#/module5" class="tk-btn tk-btn-primary">
        Continue to Module 5 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module3.html");
}
