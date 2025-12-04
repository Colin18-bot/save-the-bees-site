// Tutorials/js/views/module8-answers.js
// SPA view for "Module 8 – Management, Health & History" model answers

export function renderModule8Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Module 8 – Management, Health &amp; History</h2>
        <p class="tk-content-subtitle">
          These answers pick out the main historical themes and health concepts. Local historical
          examples can be added for extra depth.
        </p>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft);">
          This module is ideal for storytelling. Try to connect historic examples with what you
          actually do in the apiary today – examiners like practical links.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – History of hive design &amp; early management</h3>
      </section>

      <section>
        <h4>Question 1 – Skeps vs modern hives</h4>
        <p><strong>Model answer:</strong>
          Traditional skeps are fixed-comb containers, usually straw, without frames. Comb cannot
          be removed and inspected easily, and honey harvesting often destroyed brood. Modern movable-frame
          hives (e.g. National, Langstroth) allow individual frames to be lifted, inspected and returned
          without destroying the colony, complying with disease legislation and greatly improving management.
        </p>
      </section>

      <section>
        <h4>Question 2 – Langstroth’s contribution</h4>
        <p><strong>Model answer:</strong>
          Langstroth recognised and patented the use of “bee space” and designed a practical movable-frame
          hive. His hive allowed frames to be removed and replaced without bees sticking combs together.
          This innovation underpins virtually all modern hive designs.
        </p>
      </section>

      <section>
        <h4>Question 3 – Bee space</h4>
        <p><strong>Model answer:</strong>
          Bee space is the critical gap (about 6–9 mm) that bees will leave open rather than fill with
          comb or propolis. Designing hives so that spaces between frames and walls are within this range
          allows frames to be moved freely without being cemented up, making inspections practical.
        </p>
      </section>

      <section>
        <h4>Question 4 – Skeps: pros and cons</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li><strong>Advantages:</strong> cheap and simple to make, lightweight and portable, part of
              rural tradition and heritage.</li>
          <li><strong>Disadvantages:</strong> fixed comb, difficult or impossible to inspect properly
              for disease, often required killing the bees to harvest honey, does not meet modern
              statutory disease inspection requirements.</li>
        </ul>
      </section>

      <section>
        <h4>Question 5 – Pre-frame honey harvest</h4>
        <p><strong>Model answer:</strong>
          Honey was obtained by driving or killing the bees and cutting out comb, then pressing it.
          This was wasteful of colonies, labour-intensive and makes disease control impossible by
          modern standards. It is not acceptable today because colonies must be inspectable without
          destruction under current bee disease legislation.
        </p>
      </section>

      <section>
        <h4>Question 6 – Colony health</h4>
        <p><strong>Model answer:</strong>
          Colony health is the overall well-being of the colony, including disease status, nutrition
          and strength. Indicators include a solid brood pattern, good adult population, adequate
          food reserves, normal behaviour, low visible disease and ability to build up and overwinter
          successfully.
        </p>
      </section>

      <section>
        <h4>Question 7 – Stress factors</h4>
        <p><strong>Model answer (any three):</strong></p>
        <ul>
          <li>Poor nutrition or shortage of pollen/nectar.</li>
          <li>Parasites such as varroa and associated viruses.</li>
          <li>Transport and frequent movement of colonies.</li>
          <li>Exposure to pesticides.</li>
          <li>Poor hive siting (damp, windy, shaded, etc.).</li>
        </ul>
      </section>

      <section>
        <h4>Question 8 – Apiary hygiene</h4>
        <p><strong>Model answer:</strong>
          Good hygiene means keeping equipment clean, avoiding the exchange of contaminated comb,
          burning or sterilising suspect material, and not leaving accessible honey or comb in the
          apiary. It reduces the spread of notifiable diseases such as foulbrood and helps control
          more common problems like chalkbrood and Nosema.
        </p>
      </section>

      <section>
        <h4>Question 9 – Queen excluders</h4>
        <p><strong>Model answer:</strong>
          Queen excluders prevent the queen from entering honey supers, so supers usually contain only
          honey and no brood. This simplifies honey extraction, keeps brood out of extractors and allows
          clearer separation of honey and brood areas for management.
        </p>
      </section>

      <section>
        <h4>Question 10 – Swarm control</h4>
        <p><strong>Model answer:</strong>
          Historically beekeepers relied on catching natural swarms or using crude methods to discourage
          them. Modern techniques such as artificial swarming, splitting colonies and replacing queens
          allow swarming impulse to be managed more predictably, reduce loss of bees and are compatible
          with framed hives and disease control.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Health, disease and changing practices</h3>
      </section>

      <section>
        <h4>Question 11 – Major historical influence</h4>
        <p><strong>Model answer (one justified example):</strong>
          Many candidates choose the arrival of varroa as the single biggest modern influence: it changed
          management from largely “hands-off” to requiring active monitoring and treatment. Others might
          argue for the discovery of bee space or movable frames. Any major event is acceptable if clearly
          explained and linked to changes in practice.
        </p>
      </section>

      <section>
        <h4>Question 12 – Use of smoke</h4>
        <p><strong>Model answer:</strong>
          Historically, smoke may have been used quite heavily to subdue bees with little understanding
          of its effects. Over time beekeepers learned that gentle, cool smoke masks alarm pheromones and
          encourages bees to gorge on honey, making them calmer. Modern practice emphasises clean fuel,
          cool smoke and minimal use to avoid overheating or stressing colonies.
        </p>
      </section>

      <section>
        <h4>Question 13 – Varroa’s impact</h4>
        <p><strong>Model answer:</strong>
          Varroa forced beekeepers to monitor mite levels and introduce integrated pest management
          including treatments, drone brood removal and breeding for tolerance. It also increased the
          importance of regular inspections, record-keeping and winter checks, as varroa-related viruses
          became a major cause of colony losses.
        </p>
      </section>

      <section>
        <h4>Question 14 – Hive materials</h4>
        <p><strong>Model answer:</strong>
          In the 1800s hives were often made of straw, wicker, wood or even clay. Modern hives still
          use wood but also polystyrene or other insulating materials. Modern materials can offer better
          insulation, durability and hygiene, and are compatible with standard frame sizes and equipment.
        </p>
      </section>

      <section>
        <h4>Question 15 – Historic breeding aims</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li>Higher honey yields to support farm income.</li>
          <li>Gentler bees that are easier to manage and demonstrate.</li>
          <li>Reduced swarming and better overwintering ability.</li>
        </ul>
        <p>
          These aims still apply today, but modern breeders also emphasise disease resistance and
          suitability for local conditions.
        </p>
      </section>

      <section>
        <h4>Question 16 – Beekeeping associations</h4>
        <p><strong>Model answer:</strong>
          Associations have played a key role in education, organising lectures, apiary demonstrations
          and examinations. They share good practice, support disease control campaigns and act as a
          link between individual beekeepers and national authorities.
        </p>
      </section>

      <section>
        <h4>Question 17 – Winter feeding</h4>
        <p><strong>Model answer:</strong>
          Historically, feeding was often less scientific, using cheap local sugars or honey. Modern
          practice uses refined sugar syrup and fondant, with clear guidance on quantities and timings.
          Understanding of colony needs, varroa and climate has improved, so feeding is now more planned
          and recorded.
        </p>
      </section>

      <section>
        <h4>Question 18 – Skep-making</h4>
        <p><strong>Model answer:</strong>
          Skep-making involves coiling bundles of straw and stitching them with split bramble or cane.
          It is part of rural craft heritage and is still taught for historical interest and swarm catching,
          even though skeps are no longer used for routine management due to inspection laws.
        </p>
      </section>

      <section>
        <h4>Question 19 – Extraction methods</h4>
        <p><strong>Model answer:</strong>
          Early methods relied on crushing and straining comb, which destroyed it and required bees
          to rebuild from scratch. The centrifugal extractor, developed in the 19th century, spins
          out honey while leaving comb largely intact, saving the bees work and increasing efficiency.
        </p>
      </section>

      <section>
        <h4>Question 20 – Observation hives</h4>
        <p><strong>Model answer:</strong>
          Observation hives with glass sides have been used historically at fairs, exhibitions and
          teaching apiaries to show the public how bees live and work. They allow close viewing of
          brood rearing, dances and behaviour, and remain a valuable educational tool.
        </p>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Modern lessons from historical practice</h3>
      </section>

      <section>
        <h4>Question 21 – Drone culling</h4>
        <p><strong>Model answer:</strong>
          In the past drones were often seen purely as “useless mouths” and culled heavily. Modern
          understanding recognises their role in maintaining genetic diversity and in breeding programmes.
          Drone comb is still removed as part of varroa control, but blanket culling is less favoured
          where breeding is a priority.
        </p>
      </section>

      <section>
        <h4>Question 22 – Record-keeping</h4>
        <p><strong>Model answer:</strong>
          Historically many beekeepers relied on memory. Today, record-keeping is essential for tracking
          queen lineage, disease history, varroa treatments, feeding and production. It helps identify
          trends, compare stock and satisfy legal or assurance scheme requirements.
        </p>
      </section>

      <section>
        <h4>Question 23 – Early naturalists and authors</h4>
        <p><strong>Model answer:</strong>
          Early observers like François Huber and writers like Cheshire recorded careful experiments
          on bee biology and behaviour (e.g. queen mating, division of labour). Their work laid the
          foundation for modern scientific understanding and remains influential in training texts.
        </p>
      </section>

      <section>
        <h4>Question 24 – Disease control and hive design</h4>
        <p><strong>Model answer:</strong>
          Movable-frame hives allow individual combs to be inspected and, if necessary, removed and
          destroyed. This is essential for controlling foulbrood and other brood diseases and forms
          the basis of statutory inspection regimes. Fixed-comb systems do not allow such targeted control.
        </p>
      </section>

      <section>
        <h4>Question 25 – Protective clothing</h4>
        <p><strong>Model answer:</strong>
          Early beekeepers often used improvised veils and partial protection or relied on very gentle
          bees. Modern PPE includes full suits, gloves and purpose-made veils using light, breathable
          materials. It has improved safety, made beekeeping more accessible and supports more thorough
          inspections.
        </p>
      </section>

      <section>
        <h4>Question 26 – Queen-rearing methods</h4>
        <p><strong>Model answer:</strong>
          Early queen-rearing used natural queen cells from swarms or supersedure. Modern methods such
          as grafting, Jenter systems and controlled mating nucs allow more queens to be produced and
          parentage to be managed. The principle remains the same – well-fed larvae in strong colonies –
          but techniques are more systematic.
        </p>
      </section>

      <section>
        <h4>Question 27 – World wars and honey</h4>
        <p><strong>Model answer:</strong>
          During the world wars there was increased demand for home-produced food, including honey.
          Government encouragement, sugar rationing and shortages of imported sweeteners raised the
          profile of beekeeping. After the wars some of this interest remained and influenced association
          development and education.
        </p>
      </section>

      <section>
        <h4>Question 28 – Honey adulteration</h4>
        <p><strong>Model answer:</strong>
          Honey adulteration – mixing honey with cheaper sugars – became a problem as honey gained
          commercial value. Public health and trading standards legislation developed to define what
          may be sold as honey, require labelling and protect both consumers and honest producers.
        </p>
      </section>

      <section>
        <h4>Question 29 – Climate change awareness</h4>
        <p><strong>Model answer:</strong>
          Climate change brings altered flowering times, more extreme weather and potential new pests
          and diseases. Modern beekeepers must plan forage, consider droughts or heavy rainfall and
          be prepared for shifting seasons, whereas historic beekeeping assumed more stable patterns.
        </p>
      </section>

      <section>
        <h4>Question 30 – Lessons from historic practice</h4>
        <p><strong>Model answer (examples):</strong></p>
        <ul>
          <li>The value of close observation and detailed notes, as shown by early naturalists.</li>
          <li>The importance of adapting equipment and methods as new knowledge and challenges arise.</li>
          <li>The benefit of cooperation and shared learning through associations.</li>
        </ul>
        <p>
          Modern beekeepers can combine these lessons with current science to manage bees responsibly
          in a changing environment.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module8" class="tk-btn tk-btn-secondary">
        Back to Module 8 questions
      </a>
      <a href="#/modules" class="tk-btn tk-btn-primary">
        Back to module overview<span class="arrow">→</span>
      </a>
    </div>
  `;
}
