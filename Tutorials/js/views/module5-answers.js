// Tutorials/js/views/module5-answers.js
// SPA view for "Model Answers – Module 5 Honey Bee Biology"

export function renderModule5Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Guidance points for marking</h2>
        <p class="tk-content-subtitle">
          Use these as tutor notes or for self-marking. You can assign marks per point to suit your scheme.
        </p>
      </div>
    </header>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- Section A answers -->
      <section>
        <h3>Section A – Short-answer questions</h3>
      </section>

      <!-- A1 -->
      <section>
        <h4>Question 1 – Castes</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li><strong>Queen</strong> – primary egg-layer, produces pheromones that help regulate colony.</li>
          <li><strong>Worker</strong> – sterile females performing most tasks (nursing, foraging, defence, etc.).</li>
          <li><strong>Drone</strong> – male bees whose main role is mating with virgin queens.</li>
        </ul>
      </section>

      <!-- A2 -->
      <section>
        <h4>Question 2 – Exoskeleton</h4>
        <p><strong>Definition:</strong> Hard external skeleton made of chitin.</p>
        <p><strong>Functions (any two):</strong></p>
        <ul>
          <li>Provides protection for internal organs.</li>
          <li>Supports attachment of muscles for movement.</li>
          <li>Reduces water loss, helping prevent desiccation.</li>
        </ul>
      </section>

      <!-- A3 -->
      <section>
        <h4>Question 3 – Head structures</h4>
        <p><strong>Examples (any three, with functions):</strong></p>
        <ul>
          <li><strong>Compound eyes</strong> – vision, detecting movement and patterns.</li>
          <li><strong>Ocelli (simple eyes)</strong> – detect light intensity and help orientation.</li>
          <li><strong>Antennae</strong> – smell, taste, sense of touch and vibration.</li>
          <li><strong>Mouthparts (proboscis, mandibles)</strong> – feeding, wax manipulation, defence.</li>
        </ul>
      </section>

      <!-- A4 -->
      <section>
        <h4>Question 4 – Mouthparts</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>Long, flexible proboscis (tongue) for sipping nectar and honey.</li>
          <li>Strong mandibles for manipulating wax, building comb, grooming, and defence.</li>
          <li>Combination allows both liquid feeding and solid manipulation.</li>
        </ul>
      </section>

      <!-- A5 -->
      <section>
        <h4>Question 5 – Thorax and flight</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>Thorax houses the main flight muscles attached to the wings.</li>
          <li>Also carries the legs used for walking, cleaning and pollen collection.</li>
          <li>Robust structure with strong musculature allows sustained flight and rapid wing beats.</li>
        </ul>
      </section>

      <!-- A6 -->
      <section>
        <h4>Question 6 – Worker vs queen abdomen</h4>
        <p><strong>Differences (any two):</strong></p>
        <ul>
          <li>Worker abdomen includes developed wax glands and sting; queen has modified sting and reduced wax glands.</li>
          <li>Queen abdomen contains enlarged ovaries; workers have rudimentary ovaries.</li>
          <li>Worker abdomen involved in pollen packing on hind legs and wax secretion; queen’s mainly for egg laying.</li>
        </ul>
      </section>

      <!-- A7 -->
      <section>
        <h4>Question 7 – Development stages</h4>
        <p><strong>Correct order:</strong> egg → larva → pupa → adult.</p>
      </section>

      <!-- A8 -->
      <section>
        <h4>Question 8 – Development times</h4>
        <p><strong>Fastest:</strong> Queen (about 16 days).</p>
        <p><strong>Intermediate:</strong> Worker (about 21 days).</p>
        <p><strong>Slowest:</strong> Drone (about 24 days).</p>
        <p>(Small variation by source; the relative order is key.)</p>
      </section>

      <!-- A9 -->
      <section>
        <h4>Question 9 – Worker tasks by age</h4>
        <p><strong>Examples (any three, roughly in age order):</strong></p>
        <ul>
          <li>Young workers: cleaning cells, warming brood.</li>
          <li>Nurse bees: feeding larvae and queen with brood food/royal jelly.</li>
          <li>Middle-aged: comb building, receiving nectar from foragers, fanning for ventilation.</li>
          <li>Older workers: guard duties at entrance, foraging for nectar/pollen/water/propolis.</li>
        </ul>
      </section>

      <!-- A10 -->
      <section>
        <h4>Question 10 – Drone role</h4>
        <p><strong>Role:</strong> Mate with virgin queens from other colonies.</p>
        <p><strong>Winter:</strong> Drones are usually driven out or killed as winter approaches to conserve colony stores.</p>
      </section>

      <!-- A11 -->
      <section>
        <h4>Question 11 – Queen pheromones</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>Chemical signals produced by queen (especially mandibular glands).</li>
          <li>Help maintain colony cohesion, suppress full worker ovary development.</li>
          <li>Indicate queen presence and condition to workers.</li>
        </ul>
      </section>

      <!-- A12 -->
      <section>
        <h4>Question 12 – Superorganism</h4>
        <p><strong>Key idea:</strong> The colony functions as a single integrated biological unit.</p>
        <ul>
          <li>Individual bees specialise in different roles.</li>
          <li>No single bee can survive long-term alone; survival and reproduction are at colony level.</li>
          <li>Communication and feedback (pheromones, dances, trophallaxis) coordinate activities.</li>
        </ul>
      </section>

      <!-- Section B answers -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
      </section>

      <!-- A13 -->
      <section>
        <h4>Question 13 – Number of chromosomes</h4>
        <p><strong>Correct answer:</strong> 32 (diploid workers/queens, 16 haploid in drones).</p>
      </section>

      <!-- A14 -->
      <section>
        <h4>Question 14 – Haplodiploidy</h4>
        <p><strong>Correct answer:</strong> Haploid, developing from unfertilised eggs.</p>
      </section>

      <!-- A15 -->
      <section>
        <h4>Question 15 – Spermatheca</h4>
        <p><strong>Correct answer:</strong> An organ for storing sperm after mating.</p>
      </section>

      <!-- A16 -->
      <section>
        <h4>Question 16 – Egg-laying control</h4>
        <p><strong>Correct answer:</strong> It allows production of either workers/queens or drones as needed.</p>
      </section>

      <!-- A17 -->
      <section>
        <h4>Question 17 – Sensory organs</h4>
        <p><strong>Correct answer:</strong> Pumping haemolymph around the body.</p>
        <p>(Antennae are for smell, taste, touch and vibration, not circulation.)</p>
      </section>

      <!-- A18 -->
      <section>
        <h4>Question 18 – Waggle dance information</h4>
        <p><strong>Correct answer:</strong> The distance and direction of a food or nest source.</p>
      </section>

      <!-- A19 -->
      <section>
        <h4>Question 19 – Thermoregulation</h4>
        <p><strong>Correct answer:</strong> 34–35°C, approximately.</p>
      </section>

      <!-- A20 -->
      <section>
        <h4>Question 20 – Haemolymph</h4>
        <p><strong>Correct answer:</strong> The bee’s blood-like fluid, circulating nutrients and waste.</p>
      </section>

      <!-- A21 -->
      <section>
        <h4>Question 21 – Spiracles</h4>
        <p><strong>Correct answer:</strong> Openings of the respiratory system along the thorax and abdomen.</p>
      </section>

      <!-- A22 -->
      <section>
        <h4>Question 22 – Fat body</h4>
        <p><strong>Correct answer:</strong> Energy storage and roles in metabolism and immunity.</p>
      </section>

      <!-- Section C answers -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These outlines show the main points you’d expect in a strong answer.
        </p>
      </section>

      <!-- A23 -->
      <section>
        <h4>Question 23 – Worker life history</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Emerges from cell, initially stays in hive.</li>
          <li>Young: cell cleaning, warming brood, tending queen.</li>
          <li>Nurse stage: feeding larvae and queen.</li>
          <li>Middle-aged: comb building, food storage, ripening honey, ventilation.</li>
          <li>Older: guarding entrance, then foraging.</li>
          <li>Age-related division of labour spreads risk and maximises colony efficiency.</li>
        </ul>
      </section>

      <!-- A24 -->
      <section>
        <h4>Question 24 – Caste determination</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>Both workers and queens come from fertilised (diploid) eggs.</li>
          <li>Larvae destined to become queens are fed large quantities of rich royal jelly.</li>
          <li>They are reared in specially constructed queen cells (larger, vertical).</li>
          <li>Diet and environment trigger different developmental pathways (e.g., ovary development).</li>
        </ul>
      </section>

      <!-- A25 -->
      <section>
        <h4>Question 25 – Mating biology</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Queen takes mating flights to drone congregation areas (DCAs) away from the apiary.</li>
          <li>Mates with multiple drones in flight.</li>
          <li>Drones die after mating; queen returns with filled spermatheca.</li>
          <li>Stored sperm used over lifetime to fertilise eggs as needed.</li>
        </ul>
      </section>

      <!-- A26 -->
      <section>
        <h4>Question 26 – Communication methods</h4>
        <p><strong>Examples (any three):</strong></p>
        <ul>
          <li>Pheromones – queen scent, Nasonov pheromone for orientation, alarm pheromones.</li>
          <li>Dances – waggle and round dances to indicate food/nest sites.</li>
          <li>Trophallaxis – food sharing, also sharing chemical information.</li>
          <li>Vibrations and buzzing – e.g., piping queens, worker vibration signals.</li>
        </ul>
      </section>

      <!-- A27 -->
      <section>
        <h4>Question 27 – Seasonal colony cycle</h4>
        <p><strong>Outline:</strong></p>
        <ul>
          <li><strong>Winter:</strong> Small cluster, little/no brood, survival on stores.</li>
          <li><strong>Spring:</strong> Increasing brood rearing, rapid growth as forage appears.</li>
          <li><strong>Early summer:</strong> Peak population, swarming tendency, heavy foraging.</li>
          <li><strong>Late summer/autumn:</strong> Brood rearing declines, stores built for winter, drones expelled.</li>
        </ul>
      </section>

      <!-- A28 -->
      <section>
        <h4>Question 28 – Genetic diversity</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>Multiple mating increases genetic diversity among workers.</li>
          <li>Different subfamilies within colony may specialise in different tasks or have different disease resistance.</li>
          <li>Greater diversity can improve colony resilience to disease and environmental changes.</li>
        </ul>
      </section>

      <!-- A29 -->
      <section>
        <h4>Question 29 – Stinging apparatus</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Modified ovipositor forming barbed sting with associated poison sac and muscles.</li>
          <li>When a worker stings a mammal, the barbs catch in elastic skin.</li>
          <li>Sting apparatus is torn out as the bee flies away, leading to the bee’s death.</li>
        </ul>
      </section>

      <!-- A30 -->
      <section>
        <h4>Question 30 – Adaptations to social life</h4>
        <p><strong>Examples:</strong></p>
        <ul>
          <li>Caste system with division of labour (queen, workers, drones).</li>
          <li>Complex communication (pheromones, dances, trophallaxis).</li>
          <li>Shared brood care and communal nest building.</li>
          <li>Thermoregulation of brood nest by fanning, clustering, heat generation.</li>
          <li>Defensive behaviours (guard bees, alarm pheromone, stinging).</li>
        </ul>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module5" class="tk-btn tk-btn-secondary">
        Back to questions
      </a>
      <a href="#/modules" class="tk-btn tk-btn-primary">
        Back to module list<span class="arrow">→</span>
      </a>
    </div>
  `;
}
