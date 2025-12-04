// tutorials-js/views/module2.js
// SPA view for "Module 2 – Honey Bee Products & Forage" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule2(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Products & Forage</h2>
        <p class="tk-content-subtitle">
          Mix of short-answer, multiple-choice and longer written questions covering bee products and
          the plants they depend on.
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
          Try answering without notes first, then compare with
          <strong>module2-answers</strong>. Use these as revision prompts, not predictions of
          any specific exam paper.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Short-answer questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Short written answers, typically a few bullet points or a paragraph.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – What is honey?</h4>
        <p>
          In your own words, describe what honey is and how bees produce it from nectar.
        </p>
      </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – Ripening of honey</h4>
        <p>
          Explain what is meant by “ripe” honey in the hive, and how bees achieve this.
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – High water content risks</h4>
        <p>
          Why is a high water content in extracted honey a problem for the beekeeper? Give two possible consequences.
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Crystallisation</h4>
        <p>
          Some honeys granulate quickly. List three factors that influence how fast honey will crystallise.
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Comb honey vs extracted honey</h4>
        <p>
          Give two advantages and two disadvantages of producing comb honey compared with extracted honey.
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Beeswax sources</h4>
        <p>
          From which parts of the hive can a beekeeper obtain beeswax for processing? Give at least three examples.
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Uses of beeswax</h4>
        <p>
          List four common uses of beeswax by beekeepers or in commercial products.
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Pollen as a resource</h4>
        <p>
          Why is pollen important to the honey bee colony, and what precautions should be taken if pollen is trapped for human use?
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Propolis</h4>
        <p>
          What is propolis, how do bees obtain it, and how might a beekeeper make use of it?
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Water requirements</h4>
        <p>
          Give two reasons why a colony needs water and one management consideration for providing water near the apiary.
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Nectar flows</h4>
        <p>
          Explain what is meant by a “nectar flow” and why it matters to honey production and hive management.
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Forage gaps</h4>
        <p>
          What is a forage gap, and how might it affect colony performance? Suggest one way a beekeeper might reduce its impact.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Choose the best answer for each question.
        </p>
      </section>

      <!-- Q13 -->
      <section>
        <h4>Question 13 – Main sugar types</h4>
        <p class="tk-quick-check-question">
          Which three sugars are most commonly found in ripe honey?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q13" />Glucose, fructose and sucrose.</label>
          <label><input type="radio" name="m2q13" />Lactose, maltose and starch.</label>
          <label><input type="radio" name="m2q13" />Sucrose, cellulose and fructose.</label>
        </div>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – Honey moisture content</h4>
        <p class="tk-quick-check-question">
          Approximately what maximum moisture content is generally recommended for extracted honey to reduce the risk of fermentation?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q14" />Below 14%.</label>
          <label><input type="radio" name="m2q14" />Around 17–18%.</label>
          <label><input type="radio" name="m2q14" />Above 25%.</label>
        </div>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – Honey labelling</h4>
        <p class="tk-quick-check-question">
          Which of the following is usually required on a jar label when selling honey direct to the public (in many jurisdictions)?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q15" />The exact weight, producer contact details and a use-by or best-before date.</label>
          <label><input type="radio" name="m2q15" />Only the beekeeper’s first name.</label>
          <label><input type="radio" name="m2q15" />No information at all.</label>
        </div>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Honey contamination</h4>
        <p class="tk-quick-check-question">
          Which of the following is most likely to contaminate honey if extraction and bottling equipment are not kept clean?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q16" />Dust, mould spores or residues from previous batches.</label>
          <label><input type="radio" name="m2q16" />Excess oxygen from the air.</label>
          <label><input type="radio" name="m2q16" />Nectar still inside the flowers.</label>
        </div>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Floral origin</h4>
        <p class="tk-quick-check-question">
          A “monofloral” honey is best described as:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q17" />Honey made by one colony only.</label>
          <label><input type="radio" name="m2q17" />Honey in which most nectar comes from one predominant plant source.</label>
          <label><input type="radio" name="m2q17" />Honey produced in just one apiary.</label>
        </div>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Pollination value</h4>
        <p class="tk-quick-check-question">
          Which statement best describes the value of bees to forage plants?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q18" />They damage most flowers, reducing seed set.</label>
          <label><input type="radio" name="m2q18" />They often act as important pollinators, increasing fruit and seed production.</label>
          <label><input type="radio" name="m2q18" />They only visit flowers when no nectar is present.</label>
        </div>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Pollen sources</h4>
        <p class="tk-quick-check-question">
          Which of the following is mainly a pollen source rather than a major nectar source for bees?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q19" />Hazel catkins.</label>
          <label><input type="radio" name="m2q19" />Oilseed rape flowers.</label>
          <label><input type="radio" name="m2q19" />Lime (linden) trees.</label>
        </div>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Forage seasons</h4>
        <p class="tk-quick-check-question">
          Which combination correctly matches typical forage to the time of year (in a temperate climate)?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q20" />Ivy – main source in early spring.</label>
          <label><input type="radio" name="m2q20" />Dandelions – often important in spring build-up.</label>
          <label><input type="radio" name="m2q20" />Snowdrops – main nectar source in late summer.</label>
        </div>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Honey handling temperature</h4>
        <p class="tk-quick-check-question">
          Why should honey not be heated to very high temperatures for long periods during processing?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q21" />It becomes radioactive.</label>
          <label><input type="radio" name="m2q21" />It can darken, lose aroma and form more HMF, reducing quality.</label>
          <label><input type="radio" name="m2q21" />It will always ferment immediately.</label>
        </div>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Straining honey</h4>
        <p class="tk-quick-check-question">
          What is the main purpose of straining or filtering honey after extraction?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m2q22" />To remove all pollen.</label>
          <label><input type="radio" name="m2q22" />To remove wax particles, bee parts and other debris.</label>
          <label><input type="radio" name="m2q22" />To remove all sugars.</label>
        </div>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These require structured, multi-point answers.
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – From flower to jar</h4>
        <p>
          Describe the journey of nectar from a flower to a jar of extracted honey, including how bees process it
          and the main steps a beekeeper takes to harvest and bottle it.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Characteristics of good-quality honey</h4>
        <p>
          List and explain the main characteristics of good-quality honey from the consumer’s point of view,
          and mention how beekeeper practice can help achieve these.
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Beeswax processing</h4>
        <p>
          Outline a simple method for processing recovered wax into clean blocks suitable for making foundation
          or candles. Include safety points.
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Forage mapping</h4>
        <p>
          Explain how a beekeeper might assess and map the forage available within flying range of an apiary,
          and how this information can be used to plan colony numbers and expectations for honey crops.
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – Garden planting for bees</h4>
        <p>
          Write a short guide for a gardener who wants to make their garden more bee-friendly, suggesting plants
          for spring, summer and autumn, and explaining why variety over the season matters.
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Crop spraying and forage safety</h4>
        <p>
          Discuss how agricultural pesticide use can affect forage and bee products, and what steps beekeepers
          can take to reduce risks to their colonies.
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – Comparing honeys</h4>
        <p>
          Describe how honeys from different floral sources can vary in flavour, aroma, colour and texture.
          Explain how a beekeeper might present this to customers.
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Pollen and nutrition</h4>
        <p>
          Explain the role of pollen in colony nutrition and how variations in forage quality and diversity
          might affect colony health and honey yields.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module2-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      <a href="#/module3" class="tk-btn tk-btn-primary">
        Continue to Module 3 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module2.html");
}
