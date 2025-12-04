// Tutorials/js/views/module3-training.js
// SPA view for "Module 3 – Honey Bee Pests, Diseases & Poisoning" TRAINING content
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule3Training(container) {
  document.title = "Module 3 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 3</div>
          <h1 class="tk-content-title">Honey Bee Pests, Diseases &amp; Poisoning – Training</h1>
          <p class="tk-content-subtitle">
            Work through these 10 sections to build confidence in recognising, preventing and
            managing pests, diseases and poisoning in honey bee colonies. This training supports
            the Module 3 written questions and final exam.
          </p>
        </div>

        <!-- Training progress label -->
        <div class="tk-training-progress-wrapper">
          <span data-training-progress class="tk-training-progress-text">
            0% complete
          </span>
          <!-- Optional bar:
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
            <li>Recognise healthy brood and adult bees and spot when something is wrong.</li>
            <li>Describe the main brood diseases and distinguish AFB from EFB.</li>
            <li>Explain the biology and impact of Varroa destructor.</li>
            <li>Outline integrated pest management (IPM) approaches for Varroa and other pests.</li>
            <li>Understand notifiable diseases and beekeeper responsibilities.</li>
            <li>Recognise poisoning and other non-disease colony losses.</li>
            <li>Apply good hygiene and biosecurity in the apiary.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Read each section in order from 1 to 10.</li>
            <li>Use your notes page to summarise key points and typical exam phrases.</li>
            <li>Click “Mark this section as complete” when you are happy with each topic.</li>
            <li>Watch your Module 3 training progress move towards 100%.</li>
            <li>Then move on to Module 3 practice questions and model answers.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- SECTION 1 -->
    <section id="m3-section-1" class="tk-section" data-training-section="1">
      <h2>1. Principles of bee health and early recognition</h2>
      <p>
        Good bee health starts with knowing what a healthy colony looks, smells and sounds like.
        Only then can you recognise early signs that something is wrong.
      </p>

      <h3>Signs of a healthy colony</h3>
      <ul>
        <li>Even brood pattern with few empty cells in the central brood area.</li>
        <li>Brood at different stages: eggs, larvae and sealed brood all present.</li>
        <li>Calm bees on the comb, not excessively running or aggressive.</li>
        <li>No unpleasant smell from the brood nest.</li>
        <li>Reasonable stores of pollen and honey for the season.</li>
      </ul>

      <h3>General health management</h3>
      <ul>
        <li>Regular inspections with a clear objective each time.</li>
        <li>Good records of findings and treatments to spot trends.</li>
        <li>Replacing old, dark comb over time to reduce pathogen load.</li>
        <li>Avoiding robbing and drifting, which spread disease between colonies.</li>
        <li>Obtaining bees and queens from reputable, healthy sources.</li>
      </ul>

      <p>
        Exam answers often begin with a description of a healthy colony before moving on to what
        has changed. This shows the examiner that you understand the “normal” baseline.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 2 -->
    <section id="m3-section-2" class="tk-section" data-training-section="2">
      <h2>2. American foulbrood (AFB) and European foulbrood (EFB)</h2>
      <p>
        The foulbroods are serious bacterial diseases of brood. They are usually notifiable and
        require statutory control. You must recognise their key signs and know what to do if you
        suspect them.
      </p>

      <h3>American foulbrood (AFB)</h3>
      <ul>
        <li>Bacterial disease affecting sealed brood.</li>
        <li>Sunken, darkened cappings, often perforated.</li>
        <li>Larval remains brown and “ropy” when tested with a matchstick.</li>
        <li>Dry down to a hard, dark scale stuck to the lower cell wall.</li>
        <li>Often associated with a foul smell in advanced cases.</li>
      </ul>

      <h3>European foulbrood (EFB)</h3>
      <ul>
        <li>Bacterial disease affecting mainly unsealed larvae.</li>
        <li>Irregular brood pattern with twisted or “melted” larvae in cells.</li>
        <li>Larvae may appear yellowish; tracheal lines can become visible.</li>
        <li>Remains tend to be granular or rubbery rather than ropy.</li>
        <li>Smell may be sour or unpleasant, but not always obvious.</li>
      </ul>

      <h3>Key comparisons for exam answers</h3>
      <ul>
        <li>AFB – sealed brood, ropy remains, hard scales firmly stuck in cell base.</li>
        <li>EFB – unsealed brood, twisted larvae, less ropy material.</li>
      </ul>

      <p>
        If you suspect foulbrood, do not move bees or equipment, reduce the risk of robbing and
        contact the appropriate authority. Examiners expect this sequence of actions.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 3 -->
    <section id="m3-section-3" class="tk-section" data-training-section="3">
      <h2>3. Other brood diseases and abnormal brood patterns</h2>
      <p>
        Not all irregular brood indicates foulbrood. Several other diseases and non-infectious
        problems can disturb the brood pattern. Being able to distinguish these is important.
      </p>

      <h3>Chalkbrood</h3>
      <ul>
        <li>Fungal disease of larvae.</li>
        <li>White or grey “mummies” in cells or at the hive entrance.</li>
        <li>Often linked to stress, poor ventilation or some genetic lines.</li>
      </ul>

      <h3>Sacbrood</h3>
      <ul>
        <li>Viral disease causing larvae to die inside an intact larval skin.</li>
        <li>Larvae appear as fluid-filled sacs, later drying into dark, boat-shaped scales.</li>
      </ul>

      <h3>Chilled and bald brood</h3>
      <ul>
        <li><strong>Chilled brood</strong> – brood dies because bees cannot keep it warm, often at comb edges.</li>
        <li><strong>Bald brood</strong> – cappings removed, exposing pupae, sometimes associated with pests.</li>
      </ul>

      <h3>Queen failure or non-disease causes</h3>
      <p>
        Poor brood pattern can also result from an ageing or poorly mated queen, or from interrupted
        laying during bad weather. Healthy larvae and the absence of foul smells or ropy remains can
        point away from foulbrood.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 4 -->
    <section id="m3-section-4" class="tk-section" data-training-section="4">
      <h2>4. Diseases of adult bees</h2>
      <p>
        Adult bees can suffer from a range of diseases affecting their gut, nervous system and
        general vitality. Many are linked with stress or heavy Varroa infestation.
      </p>

      <h3>Gut problems</h3>
      <ul>
        <li>Faecal staining on combs or hive walls can indicate digestive upset.</li>
        <li>Poor forage, unsuitable feed or disease can all contribute.</li>
      </ul>

      <h3>Viral disease signs</h3>
      <ul>
        <li>Deformed wings and shortened abdomens.</li>
        <li>Trembling, crawling bees unable to fly.</li>
        <li>Unusual clustering or large numbers of dead bees outside the hive.</li>
      </ul>

      <h3>Paralysis-type symptoms</h3>
      <ul>
        <li>Shiny, black, hairless bees.</li>
        <li>Bees shaking or crawling near the entrance.</li>
      </ul>

      <p>
        Often, the best response is to reduce Varroa levels, improve nutrition and consider requeening.
        For exam purposes, show that you can link adult disease signs with possible underlying causes.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 5 -->
    <section id="m3-section-5" class="tk-section" data-training-section="5">
      <h2>5. Varroa destructor – biology and life cycle</h2>
      <p>
        Varroa destructor is one of the most serious threats to modern beekeeping. Understanding its
        life cycle is essential for effective control strategies.
      </p>

      <h3>Form and behaviour</h3>
      <ul>
        <li>Flattened, reddish-brown mite visible on bees or at the bottom of brood cells.</li>
        <li>Feeds on developing brood and adult bees.</li>
        <li>Spreads between bees during close contact and robbing.</li>
      </ul>

      <h3>Reproduction in brood cells</h3>
      <ul>
        <li>Female mite enters a brood cell shortly before capping, especially drone cells.</li>
        <li>Lays eggs after capping; offspring develop and mate inside the cell.</li>
        <li>Adult female mites emerge with the bee and continue the cycle.</li>
      </ul>

      <h3>Impact on colonies</h3>
      <ul>
        <li>Weakens bees directly through feeding.</li>
        <li>Vectors viruses, leading to deformed and short-lived bees.</li>
        <li>Unchecked infestation can cause colony collapse.</li>
      </ul>

      <p>
        Exam questions may ask for a description of the Varroa life cycle or for an explanation of
        why drone brood is especially targeted. Be ready to link this to control measures.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 6 -->
    <section id="m3-section-6" class="tk-section" data-training-section="6">
      <h2>6. Monitoring and integrated control of Varroa</h2>
      <p>
        No single method can control Varroa indefinitely. Effective management relies on
        <strong>Integrated Pest Management (IPM)</strong>, combining monitoring with a range of
        control techniques.
      </p>

      <h3>Monitoring methods</h3>
      <ul>
        <li>Natural mite fall on inspection boards.</li>
        <li>Sampling drone brood to assess Varroa levels.</li>
        <li>Occasional direct checks of adult bees where appropriate.</li>
      </ul>

      <h3>Control tools (overview)</h3>
      <ul>
        <li>Biotechnical methods such as drone brood removal or brood breaks.</li>
        <li>Authorised treatments such as organic acids or other approved substances.</li>
        <li>Rotating treatments to reduce the risk of resistance.</li>
      </ul>

      <h3>IPM principles</h3>
      <ul>
        <li>Monitor regularly and only treat when thresholds are exceeded.</li>
        <li>Time treatments to fit the brood cycle and honey production.</li>
        <li>Aim to keep Varroa at manageable levels, not necessarily to eradicate it.</li>
      </ul>

      <p>
        In exam answers, show that Varroa control is an ongoing plan, not a single annual treatment.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 7 -->
    <section id="m3-section-7" class="tk-section" data-training-section="7">
      <h2>7. Other pests and predators</h2>
      <p>
        Many other organisms exploit bees, colonies or stored comb. Some are minor nuisances; others
        can cause serious damage if not controlled.
      </p>

      <h3>Wax moth</h3>
      <ul>
        <li>Larvae tunnel through comb, leaving webbing and frass.</li>
        <li>Particularly damaging to stored comb and weak colonies.</li>
        <li>Strong colonies and good storage conditions are the best defence.</li>
      </ul>

      <h3>Other invasive threats (awareness)</h3>
      <p>
        In some regions, additional pests such as small hive beetle or other beetles may occur.
        Awareness of signs, legal reporting requirements and movement controls is important.
      </p>

      <h3>Predators and nuisances</h3>
      <ul>
        <li>Wasps and hornets can rob and weaken colonies.</li>
        <li>Mice may nest in hives over winter and damage comb.</li>
        <li>Birds such as woodpeckers may damage hive walls in severe weather.</li>
      </ul>

      <p>
        Practical steps include reducing entrances for weak colonies, using mouse guards, securing
        hives and keeping apiaries tidy.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 8 -->
    <section id="m3-section-8" class="tk-section" data-training-section="8">
      <h2>8. Notifiable diseases, inspections and legislation (awareness)</h2>
      <p>
        In many countries, foulbroods and some exotic pests are notifiable. Beekeepers must understand
        their responsibilities and cooperate with official inspection services.
      </p>

      <h3>Notifiable diseases (general awareness)</h3>
      <ul>
        <li>American foulbrood (AFB) and European foulbrood (EFB) are typically notifiable.</li>
        <li>Certain invasive pests may also fall under statutory control.</li>
      </ul>

      <h3>Inspection and control</h3>
      <ul>
        <li>Authorised inspectors may examine colonies and equipment.</li>
        <li>Control measures can include destruction of diseased colonies and equipment under
            official guidance.</li>
      </ul>

      <h3>Beekeeper responsibilities</h3>
      <ul>
        <li>Report suspected notifiable disease promptly.</li>
        <li>Do not move bees, equipment or honey from suspect sites.</li>
        <li>Follow guidance on cleaning, burning or disinfecting equipment.</li>
      </ul>

      <p>
        In the exam, show that you understand the need for coordinated control to protect all
        beekeepers, not just your own apiary.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 9 -->
    <section id="m3-section-9" class="tk-section" data-training-section="9">
      <h2>9. Poisoning, environmental stresses and misdiagnosis</h2>
      <p>
        Not all colony losses are due to infectious disease. Poisoning, starvation, exposure and
        queen problems can all cause sudden deaths or collapse.
      </p>

      <h3>Signs of possible poisoning</h3>
      <ul>
        <li>Large numbers of dead or twitching bees outside the hive.</li>
        <li>Bees with extended proboscises or abnormal movements.</li>
        <li>Several colonies affected at once following foraging.</li>
      </ul>

      <h3>Other stresses that mimic disease</h3>
      <ul>
        <li><strong>Starvation</strong> – bees dead head-first in cells, with light combs.</li>
        <li><strong>Chilling</strong> – dead brood due to insufficient bees or poor weather timing.</li>
        <li><strong>Queen problems</strong> – dwindling colony with scattered brood and lack of eggs.</li>
      </ul>

      <p>
        Good records, careful observation and an understanding of recent weather and forage
        conditions help distinguish between disease and other causes of loss.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 10 -->
    <section id="m3-section-10" class="tk-section" data-training-section="10">
      <h2>10. Hygiene, biosecurity and long-term health planning</h2>
      <p>
        Disease control is about more than individual treatments. Long-term colony health depends on
        good hygiene, sensible movement of bees and equipment, and planned monitoring.
      </p>

      <h3>Hygiene practices</h3>
      <ul>
        <li>Keep tools, gloves and hive parts reasonably clean.</li>
        <li>Avoid leaving exposed comb where it can attract robbing.</li>
        <li>Replace old, dark comb regularly.</li>
      </ul>

      <h3>Biosecurity</h3>
      <ul>
        <li>Be cautious when acquiring bees, queens or used equipment.</li>
        <li>Avoid unnecessary swapping of combs between colonies.</li>
        <li>Manage drifting by thoughtful hive layout and markings.</li>
      </ul>

      <h3>Health planning</h3>
      <ul>
        <li>Set a schedule for health inspections and Varroa monitoring.</li>
        <li>Record treatments, doses and dates for each colony.</li>
        <li>Stay informed through local associations and inspection services.</li>
      </ul>

      <p>
        Examiners like answers that show a joined-up approach: healthy, well-managed colonies with
        good queens, good forage and clean comb are more resilient to many problems.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="10">
          Mark this section as complete
        </button>
      </div>
    </section>
  `;

  // Generic helpers (if you use notes / answer blocks here)
  initAnswerBlocks(container);

  // Wire training progress for Module 3 (10 sections)
  if (window.BKTraining && typeof window.BKTraining.initTrainingProgressForModule === "function") {
    window.BKTraining.initTrainingProgressForModule(container, "module3", 10);
  }
}
