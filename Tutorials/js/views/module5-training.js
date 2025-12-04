// Tutorials/js/views/module5-training.js
// SPA view for "Module 5 – Honey Bee Biology" TRAINING content (merged from old M2+M5)
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule5Training(container) {
  document.title = "Module 5 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 5</div>
          <h1 class="tk-content-title">Honey Bee Biology – Training</h1>
          <p class="tk-content-subtitle">
            This module brings together the key biological topics you need for the written exams:
            development, anatomy, body systems, senses, communication and how the colony functions
            as a single "superorganism". Work through these 10 sections to build a solid biological
            foundation for practical beekeeping and exam answers.
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
            <li>Describe egg-to-adult development and caste determination for queens, workers and drones.</li>
            <li>Explain the external and internal anatomy of adult bees and link structure to function.</li>
            <li>Outline the main body systems: digestive, excretory, circulatory, respiratory, nervous and muscular.</li>
            <li>Describe how bees sense, communicate and navigate as individuals and as a colony.</li>
            <li>Use biological knowledge to interpret brood patterns and to justify practical management decisions.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Start at Section 1 and read each topic carefully, making notes in your own words.</li>
            <li>Sketch simple diagrams (e.g. body regions, development timelines, brood layout) to help fix ideas.</li>
            <li>Click “Mark this section as complete” once you feel reasonably confident with that topic.</li>
            <li>Revisit weaker sections later and update your notes as you work through past questions.</li>
            <li>When you reach 100%, move on to Module 5 practice questions and model answers.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- SECTION 1 -->
    <section id="m5-section-1" class="tk-section" data-training-section="1">
      <h2>1. Egg-to-adult development and castes</h2>
      <p>
        Honey bees undergo complete metamorphosis: egg, larva, pupa and adult. The timing of
        development and the diet given to larvae determine whether they become queens, workers or drones.
      </p>

      <h3>Development times (approximate)</h3>
      <ul>
        <li><strong>Queen</strong> – about 16 days from egg to emergence.</li>
        <li><strong>Worker</strong> – about 21 days.</li>
        <li><strong>Drone</strong> – about 24 days.</li>
      </ul>

      <h3>Stages</h3>
      <ul>
        <li><strong>Egg</strong> – stands upright at first, then leans before hatching.</li>
        <li><strong>Larva</strong> – legless grub, fed heavily and moulting several times.</li>
        <li><strong>Pupa</strong> – inside the capped cell; larval tissues reorganise into adult bee.</li>
      </ul>

      <h3>Caste determination</h3>
      <ul>
        <li>Queens and workers share the same genetic potential; diet and cell type decide the outcome.</li>
        <li>Queen larvae receive richer royal jelly throughout larval life.</li>
        <li>Drones arise from unfertilised eggs and develop in larger, domed cells.</li>
      </ul>

      <p>
        In exam answers, always link development timing to practical management (e.g. planning inspections
        after introducing queen cells or evaluating queen performance).
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 2 -->
    <section id="m5-section-2" class="tk-section" data-training-section="2">
      <h2>2. External anatomy and body regions</h2>
      <p>
        All adult bees share the basic insect body plan of head, thorax and abdomen, but each caste is
        specialised for its role.
      </p>

      <h3>Head</h3>
      <ul>
        <li>Compound eyes and ocelli for vision and orientation.</li>
        <li>Antennae for smell, taste and touch.</li>
        <li>Mouthparts adapted for both biting and lapping.</li>
        <li>In workers, hypopharyngeal glands produce brood food.</li>
      </ul>

      <h3>Thorax</h3>
      <ul>
        <li>Three pairs of legs; workers have pollen baskets (corbiculae) on hind legs.</li>
        <li>Two pairs of wings used for flight and fanning.</li>
        <li>Contains powerful flight muscles that also generate heat.</li>
      </ul>

      <h3>Abdomen</h3>
      <ul>
        <li>Contains parts of the digestive, excretory and reproductive systems.</li>
        <li>Workers have wax glands and a barbed sting for defence.</li>
        <li>Queens have a long abdomen with enlarged ovaries and spermatheca; drones carry reproductive organs and no sting.</li>
      </ul>

      <p>
        Good biology answers always connect structure to function: how each feature supports the bee’s
        job in the colony (e.g. large drone eyes for mating flights).
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 3 -->
    <section id="m5-section-3" class="tk-section" data-training-section="3">
      <h2>3. Exoskeleton, moulting and growth</h2>
      <p>
        The exoskeleton supports and protects the bee but also limits growth. Understanding this helps
        explain why larvae moult and adults do not.
      </p>

      <h3>Cuticle layers</h3>
      <ul>
        <li>Outer waxy layer reduces water loss.</li>
        <li>Pigmented layers provide colour and some protection from light.</li>
        <li>Underlying chitin–protein matrix gives strength and flexibility.</li>
      </ul>

      <h3>Moulting and growth</h3>
      <ul>
        <li>Larvae moult several times as they grow inside the cell.</li>
        <li>After emergence, adults no longer moult; they only change slightly as tissues mature.</li>
      </ul>

      <p>
        You may mention the exoskeleton when discussing protection, water balance, the need for moulting
        in larvae and the limitations on adult growth.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 4 -->
    <section id="m5-section-4" class="tk-section" data-training-section="4">
      <h2>4. Digestive system, nutrition and brood food</h2>
      <p>
        Bees process nectar, pollen and stored foods through a specialised digestive system. Good
        nutrition underpins brood rearing, gland development and adult health.
      </p>

      <h3>Digestive system</h3>
      <ul>
        <li><strong>Honey stomach (crop)</strong> – stores nectar collected from flowers.</li>
        <li><strong>Proventriculus</strong> – valve controlling what passes from crop to midgut.</li>
        <li><strong>Midgut</strong> – main site of digestion and nutrient absorption.</li>
        <li><strong>Hindgut and rectum</strong> – water reabsorbed; faeces stored for cleansing flights.</li>
      </ul>

      <h3>Adult nutrition</h3>
      <ul>
        <li><strong>Nectar / honey</strong> – main energy source for flight, heat and daily activity.</li>
        <li><strong>Pollen</strong> – provides protein, fats, vitamins and minerals, vital for brood rearing.</li>
        <li>Nectar is ripened into honey; pollen is stored as bee bread.</li>
      </ul>

      <h3>Brood food</h3>
      <ul>
        <li>Nurse bees produce brood food using hypopharyngeal and mandibular glands.</li>
        <li>Young larvae, especially future queens, receive richer jelly.</li>
        <li>Quality of brood food affects adult bee strength and longevity.</li>
      </ul>

      <p>
        In practice, this underlines the importance of good forage and, when necessary, appropriate
        supplementary feeding during build-up and poor weather.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 5 -->
    <section id="m5-section-5" class="tk-section" data-training-section="5">
      <h2>5. Excretory and circulatory systems</h2>
      <p>
        Bees must remove waste products and move nutrients and hormones around the body. Their
        circulatory system is open and does not carry oxygen.
      </p>

      <h3>Excretory system</h3>
      <ul>
        <li>Malpighian tubules remove waste from haemolymph into the gut.</li>
        <li>Waste is concentrated in the rectum and usually voided during cleansing flights.</li>
        <li>Staining inside the hive can indicate problems with diet, disease or confinement.</li>
      </ul>

      <h3>Circulatory system</h3>
      <ul>
        <li>Haemolymph circulates in an open system bathing organs.</li>
        <li>A long dorsal vessel acts as a heart, pumping haemolymph forward.</li>
        <li>Transports nutrients, hormones and immune components, but not oxygen.</li>
      </ul>

      <p>
        You can gain marks by contrasting the bee’s open circulatory system with mammals and by
        linking excretory problems to disease signs or poor management.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 6 -->
    <section id="m5-section-6" class="tk-section" data-training-section="6">
      <h2>6. Respiration and thermoregulation</h2>
      <p>
        Bees breathe through a tracheal system and regulate temperature at both individual and
        colony level. This is crucial for brood development and flight.
      </p>

      <h3>Respiration</h3>
      <ul>
        <li>Air enters via spiracles on thorax and abdomen.</li>
        <li>Tracheae and air sacs carry oxygen directly to tissues.</li>
        <li>Abdominal pumping helps ventilate the system, especially in flight.</li>
      </ul>

      <h3>Thermoregulation</h3>
      <ul>
        <li>Bees shiver flight muscles to generate heat.</li>
        <li>Workers fan and evaporate water to cool the hive.</li>
        <li>Brood nest is maintained at about 34–35°C for proper development.</li>
      </ul>

      <p>
        This explains why colonies are vulnerable to chilling brood during spring inspections and
        why good ventilation and shade matter in hot weather.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 7 -->
    <section id="m5-section-7" class="tk-section" data-training-section="7">
      <h2>7. Nervous system, senses and communication</h2>
      <p>
        The nervous system and senses allow bees to respond to their environment. These underpin
        key behaviours such as orientation, foraging and communication.
      </p>

      <h3>Nervous system</h3>
      <ul>
        <li>Brain in the head with ganglia in thorax and abdomen.</li>
        <li>Nerves connect sense organs, muscles and internal organs.</li>
      </ul>

      <h3>Senses</h3>
      <ul>
        <li><strong>Vision</strong> – compound eyes for movement and colour (including UV), ocelli for light intensity.</li>
        <li><strong>Smell and taste</strong> – antennae and mouthparts detect odours and flavours.</li>
        <li><strong>Touch and vibration</strong> – sensory hairs and mechanoreceptors detect contact and movement.</li>
      </ul>

      <h3>Communication methods</h3>
      <ul>
        <li><strong>Waggle and round dances</strong> – convey direction and distance of food or nesting sites.</li>
        <li><strong>Trophallaxis</strong> – food exchange that also spreads chemical information.</li>
        <li><strong>Vibrations and sounds</strong> – various in-hive signals (e.g. piping queens).</li>
      </ul>

      <p>
        Exam questions often ask you to describe dances or explain why scent is so important. Always
        link senses and communication back to colony survival and efficiency.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 8 -->
    <section id="m5-section-8" class="tk-section" data-training-section="8">
      <h2>8. Pheromones and colony cohesion</h2>
      <p>
        Pheromones are chemical signals that coordinate behaviour, development and reproduction
        within the colony, helping many individuals function as one unit.
      </p>

      <h3>Queen pheromones</h3>
      <ul>
        <li>Signal the queen’s presence and quality.</li>
        <li>Help suppress worker ovary development.</li>
        <li>Influence swarming, supersedure and worker behaviour.</li>
      </ul>

      <h3>Brood pheromones</h3>
      <ul>
        <li>Indicate the amount and type of open brood.</li>
        <li>Stimulate nurse activity and pollen foraging.</li>
      </ul>

      <h3>Other pheromones</h3>
      <ul>
        <li><strong>Nasonov pheromone</strong> – used for orientation and cohesion at the hive or swarm cluster.</li>
        <li><strong>Alarm pheromone</strong> – released during stinging or threats, recruiting more defenders.</li>
      </ul>

      <p>
        Strong answers show how pheromones knit together individual behaviours into an organised
        colony, and how this influences management decisions (e.g. requeening).
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 9 -->
    <section id="m5-section-9" class="tk-section" data-training-section="9">
      <h2>9. Brood patterns, superorganism and seasonal rhythms</h2>
      <p>
        The brood nest and seasonal changes in brood tell you a great deal about colony health and
        how the “superorganism” is functioning.
      </p>

      <h3>Brood pattern clues</h3>
      <ul>
        <li><strong>Solid, even brood</strong> – usually a sign of a good queen and healthy colony.</li>
        <li><strong>Patchy or scattered brood</strong> – may indicate disease, failing queen or chilled brood.</li>
        <li><strong>Drone-laying workers</strong> – mainly drone brood in worker cells, often scattered.</li>
      </ul>

      <h3>Colony as a superorganism</h3>
      <ul>
        <li>Division of labour among workers by age and role.</li>
        <li>Collective regulation of temperature, food stores and defence.</li>
        <li>Coordinated responses to threats, nectar flows and seasonal changes.</li>
      </ul>

      <h3>Seasonal rhythms</h3>
      <ul>
        <li>Spring build-up with increasing brood and foraging.</li>
        <li>Summer peak with maximum activity and swarming risk.</li>
        <li>Autumn preparation for winter; reducing brood.</li>
        <li>Winter clustering with minimal flight.</li>
      </ul>

      <p>
        Interpreting brood patterns in the context of the time of year is a key exam skill and
        directly informs management decisions in the apiary.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 10 -->
    <section id="m5-section-10" class="tk-section" data-training-section="10">
      <h2>10. Linking biology to practical management and exam answers</h2>
      <p>
        The real value of this module is learning to apply biological facts in practical and exam
        situations. Examiners reward answers that explain <em>why</em> something matters to the beekeeper.
      </p>

      <h3>Biology–management links</h3>
      <ul>
        <li><strong>Development times</strong> – used to plan inspections and judge queen performance.</li>
        <li><strong>Thermoregulation</strong> – informs how long you can keep a hive open in cool or hot weather.</li>
        <li><strong>Nutrition and brood food</strong> – explains the need for adequate forage or feeding.</li>
        <li><strong>Pheromones and queen quality</strong> – help you recognise when to requeen.</li>
        <li><strong>Brood patterns</strong> – guide decisions about disease checks, uniting colonies or replacing queens.</li>
      </ul>

      <p>
        When practising written answers, try using the pattern:
        <em>fact → explanation → why this matters to the beekeeper</em>. This structure helps turn
        bare biology into clear, well-argued responses.
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
    window.BKTraining.initTrainingProgressForModule(container, "module5", 10);
  }
}
