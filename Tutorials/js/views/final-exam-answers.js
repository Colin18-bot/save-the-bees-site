// Tutorials/js/views/final-exam-answers.js
// SPA view for the "Final Mock Exam – Model Answers" page
// This is the content from final-exam-answers.html inside <section class="tk-content">…</section>

export function renderFinalExamAnswers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Marking guide – Final mock exam</h2>
        <p class="tk-content-subtitle">
          You don’t need to match the wording exactly, but your answers should cover the main
          ideas and use appropriate terminology.
        </p>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft);">
          For each question, give yourself roughly 1 mark per key idea you included.
          Use this to spot areas where you need to revisit a module rather than to
          calculate an exact exam score.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:16px;">

      <!-- Section 1 -->
      <section>
        <h3>Section 1 – Management &amp; Manipulation (Module 1)</h3>
      </section>

      <section>
        <h4>Question 1 – First full inspection of the season</h4>
        <p><strong>Model answer (key points):</strong></p>
        <ul>
          <li><strong>Preparation:</strong> choose a mild, calm day; have smoker, fuel, hive tool,
              spare equipment and record card ready.</li>
          <li><strong>Approach:</strong> use cool smoke at entrance and under the crownboard, work from
              the side or back of the hive.</li>
          <li><strong>Frame sequence:</strong> remove an outside frame first to make space, then work
              through brood box frame by frame.</li>
          <li><strong>What to check:</strong> presence of eggs/young brood (queenright), brood pattern,
              signs of disease, food stores, room for laying, and signs of swarm preparation.</li>
          <li><strong>Actions:</strong> adjust frames, add feed if short of stores, mark records,
              consider space (supering) and plan follow-up inspections.</li>
        </ul>
      </section>

      <section>
        <h4>Question 2 – Artificial swarm</h4>
        <p><strong>Model answer (example – “Pagden” type):</strong></p>
        <ul>
          <li>Used to control swarming by separating flying bees and old queen from brood and queen cells.</li>
          <li>Move original hive to the side; place a new hive with drawn comb or foundation on original stand.</li>
          <li>Find the queen and place her with one or two brood frames and food into the new hive (on the old position).</li>
          <li>Flying bees return to the new hive with the old queen; queen cells and brood remain in the old hive on a new site.</li>
          <li>Reduce queen cells to one good cell later; monitor both colonies and adjust supers as needed.</li>
        </ul>
      </section>

      <!-- Section 2 -->
      <section>
        <h3>Section 2 – Products &amp; Forage (Module 2)</h3>
      </section>

      <section>
        <h4>Question 3 – Nectar flow and apiary management</h4>
        <p><strong>Model answer:</strong></p>
        <ul>
          <li>A nectar flow is a period when forage plants are yielding substantial nectar that bees can collect.</li>
          <li>Beekeeper should ensure colonies are strong and queenright before the flow.</li>
          <li>Provide sufficient super space in advance of the flow to avoid congestion and reduce swarming.</li>
          <li>Avoid unnecessary disturbance during a major flow so bees can forage efficiently.</li>
        </ul>
      </section>

      <section>
        <h4>Question 4 – Honey extraction</h4>
        <p><strong>Model answer (main steps):</strong></p>
        <ul>
          <li>Remove supers with <strong>ripe, capped combs</strong> (test with shake test if needed).</li>
          <li>Clear bees from supers (bee escape, brushing, or other suitable method).</li>
          <li>Uncap frames using knife or uncapping fork.</li>
          <li>Spin in an extractor until cells are emptied.</li>
          <li>Strain honey through sieves or filters and allow to settle to remove bubbles and debris.</li>
          <li>Jar into clean, dry containers and label in accordance with regulations.</li>
        </ul>
      </section>

      <!-- Section 3 -->
      <section>
        <h3>Section 3 – Pests, Diseases &amp; Poisoning (Module 3)</h3>
      </section>

      <section>
        <h4>Question 5 – Foulbrood recognition</h4>
        <p><strong>Model answer (compare and contrast):</strong></p>
        <ul>
          <li><strong>EFB:</strong> usually affects unsealed or recently sealed larvae; larvae off-centre,
              twisted in cells, yellowish, granular, sour smell sometimes; scales are loose and easy
              to remove. Brood pattern often patchy but cappings may look normal.</li>
          <li><strong>AFB:</strong> mainly affects sealed brood; cappings sunken and perforated; ropiness
              test positive (glutinous larval remains stretching in a thread); dark, hard scales stuck
              to lower cell wall, difficult to remove; characteristic smell in advanced cases.</li>
        </ul>
      </section>

      <section>
        <h4>Question 6 – Varroa monitoring</h4>
        <p><strong>Model answer (example – natural mite drop):</strong></p>
        <ul>
          <li>Place a removable floor insert or sticky board under an open-mesh floor.</li>
          <li>Leave in place for several days (e.g. 3–7 days) and count mites that fall.</li>
          <li>Calculate average daily mite drop.</li>
          <li>Compare with guidance thresholds for the season to decide if treatment is needed.</li>
          <li>Alternatively, describe sugar roll or alcohol wash and relate infestation level to treatment decisions.</li>
        </ul>
      </section>

      <!-- Section 4 -->
      <section>
        <h3>Section 4 – Honey Bee Biology (Module 5)</h3>
      </section>

      <section>
        <h4>Question 7 – Worker development</h4>
        <p><strong>Model answer (approximate timings):</strong></p>
        <ul>
          <li>Egg stage – about 3 days.</li>
          <li>Larval stage – about 6 days of feeding as larva (total 9 days from egg to capping).</li>
          <li>Pupal stage – about 12 days sealed in the cell.</li>
          <li>Worker emerges at around <strong>21 days</strong> from egg laying.</li>
        </ul>
      </section>

      <section>
        <h4>Question 8 – Worker anatomy</h4>
        <p><strong>Model answer (any three, with function):</strong></p>
        <ul>
          <li><strong>Pollen baskets (corbiculae):</strong> flattened areas with hairs on the hind legs
              used to carry pollen back to the hive.</li>
          <li><strong>Proboscis:</strong> long tongue for sucking up nectar, honey and water.</li>
          <li><strong>Wax glands:</strong> on the underside of the abdomen; secrete wax scales used
              for comb building.</li>
          <li><strong>Sting apparatus:</strong> barbed sting and venom sac for colony defence.</li>
        </ul>
      </section>

      <!-- Section 5 -->
      <section>
        <h3>Section 5 – Behaviour (Module 6)</h3>
      </section>

      <section>
        <h4>Question 9 – Swarm behaviour</h4>
        <p><strong>Model answer:</strong></p>
        <ul>
          <li>Before swarming: colony becomes crowded, queen may slim down, swarm cells built, bees may
              hang in a beard at the entrance; flying bees orient around hive.</li>
          <li>At swarming: old queen leaves with many flying bees, forming a cloud around the hive.</li>
          <li>After leaving: swarm clusters on a nearby object; bees fan at the cluster to spread queen
              scent; scout bees search for new nest sites and dance to advertise them.</li>
        </ul>
      </section>

      <section>
        <h4>Question 10 – Defensive response</h4>
        <p><strong>Model answer:</strong></p>
        <ul>
          <li>Guard bees detect disturbance and release alarm pheromones when stinging or when bees are crushed.</li>
          <li>Alarm pheromone attracts other workers and directs them to the source of disturbance.</li>
          <li>Beekeeper can minimise this by gentle handling, using cool smoke correctly, avoiding crushing bees,
              working in suitable weather, and avoiding strong perfumes or dark, furry clothing.</li>
        </ul>
      </section>

      <!-- Section 6 -->
      <section>
        <h3>Section 6 – Selection &amp; Breeding (Module 7)</h3>
      </section>

      <section>
        <h4>Question 11 – Choosing breeder colonies</h4>
        <p><strong>Model answer (key factors):</strong></p>
        <ul>
          <li>Good temperament (calm on combs, not excessively defensive).</li>
          <li>Consistent honey production relative to other colonies.</li>
          <li>Low swarming tendency when managed properly.</li>
          <li>Good brood pattern, wintering ability and disease resistance/hygienic behaviour.</li>
          <li>Performance recorded over at least one full season, not just a single inspection.</li>
        </ul>
      </section>

      <section>
        <h4>Question 12 – Open mating and drone colonies</h4>
        <p><strong>Model answer:</strong></p>
        <ul>
          <li>Place strong colonies with desirable traits near the mating area and encourage them to rear
              plenty of drones (drone comb).</li>
          <li>Reduce or move away colonies with poor traits so their drones are less likely to contribute.</li>
          <li>Where possible, use relatively isolated sites to reduce influence from unknown drones.</li>
        </ul>
      </section>

      <!-- Section 7 -->
      <section>
        <h3>Section 7 – Management, Health &amp; History (Module 8)</h3>
      </section>

      <section>
        <h4>Question 13 – Movable-frame hives and disease control</h4>
        <p><strong>Model answer:</strong></p>
        <ul>
          <li>Movable frames allow individual combs to be inspected for brood pattern and disease signs.</li>
          <li>Suspect combs can be removed, marked, or destroyed without sacrificing the whole colony.</li>
          <li>They make statutory inspections practical and support eradication of foulbrood through
              targeted destruction or shook swarm techniques.</li>
        </ul>
      </section>

      <section>
        <h4>Question 14 – Learning from history</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li>From skeps and early hives we learned the importance of being able to inspect brood, which led
              to modern movable-frame requirements.</li>
          <li>Historic honey adulteration issues led to modern labelling and quality standards, protecting
              both consumers and genuine producers.</li>
          <li>Observation hives and early naturalists showed the value of careful observation, which remains
              central to good beekeeping today.</li>
        </ul>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/final-exam" class="tk-btn tk-btn-secondary">
        Back to mock exam paper
      </a>
      <a href="#/modules" class="tk-btn tk-btn-primary">
        Back to module overview<span class="arrow">→</span>
      </a>
    </div>
  `;
}
