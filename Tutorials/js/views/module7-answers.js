// Tutorials/js/views/module7-answers.js
// SPA view for "Module 7 – Selection & Breeding" model answers

export function renderModule7Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Module 7 – Selection &amp; Breeding</h2>
        <p class="tk-content-subtitle">
          These answers highlight the key points examiners are likely to look for. Add local or
          association experience where appropriate.
        </p>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft);">
          When marking yourself, check that you have covered the main ideas rather than identical wording.
          Many questions can be answered with examples from your own bees.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Breeding goals &amp; basic genetics</h3>
      </section>

      <section>
        <h4>Question 1 – Purpose of selective breeding</h4>
        <p><strong>Model answer:</strong>
          The main purpose of selective breeding is to improve future generations of bees by increasing
          desirable traits (e.g. calmness, productivity, disease resistance) and reducing undesirable
          ones (e.g. aggression, high swarming tendency). Over time this leads to better-performing
          colonies for the beekeeper and healthier bees.
        </p>
      </section>

      <section>
        <h4>Question 2 – Desirable traits</h4>
        <p><strong>Model answer (any four):</strong></p>
        <ul>
          <li>Good temperament and low defensiveness.</li>
          <li>High honey production or good use of forage.</li>
          <li>Low swarming tendency and good queen longevity.</li>
          <li>Good hygienic behaviour and disease resistance.</li>
          <li>Low propolis and brace comb where appropriate.</li>
        </ul>
      </section>

      <section>
        <h4>Question 3 – Genotype and phenotype</h4>
        <p><strong>Model answer:</strong>
          Genotype is the genetic make-up of an individual or colony – the genes they carry.
          Phenotype is what we actually see expressed: behaviour, productivity, colour and so on.
          The phenotype results from the interaction between genotype and the environment (e.g. climate,
          forage, management).
        </p>
      </section>

      <section>
        <h4>Question 4 – Temperament</h4>
        <p><strong>Model answer:</strong>
          Temperament – how calm or defensive a colony is – has a strong genetic component and is
          therefore heritable. It is important because colonies that are gentle are easier and safer
          to manage, reduce the risk of stinging incidents and allow more thorough inspections, which
          supports good husbandry.
        </p>
      </section>

      <section>
        <h4>Question 5 – Open mating</h4>
        <p><strong>Model answer:</strong>
          Open mating is when queens mate naturally with drones in the environment, usually at drone
          congregation areas. A limitation is lack of control over which drones they mate with, so the
          beekeeper cannot fully control the genetics of the offspring.
        </p>
      </section>

      <section>
        <h4>Question 6 – Instrumental insemination</h4>
        <p><strong>Model answer:</strong>
          Instrumental insemination is an artificial method where semen is collected from selected drones
          and injected into a queen under controlled conditions. It is used in research and high-level
          breeding programmes to control parentage and maintain specific lines, but is specialised and
          not usually used by hobbyists.
        </p>
      </section>

      <section>
        <h4>Question 7 – Drone congregation areas</h4>
        <p><strong>Model answer:</strong>
          Drone congregation areas are specific locations where drones gather each day to fly and wait
          for virgin queens. Queens fly to these areas to mate. DCAs help ensure queens mate with many
          drones from a wide area, increasing genetic diversity.
        </p>
      </section>

      <section>
        <h4>Question 8 – Drone quality</h4>
        <p><strong>Model answer:</strong>
          High-quality drones come from strong, healthy colonies fed well with plenty of drone comb.
          Avoid treating drone brood with miticides while it is developing, and ensure colonies selected
          to rear drones have desirable traits, as they contribute half the genetics of future queens.
        </p>
      </section>

      <section>
        <h4>Question 9 – Environment and mating</h4>
        <p><strong>Model answer:</strong>
          Good mating requires suitable weather (warm, calm and dry), adequate drone availability,
          and access to DCAs. Wind, rain or low temperatures may prevent flights, leading to poorly
          mated queens that show patchy brood or early supersedure.
        </p>
      </section>

      <section>
        <h4>Question 10 – Genetic diversity</h4>
        <p><strong>Model answer:</strong>
          Genetic diversity means a wide range of genes within the bee population. It is important
          for resilience to disease, parasites and environmental change, and helps avoid inbreeding
          problems such as poor brood viability and weak colonies.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Hygienic traits, mating systems &amp; queen rearing</h3>
      </section>

      <section>
        <h4>Question 11 – Hygienic behaviour tests</h4>
        <p><strong>Model answer:</strong>
          A simple test is to kill a patch of capped brood (e.g. with a pin test or liquid nitrogen)
          and then measure how quickly bees uncap and remove the dead brood. Colonies that remove a high
          proportion within 24 hours are considered more hygienic and good candidates for breeding.
        </p>
      </section>

      <section>
        <h4>Question 12 – Breeder queen</h4>
        <p><strong>Model answer:</strong>
          A breeder queen is a queen selected as the main mother for future queens. She is evaluated
          over at least one full season for traits such as brood pattern, temperament, honey yield,
          wintering ability and disease resistance. Only queens with consistently good performance
          should be used as breeders.
        </p>
      </section>

      <section>
        <h4>Question 13 – Inbreeding drawbacks</h4>
        <p><strong>Model answer (any three):</strong></p>
        <ul>
          <li>Increased risk of diploid drones and brood inviability due to complementary sex determiner issues.</li>
          <li>Reduced vigour and productivity.</li>
          <li>Higher susceptibility to disease and parasites.</li>
          <li>Loss of genetic diversity and adaptability.</li>
        </ul>
      </section>

      <section>
        <h4>Question 14 – Pin or liquid nitrogen test</h4>
        <p><strong>Model answer:</strong>
          In these tests a patch of brood is killed – either by piercing sealed cells with a pin or by
          freezing them with liquid nitrogen. The colony’s response is timed. Hygienic bees uncap and
          remove the dead brood quickly, showing that they can detect and clear diseased or damaged brood.
        </p>
      </section>

      <section>
        <h4>Question 15 – Weather and mating flights</h4>
        <p><strong>Model answer:</strong>
          Queens normally require several mating flights over a number of days to mate with enough drones.
          This requires repeated periods of warm, dry, relatively calm weather. Prolonged poor weather
          can lead to poorly mated queens or complete mating failure.
        </p>
      </section>

      <section>
        <h4>Question 16 – Well-mated queen indicators</h4>
        <p><strong>Model answer (any two):</strong></p>
        <ul>
          <li>Solid, even brood pattern with few empty cells in the brood area.</li>
          <li>Presence of both worker and drone brood in appropriate proportions.</li>
          <li>Strong colony population and steady build-up.</li>
        </ul>
      </section>

      <section>
        <h4>Question 17 – Drone saturation</h4>
        <p><strong>Model answer:</strong>
          Drone saturation is the deliberate provision of large numbers of drones from colonies with
          desirable traits in the area where queens mate. This increases the chance that queens mate
          with drones from those selected colonies rather than random stock.
        </p>
      </section>

      <section>
        <h4>Question 18 – Closed breeding system</h4>
        <p><strong>Model answer:</strong>
          A closed breeding system is where most or all queens and drones used in mating come from
          within the breeder’s own controlled population, often in an isolated mating area or island.
          This allows more control over genetics but requires careful management to avoid inbreeding.
        </p>
      </section>

      <section>
        <h4>Question 19 – Simple queen-rearing method</h4>
        <p><strong>Model answer (example):</strong>
          A simple method is to remove a frame with young larvae from a good colony and place it in
          a queenless “starter” colony, encouraging them to raise emergency queen cells. Alternatively,
          use a small nuc with young larvae and destroy unwanted queen cells, keeping only the best.
          Candidates should describe the main steps clearly.
        </p>
      </section>

      <section>
        <h4>Question 20 – Breeding and treatments</h4>
        <p><strong>Model answer:</strong>
          By selecting stock that shows better tolerance to varroa and good hygienic behaviour, the
          need for chemical treatments may be reduced. Stronger disease resistance means colonies
          can cope better with pests and pathogens, allowing lower treatment frequency or “soft”
          approaches, under veterinary and legal guidance.
        </p>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Assessing stock &amp; managing a breeding programme</h3>
      </section>

      <section>
        <h4>Question 21 – Temperament in inspections</h4>
        <p><strong>Model answer:</strong>
          Temperament is apparent from the moment you approach the hive: whether bees remain calm on the
          combs, run about, ping off the veil, or follow the beekeeper. First impressions during opening
          and early frames usually reveal if the colony is pleasant to handle.
        </p>
      </section>

      <section>
        <h4>Question 22 – Productivity and breeding</h4>
        <p><strong>Model answer:</strong>
          Colonies that consistently produce good crops relative to others in the same apiary and conditions
          are valuable breeding candidates. High productivity, combined with good behaviour and health,
          shows that the genetics are suitable for the area and management system.
        </p>
      </section>

      <section>
        <h4>Question 23 – Supersedure vs swarming</h4>
        <p><strong>Model answer:</strong>
          Supersedure is when a colony replaces its queen without swarming, often because she is failing
          or damaged. The old queen usually remains until the new one is laying. Swarming is a reproductive
          process where the old queen leaves with part of the workforce to found a new colony.
        </p>
      </section>

      <section>
        <h4>Question 24 – Nurse bees and queen cells</h4>
        <p><strong>Model answer:</strong>
          Nurse bees feed and tend queen larvae with large amounts of royal jelly and maintain correct
          temperature and humidity around queen cells. Without plenty of young nurse bees, queen cells
          may be poorly provisioned, resulting in inferior queens.
        </p>
      </section>

      <section>
        <h4>Question 25 – Consistency of worker behaviour</h4>
        <p><strong>Model answer:</strong>
          A beekeeper can record behaviour at each inspection (calm, average, defensive), along with
          notes on productivity and disease. By comparing records over several seasons they can see
          whether a colony or line consistently performs well, rather than judging on a single visit.
        </p>
      </section>

      <section>
        <h4>Question 26 – Assessing virgin queens</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li>Body size and symmetry (well-formed, no deformities).</li>
          <li>Condition of wings and legs.</li>
          <li>General vigour and activity level in the cage or on the comb.</li>
        </ul>
      </section>

      <section>
        <h4>Question 27 – Mating nucs</h4>
        <p><strong>Model answer:</strong>
          A mating nuc is a small colony – usually a few frames – used to house a virgin queen until she
          mates and begins to lay. It is economical in bees and equipment, and makes it easier to manage
          multiple queens at once.
        </p>
      </section>

      <section>
        <h4>Question 28 – Culling queen cells</h4>
        <p><strong>Model answer:</strong>
          Culling removes poorly positioned or undersized queen cells so that resources are concentrated
          on a smaller number of well-placed, well-fed cells. This helps ensure that the queens that emerge
          are of better quality.
        </p>
      </section>

      <section>
        <h4>Question 29 – Heritability</h4>
        <p><strong>Model answer:</strong>
          Heritability is the proportion of variation in a trait that can be attributed to genetic
          differences rather than environment. Traits with high heritability respond well to selection,
          while low heritability traits are more influenced by management and conditions.
        </p>
      </section>

      <section>
        <h4>Question 30 – Long-term breeding line challenges</h4>
        <p><strong>Model answer:</strong>
          Challenges include avoiding inbreeding in a limited population, maintaining enough drones of
          the chosen line, preventing introgression from uncontrolled matings, and ensuring that selection
          for specific traits does not accidentally worsen others (e.g. selecting only for honey yield
          and neglecting temperament).
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module7" class="tk-btn tk-btn-secondary">
        Back to Module 7 questions
      </a>
      <a href="#/module8" class="tk-btn tk-btn-primary">
        Continue to Module 8 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
}
