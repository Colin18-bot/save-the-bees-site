// tutorials-js/views/module5.js
// SPA view for "Module 5 – Honey Bee Biology" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule5(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Honey Bee Biology</h2>
        <p class="tk-content-subtitle">
          A mix of short-answer, multiple-choice and longer written questions to test understanding of
          honey bee biology and colony organisation.
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
          Try to answer without notes first. Then open
          <strong>module5-answers</strong> to compare with the model answers and marking notes.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Short-answer questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These usually call for a few clear points or a short paragraph.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – Castes</h4>
        <p>
          Name the three castes in a honey bee colony and state the primary role of each.
        </p>
      </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – Exoskeleton</h4>
        <p>
          What is an exoskeleton and what are two functions it serves for the honey bee?
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – Head structures</h4>
        <p>
          List three important structures found on the head of the worker bee and briefly state their functions.
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Mouthparts</h4>
        <p>
          Explain how the mouthparts of a worker bee are adapted for both feeding on nectar and manipulating wax.
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Thorax and flight</h4>
        <p>
          Why is the thorax described as the “power centre” of the bee, and how is it adapted for flight?
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Worker vs queen abdomen</h4>
        <p>
          Give two ways in which the abdomen of a worker differs in function from that of the queen.
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Development stages</h4>
        <p>
          Name the four main stages in the complete metamorphosis of a honey bee, in order.
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Development times</h4>
        <p>
          Which caste develops the fastest and which the slowest? Give approximate development times from egg to
          emergence for each.
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Worker tasks by age</h4>
        <p>
          Give three examples of tasks carried out by worker bees inside the hive at different ages, from young
          to older workers.
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Drone role</h4>
        <p>
          What is the primary biological role of the drone, and what typically happens to drones as winter approaches?
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Queen pheromones</h4>
        <p>
          Explain in simple terms what queen pheromones are and give two effects they have on the colony.
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Colony as a “superorganism”</h4>
        <p>
          Why is a honey bee colony sometimes described as a “superorganism”?
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
        <h4>Question 13 – Number of chromosomes</h4>
        <p class="tk-quick-check-question">
          How many chromosomes are found in a diploid honey bee (worker or queen) cell?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q13" />8</label>
          <label><input type="radio" name="m5q13" />16</label>
          <label><input type="radio" name="m5q13" />32</label>
        </div>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – Haplodiploidy</h4>
        <p class="tk-quick-check-question">
          In honey bees, males (drones) are:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q14" />Diploid, developing from fertilised eggs.</label>
          <label><input type="radio" name="m5q14" />Haploid, developing from unfertilised eggs.</label>
          <label><input type="radio" name="m5q14" />Produced only by other drones.</label>
        </div>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – Spermatheca</h4>
        <p class="tk-quick-check-question">
          The spermatheca of the queen is:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q15" />A gland producing royal jelly.</label>
          <label><input type="radio" name="m5q15" />An organ for storing sperm after mating.</label>
          <label><input type="radio" name="m5q15" />Part of the sting mechanism.</label>
        </div>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Egg-laying control</h4>
        <p class="tk-quick-check-question">
          When laying an egg, the queen can usually control whether it is fertilised. Why is this important?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q16" />It allows production of either workers/queens or drones as needed.</label>
          <label><input type="radio" name="m5q16" />It prevents the colony from swarming.</label>
          <label><input type="radio" name="m5q16" />It changes the colour of honey.</label>
        </div>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Sensory organs</h4>
        <p class="tk-quick-check-question">
          Which of the following is <em>not</em> a primary function of the antennae?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q17" />Smell and taste.</label>
          <label><input type="radio" name="m5q17" />Detecting vibrations.</label>
          <label><input type="radio" name="m5q17" />Pumping haemolymph around the body.</label>
        </div>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Waggle dance information</h4>
        <p class="tk-quick-check-question">
          The waggle dance primarily tells other bees about:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q18" />The colony’s genetic diversity.</label>
          <label><input type="radio" name="m5q18" />The distance and direction of a food or nest source.</label>
          <label><input type="radio" name="m5q18" />The queen’s age.</label>
        </div>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Thermoregulation</h4>
        <p class="tk-quick-check-question">
          At the brood nest, bees usually maintain the temperature close to:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q19" />20°C</label>
          <label><input type="radio" name="m5q19" />25°C</label>
          <label><input type="radio" name="m5q19" />34–35°C</label>
        </div>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Haemolymph</h4>
        <p class="tk-quick-check-question">
          Haemolymph in the honey bee is:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q20" />The bee’s blood-like fluid, circulating nutrients and waste.</label>
          <label><input type="radio" name="m5q20" />A gland that produces wax.</label>
          <label><input type="radio" name="m5q20" />The fluid inside honey.</label>
        </div>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Spiracles</h4>
        <p class="tk-quick-check-question">
          Spiracles are:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q21" />Openings of the respiratory system along the thorax and abdomen.</label>
          <label><input type="radio" name="m5q21" />The joints of the legs.</label>
          <label><input type="radio" name="m5q21" />Scent glands on the queen.</label>
        </div>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Fat body</h4>
        <p class="tk-quick-check-question">
          The “fat body” in bees is important mainly for:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m5q22" />Producing nectar.</label>
          <label><input type="radio" name="m5q22" />Energy storage and roles in metabolism and immunity.</label>
          <label><input type="radio" name="m5q22" />Hearing aerial vibrations.</label>
        </div>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These call for structured, multi-point answers.
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – Worker life history</h4>
        <p>
          Describe the typical life history of a summer worker bee from emergence to death, highlighting how
          her tasks change with age and how this benefits the colony.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Caste determination</h4>
        <p>
          Explain how the same fertilised egg can develop into either a worker or a queen. Include the roles of
          diet and queen cells.
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Mating biology</h4>
        <p>
          Summarise what happens during and after a queen’s mating flights, including where mating usually
          takes place and how sperm is stored and used.
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Communication methods</h4>
        <p>
          Describe at least three ways in which bees communicate within the colony (not just dances) and give
          an example of each.
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – Seasonal colony cycle</h4>
        <p>
          Outline the seasonal life cycle of a honey bee colony over a year in a temperate climate, focusing on
          changes in population, brood rearing and colony behaviour.
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Genetic diversity</h4>
        <p>
          Explain why it is biologically beneficial for a queen to mate with several drones and how this affects
          the colony’s resilience.
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – Stinging apparatus</h4>
        <p>
          Describe the worker’s stinging apparatus and explain why workers usually die after stinging a mammal.
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Adaptations to social life</h4>
        <p>
          Discuss some key biological adaptations that allow honey bees to live successfully as highly social
          insects in large colonies.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module5-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      <a href="#/module6" class="tk-btn tk-btn-primary">
        Continue to Module 6 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module5.html");
}
