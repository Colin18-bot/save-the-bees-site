// Tutorials/js/views/module2-answers.js
// SPA view for "Model Answers – Module 2 Honey Bee Products & Forage"
// This is the content from module2-answers.html inside <section class="tk-content">…</section>

export function renderModule2Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Guidance points for marking</h2>
        <p class="tk-content-subtitle">
          Use these to support self-marking or as tutor notes. You can adjust detail and mark allocations
          to match your own scheme.
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
        <h4>Question 1 – What is honey?</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Honey is a sweet, viscous food made by bees from plant nectars (or honeydew).</li>
          <li>Bees collect nectar, add enzymes (eg, invertase), and reduce water content by regurgitating
              and fanning.</li>
          <li>Stored and capped in comb when “ripe”.</li>
        </ul>
      </section>

      <!-- A2 -->
      <section>
        <h4>Question 2 – Ripening of honey</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>“Ripe” honey has low enough water content to resist fermentation.</li>
          <li>Bees ripen nectar by spreading thinly in cells, fanning to evaporate water and adding enzymes.</li>
          <li>Once ripe, cells are sealed with wax cappings.</li>
        </ul>
      </section>

      <!-- A3 -->
      <section>
        <h4>Question 3 – High water content risks</h4>
        <p><strong>Consequences (any two):</strong></p>
        <ul>
          <li>Increased risk of fermentation (yeast activity) in storage.</li>
          <li>Shorter shelf life, off flavours, possible frothing.</li>
          <li>May fail quality checks or legal moisture limits in some markets.</li>
        </ul>
      </section>

      <!-- A4 -->
      <section>
        <h4>Question 4 – Crystallisation</h4>
        <p><strong>Factors affecting crystallisation (any three):</strong></p>
        <ul>
          <li>Ratio of glucose to fructose (higher glucose → faster crystallisation).</li>
          <li>Presence of fine particles (pollen, wax) acting as nuclei.</li>
          <li>Storage temperature (cooler, around 10–15°C, encourages granulation).</li>
          <li>Botanical origin of nectar (eg, oilseed rape crystallises quickly).</li>
        </ul>
      </section>

      <!-- A5 -->
      <section>
        <h4>Question 5 – Comb honey vs extracted honey</h4>
        <p><strong>Possible advantages of comb honey:</strong></p>
        <ul>
          <li>Premium product, perceived as very natural.</li>
          <li>No extraction equipment needed, less handling.</li>
        </ul>
        <p><strong>Possible disadvantages:</strong></p>
        <ul>
          <li>Requires very clean comb; risk of damage/transport issues.</li>
          <li>More demanding to produce; more wax used by bees.</li>
          <li>Shorter shelf life if poorly stored (comb damage, weeping).</li>
        </ul>
      </section>

      <!-- A6 -->
      <section>
        <h4>Question 6 – Beeswax sources</h4>
        <p><strong>Sources (any three):</strong></p>
        <ul>
          <li>Cappings from extracted comb.</li>
          <li>Old brood comb (after sterilisation/disposal considerations).</li>
          <li>Brace comb and burr comb.</li>
          <li>Damaged comb removed during inspections.</li>
        </ul>
      </section>

      <!-- A7 -->
      <section>
        <h4>Question 7 – Uses of beeswax</h4>
        <p><strong>Examples (any four):</strong></p>
        <ul>
          <li>Making foundation sheets.</li>
          <li>Candles.</li>
          <li>Polishes and furniture wax.</li>
          <li>Cosmetics such as lip balms and creams.</li>
          <li>Food wraps, sealing cheeses, craft uses.</li>
        </ul>
      </section>

      <!-- A8 -->
      <section>
        <h4>Question 8 – Pollen as a resource</h4>
        <p><strong>Importance:</strong></p>
        <ul>
          <li>Main source of protein, fats, vitamins and minerals for brood food.</li>
          <li>Essential for development of young bees and glands producing royal jelly.</li>
        </ul>
        <p><strong>Precautions when trapping:</strong></p>
        <ul>
          <li>Do not remove too much; avoid weakening colony nutrition.</li>
          <li>Ensure trapped pollen is promptly dried/frozen to prevent mould.</li>
          <li>Use clean equipment to avoid contamination.</li>
        </ul>
      </section>

      <!-- A9 -->
      <section>
        <h4>Question 9 – Propolis</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Resinous material collected from tree buds and plant exudates.</li>
          <li>Used by bees to seal gaps, smooth surfaces and as part of hive “immune system”.</li>
          <li>Beekeeper can scrape from hive parts or use propolis traps.</li>
          <li>Used in tinctures, health products and polishes.</li>
        </ul>
      </section>

      <!-- A10 -->
      <section>
        <h4>Question 10 – Water requirements</h4>
        <p><strong>Reasons for water (any two):</strong></p>
        <ul>
          <li>To dilute honey/nectar for feeding brood.</li>
          <li>To help cool the hive via evaporation.</li>
          <li>General metabolic needs.</li>
        </ul>
        <p><strong>Management consideration:</strong></p>
        <ul>
          <li>Provide a safe water source near the apiary (shallow, with landing places) to discourage bees using neighbours’ water features.</li>
        </ul>
      </section>

      <!-- A11 -->
      <section>
        <h4>Question 11 – Nectar flows</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>A “nectar flow” is a period when many flowers are secreting nectar and bees bring in surplus.</li>
          <li>Important for honey production and brood rearing.</li>
          <li>Management: adding supers, ensuring space, may reduce feeding needs.</li>
        </ul>
      </section>

      <!-- A12 -->
      <section>
        <h4>Question 12 – Forage gaps</h4>
        <p><strong>Definition:</strong> Period when few flowers are available or little nectar/pollen is coming in.</p>
        <p><strong>Effects:</strong></p>
        <ul>
          <li>Reduced nectar and pollen intake, possible brood reduction.</li>
          <li>Risk of starvation if stores are low.</li>
        </ul>
        <p><strong>Management option:</strong></p>
        <ul>
          <li>Feeding if necessary, planting to provide continuity, or moving colonies to better forage.</li>
        </ul>
      </section>

      <!-- Section B answers -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
      </section>

      <!-- A13 -->
      <section>
        <h4>Question 13 – Main sugar types</h4>
        <p><strong>Correct answer:</strong> Glucose, fructose and sucrose.</p>
      </section>

      <!-- A14 -->
      <section>
        <h4>Question 14 – Honey moisture content</h4>
        <p><strong>Correct answer:</strong> Around 17–18%.</p>
        <p>Note: thresholds vary slightly by standard, but ~17–20% is typical; below this reduces fermentation risk.</p>
      </section>

      <!-- A15 -->
      <section>
        <h4>Question 15 – Honey labelling</h4>
        <p><strong>Correct answer:</strong> The exact weight, producer contact details and a use-by or best-before date.</p>
        <p>(Details differ by country; adjust if you localise for UK, EU, etc.)</p>
      </section>

      <!-- A16 -->
      <section>
        <h4>Question 16 – Honey contamination</h4>
        <p><strong>Correct answer:</strong> Dust, mould spores or residues from previous batches.</p>
      </section>

      <!-- A17 -->
      <section>
        <h4>Question 17 – Floral origin</h4>
        <p><strong>Correct answer:</strong> Honey in which most nectar comes from one predominant plant source.</p>
      </section>

      <!-- A18 -->
      <section>
        <h4>Question 18 – Pollination value</h4>
        <p><strong>Correct answer:</strong> They often act as important pollinators, increasing fruit and seed production.</p>
      </section>

      <!-- A19 -->
      <section>
        <h4>Question 19 – Pollen sources</h4>
        <p><strong>Best answer:</strong> Hazel catkins (primarily a pollen source).</p>
        <p>Oilseed rape and lime provide notable nectar flows as well.</p>
      </section>

      <!-- A20 -->
      <section>
        <h4>Question 20 – Forage seasons</h4>
        <p><strong>Correct answer:</strong> Dandelions – often important in spring build-up.</p>
      </section>

      <!-- A21 -->
      <section>
        <h4>Question 21 – Honey handling temperature</h4>
        <p><strong>Correct answer:</strong> It can darken, lose aroma and form more HMF, reducing quality.</p>
      </section>

      <!-- A22 -->
      <section>
        <h4>Question 22 – Straining honey</h4>
        <p><strong>Correct answer:</strong> To remove wax particles, bee parts and other debris.</p>
      </section>

      <!-- Section C answers -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These outlines show the main points; more detailed, well-structured answers would gain higher marks.
        </p>
      </section>

      <!-- A23 -->
      <section>
        <h4>Question 23 – From flower to jar</h4>
        <p><strong>Key stages:</strong></p>
        <ul>
          <li>Bees collect nectar from flowers, store in honey stomach.</li>
          <li>Back in hive: pass nectar to house bees, enzyme addition, repeated transfer.</li>
          <li>Nectar placed in cells, fanned to reduce water content.</li>
          <li>Capped when ripe.</li>
          <li>Beekeeper: add supers, remove frames of sealed honey, uncap, extract by spinner.</li>
          <li>Filter/strain, settle to remove bubbles, then jar and label.</li>
        </ul>
      </section>

      <!-- A24 -->
      <section>
        <h4>Question 24 – Characteristics of good-quality honey</h4>
        <p><strong>From consumer viewpoint:</strong></p>
        <ul>
          <li>Pleasant flavour and aroma, typical of floral source.</li>
          <li>Attractive colour and clarity (or even, fine granulation).</li>
          <li>Clean (no foreign bodies), no fermentation off-smells.</li>
          <li>Appropriate texture (liquid, soft set, comb) as described.</li>
        </ul>
        <p><strong>Beekeeper practices:</strong></p>
        <ul>
          <li>Careful extraction from ripe, capped comb.</li>
          <li>Clean equipment, correct storage temperatures.</li>
          <li>Avoid overheating; proper straining and settling.</li>
        </ul>
      </section>

      <!-- A25 -->
      <section>
        <h4>Question 25 – Beeswax processing</h4>
        <p><strong>Outline method:</strong></p>
        <ul>
          <li>Collect wax (eg, cappings), wash if necessary.</li>
          <li>Melt in water using indirect heat (double boiler) – never direct naked flame.</li>
          <li>Allow impurities to sink; strain molten wax through fine mesh or cloth.</li>
          <li>Pour into moulds and allow to cool slowly.</li>
        </ul>
        <p><strong>Safety:</strong> Wax is flammable; avoid overheating and water in hot wax; good ventilation.</p>
      </section>

      <!-- A26 -->
      <section>
        <h4>Question 26 – Forage mapping</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Walk or map area within roughly 2–3 km of apiary.</li>
          <li>Note major crops, hedgerows, trees, gardens, wildflower areas.</li>
          <li>Identify timing of main nectar and pollen flows.</li>
          <li>Use info to plan colony numbers, supering, expectations for crop size and potential forage gaps.</li>
        </ul>
      </section>

      <!-- A27 -->
      <section>
        <h4>Question 27 – Garden planting for bees</h4>
        <p><strong>Key themes:</strong></p>
        <ul>
          <li>Provide a range of plants across spring, summer and autumn.</li>
          <li>Examples: spring (willows, crocus, fruit trees); summer (lavender, clover, borage, herbs);
              autumn (ivy, sedum, late asters).</li>
          <li>Avoid double flowers that hide nectar/pollen; reduce pesticide use.</li>
        </ul>
      </section>

      <!-- A28 -->
      <section>
        <h4>Question 28 – Crop spraying and forage safety</h4>
        <p><strong>Effects of pesticides:</strong></p>
        <ul>
          <li>Acute poisoning of foragers.</li>
          <li>Sub-lethal effects on navigation, brood, queen.</li>
          <li>Residues in nectar, pollen, and possibly honey.</li>
        </ul>
        <p><strong>Beekeeper actions:</strong></p>
        <ul>
          <li>Maintain good communication with farmers.</li>
          <li>Move colonies or close entrances during spraying where advised.</li>
          <li>Follow national guidance on reporting suspected pesticide incidents.</li>
        </ul>
      </section>

      <!-- A29 -->
      <section>
        <h4>Question 29 – Comparing honeys</h4>
        <p><strong>Variations:</strong></p>
        <ul>
          <li>Colour: water white to dark amber.</li>
          <li>Flavour/aroma: delicate to strong; floral, fruity, malty, etc.</li>
          <li>Texture: runny, soft set, coarse crystals, creamy.</li>
        </ul>
        <p><strong>Presentation to customers:</strong></p>
        <ul>
          <li>Tasting notes on labels or at markets.</li>
          <li>Explain floral source and season.</li>
          <li>Offer small jars or tasting flights.</li>
        </ul>
      </section>

      <!-- A30 -->
      <section>
        <h4>Question 30 – Pollen and nutrition</h4>
        <p><strong>Role of pollen:</strong></p>
        <ul>
          <li>Provides protein, lipids, vitamins and minerals.</li>
          <li>Essential for brood rearing and development of nurse bees.</li>
        </ul>
        <p><strong>Effects of forage quality/diversity:</strong></p>
        <ul>
          <li>Rich, diverse forage supports strong colonies, good immunity, better honey yields.</li>
          <li>Poor or limited forage can lead to weak colonies, disease susceptibility and reduced honey crop.</li>
        </ul>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module2" class="tk-btn tk-btn-secondary">
        Back to questions
      </a>
      <a href="#/module3" class="tk-btn tk-btn-primary">
        Next: Module 3 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
}
