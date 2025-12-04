// Tutorials/js/views/module6-answers.js
// SPA view for "Module 6 – Honey Bee Behaviour" model answers

export function renderModule6Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Module 6 – Honey Bee Behaviour</h2>
        <p class="tk-content-subtitle">
          Use these answers as a guide. In an exam you may word things differently,
          but you should cover the same key points.
        </p>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft);">
          Tip: read each answer and tick off the main ideas you included in your own notes.
          You do not need to memorise every word – focus on concepts, terminology and clear structure.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Colony organisation &amp; communication</h3>
      </section>

      <section>
        <h4>Question 1 – Definition of behaviour</h4>
        <p><strong>Model answer:</strong>
          Behaviour is the observable actions and responses of bees, both individually and collectively,
          to internal and external stimuli. In honey bees it is helpful to think of the colony as
          a “superorganism”, where the individual bees act like cells in a larger body. Many behaviours
          (e.g. brood care, defence, foraging) only make sense when seen at colony level, not as
          isolated individuals.
        </p>
      </section>

      <section>
        <h4>Question 2 – Division of labour</h4>
        <p><strong>Model answer:</strong>
          Worker bees show age-related division of labour (temporal polyethism). Very young workers
          (0–3 days) clean cells and warm brood, slightly older workers feed larvae and attend the queen,
          then progress to comb building, food processing and storing. Older workers take on guarding
          and finally foraging outside the hive. This system ensures that the most valuable bees (young
          ones) remain in the hive, while the oldest carry out the riskiest tasks.
        </p>
      </section>

      <section>
        <h4>Question 3 – Age-related tasks</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li><strong>Young workers:</strong> cell cleaning, brood warming, feeding young larvae.</li>
          <li><strong>Middle-aged workers:</strong> feeding older larvae and queen, comb building,
              nectar ripening, ventilating the hive.</li>
          <li><strong>Older workers:</strong> guarding the entrance, undertaking dead bees,
              foraging for nectar, pollen, water and propolis.</li>
        </ul>
      </section>

      <section>
        <h4>Question 4 – Trophallaxis</h4>
        <p><strong>Model answer:</strong>
          Trophallaxis is the mouth-to-mouth exchange of food and glandular secretions between bees.
          It distributes nectar and honey throughout the colony and also spreads pheromones and other
          chemical signals. This helps coordinate colony activities and maintains social cohesion.
        </p>
      </section>

      <section>
        <h4>Question 5 – Queen pheromones</h4>
        <p><strong>Model answer (two points):</strong></p>
        <ul>
          <li>Queen mandibular pheromone helps inhibit worker ovary development and suppresses queen
              cell production when the queen is healthy and present.</li>
          <li>It acts as a contact pheromone that attracts a retinue of workers, encouraging grooming
              and feeding and helping distribute queen scent throughout the colony.</li>
        </ul>
      </section>

      <section>
        <h4>Question 6 – Brood pheromones</h4>
        <p><strong>Model answer:</strong>
          Brood pheromones come from eggs and larvae. They stimulate nurse bees to feed and care
          for brood, influence the ratio of brood to foragers, and can delay worker transition from
          nursing to foraging. They ensure that sufficient workers are available to rear brood when
          brood levels are high.
        </p>
      </section>

      <section>
        <h4>Question 7 – Alarm pheromones</h4>
        <p><strong>Model answer:</strong>
          Alarm pheromones (e.g. from the sting apparatus) recruit other workers to defend the colony
          and direct them to the source of disturbance. A beekeeper may trigger their release by
          rough handling, crushing bees, or excessive use of manipulations at the entrance.
          Strong smells like sweat or dark clothing can also provoke defensive responses.
        </p>
      </section>

      <section>
        <h4>Question 8 – Orientation flights</h4>
        <p><strong>Model answer:</strong>
          Orientation flights are short, looping flights taken by young bees around the hive entrance
          to learn its position relative to landmarks and the sun. They usually occur on warm, calm
          afternoons and allow bees to find their way back once they become foragers.
        </p>
      </section>

      <section>
        <h4>Question 9 – Waggle dance</h4>
        <p><strong>Model answer:</strong>
          The waggle dance is a figure-of-eight dance used by foragers to indicate the direction and
          distance of a profitable food or water source, or a new nest site. The angle of the waggle
          run relative to vertical shows the direction relative to the sun, and the duration of the
          waggle run indicates distance.
        </p>
      </section>

      <section>
        <h4>Question 10 – Round dance</h4>
        <p><strong>Model answer:</strong>
          The round dance consists of circular movements and is used for relatively short-distance
          sources close to the hive (often within about 50–100 m). It communicates that food is nearby
          but does not give precise directional information, encouraging recruits to search around
          the hive.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Defensive, hygienic &amp; reproductive behaviour</h3>
      </section>

      <section>
        <h4>Question 11 – Guard bees</h4>
        <p><strong>Model answer:</strong>
          Guard bees stand at or near the hive entrance. They inspect incoming bees, rejecting
          those with unfamiliar odours, and defend against wasps or robber bees. They use smell
          (colony odour), behaviour and sometimes size or species differences to recognise intruders.
        </p>
      </section>

      <section>
        <h4>Question 12 – Defensive behaviour</h4>
        <p><strong>Model answer (any three):</strong></p>
        <ul>
          <li>Genetic strain or breeding history.</li>
          <li>Weather conditions (cold, thundery or very windy weather often increases defensiveness).</li>
          <li>Nectar flow (colonies can be calmer on a good flow and more defensive in a dearth).</li>
          <li>Queen age or queenlessness.</li>
          <li>Handling technique and smell of the beekeeper.</li>
        </ul>
      </section>

      <section>
        <h4>Question 13 – Stinging behaviour</h4>
        <p><strong>Model answer:</strong>
          When a worker bee stings a mammal, the barbed sting lodges in the skin and tears out of the
          abdomen, along with venom sac and associated muscles. These continue to pump venom into
          the wound. The loss of abdominal tissue is fatal to the worker, so she dies shortly afterwards.
        </p>
      </section>

      <section>
        <h4>Question 14 – Robbing</h4>
        <p><strong>Model answer:</strong>
          Robbing is when bees from strong colonies steal honey from weaker ones or from exposed combs.
          At the entrance you may see frenetic flight, bees darting around, fighting, wax crumbs and
          honey spillage, and bees trying to enter through cracks rather than the normal entrance.
        </p>
      </section>

      <section>
        <h4>Question 15 – Reducing robbing risk</h4>
        <p><strong>Model answer (three examples):</strong></p>
        <ul>
          <li>Avoid leaving honey or wet combs exposed in the apiary.</li>
          <li>Reduce the entrance of weak colonies so they can defend themselves.</li>
          <li>Work quickly, keep the hive open for as short a time as possible and avoid spilling syrup or honey.</li>
          <li>Feed in the evening and avoid open feeding in the apiary.</li>
        </ul>
      </section>

      <section>
        <h4>Question 16 – Hygienic behaviour</h4>
        <p><strong>Model answer:</strong>
          Hygienic behaviour is the ability of bees to detect, uncap and remove diseased or dead brood.
          It helps reduce the spread of brood diseases and limits reproduction of varroa mites, so it is
          considered a desirable, heritable trait in breeding programmes.
        </p>
      </section>

      <section>
        <h4>Question 17 – Grooming behaviour</h4>
        <p><strong>Model answer:</strong>
          Grooming behaviour is the removal of parasites or debris from the body. Bees may groom
          themselves or each other. Effective grooming can dislodge varroa mites and other external
          parasites, reducing their numbers in the colony.
        </p>
      </section>

      <section>
        <h4>Question 18 – Swarming cues</h4>
        <p><strong>Model answer (any three):</strong></p>
        <ul>
          <li>Presence of charged swarm queen cells on the edges or lower parts of combs.</li>
          <li>Crowding in the brood nest, with little space for the queen to lay.</li>
          <li>Large numbers of bees hanging in a beard at the entrance.</li>
          <li>Reduced queen pheromone distribution due to colony size.</li>
        </ul>
      </section>

      <section>
        <h4>Question 19 – Swarm clustering</h4>
        <p><strong>Model answer:</strong>
          After leaving the hive the swarm usually gathers on a nearby object such as a branch or fence post,
          forming a cluster around the queen. Scout bees then search for suitable nest sites, returning to
          the cluster and dancing to advertise them. Once a decision is reached the swarm flies off to the
          chosen site.
        </p>
      </section>

      <section>
        <h4>Question 20 – Supersedure vs swarming</h4>
        <p><strong>Model answer:</strong>
          In supersedure the colony replaces an ageing or failing queen without swarming. There are usually
          fewer queen cells (often in the middle of the combs) and the old queen often remains in the hive
          until the new one is laying. In swarming, many queen cells are built and the old queen leaves with
          part of the workforce, leaving developing queens behind.
        </p>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Foraging, navigation &amp; learning</h3>
      </section>

      <section>
        <h4>Question 21 – Foraging range</h4>
        <p><strong>Model answer:</strong>
          Bees can typically forage within 2–3 km of the hive and further if necessary. The actual range
          is influenced by forage availability and quality, weather, landscape features and colony strength.
          They will usually exploit nearer sources first if these are profitable.
        </p>
      </section>

      <section>
        <h4>Question 22 – Daily activity pattern</h4>
        <p><strong>Model answer:</strong>
          Foraging often starts once temperatures rise and light levels are adequate, increasing through
          late morning and early afternoon, then declining in the evening. Bad weather (cold, rain, wind)
          suppresses or stops foraging, while strong nectar flows can extend activity for more of the day.
        </p>
      </section>

      <section>
        <h4>Question 23 – Drifting</h4>
        <p><strong>Model answer:</strong>
          Drifting is when foragers return to the wrong hive, often one nearby with a stronger odour or more
          conspicuous entrance. Hives in straight rows, identical colours and close spacing can increase
          drifting. Staggered lines or different coloured hive fronts help reduce it.
        </p>
      </section>

      <section>
        <h4>Question 24 – Queenless colony behaviour</h4>
        <p><strong>Model answer (any three):</strong></p>
        <ul>
          <li>Increased noise level and a higher-pitched “queenless roar”.</li>
          <li>Restless bees and disorganised behaviour on the combs.</li>
          <li>Lack of eggs or young brood after some time.</li>
          <li>Construction of emergency queen cells if young larvae are present.</li>
        </ul>
      </section>

      <section>
        <h4>Question 25 – Laying workers</h4>
        <p><strong>Model answer:</strong>
          In a laying worker colony, several workers develop functional ovaries and lay unfertilised eggs.
          The brood pattern is patchy with multiple eggs per cell and many drone cells in worker comb.
          There is no single queen, bees may be nervous and the colony can be difficult to re-queen.
        </p>
      </section>

      <section>
        <h4>Question 26 – Orientation and landmarks</h4>
        <p><strong>Model answer:</strong>
          Bees learn landmarks such as trees, buildings and hedges around the hive and use the sun’s position
          (and polarised light pattern) as a compass. Together with their internal clock this allows them
          to navigate back to the hive and communicate directions via the waggle dance.
        </p>
      </section>

      <section>
        <h4>Question 27 – Learning and memory</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li>Foragers learn the location and smell of profitable forage and will repeatedly visit it.</li>
          <li>Bees can learn to associate colours, scents or patterns with a food reward.</li>
          <li>Guard bees remember typical hive odour and reject unfamiliar bees.</li>
        </ul>
      </section>

      <section>
        <h4>Question 28 – Influence of forage availability</h4>
        <p><strong>Model answer:</strong>
          When nectar or pollen is abundant, more foragers are recruited and dance activity increases.
          In a dearth, recruitment falls, bees may conserve stores, reduce brood rearing and can become
          more defensive or susceptible to robbing.
        </p>
      </section>

      <section>
        <h4>Question 29 – Handling and temperament</h4>
        <p><strong>Model answer:</strong>
          Calm, gentle handling with adequate smoke, slow movements and minimal crushing of bees helps
          keep colonies docile and reduces defensive responses. Rough handling, banging, poor use of smoke
          and repeatedly opening the hive in bad weather can appear to “make bees bad” over time, although
          genetics remain the underlying factor.
        </p>
      </section>

      <section>
        <h4>Question 30 – Long-term selection by behaviour</h4>
        <p><strong>Model answer:</strong>
          By consistently re-queening from the calmest, healthiest and most productive colonies and avoiding
          breeding from aggressive or unmanageable ones, a beekeeper gradually improves the overall
          temperament and performance of the apiary. It may take several seasons, but the behavioural
          profile of the bees can be noticeably improved.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module6" class="tk-btn tk-btn-secondary">
        Back to Module 6 questions
      </a>
      <a href="#/module7" class="tk-btn tk-btn-primary">
        Continue to Module 7 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
}
