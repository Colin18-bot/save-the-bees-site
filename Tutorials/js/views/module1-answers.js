// Tutorials/js/views/module1-answers.js
// SPA view for "Model Answers – Module 1 Honey Bee Management"
// This is the content from module1-answers.html inside <section class="tk-content">…</section>

export function renderModule1Answers(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Model answers</div>
        <h2 class="tk-content-title">Guidance points for marking</h2>
        <p class="tk-content-subtitle">
          Use these as a reference for self-marking or tutoring. Alternative but equivalent wording or
          additional correct points should also be credited.
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
        <h4>Question 1 – Routine inspection aims</h4>
        <p><strong>Key points (any four):</strong></p>
        <ul>
          <li>Is there a laying queen or clear evidence of one (eggs, young brood)?</li>
          <li>Is there a good brood pattern and brood at all stages?</li>
          <li>Is there sufficient food (nectar/honey and pollen)?</li>
          <li>Any signs of disease or abnormal brood/comb?</li>
          <li>Any queen cells or signs of preparing to swarm?</li>
          <li>Space available in brood box and supers.</li>
        </ul>
      </section>

      <!-- A2 -->
      <section>
        <h4>Question 2 – “CBPVQ” memory aid</h4>
        <p><strong>Example checklists:</strong> many variations acceptable, such as:</p>
        <ul>
          <li><strong>Q</strong>ueen / eggs / young brood.</li>
          <li><strong>B</strong>rood pattern and stages.</li>
          <li><strong>P</strong>ollen and <strong>F</strong>ood stores.</li>
          <li><strong>S</strong>pace and supers.</li>
          <li><strong>H</strong>ealth / disease signs.</li>
        </ul>
        <p>Credit any sensible 3–5 point checklist linked to key inspection aims.</p>
      </section>

      <!-- A3 -->
      <section>
        <h4>Question 3 – Signs of queenlessness</h4>
        <p><strong>Key points (any three):</strong></p>
        <ul>
          <li>No eggs or very young larvae over time.</li>
          <li>Spotty or absent brood, especially after previous normal pattern.</li>
          <li>Increased noise and agitation, “roaring” colony.</li>
          <li>Emergency queen cells on worker larvae.</li>
          <li>Presence of laying worker pattern (eggs on sides, many in cells) in long-term cases.</li>
        </ul>
      </section>

      <!-- A4 -->
      <section>
        <h4>Question 4 – Records</h4>
        <p><strong>Reasons to keep records:</strong></p>
        <ul>
          <li>Track queen performance (temperament, brood pattern, age).</li>
          <li>Monitor disease history and treatments.</li>
          <li>Record swarming, supersedure, and manipulations.</li>
          <li>Support planning (eg, uniting, breeding from good colonies).</li>
          <li>Allow comparison of colonies and seasons over time.</li>
        </ul>
        <p><strong>Examples of data:</strong> date, weather, queen status, brood/stores, disease signs, actions taken.</p>
      </section>

      <!-- A5 -->
      <section>
        <h4>Question 5 – Spring management</h4>
        <p><strong>Key ideas (any two):</strong></p>
        <ul>
          <li>Check food reserves and feed if necessary.</li>
          <li>Gradually remove excess insulation/empty comb if appropriate.</li>
          <li>Assess colony strength and queen performance.</li>
          <li>Replace very old or damaged comb over time.</li>
          <li>Prepare for swarm season (equipment ready, plan in mind).</li>
        </ul>
      </section>

      <!-- A6 -->
      <section>
        <h4>Question 6 – Summer management</h4>
        <p><strong>Key ideas (any two):</strong></p>
        <ul>
          <li>Provide space by adding supers as nectar comes in.</li>
          <li>Regular inspections for swarm preparations and queen cells.</li>
          <li>Maintaining good ventilation and shade where needed.</li>
          <li>Removing and extracting ripe honey when appropriate.</li>
        </ul>
      </section>

      <!-- A7 -->
      <section>
        <h4>Question 7 – Autumn management</h4>
        <p><strong>Key ideas (any three):</strong></p>
        <ul>
          <li>Ensure sufficient winter stores, feeding if needed.</li>
          <li>Check and treat for varroa as appropriate.</li>
          <li>Remove surplus supers and reduce hive space.</li>
          <li>Uniting weak colonies with stronger ones where sensible.</li>
          <li>Weather-proofing hives and securing roofs.</li>
        </ul>
      </section>

      <!-- A8 -->
      <section>
        <h4>Question 8 – Winter checks</h4>
        <p><strong>Key ideas (any two):</strong></p>
        <ul>
          <li>Hefting or lifting to judge stores.</li>
          <li>Providing fondant/candy if stores are low.</li>
          <li>Checking mouse guards and entrances are clear.</li>
          <li>Checking for woodpecker or weather damage to hives.</li>
        </ul>
      </section>

      <!-- A9 -->
      <section>
        <h4>Question 9 – Uniting colonies</h4>
        <p><strong>Outline of simple method:</strong></p>
        <ul>
          <li>Choose which queen to keep; remove the other.</li>
          <li>Place a sheet of newspaper between brood boxes of the two colonies.</li>
          <li>Make small slits in the paper and close the hive.</li>
          <li>Bees gradually chew through and unite with minimal fighting.</li>
        </ul>
        <p><strong>Reasons to unite:</strong> weak colonies, queenless colony, balancing strengths, overwintering viability.</p>
      </section>

      <!-- A10 -->
      <section>
        <h4>Question 10 – Feeding</h4>
        <p><strong>Reasons for syrup (any two):</strong></p>
        <ul>
          <li>To build up winter stores after honey removal.</li>
          <li>To support a light colony during late summer/early autumn.</li>
          <li>To stimulate comb building in some situations (with care).</li>
        </ul>
        <p><strong>Reason for fondant/candy:</strong></p>
        <ul>
          <li>Used in colder weather when liquid feed risks chilling bees or fermenting.</li>
          <li>Provides emergency food above cluster in winter/early spring.</li>
        </ul>
      </section>

      <!-- A11 -->
      <section>
        <h4>Question 11 – Handling comb</h4>
        <p><strong>Key points:</strong></p>
        <ul>
          <li>Lift frames slowly and vertically to avoid rolling bees.</li>
          <li>Hold frames over the hive to avoid dropping the queen.</li>
          <li>Avoid shaking brood frames unless necessary.</li>
          <li>Do not expose brood to cold or sun for long periods.</li>
        </ul>
      </section>

      <!-- A12 -->
      <section>
        <h4>Question 12 – Apiary site choice</h4>
        <p><strong>Considerations (any three):</strong></p>
        <ul>
          <li>Shelter from strong winds, some sun.</li>
          <li>Safe flight paths away from neighbours/footpaths.</li>
          <li>Good access for the beekeeper and vehicle if needed.</li>
          <li>Dry, well-drained ground (no standing water).</li>
          <li>Proximity to forage and water.</li>
        </ul>
      </section>

      <!-- Section B answers -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
      </section>

      <!-- A13 -->
      <section>
        <h4>Question 13 – Swarm risk</h4>
        <p><strong>Correct answer:</strong> Overcrowded brood box with many queen cells on the comb edges.</p>
      </section>

      <!-- A14 -->
      <section>
        <h4>Question 14 – Use of the smoker</h4>
        <p><strong>Correct answer:</strong> To encourage bees to gorge on stores and become calmer.</p>
      </section>

      <!-- A15 -->
      <section>
        <h4>Question 15 – Queen excluder</h4>
        <p><strong>Correct answer:</strong> To prevent the queen from laying eggs in the honey supers.</p>
      </section>

      <!-- A16 -->
      <section>
        <h4>Question 16 – Adding supers</h4>
        <p><strong>Correct answer:</strong> When most brood frames are covered with bees and nectar is coming in.</p>
      </section>

      <!-- A17 -->
      <section>
        <h4>Question 17 – Defensive colony</h4>
        <p><strong>Correct answer:</strong> Check for recent queen replacement or disturbance and review handling and weather conditions.</p>
        <p>Further discussion: later actions might include requeening if behaviour persists.</p>
      </section>

      <!-- A18 -->
      <section>
        <h4>Question 18 – Brood pattern</h4>
        <p><strong>Correct answer:</strong> Compact, with an even area of brood and few empty cells in the centre of the frame.</p>
      </section>

      <!-- A19 -->
      <section>
        <h4>Question 19 – Dummy board</h4>
        <p><strong>Correct answer:</strong> To fill unused space and help maintain a compact brood nest.</p>
      </section>

      <!-- A20 -->
      <section>
        <h4>Question 20 – Shook swarm</h4>
        <p><strong>Correct answer:</strong> It is removed and replaced with new foundation or comb.</p>
      </section>

      <!-- A21 -->
      <section>
        <h4>Question 21 – Drone brood</h4>
        <p><strong>Correct answer:</strong> Larger cells with domed cappings.</p>
      </section>

      <!-- A22 -->
      <section>
        <h4>Question 22 – Inspections and weather</h4>
        <p><strong>Correct answer:</strong> Warm, calm day with flying bees and little risk of rain.</p>
      </section>

      <!-- Section C answers -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These answers are outlines. In an exam, marks would depend on clarity, structure and coverage of key points.
        </p>
      </section>

      <!-- A23 -->
      <section>
        <h4>Question 23 – Swarm control scenario</h4>
        <p><strong>Key elements of a suitable method (eg, artificial swarm):</strong></p>
        <ul>
          <li>Separate flying bees and queen from brood and queen cells.</li>
          <li>Move original hive and place new hive with frames/foundation in original position.</li>
          <li>Transfer queen and some brood/bees to new box; leave queen cells with brood in old box.</li>
          <li>Explain aim: to simulate a swarm and reduce swarming impulse while preserving colony strength.</li>
        </ul>
        <p>Credit any coherent swarm control method with clear steps and rationale.</p>
      </section>

      <!-- A24 -->
      <section>
        <h4>Question 24 – Seasonal calendar</h4>
        <p><strong>Spring:</strong> build-up, checking stores, replacing old comb, prepare for swarming.</p>
        <p><strong>Summer:</strong> swarm control, supering, main inspections, honey production.</p>
        <p><strong>Autumn:</strong> varroa control, feeding to ensure stores, uniting weak colonies, reducing space.</p>
        <p><strong>Winter:</strong> minimal disturbance, monitoring stores, weather protection, planning for next season.</p>
      </section>

      <!-- A25 -->
      <section>
        <h4>Question 25 – Hive equipment and layout</h4>
        <p><strong>Typical order and purposes:</strong></p>
        <ul>
          <li>Stand – lifts hive off ground, reduces damp.</li>
          <li>Floor (often mesh) – entrance and ventilation.</li>
          <li>Brood box – brood nest and main colony.</li>
          <li>Queen excluder – keeps queen below in brood box.</li>
          <li>Supers – storage of surplus honey.</li>
          <li>Inner cover/crown board – insulation, feed hole.</li>
          <li>Roof – weather protection.</li>
        </ul>
      </section>

      <!-- A26 -->
      <section>
        <h4>Question 26 – Dealing with a failing queen</h4>
        <p><strong>Assessment:</strong> check brood pattern, presence of eggs, signs of disease or laying workers.</p>
        <p><strong>Possible actions:</strong></p>
        <ul>
          <li>Requeen with a better queen if available.</li>
          <li>Unite with a stronger, better colony.</li>
          <li>If laying workers, follow careful methods (e.g., unite with queenright colony using newspaper).</li>
        </ul>
      </section>

      <!-- A27 -->
      <section>
        <h4>Question 27 – Preparing for winter</h4>
        <p><strong>Key topics:</strong></p>
        <ul>
          <li>Ensure adequate stores (hefting, feeding).</li>
          <li>Varroa and disease control as appropriate.</li>
          <li>Reduce entrances, fit mouse guards.</li>
          <li>Secure roofs, check stands, wind protection.</li>
          <li>Consider uniting weak colonies.</li>
        </ul>
      </section>

      <!-- A28 -->
      <section>
        <h4>Question 28 – Opening a hive safely</h4>
        <p><strong>Sequence:</strong></p>
        <ul>
          <li>Check weather and surroundings; wear protective clothing.</li>
          <li>Approach from side or back, minimal vibration.</li>
          <li>Use a little cool smoke at entrance and under roof.</li>
          <li>Remove roof and crown board gently.</li>
          <li>Inspect outer frames first, then brood frames, handling carefully.</li>
        </ul>
      </section>

      <!-- A29 -->
      <section>
        <h4>Question 29 – Choosing a colony to propagate from</h4>
        <p><strong>Desirable characteristics:</strong></p>
        <ul>
          <li>Calm, gentle temper.</li>
          <li>Good brood pattern and productivity.</li>
          <li>Low swarming tendency under good management.</li>
          <li>Good overwintering performance.</li>
          <li>Low disease incidence.</li>
        </ul>
      </section>

      <!-- A30 -->
      <section>
        <h4>Question 30 – Apiary risk assessment</h4>
        <p><strong>Risks:</strong></p>
        <ul>
          <li>Stings to beekeeper and public; livestock disturbance.</li>
          <li>Slips, trips, lifting injuries; weather exposure.</li>
          <li>Theft or vandalism; damage to property.</li>
        </ul>
        <p><strong>Mitigation:</strong></p>
        <ul>
          <li>Careful site choice and hive orientation.</li>
          <li>Protective clothing, safe handling, first-aid awareness.</li>
          <li>Clear access paths, safe lifting, secure hives/fences.</li>
        </ul>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module1" class="tk-btn tk-btn-secondary">
        Back to questions
      </a>
      <a href="#/module2" class="tk-btn tk-btn-primary">
        Next: Module 2 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
}
