// Tutorials/js/views/module3-answers.js
// SPA view for "Model Answers – Module 3 Pests, Diseases & Poisoning"

export function renderModule3Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Guidance points for marking</h2>
        <p class="tk-content-subtitle">
          These outlines show the key ideas. You can assign your own mark values and accept any clearly
          equivalent correct points.
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
        <h4>Question 1 – Healthy brood</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Sealed worker brood appears as a solid, even “carpet” of cappings.</li>
          <li>Cappings are slightly convex, biscuit coloured, not sunken or perforated.</li>
          <li>Few empty cells in the middle of the brood area.</li>
        </ul>
        <p>Recognising this helps spot deviations that may indicate disease or queen problems.</p>
      </section>

      <!-- A2 -->
      <section>
        <h4>Question 2 – Signs of brood disease</h4>
        <p><strong>General warning signs (any four):</strong></p>
        <ul>
          <li>Patchy brood pattern with many empty cells.</li>
          <li>Sunken, perforated or discoloured cappings.</li>
          <li>Larvae in unnatural positions (twisted, not in “C” shape).</li>
          <li>Discoloured larvae (yellow, brown, grey) or abnormal consistency.</li>
          <li>Unpleasant smell from brood area in serious infections.</li>
        </ul>
      </section>

      <!-- A3 -->
      <section>
        <h4>Question 3 – Adult vs brood disease</h4>
        <p><strong>Adult bee disease:</strong> primarily affects adult bees (eg Nosema, chronic bee paralysis).</p>
        <p><strong>Brood disease:</strong> primarily affects larvae/pupae (eg AFB, EFB, chalkbrood).</p>
      </section>

      <!-- A4 -->
      <section>
        <h4>Question 4 – Varroa as a parasite</h4>
        <p><strong>Key ideas:</strong></p>
        <ul>
          <li>Feeds on bees, weakening them.</li>
          <li>Reproduces in sealed brood cells, rapidly increasing numbers.</li>
          <li>Vectors many viruses (eg deformed wing virus) that can kill colonies.</li>
          <li>Untreated infestations can lead to collapse.</li>
        </ul>
      </section>

      <!-- A5 -->
      <section>
        <h4>Question 5 – Monitoring varroa</h4>
        <p><strong>Methods (any two):</strong></p>
        <ul>
          <li>Counting natural mite drop on a monitoring board under mesh floor.</li>
          <li>Alcohol or detergent wash of a sample of bees (sacrificial).</li>
          <li>Sugar roll test on a sample of bees.</li>
          <li>Visual checks of drone brood uncapping (less precise).</li>
        </ul>
      </section>

      <!-- A6 -->
      <section>
        <h4>Question 6 – Integrated pest management (IPM)</h4>
        <p><strong>Definition:</strong></p>
        <ul>
          <li>Combining several complementary methods (cultural, mechanical, biological, chemical) to keep
              varroa below damaging levels.</li>
          <li>Avoids relying on a single treatment and reduces resistance risk.</li>
          <li>Includes monitoring, brood manipulation, treatment timing, possible use of less harsh products.</li>
        </ul>
      </section>

      <!-- A7 -->
      <section>
        <h4>Question 7 – Notifiable disease</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Diseases that must legally be reported to the relevant authority (eg foulbroods in many countries).</li>
          <li>Beekeeper should not move bees or equipment, should contact the bee inspector or competent authority
              immediately.</li>
          <li>Follow official instructions for sampling, confirmation and control measures.</li>
        </ul>
      </section>

      <!-- A8 -->
      <section>
        <h4>Question 8 – Nosema</h4>
        <p><strong>Possible signs:</strong></p>
        <ul>
          <li>Weak, dwindling colonies with poor spring build-up.</li>
          <li>Staining of front of hive and frames with faeces (“dysentery-like”).</li>
          <li>Shortened lifespan of adult bees, crawling bees.</li>
        </ul>
      </section>

      <!-- A9 -->
      <section>
        <h4>Question 9 – Small hive beetle</h4>
        <p><strong>Main concerns:</strong></p>
        <ul>
          <li>Larvae can destroy comb, spoil honey and pollen, causing slime and fermentation.</li>
          <li>Serious economic impact where established.</li>
          <li>Concern for regions currently free of SHB because of risk of introduction and spread.</li>
        </ul>
      </section>

      <!-- A10 -->
      <section>
        <h4>Question 10 – Wax moth</h4>
        <p><strong>Damage:</strong></p>
        <ul>
          <li>Larvae tunnel through comb, leaving webbing and faeces.</li>
          <li>Severe infestation can render comb unusable.</li>
        </ul>
        <p><strong>Control in stored comb:</strong></p>
        <ul>
          <li>Store combs in cool, well-ventilated, light place where possible.</li>
          <li>Freezing comb before storage in some systems.</li>
          <li>Regular inspection of stored comb and destruction of heavily infested frames.</li>
        </ul>
      </section>

      <!-- A11 -->
      <section>
        <h4>Question 11 – Robbing</h4>
        <p><strong>Definition:</strong> Bees from one colony steal honey from another, usually weaker colony, often
          entering at the entrance or through gaps.</p>
        <p><strong>Problem for disease:</strong> Robbers can carry pathogens or spores (eg AFB) from infected
          colonies to clean ones.</p>
      </section>

      <!-- A12 -->
      <section>
        <h4>Question 12 – Pesticide poisoning</h4>
        <p><strong>Possible signs (any three):</strong></p>
        <ul>
          <li>Large numbers of dead bees in front of the hive.</li>
          <li>Bees crawling, trembling, disoriented or unable to fly.</li>
          <li>Sudden collapse of flying bee population shortly after spraying nearby crops.</li>
        </ul>
      </section>

      <!-- Section B answers -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
      </section>

      <!-- A13 -->
      <section>
        <h4>Question 13 – Chalkbrood</h4>
        <p><strong>Correct answer:</strong> Brood, which becomes mummified and chalk-like.</p>
      </section>

      <!-- A14 -->
      <section>
        <h4>Question 14 – American foulbrood (AFB)</h4>
        <p><strong>Correct answer:</strong> Ropy larval remains and sunken, perforated cappings.</p>
      </section>

      <!-- A15 -->
      <section>
        <h4>Question 15 – European foulbrood (EFB)</h4>
        <p><strong>Correct answer:</strong> Mostly in unsealed larvae, often twisted in their cells with a patchy brood pattern.</p>
      </section>

      <!-- A16 -->
      <section>
        <h4>Question 16 – Varroa reproduction</h4>
        <p><strong>Correct answer:</strong> Inside sealed brood cells, especially drone brood.</p>
      </section>

      <!-- A17 -->
      <section>
        <h4>Question 17 – Varroa damage</h4>
        <p><strong>Correct answer:</strong> Feeding on bees and spreading harmful viruses.</p>
      </section>

      <!-- A18 -->
      <section>
        <h4>Question 18 – Nosema signs</h4>
        <p><strong>Correct answer:</strong> Dysentery-like spotting around hive entrance and weakened colonies.</p>
      </section>

      <!-- A19 -->
      <section>
        <h4>Question 19 – Tracheal mites</h4>
        <p><strong>Correct answer:</strong> The airways (tracheae) of adult bees.</p>
      </section>

      <!-- A20 -->
      <section>
        <h4>Question 20 – Pesticide poisoning sign</h4>
        <p><strong>Correct answer:</strong> Large numbers of dead or trembling bees in front of the hive soon after spraying nearby crops.</p>
      </section>

      <!-- A21 -->
      <section>
        <h4>Question 21 – Hygienic behaviour</h4>
        <p><strong>Correct answer:</strong> Detecting and removing diseased or dead brood.</p>
      </section>

      <!-- A22 -->
      <section>
        <h4>Question 22 – Equipment disinfection</h4>
        <p><strong>Correct answer:</strong> To help disinfect wooden surfaces after disease, where allowed.</p>
      </section>

      <!-- Section C answers -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These outlines cover the main points you’d expect in a strong answer.
        </p>
      </section>

      <!-- A23 -->
      <section>
        <h4>Question 23 – Inspecting for brood disease</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Careful visual scan of brood pattern and cappings (sunken, perforated, discoloured).</li>
          <li>Look at larvae: position, colour, consistency, smell.</li>
          <li>Use matchstick or twig test cautiously if foulbrood suspected (ropy test for AFB).</li>
          <li>Do not shake frames vigorously if suspecting AFB (to avoid spreading spores).</li>
          <li>If suspicious: close hive, mark it, and contact inspector/authority – avoid moving frames or equipment elsewhere.</li>
        </ul>
      </section>

      <!-- A24 -->
      <section>
        <h4>Question 24 – Varroa treatment choices</h4>
        <p><strong>Integrated approach might include:</strong></p>
        <ul>
          <li>Monitoring mite levels regularly.</li>
          <li>Chemical treatments: authorised products (eg organic acids, synthetic strips) used according to label.</li>
          <li>Non-chemical methods: drone brood removal, brood interruption, trapping comb, breeding from more tolerant stock.</li>
          <li>Timing treatments to periods with little/ no brood where appropriate.</li>
          <li>Rotating or varying treatments to reduce resistance risk.</li>
        </ul>
      </section>

      <!-- A25 -->
      <section>
        <h4>Question 25 – Suspected foulbrood</h4>
        <p><strong>Steps:</strong></p>
        <ul>
          <li>Stop manipulations that might spread disease (no shaking, no moving comb to other hives).</li>
          <li>Record hive ID and signs observed.</li>
          <li>Contact bee inspector or competent authority as required.</li>
          <li>Follow instructions for sampling/confirmation.</li>
          <li>Avoid moving bees, equipment or honey off site until cleared or instructed.</li>
          <li>Inform neighbouring beekeepers if appropriate and in line with guidance.</li>
        </ul>
      </section>

      <!-- A26 -->
      <section>
        <h4>Question 26 – Disease spread between apiaries</h4>
        <p><strong>Routes of spread:</strong></p>
        <ul>
          <li>Drifting and robbing bees.</li>
          <li>Movement of infected equipment, comb and honey.</li>
          <li>Swarm movement, imports and queen purchases.</li>
        </ul>
        <p><strong>Control steps:</strong></p>
        <ul>
          <li>Good apiary layout to reduce drifting, avoid encouraging robbing.</li>
          <li>Disinfect or destroy suspicious equipment as appropriate.</li>
          <li>Source bees and queens from reputable suppliers.</li>
          <li>Observe standstill orders or local rules after notifiable disease incidents.</li>
        </ul>
      </section>

      <!-- A27 -->
      <section>
        <h4>Question 27 – Recognising chronic problems</h4>
        <p><strong>Possible causes:</strong></p>
        <ul>
          <li>Chronic high varroa loads and viruses.</li>
          <li>Nosema or other chronic adult bee diseases.</li>
          <li>Poor queen quality (age, genetics) interacting with disease.</li>
          <li>Consistent forage shortage plus disease stress.</li>
        </ul>
        <p><strong>Investigation:</strong></p>
        <ul>
          <li>Examine brood carefully for disease signs.</li>
          <li>Check for varroa and treatment history.</li>
          <li>Microscopic checks for Nosema (where available) or send samples.</li>
          <li>Review records, queen age and forage situation.</li>
        </ul>
      </section>

      <!-- A28 -->
      <section>
        <h4>Question 28 – Recording disease incidents</h4>
        <p><strong>Why important:</strong></p>
        <ul>
          <li>Helps track patterns over time (recurring issues, treatment effectiveness).</li>
          <li>Supports better decision-making in future seasons.</li>
          <li>Useful when working with inspectors or vets.</li>
          <li>Aggregated data at association/national level can show trends and emerging threats.</li>
        </ul>
      </section>

      <!-- A29 -->
      <section>
        <h4>Question 29 – After a pesticide incident</h4>
        <p><strong>Actions:</strong></p>
        <ul>
          <li>Document evidence (photos, notes, timing, weather, spraying observed).</li>
          <li>Collect dead bees for potential analysis following official guidance.</li>
          <li>Notify the relevant authority/incident scheme and association.</li>
          <li>Discuss with local farmers to improve communication and future precautions.</li>
          <li>Review apiary siting and water sources if needed.</li>
        </ul>
      </section>

      <!-- A30 -->
      <section>
        <h4>Question 30 – Biosecurity plan</h4>
        <p><strong>Elements might include:</strong></p>
        <ul>
          <li>Regular, careful inspections focusing on health signs.</li>
          <li>Clean hive tools and gloves between apiaries (or disposable gloves).</li>
          <li>Separate tools or boxes for suspect colonies.</li>
          <li>Careful control of robbing and feeding practices.</li>
          <li>Record-keeping of treatments, losses and disease findings.</li>
          <li>Awareness of notifiable disease procedures and contacts.</li>
        </ul>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module3" class="tk-btn tk-btn-secondary">
        Back to questions
      </a>
      <a href="#/module5" class="tk-btn tk-btn-primary">
        Next: Module 5 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
}
