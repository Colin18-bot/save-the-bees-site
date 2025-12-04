// Tutorials/js/views/module7-training.js
// SPA view for "Module 7 – Selection & Breeding" TRAINING content
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule7Training(container) {
  document.title = "Module 7 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 7</div>
          <h1 class="tk-content-title">Selection &amp; Breeding of Honey Bees – Training</h1>
          <p class="tk-content-subtitle">
            This module covers why and how beekeepers select and breed bees: desired traits, basic
            genetics, mating biology and practical queen rearing and record keeping.
          </p>
        </div>

        <div class="tk-training-progress-wrapper">
          <span data-training-progress class="tk-training-progress-text">
            0% complete
          </span>
        </div>
      </header>

      <div class="tk-card-grid">
        <article class="tk-card">
          <h2>What you should be able to do after this training</h2>
          <ul>
            <li>Explain why selection and breeding matter in modern beekeeping.</li>
            <li>List key traits to select for and how to assess them.</li>
            <li>Describe basic genetics and mating relevant to bee breeding.</li>
            <li>Outline simple queen rearing and selection schemes.</li>
            <li>Discuss local adaptation, diversity and ethical considerations.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Work through the sections, building a picture of what “good bees” mean for you.</li>
            <li>Use your notes to sketch a simple selection plan for a small apiary.</li>
            <li>Mark sections complete as you go and revisit any you are unsure about later.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- SECTION 1 -->
    <section id="m7-section-1" class="tk-section" data-training-section="1">
      <h2>1. Why select and breed honey bees?</h2>
      <p>
        Selection and breeding aim to improve future generations of bees, not just this year’s
        crop. Good selection can improve productivity, health, temperament and suitability to the
        local environment.
      </p>
      <h3>Reasons for selection</h3>
      <ul>
        <li>Improved honey production or pollination performance.</li>
        <li>Better temperament and ease of handling.</li>
        <li>Reduced swarming tendency or more manageable swarm behaviour.</li>
        <li>Resistance or tolerance to pests and diseases.</li>
        <li>Adaptation to local climate and forage.</li>
      </ul>
      <p>
        In exam answers, explain that selection is a long-term process requiring consistent
        observation and record keeping, not one-off decisions.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 2 -->
    <section id="m7-section-2" class="tk-section" data-training-section="2">
      <h2>2. Traits to select for and how to assess them</h2>
      <p>
        Before breeding, you must decide what traits you want and how you will measure them. Clear,
        simple criteria are best, especially in small apiaries.
      </p>
      <h3>Common traits</h3>
      <ul>
        <li>Temperament (calmness on comb, stinging behaviour, following).</li>
        <li>Honey production and use of forage.</li>
        <li>Swarming tendency and queen performance.</li>
        <li>Health indicators and survivability.</li>
        <li>Overwintering ability and spring build-up.</li>
      </ul>
      <h3>Assessing traits</h3>
      <ul>
        <li>Use simple scales (e.g. 1–5) to rate each colony on each trait.</li>
        <li>Record observations consistently through the season.</li>
        <li>Compare colonies under similar conditions rather than one-off impressions.</li>
      </ul>
      <p>
        Well-kept records are central to selection and will also be helpful in exam answers when
        describing breeding schemes.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 3 -->
    <section id="m7-section-3" class="tk-section" data-training-section="3">
      <h2>3. Basic genetics relevant to bee breeding</h2>
      <p>
        You do not need advanced genetics, but you should understand haplodiploidy and the
        implications of queens mating with many drones.
      </p>
      <h3>Key points</h3>
      <ul>
        <li>Queens and workers are diploid (two sets of chromosomes).</li>
        <li>Drones are haploid (one set), developed from unfertilised eggs.</li>
        <li>Drones pass all of their genes to their daughters.</li>
        <li>Queens mate with many drones, increasing genetic diversity in the worker population.</li>
      </ul>
      <p>
        Explain in answers that this genetic system affects how traits are expressed and why
        inbreeding can become a concern if breeding is very closed.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 4 -->
    <section id="m7-section-4" class="tk-section" data-training-section="4">
      <h2>4. Mating biology and its implications</h2>
      <p>
        Queens mate in flight with multiple drones, usually from different colonies. This has
        important implications for breeding programmes.
      </p>
      <h3>Mating behaviour</h3>
      <ul>
        <li>Mating occurs at drone congregation areas away from the home apiary.</li>
        <li>Queens usually mate with many drones over several flights.</li>
        <li>Sperm is stored in the spermatheca for the queen’s life.</li>
      </ul>
      <h3>Implications for breeders</h3>
      <ul>
        <li>Hard to control which drones are involved unless using isolated mating sites or instrumental insemination.</li>
        <li>Neighbouring apiaries and feral colonies influence mating outcomes.</li>
        <li>Even with partial control, selection can still shift overall colony characteristics over time.</li>
      </ul>
      <p>
        For exam purposes, you should be able to describe why full control of mating is difficult
        and what practical steps can improve it (e.g. drone flooding, sister queens).
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 5 -->
    <section id="m7-section-5" class="tk-section" data-training-section="5">
      <h2>5. Simple selection in a small apiary</h2>
      <p>
        Most beekeepers have only a few colonies. Even so, they can practise simple but effective
        selection from their better stocks.
      </p>
      <h3>Approach</h3>
      <ul>
        <li>Keep basic records of each colony’s performance and temperament.</li>
        <li>Identify “best” colonies based on several seasons’ observations.</li>
        <li>Avoid raising queens from colonies with poor traits, especially bad temper.</li>
      </ul>
      <p>
        A small, consistent improvement each year builds up over time. This approach is realistic
        for many hobby beekeepers and works well in exam examples.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 6 -->
    <section id="m7-section-6" class="tk-section" data-training-section="6">
      <h2>6. Queen rearing basics</h2>
      <p>
        Queen rearing techniques range from using natural queen cells to grafting and more advanced
        methods. At this level, you should understand the principles and a few simple methods.
      </p>
      <h3>Key ideas</h3>
      <ul>
        <li>Queens must be raised from larvae less than a few days old.</li>
        <li>Colony conditions must encourage queen cell building (e.g. hopelessly queenless, strong nurse population).</li>
        <li>Cells must be protected from damage and chilling.</li>
      </ul>
      <p>
        You might describe simple queen rearing from carefully chosen swarm or supersedure cells,
        or outline a straightforward grafting-based method in exam answers.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 7 -->
    <section id="m7-section-7" class="tk-section" data-training-section="7">
      <h2>7. Strains, local adaptation and imports</h2>
      <p>
        Different honey bee strains or types have arisen due to geography and selection. Modern
        beekeepers must weigh the benefits and risks of imports and crossbreeding.
      </p>
      <h3>Local adaptation</h3>
      <ul>
        <li>Locally adapted bees may cope better with weather and forage patterns.</li>
        <li>They may show better overwinter survival and spring build-up in that area.</li>
      </ul>
      <h3>Imports</h3>
      <ul>
        <li>Can introduce desirable traits, but also disease risks and less adapted genetics.</li>
        <li>May increase diversity but also complicate local breeding efforts.</li>
      </ul>
      <p>
        In exams, acknowledge both sides of the argument and emphasise responsible sourcing and
        health checks when discussing imports or new strains.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 8 -->
    <section id="m7-section-8" class="tk-section" data-training-section="8">
      <h2>8. Inbreeding, diversity and long-term planning</h2>
      <p>
        Breeding from too narrow a genetic base can lead to inbreeding problems. Long-term planning
        aims to improve bees while keeping enough diversity.
      </p>
      <h3>Inbreeding risks</h3>
      <ul>
        <li>Reduced vigour and fertility.</li>
        <li>Increased susceptibility to disease.</li>
        <li>More variable or unexpected expression of traits.</li>
      </ul>
      <h3>Maintaining diversity</h3>
      <ul>
        <li>Use several good colonies as breeding sources, not just one.</li>
        <li>Refresh breeding stock periodically with suitable outside lines.</li>
        <li>Coordinate with other beekeepers where possible.</li>
      </ul>
      <p>
        Good exam answers show an awareness that breeding is a long-term project requiring balance,
        not just rapid pursuit of a single trait like honey yield.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 9 -->
    <section id="m7-section-9" class="tk-section" data-training-section="9">
      <h2>9. Cooperative breeding schemes and mating control</h2>
      <p>
        Groups of beekeepers can work together to improve local bee stocks. This is often more
        effective than isolated efforts.
      </p>
      <h3>Cooperative approaches</h3>
      <ul>
        <li>Shared record keeping and selection criteria.</li>
        <li>Using a common strain or queen line as a basis.</li>
        <li>Organising mating apiaries or drone flooding with agreed stock.</li>
      </ul>
      <p>
        Even if you don’t plan to run such a scheme, understanding the principles will help you
        answer exam questions about regional or association breeding programmes.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 10 -->
    <section id="m7-section-10" class="tk-section" data-training-section="10">
      <h2>10. Ethics, welfare and communication with other beekeepers</h2>
      <p>
        Selection and breeding have ethical and practical implications. Decisions about importing
        stock, temperament and disease resistance affect other beekeepers and the wider environment.
      </p>
      <h3>Ethical considerations</h3>
      <ul>
        <li>Temperament: aggressive bees are a risk to others and may give beekeeping a bad name.</li>
        <li>Health: bringing in poorly screened imports can spread disease.</li>
        <li>Environment: consider local ecosystems and pollination needs.</li>
      </ul>
      <p>
        Examiners will appreciate balanced answers that consider bee welfare, public safety,
        cooperation and the long-term health of the managed and wild bee populations.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="10">
          Mark this section as complete
        </button>
      </div>
    </section>
  `;

  initAnswerBlocks(container);

  if (window.BKTraining && typeof window.BKTraining.initTrainingProgressForModule === "function") {
    window.BKTraining.initTrainingProgressForModule(container, "module7", 10);
  }
}
