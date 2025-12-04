// Tutorials/js/views/module6-training.js
// SPA view for "Module 6 – Honey Bee Behaviour" TRAINING content
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule6Training(container) {
  document.title = "Module 6 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 6</div>
          <h1 class="tk-content-title">Honey Bee Behaviour – Training</h1>
          <p class="tk-content-subtitle">
            This module focuses on how bees behave as individuals and as a colony: foraging, swarming,
            communication, defence and seasonal patterns. Behaviour is where biology turns into
            practical signs you can see in the apiary.
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
            <li>Describe key foraging and communication behaviours, including dances and pheromones.</li>
            <li>Explain swarming, supersedure and queen-related behaviours.</li>
            <li>Recognise defensive and abnormal behaviours in colonies.</li>
            <li>Understand daily and seasonal activity patterns.</li>
            <li>Use behaviour clues to guide management decisions.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Read each behaviour topic and relate it to situations you’ve seen at the hive.</li>
            <li>Use your notes to build a short “story” for each behaviour (what, why, when, what beekeeper does).</li>
            <li>Mark sections complete as you become confident.</li>
            <li>Revisit sections that feel unclear when you practise past questions.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- SECTION 1 -->
    <section id="m6-section-1" class="tk-section" data-training-section="1">
      <h2>1. Instincts, learning and flexibility</h2>
      <p>
        Honey bees show a mixture of instinctive behaviours and learning. Understanding this balance
        helps explain why colonies behave predictably in some ways but flexibly in others.
      </p>
      <h3>Instinctive behaviour</h3>
      <ul>
        <li>Nest building, brood care, foraging and defence are strongly instinct-driven.</li>
        <li>Swarming and queen rearing follow typical patterns when conditions are right.</li>
      </ul>
      <h3>Learning</h3>
      <ul>
        <li>Foragers learn and remember profitable forage locations.</li>
        <li>Bees can associate smells and visual cues with rewards.</li>
      </ul>
      <p>
        The combination of instinct and learning allows colonies to respond to local conditions
        while still following a recognisable annual pattern.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 2 -->
    <section id="m6-section-2" class="tk-section" data-training-section="2">
      <h2>2. Foraging behaviour and recruitment</h2>
      <p>
        Foraging behaviour is central to colony survival. Bees must find, assess and share
        information about food sources efficiently.
      </p>
      <h3>Forager roles</h3>
      <ul>
        <li>Scout bees search for new sources of nectar, pollen, water and propolis.</li>
        <li>Recruit bees exploit profitable sources based on information from scouts.</li>
      </ul>
      <h3>Recruitment mechanisms</h3>
      <ul>
        <li>Waggle dance to convey direction and distance of resources.</li>
        <li>Round dance for nearer sources (direction less important).</li>
        <li>Odours carried back on the bee and in nectar samples.</li>
      </ul>
      <p>
        Exam answers often ask you to describe how bees communicate the location of forage. Include
        both the dance and the importance of scent and taste.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 3 -->
    <section id="m6-section-3" class="tk-section" data-training-section="3">
      <h2>3. Orientation and navigation</h2>
      <p>
        Bees must be able to orient themselves around the hive and navigate between the nest and
        food sources, sometimes over considerable distances.
      </p>
      <h3>Orientation</h3>
      <ul>
        <li>Young bees perform orientation flights near the hive entrance.</li>
        <li>They learn landmarks and the general position of the hive.</li>
      </ul>
      <h3>Navigation tools</h3>
      <ul>
        <li>The sun’s position and internal time sense.</li>
        <li>Visual landmarks such as trees, buildings and hedges.</li>
        <li>Patterns of polarised light in the sky.</li>
      </ul>
      <p>
        This behaviour explains why relocating hives short distances can cause confusion and why
        good landmarks reduce drifting between colonies.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 4 -->
    <section id="m6-section-4" class="tk-section" data-training-section="4">
      <h2>4. Swarming behaviour</h2>
      <p>
        Swarming is the colony’s natural method of reproduction. Behaviour around swarming is
        predictable if you know what to look for.
      </p>
      <h3>Pre-swarm behaviour</h3>
      <ul>
        <li>Crowding and congestion in the brood nest.</li>
        <li>Queen reduces or stops laying.</li>
        <li>Bees build and provision swarm queen cells.</li>
      </ul>
      <h3>The swarm itself</h3>
      <ul>
        <li>Old queen departs with many flying bees.</li>
        <li>Bees cluster temporarily near the old hive while scouts find a new site.</li>
      </ul>
      <p>
        Being able to describe the sequence of behaviours helps you explain why specific swarm
        control methods work in practice.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 5 -->
    <section id="m6-section-5" class="tk-section" data-training-section="5">
      <h2>5. Supersedure, emergency queen rearing and queen acceptance</h2>
      <p>
        Colonies display characteristic behaviours when replacing queens or responding to queen loss.
      </p>
      <h3>Supersedure</h3>
      <ul>
        <li>Colony quietly replaces an ageing or failing queen.</li>
        <li>Often only one or two supersedure cells, usually mid-comb.</li>
      </ul>
      <h3>Emergency queen rearing</h3>
      <ul>
        <li>Triggered when the queen is suddenly lost.</li>
        <li>Workers convert worker cells containing young larvae into queen cells.</li>
      </ul>
      <h3>Queen acceptance</h3>
      <ul>
        <li>Workers may vary in how readily they accept a new queen.</li>
        <li>Behaviour at the cage or cage introduction can help judge acceptance.</li>
      </ul>
      <p>
        Recognising these behaviours helps you make sense of queen cell patterns and plan requeening
        strategies in practice and in exam answers.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 6 -->
    <section id="m6-section-6" class="tk-section" data-training-section="6">
      <h2>6. Defensive behaviour and stinging</h2>
      <p>
        Colonies must defend their nest and stores. Defensive behaviour protects the colony but
        can cause problems for neighbours and beekeepers if excessive.
      </p>
      <h3>Stages of defensive response</h3>
      <ul>
        <li>Guard bees check returning bees and respond to alarm cues.</li>
        <li>Alarm pheromone released when a bee stings or is threatened.</li>
        <li>More bees recruited to the entrance or perceived threat.</li>
      </ul>
      <h3>Factors influencing aggression</h3>
      <ul>
        <li>Genetics and queen line.</li>
        <li>Weather, nectar flow and disturbance.</li>
        <li>Colony health and queen status.</li>
      </ul>
      <p>
        For exams, show that you appreciate both the biological basis of defence and the
        responsibility to manage temperament by requeening if necessary.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 7 -->
    <section id="m6-section-7" class="tk-section" data-training-section="7">
      <h2>7. Communication: dances, pheromones and trophallaxis</h2>
      <p>
        Communication is central to coordinated behaviour. Bees use dances, pheromones and food
        sharing to pass information.
      </p>
      <h3>Dances</h3>
      <ul>
        <li>Waggle dance to indicate direction and distance of food sources.</li>
        <li>Round dance for nearer sources.</li>
      </ul>
      <h3>Pheromones</h3>
      <ul>
        <li>Queen, brood, alarm and Nasonov pheromones each have specific behavioural effects.</li>
      </ul>
      <h3>Trophallaxis</h3>
      <ul>
        <li>Food sharing between bees also transfers chemical information.</li>
      </ul>
      <p>
        In answers, mention at least two or three communication methods and explain how they fit
        into wider colony behaviour such as foraging and queen recognition.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 8 -->
    <section id="m6-section-8" class="tk-section" data-training-section="8">
      <h2>8. Daily and seasonal activity patterns</h2>
      <p>
        Bee behaviour varies through the day and across the year. Recognising these patterns helps
        you time inspections and interventions.
      </p>
      <h3>Daily patterns</h3>
      <ul>
        <li>Foraging mainly in daylight and in suitable weather.</li>
        <li>Night-time cluster and in-hive tasks.</li>
      </ul>
      <h3>Seasonal patterns</h3>
      <ul>
        <li>Spring build-up with increasing brood and foraging.</li>
        <li>Summer peak with maximum activity and swarming risk.</li>
        <li>Autumn preparation for winter, with reduced brood.</li>
        <li>Winter clustering with minimal flight.</li>
      </ul>
      <p>
        Many exam questions implicitly rely on you knowing when certain behaviours are “normal”
        for the time of year, and when they are cause for concern.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 9 -->
    <section id="m6-section-9" class="tk-section" data-training-section="9">
      <h2>9. Behavioural signs of disease and stress</h2>
      <p>
        Changes in behaviour can be early indicators of disease or other stresses before obvious
        physical signs appear.
      </p>
      <h3>Examples</h3>
      <ul>
        <li>Unusual aggression or extreme defensiveness.</li>
        <li>Crawling bees unable to fly, or bees with deformed wings.</li>
        <li>Loss of foraging activity compared with similar colonies nearby.</li>
        <li>Bees avoiding certain comb areas or abandoning brood.</li>
      </ul>
      <p>
        Behavioural clues should always be interpreted alongside brood, stores and environmental
        context. Good records help you spot changes over time.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 10 -->
    <section id="m6-section-10" class="tk-section" data-training-section="10">
      <h2>10. Using behaviour to guide management</h2>
      <p>
        The real value of this module is learning to read colonies and act appropriately. Behaviour
        provides much of the information you need.
      </p>
      <h3>Examples of behaviour-informed decisions</h3>
      <ul>
        <li>Recognising pre-swarm behaviour and applying swarm control in good time.</li>
        <li>Spotting queenlessness from behaviours and brood pattern.</li>
        <li>Deciding when to requeen based on temperament and colony performance.</li>
        <li>Adjusting inspection timing based on weather and foraging behaviour.</li>
      </ul>
      <p>
        Practise describing behaviour in a logical sequence and then explaining what the beekeeper
        should do and why. This style is rewarded in exams.
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
    window.BKTraining.initTrainingProgressForModule(container, "module6", 10);
  }
}
