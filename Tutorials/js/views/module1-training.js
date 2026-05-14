// Tutorials/js/views/module1-training.js
// SPA view for "Module 1 – Honey Bee Management" TRAINING content
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule1Training(container) {
  document.title = "Module 1 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 1</div>
          <h2 class="tk-content-title">Honey Bee Management – Training</h2>
          <p class="tk-content-subtitle">
            Work through these 10 short sections to build the knowledge needed for the Module 1
            questions and final exam. Tick each section off as you go and use your notes / glossary
            alongside this page.
          </p>
        </div>

        <!-- 🔹 Training progress label (wired by BKTraining.initTrainingProgressForModule) -->
        <div class="tk-training-progress-wrapper">
          <span data-training-progress class="tk-training-progress-text">
            0% complete
          </span>
          <!-- Optional bar – style in CSS if you like -->
          <!--
          <div class="tk-progress-bar">
            <div data-progress-bar-inner class="tk-progress-bar-inner"></div>
          </div>
          -->
        </div>
      </header>

      <div class="tk-card-grid">
        <article class="tk-card">
          <h2>What you should be able to do after this training</h2>
          <ul>
            <li>Describe colony organisation and the main castes.</li>
            <li>Explain the annual colony cycle and relate it to management.</li>
            <li>Identify and describe the queen, workers and drones.</li>
            <li>Outline basic hive equipment and apiary layout.</li>
            <li>Explain swarming signs and the principles of swarm control.</li>
            <li>Describe routine inspections, records, feeding and winter preparation.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Start at Section 1 and read each section in order.</li>
            <li>Use your notes page to summarise key points in your own words.</li>
            <li>Click “Mark this section as complete” when you’ve finished each one.</li>
            <li>Watch the progress text move towards 100% complete.</li>
            <li>When you reach 100%, move on to the Module 1 practice questions.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- 🔹 SECTION 1 -->
    <section id="m1-section-1" class="tk-section" data-training-section="1">
      <h2>1. Colony organisation and castes</h2>
      <p>
        A honey bee colony acts as a single “superorganism”. Individual bees cannot survive
        for long on their own; each caste plays a specialised role that contributes to the
        survival of the whole colony.
      </p>

      <h3>Main castes</h3>
      <ul>
        <li><strong>Queen</strong> – a fertile female that lays eggs and produces pheromones which help regulate colony behaviour.</li>
        <li><strong>Workers</strong> – infertile females that carry out nursing, comb building, foraging, cleaning, guarding and more.</li>
        <li><strong>Drones</strong> – males whose main role is to mate with virgin queens from other colonies.</li>
      </ul>

      <h3>Roles within the colony</h3>
      <p>
        The queen provides continuity through egg-laying and pheromones. Workers manage day-to-day
        running of the colony and adjust their behaviour according to conditions. Drones are produced
        seasonally so that queens from many colonies can mate in the air, promoting genetic diversity.
      </p>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 2 -->
    <section id="m1-section-2" class="tk-section" data-training-section="2">
      <h2>2. The annual colony cycle</h2>
      <p>
        Colonies change with the seasons. Their size, behaviour and needs in early spring are very
        different from those in late summer or mid-winter. Successful management depends on
        understanding this cycle.
      </p>

      <h3>Spring build-up</h3>
      <ul>
        <li>Queen increases egg laying as days lengthen and forage becomes available.</li>
        <li>Worker population rises, first slowly then rapidly.</li>
        <li>Risk of starvation remains if weather is poor, because brood rearing consumes stores.</li>
      </ul>

      <h3>Summer peak</h3>
      <ul>
        <li>Population may reach 40,000–60,000 bees in a strong colony.</li>
        <li>Swarming is most likely when colonies are crowded and well supplied with nectar.</li>
        <li>Surplus honey may be produced and stored in supers.</li>
      </ul>

      <h3>Late summer and autumn</h3>
      <ul>
        <li>Egg laying declines as forage reduces.</li>
        <li>Colonies rear “winter bees” adapted to live longer.</li>
        <li>Beekeeper checks for disease, manages queens and ensures adequate stores.</li>
      </ul>

      <h3>Winter</h3>
      <ul>
        <li>Bees form a cluster around brood and stores.</li>
        <li>Little or no brood may be present at mid-winter.</li>
        <li>Beekeeper mainly monitors hive condition and weight, avoiding unnecessary disturbance.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 3 -->
    <section id="m1-section-3" class="tk-section" data-training-section="3">
      <h2>3. The queen and reproduction</h2>
      <p>
        The queen is normally the only bee in the colony that lays fertilised eggs. Her quality and
        pheromones strongly influence colony temperament, productivity and tendency to swarm.
      </p>

      <h3>Queen development</h3>
      <ul>
        <li>Queens develop from fertilised eggs, but are fed royal jelly throughout larval life.</li>
        <li>They grow in larger, vertical queen cells rather than worker-sized horizontal cells.</li>
        <li>Development from egg to emergence takes about 16 days.</li>
      </ul>

      <h3>Egg laying and pheromones</h3>
      <ul>
        <li>A good queen in the active season may lay 1,000–2,000 eggs per day.</li>
        <li>Queen pheromones help maintain social cohesion and suppress worker ovary development.</li>
        <li>Poor pheromone distribution (for example in an old or failing queen) can encourage supersedure or swarming.</li>
      </ul>

      <h3>Queen replacement</h3>
      <ul>
        <li><strong>Supersedure</strong> – colony replaces an ageing or failing queen without swarming.</li>
        <li><strong>Swarming</strong> – old queen leaves with part of the workforce, leaving queen cells behind.</li>
        <li><strong>Emergency queen rearing</strong> – if the queen is suddenly lost, workers convert worker cells to queen cells.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 4 -->
    <section id="m1-section-4" class="tk-section" data-training-section="4">
      <h2>4. Drones, mating and simple genetics</h2>
      <p>
        Drones are essential for mating with virgin queens from other colonies. Although they do not
        perform work inside the hive, they play a vital part in maintaining genetic diversity.
      </p>

      <h3>Drones in the colony</h3>
      <ul>
        <li>Reared mainly in spring and early summer.</li>
        <li>Develop from unfertilised eggs (haploid).</li>
        <li>Usually expelled in late summer and absent through much of winter.</li>
      </ul>

      <h3>Mating behaviour</h3>
      <ul>
        <li>Queens mate in flight at drone congregation areas.</li>
        <li>They mate with multiple drones, storing sperm for their lifetime.</li>
        <li>Mating usually occurs over several flights shortly after queen emergence.</li>
      </ul>

      <h3>Simple genetics (Module 1 level)</h3>
      <p>
        Because drones are haploid and queens are diploid, drones pass on all of their genes to their
        daughters. This means careful selection of breeding stock can influence temperament and
        productivity over time, even with basic management.
      </p>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 5 -->
    <section id="m1-section-5" class="tk-section" data-training-section="5">
      <h2>5. Workers and division of labour</h2>
      <p>
        Worker bees carry out almost all visible tasks in the colony. Their duties change with age,
        although there is flexibility depending on the colony’s needs.
      </p>

      <h3>Typical age-related tasks</h3>
      <ul>
        <li><strong>0–3 days</strong> – cleaning cells, warming brood, feeding royal jelly to young larvae.</li>
        <li><strong>3–10 days</strong> – nurse bees feeding older larvae, capping brood, tending the queen.</li>
        <li><strong>10–20 days</strong> – comb building, receiving nectar, processing and storing honey, fanning.</li>
        <li><strong>20+ days</strong> – foraging for nectar, pollen, water and propolis, and acting as guard bees.</li>
      </ul>

      <h3>Communication</h3>
      <ul>
        <li>Foragers use dances and scent to indicate profitable forage sites.</li>
        <li>Pheromones help bees recognise their own colony and maintain order.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 6 -->
    <section id="m1-section-6" class="tk-section" data-training-section="6">
      <h2>6. Hive equipment and apiary layout</h2>
      <p>
        Good management begins with appropriate equipment and a well-chosen apiary site. Poor siting
        or unsuitable equipment can make inspections harder and stress the bees.
      </p>

      <h3>Basic hive components</h3>
      <ul>
        <li>Floor, brood box and supers.</li>
        <li>Frames, foundation and comb.</li>
        <li>Queen excluder (if used), crown board and roof.</li>
        <li>Feeder for administering syrup in spring or autumn.</li>
      </ul>

      <h3>Choosing an apiary site</h3>
      <ul>
        <li>Good year-round access for the beekeeper.</li>
        <li>Reasonable shelter from strong winds but not deep shade.</li>
        <li>Reliable forage and water nearby.</li>
        <li>Hive entrances facing away from paths, houses and livestock where possible.</li>
      </ul>

      <h3>Layout</h3>
      <ul>
        <li>Hives spaced and oriented to reduce drifting.</li>
        <li>Solid stands to keep hives off the ground.</li>
        <li>Safe working space behind or beside each hive.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 7 -->
    <section id="m1-section-7" class="tk-section" data-training-section="7">
      <h2>7. Swarming and swarm control</h2>
      <p>
        Swarming is the colony’s natural method of reproduction. For beekeepers it can mean loss of
        bees and honey, but it can be managed if the signs are recognised in time.
      </p>

      <h3>Swarming signs</h3>
      <ul>
        <li>Congested brood nest and supers.</li>
        <li>Charged swarm queen cells on comb edges or the bottom of frames.</li>
        <li>Reduced egg laying by the queen as swarming approaches.</li>
      </ul>

      <h3>Causes</h3>
      <ul>
        <li>Overcrowding and poor ventilation.</li>
        <li>Old queen or reduced queen pheromone distribution.</li>
        <li>Strong nectar flow with inadequate space.</li>
      </ul>

      <h3>Basic principles of swarm control</h3>
      <ul>
        <li>Remove or relieve the conditions that trigger swarming (congestion, old queen).</li>
        <li>Simulate the effect of a swarm by separating flying bees from brood and queen.</li>
        <li>Retain a single good queen cell or introduce a known queen.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 8 -->
    <section id="m1-section-8" class="tk-section" data-training-section="8">
      <h2>8. Routine inspections and records</h2>
      <p>
        Regular inspections allow the beekeeper to monitor health, space, queen status and signs of
        disease or swarming. Good records help track changes over time and support sound decisions.
      </p>

      <h3>Inspection objectives</h3>
      <ul>
        <li>Is the colony queenright (eggs, brood pattern, temperament)?</li>
        <li>Is there enough space for brood and incoming nectar?</li>
        <li>Any signs of queen cells, disease or abnormal brood?</li>
        <li>Are there sufficient stores?</li>
      </ul>

      <h3>Record keeping</h3>
      <p>
        Records might include date, weather, brood pattern, presence of eggs and queen cells, space,
        stores, any treatment given and actions planned. Your BeezKnees app is ideal for capturing
        these details consistently.
      </p>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 9 -->
    <section id="m1-section-9" class="tk-section" data-training-section="9">
      <h2>9. Feeding, stores and wintering</h2>
      <p>
        Colonies need adequate stores to survive brood rearing and winter. The beekeeper manages
        feeding and honey removal so that the bees are neither starved nor excessively disturbed.
      </p>

      <h3>Types of feed</h3>
      <ul>
        <li><strong>Thin syrup</strong> – often used in spring to stimulate comb building and brood rearing (with care).</li>
        <li><strong>Thick syrup</strong> – used in late summer/autumn to build winter stores.</li>
        <li><strong>Fondant or candy</strong> – used in winter as an emergency top-up if required.</li>
      </ul>

      <h3>Winter preparation</h3>
      <ul>
        <li>Ensure colonies are headed by a good queen and are disease-checked.</li>
        <li>Provide adequate stores, often expressed as total hive weight or number of full combs.</li>
        <li>Secure hives against wind and animals; reduce entrances where appropriate.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- 🔹 SECTION 10 -->
    <section id="m1-section-10" class="tk-section" data-training-section="10">
      <h2>10. Temperament, safety and good practice</h2>
      <p>
        Safe and considerate beekeeping depends on good handling, appropriate siting and managing
        colonies with acceptable temperament. This protects you, neighbours and livestock.
      </p>

      <h3>Managing temperament</h3>
      <ul>
        <li>Assess temperament regularly: calmness on the comb, running, stinging behaviour.</li>
        <li>Avoid breeding from aggressive colonies; requeen if necessary.</li>
        <li>Consider the impact on neighbours and public places.</li>
      </ul>

      <h3>Personal safety</h3>
      <ul>
        <li>Wear suitable protective clothing and a clean veil.</li>
        <li>Keep a smoker ready before opening hives.</li>
        <li>Know what to do if someone suffers a severe reaction to stings.</li>
      </ul>

      <div class="tk-section-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary"
          data-mark-complete="10">
          Mark this section as complete
        </button>
      </div>
    </section>
  `;

  // If you have any generic behaviour (e.g. notes blocks) you want on training pages:
  initAnswerBlocks(container);

  // 🔹 Wire training progress (10 sections)
  if (window.BKTraining && typeof window.BKTraining.initTrainingProgressForModule === "function") {
    window.BKTraining.initTrainingProgressForModule(container, "module1", 10);
  }
}
