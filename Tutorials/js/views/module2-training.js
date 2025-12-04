// Tutorials/js/views/module2-training.js
// SPA view for "Module 2 – Products & Forage" TRAINING content
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule2Training(container) {
  document.title = "Module 2 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 2</div>
          <h1 class="tk-content-title">Products &amp; Forage – Training</h1>
          <p class="tk-content-subtitle">
            This module explores honey bee forage, nectar and pollen production, hive products, wax,
            honey processing, food hygiene and relevant UK regulations. Work through these 10
            sections to build a strong understanding of where hive products come from and how they
            should be handled safely and legally.
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
            <li>Describe how nectar, pollen and propolis are produced and collected.</li>
            <li>Identify major forage plants and understand their flowering periods.</li>
            <li>Explain how honey is processed from nectar to ripe honey.</li>
            <li>Understand the properties and uses of beeswax, propolis and royal jelly.</li>
            <li>Describe safe and legal methods for extracting, storing and labelling honey.</li>
            <li>Comply with UK food safety and hygiene regulations for hive products.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Read each section carefully — many exam questions expect detailed explanations.</li>
            <li>Learn seasonality and plant types; these often appear in forage-related questions.</li>
            <li>Use the notes page to record important flowering periods and honey flow patterns.</li>
            <li>Click “Mark this section as complete” when comfortable with the topic.</li>
            <li>Move to Module 2 practice questions when you reach 100%.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- SECTION 1 -->
    <section id="m2p-section-1" class="tk-section" data-training-section="1">
      <h2>1. Nectar production and availability</h2>
      <p>
        Nectar is produced in nectaries in flowers or extrafloral structures. Its sugar concentration
        and availability vary with weather, species and time of day.
      </p>

      <h3>Factors affecting nectar flow</h3>
      <ul>
        <li><strong>Temperature</strong> – warm, stable weather increases secretion.</li>
        <li><strong>Soil moisture</strong> – drought reduces nectar; rehydration improves flows.</li>
        <li><strong>Time of day</strong> – peak production often mid-morning or early afternoon.</li>
        <li><strong>Plant species</strong> – some give large flows (e.g. oilseed rape), others sparse.</li>
      </ul>

      <h3>Nectar composition</h3>
      <ul>
        <li>Sugars: primarily sucrose, glucose and fructose.</li>
        <li>Water content varies (often 40–80%).</li>
        <li>Amino acids, minerals and trace compounds influence flavour.</li>
      </ul>

      <p>
        Understanding nectar flow helps explain variation in honey yields and why colonies expand or
        contract their foraging effort.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 2 -->
    <section id="m2p-section-2" class="tk-section" data-training-section="2">
      <h2>2. Pollen production and nutritional value</h2>
      <p>
        Pollen is the primary protein source for honey bees and is essential for brood food
        production. Its value varies greatly between plant species.
      </p>

      <h3>Pollen characteristics</h3>
      <ul>
        <li>Protein content varies widely (7–35%).</li>
        <li>Grain size, colour and texture depend on plant species.</li>
        <li>Pollen loads are packed into corbiculae on hind legs.</li>
      </ul>

      <h3>Why pollen matters</h3>
      <ul>
        <li>Supports brood rearing and adult gland development.</li>
        <li>Influences colony growth and spring build-up.</li>
        <li>Shortages limit brood production even if nectar is abundant.</li>
      </ul>

      <p>
        Exams may ask about “balanced nutrition” or “differences between nectar and pollen”.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 3 -->
    <section id="m2p-section-3" class="tk-section" data-training-section="3">
      <h2>3. Major UK forage plants and flowering periods</h2>
      <p>
        Good beekeeping involves understanding local forage. Colonies rely on predictable nectar and
        pollen flows throughout the year.
      </p>

      <h3>Key sources by season (examples)</h3>
      <ul>
        <li><strong>Spring:</strong> willow, dandelion, sycamore, fruit blossom, OSR.</li>
        <li><strong>Early summer:</strong> clover, bramble, lime, horse chestnut.</li>
        <li><strong>Late summer:</strong> heather, Himalayan balsam, rosebay willowherb.</li>
        <li><strong>Autumn:</strong> ivy provides vital late nectar and pollen.</li>
      </ul>

      <h3>Why flowering periods matter</h3>
      <ul>
        <li>Predicting honey flows and supers requirements.</li>
        <li>Managing swarm risk during peak forage.</li>
        <li>Planning feeding when forage gaps occur.</li>
      </ul>

      <p>
        Many Module 2 questions ask candidates to “describe the seasonal forage available to bees”.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 4 -->
    <section id="m2p-section-4" class="tk-section" data-training-section="4">
      <h2>4. How bees collect and process nectar into honey</h2>
      <p>
        Bees transform nectar into ripe honey through physical processing and enzymatic changes.
      </p>

      <h3>Stages of honey production</h3>
      <ul>
        <li><strong>Foraging:</strong> nectar collected into the crop.</li>
        <li><strong>Enzymes added:</strong> invertase converts sucrose to glucose/fructose.</li>
        <li><strong>Transfer:</strong> nectar passed to house bees through trophallaxis.</li>
        <li><strong>Ripening:</strong> spread over cells; evaporated by warm air currents and fanning.</li>
        <li><strong>Capping:</strong> sealed with wax once water content is ~17–18%.</li>
      </ul>

      <h3>Why unripe honey ferments</h3>
      <ul>
        <li>High water content encourages yeast activity.</li>
        <li>Proper ripening prevents spoilage and maintains shelf life.</li>
      </ul>

      <p>
        Examiners often expect clear explanation of how honey becomes “ripe”.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 5 -->
    <section id="m2p-section-5" class="tk-section" data-training-section="5">
      <h2>5. Honey types, crystallisation and storage</h2>
      <p>
        Different honeys behave differently depending on floral source, sugar ratio and storage
        conditions.
      </p>

      <h3>Types of honey</h3>
      <ul>
        <li>Blossom, comb, chunk and extracted.</li>
        <li>Monofloral (OSR, heather, borage) and polyfloral.</li>
        <li>Set or runny depending on glucose–fructose ratio.</li>
      </ul>

      <h3>Crystallisation</h3>
      <ul>
        <li>High glucose honeys (e.g. OSR) crystallise rapidly.</li>
        <li>Fine crystals form in cool conditions.</li>
        <li>Gentle warming (≈ 30–40°C) re-liquefies honey without damaging enzymes.</li>
      </ul>

      <h3>Storage</h3>
      <ul>
        <li>Store in airtight, food-safe containers.</li>
        <li>Avoid contamination with odours or moisture.</li>
        <li>Protect from light and heat to preserve flavour and enzymes.</li>
      </ul>

      <p>
        Honey properties and crystallisation behaviour come up frequently in exams.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 6 -->
    <section id="m2p-section-6" class="tk-section" data-training-section="6">
      <h2>6. Beeswax: production, properties and uses</h2>
      <p>
        Beeswax is produced by young worker bees and has many natural and commercial uses.
      </p>

      <h3>Production</h3>
      <ul>
        <li>Secreted from wax glands on abdominal segments 4–7.</li>
        <li>Formed into scales, manipulated with mandibles.</li>
        <li>Requires a high energy intake — many pounds of honey per pound of wax.</li>
      </ul>

      <h3>Properties</h3>
      <ul>
        <li>Melting point around 62–65°C.</li>
        <li>Hydrophobic and naturally antibacterial.</li>
        <li>Composition includes esters, hydrocarbons and fatty acids.</li>
      </ul>

      <h3>Uses</h3>
      <ul>
        <li>Foundation sheets and comb building.</li>
        <li>Candles, cosmetics, furniture polish.</li>
        <li>Food wraps and balms.</li>
      </ul>

      <p>
        Exam questions often ask candidates to describe wax production and economic value.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 7 -->
    <section id="m2p-section-7" class="tk-section" data-training-section="7">
      <h2>7. Propolis, royal jelly and other hive products</h2>
      <p>
        Besides honey and wax, bees produce several other important substances.
      </p>

      <h3>Propolis</h3>
      <ul>
        <li>Resinous material collected from tree buds and sap flows.</li>
        <li>Used to seal gaps, varnish surfaces, reduce draughts and maintain hive hygiene.</li>
        <li>Contains antimicrobial compounds.</li>
      </ul>

      <h3>Royal jelly</h3>
      <ul>
        <li>Produced by nurse bees from hypopharyngeal and mandibular glands.</li>
        <li>Fed to larvae during early life; continuous feeding creates queens.</li>
      </ul>

      <h3>Other products</h3>
      <ul>
        <li><strong>Pollen</strong> – harvested and sold as a supplement.</li>
        <li><strong>Bee venom</strong> – niche therapeutic uses.</li>
        <li><strong>Bee bread</strong> – fermented pollen stores rich in nutrients.</li>
      </ul>

      <p>
        Many exam questions ask for differences between these products and their uses.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 8 -->
    <section id="m2p-section-8" class="tk-section" data-training-section="8">
      <h2>8. Honey extraction and processing (safe practice)</h2>
      <p>
        Hygienic extraction and correct handling of honey is essential for producing a safe, legal
        and high-quality product.
      </p>

      <h3>Good extraction practice</h3>
      <ul>
        <li>Use clean, food-grade equipment.</li>
        <li>Warm supers gently if needed (not above ~35°C).</li>
        <li>Uncap using knives, forks or rollers.</li>
        <li>Extract with a manual or electric centrifuge.</li>
        <li>Filter to remove wax; allow air bubbles to settle.</li>
      </ul>

      <h3>Risks and hygiene</h3>
      <ul>
        <li>Contamination from equipment or environment.</li>
        <li>Under-ripened honey may ferment.</li>
        <li>Heating above 40°C damages enzymes and flavour.</li>
      </ul>

      <p>
        Food hygiene is one of the biggest topics in the real exam.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 9 -->
    <section id="m2p-section-9" class="tk-section" data-training-section="9">
      <h2>9. Food safety, regulations and honey labelling (UK)</h2>
      <p>
        Honey is regulated under UK food law. Beekeepers must comply with hygiene and labelling
        requirements when selling to the public.
      </p>

      <h3>Legal requirements</h3>
      <ul>
        <li>Honey must be pure, natural and not heated excessively.</li>
        <li>Cannot contain added sugars, flavours or colourings.</li>
        <li>Must meet moisture limit (≤ 20%, lower for heather honey).</li>
      </ul>

      <h3>Labelling rules (key points)</h3>
      <ul>
        <li>Product name (“Honey”, “Heather Honey”, etc.).</li>
        <li>Country of origin or “Blend of EU/non-EU honeys”.</li>
        <li>Weight (metric).</li>
        <li>Lot/batch number.</li>
        <li>Best-before date.</li>
        <li>Name &amp; address of producer.</li>
      </ul>

      <h3>Food hygiene basics</h3>
      <ul>
        <li>Register with local authority if selling regularly.</li>
        <li>Maintain clean workspaces and food-safe surfaces.</li>
        <li>Keep extraction area free from pets and pests.</li>
      </ul>

      <p>
        Exam questions often test knowledge of legal honey definitions and labelling requirements.
      </p>

      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 10 -->
    <section id="m2p-section-10" class="tk-section" data-training-section="10">
      <h2>10. Linking forage, products and management decisions</h2>
      <p>
        Understanding forage and hive products helps beekeepers make effective seasonal decisions.
      </p>

      <h3>Examples of management links</h3>
      <ul>
        <li><strong>Forage gaps</strong> – may require feeding or brood management.</li>
        <li><strong>Major nectar flows</strong> – need timely supering to prevent swarming.</li>
        <li><strong>Pollen shortages</strong> – limit brood rearing even when nectar is abundant.</li>
        <li><strong>Ivy flow</strong> – late season nectar that granulates quickly; affects winter stores.</li>
        <li><strong>Wax production cost</strong> – influences decisions about foundation and letting bees draw comb.</li>
      </ul>

      <p>
        Exam answers should always tie biological or product-based knowledge back to practical
        beekeeping actions and timing.
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
    window.BKTraining.initTrainingProgressForModule(container, "module2", 10);
  }
}
