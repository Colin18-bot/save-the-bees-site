// tutorials-js/views/module1.js
// SPA view for "Module 1 – Honey Bee Management" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule1(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Honey Bee Management</h2>
        <p class="tk-content-subtitle">
          Mix of short-answer, multiple-choice and longer written questions. In the live app you could
          add scoring or marking; this version is a clean printable / on-screen practice set.
        </p>
      </div>
      <div class="tk-page-actions">
        <button
          type="button"
          class="tk-btn tk-btn-secondary tk-print-hide"
          onclick="window.print()">
          Print questions
        </button>

        <a href="#/modules" class="tk-btn tk-btn-secondary">
          Back to modules
        </a>
      </div>
    </header>

    <!-- Instructions -->
    <section class="tk-card">
      <div class="tk-card-body">
        <p style="font-size:0.86rem; color:var(--text-soft);">
          Suggested use: answer the questions without notes, then compare with the model answers page
          <strong>(module1-answers)</strong>. Treat them as revision prompts rather than
          exact exam predictions.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Short-answer questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These typically expect a few bullet points or a short paragraph. In a written exam they might be
          worth 2–6 marks each.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – Routine inspection aims</h4>
        <p>
          During a routine inspection in spring or summer, list four key things you should check in each colony.
        </p>
       </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – “CBPVQ” memory aid</h4>
        <p>
          Many beekeepers use a simple checklist to remember what to look for (such as “food, brood, queen”).
          Suggest your own 3–5 point checklist and explain briefly what each item reminds you to consider.
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – Signs of queenlessness</h4>
        <p>
          Give three signs that a colony may be queenless or having serious queen problems.
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Records</h4>
        <p>
          Explain why keeping inspection records is important for good colony management. Give at least three
          examples of information you might record.
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Spring management</h4>
        <p>
          Describe two management tasks that are particularly important in early spring as the colony begins
          to build up.
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Summer management</h4>
        <p>
          Describe two management tasks that are particularly important during the main summer nectar flow.
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Autumn management</h4>
        <p>
          Give three actions you might take in late summer or early autumn to prepare colonies for winter.
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Winter checks</h4>
        <p>
          Inspections are limited in winter, but some checks are still useful. Describe two things you can
          safely check or do during winter without opening the hive fully.
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Uniting colonies</h4>
        <p>
          Briefly outline a simple method for uniting two colonies and explain why you might wish to unite them.
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Feeding</h4>
        <p>
          Give two reasons for feeding a colony sugar syrup, and one reason for feeding fondant or candy
          instead of syrup.
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Handling comb</h4>
        <p>
          Describe good practice when lifting and examining a frame of brood to minimise harm to bees and brood.
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Apiary site choice</h4>
        <p>
          List three factors to consider when choosing a site for an apiary from a management point of view.
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Multiple-choice questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Choose the best answer in each case. In a live system these could be auto-marked.
        </p>
      </section>

      <!-- Q13 -->
      <section>
        <h4>Question 13 – Swarm risk</h4>
        <p class="tk-quick-check-question">
          Which situation is most likely to increase the risk of swarming in a strong colony?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q13" />Plenty of space in brood box and supers.</label>
          <label><input type="radio" name="m1q13" />Overcrowded brood box with many queen cells on the comb edges.</label>
          <label><input type="radio" name="m1q13" />Regular removal of drone brood.</label>
        </div>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – Use of the smoker</h4>
        <p class="tk-quick-check-question">
          What is the main purpose of using cool smoke at the hive entrance and under the crown board?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q14" />To drive all bees out of the hive before inspection.</label>
          <label><input type="radio" name="m1q14" />To encourage bees to gorge on stores and become calmer.</label>
          <label><input type="radio" name="m1q14" />To mask the beekeeper’s scent so the bees cannot see them.</label>
        </div>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – Queen excluder</h4>
        <p class="tk-quick-check-question">
          Why is a queen excluder commonly placed between the brood box and honey supers?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q15" />To prevent worker bees from entering the supers.</label>
          <label><input type="radio" name="m1q15" />To prevent the queen from laying eggs in the honey supers.</label>
          <label><input type="radio" name="m1q15" />To keep the brood box warmer in winter.</label>
        </div>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Adding supers</h4>
        <p class="tk-quick-check-question">
          When is the best time to add a super to a colony?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q16" />When most brood frames are covered with bees and nectar is coming in.</label>
          <label><input type="radio" name="m1q16" />Immediately after winter, regardless of colony strength.</label>
          <label><input type="radio" name="m1q16" />Only once all brood comb is completely sealed.</label>
        </div>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Defensive colony</h4>
        <p class="tk-quick-check-question">
          Which of the following actions is the most appropriate first step if a colony suddenly becomes unusually defensive?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q17" />Destroy the colony immediately.</label>
          <label><input type="radio" name="m1q17" />Check for recent queen replacement or disturbance and review handling and weather conditions.</label>
          <label><input type="radio" name="m1q17" />Never inspect again and leave them entirely alone.</label>
        </div>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Brood pattern</h4>
        <p class="tk-quick-check-question">
          A good brood pattern in a well-managed colony is usually:
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q18" />Very patchy with many empty cells scattered through the brood.</label>
          <label><input type="radio" name="m1q18" />Compact, with an even area of brood and few empty cells in the centre of the frame.</label>
          <label><input type="radio" name="m1q18" />Only drone brood across all frames.</label>
        </div>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Use of a dummy board</h4>
        <p class="tk-quick-check-question">
          What is a dummy board used for in hive management?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q19" />To prevent bees from leaving the hive at the entrance.</label>
          <label><input type="radio" name="m1q19" />To fill unused space and help maintain a compact brood nest.</label>
          <label><input type="radio" name="m1q19" />To separate the queen from drones.</label>
        </div>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Shook swarm</h4>
        <p class="tk-quick-check-question">
          In a shook swarm procedure, what happens to the old comb?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q20" />It is left in place and reused for several more seasons.</label>
          <label><input type="radio" name="m1q20" />It is removed and replaced with new foundation or comb.</label>
          <label><input type="radio" name="m1q20" />It is moved above a queen excluder as honey supers.</label>
        </div>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Drone brood</h4>
        <p class="tk-quick-check-question">
          Which of the following best describes drone brood compared to worker brood?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q21" />Smaller cells with flatter cappings.</label>
          <label><input type="radio" name="m1q21" />Larger cells with domed cappings.</label>
          <label><input type="radio" name="m1q21" />Exactly the same appearance as worker brood.</label>
        </div>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Inspections and weather</h4>
        <p class="tk-quick-check-question">
          Which weather conditions are generally most suitable for a full brood inspection?
        </p>
        <div class="tk-quick-check-options">
          <label><input type="radio" name="m1q22" />Cold, windy day with frequent showers.</label>
          <label><input type="radio" name="m1q22" />Warm, calm day with flying bees and little risk of rain.</label>
          <label><input type="radio" name="m1q22" />Mid-winter frosty morning.</label>
        </div>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Longer written questions</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          These call for structured answers in several paragraphs or bullet points.
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – Swarm control scenario</h4>
        <p>
          You inspect a strong colony in May and find several charged queen cells on the face of brood comb,
          with plenty of sealed brood and stores. Describe a suitable swarm control method you could use,
          outlining the main steps and the aim of each step.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Seasonal calendar</h4>
        <p>
          Draw up a brief seasonal outline (spring, summer, autumn, winter) listing the main management
          priorities and typical tasks at each time of year for a hobby beekeeper with a few colonies.
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Hive equipment and layout</h4>
        <p>
          Describe the typical arrangement of components in a standard hive from the ground up (floor to roof),
          mentioning the purpose of each main part from a management point of view.
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Dealing with a failing queen</h4>
        <p>
          A colony shows a poor, patchy brood pattern and declining strength, with signs of laying workers on one
          frame. Explain how you would assess the situation and outline possible management responses.
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – Preparing for winter</h4>
        <p>
          Write a short guide for a new beekeeper explaining how to prepare a colony for winter, including
          considerations of health, stores, equipment and apiary layout.
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Opening a hive safely</h4>
        <p>
          Explain the sequence of actions you would take from arriving at the apiary to examining the first
          brood frame, emphasising safe and calm handling of the bees.
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – Recognising a good colony to propagate from</h4>
        <p>
          List the characteristics you would look for when choosing a colony to raise queens from, and explain
          why each characteristic is desirable.
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Apiary risk assessment</h4>
        <p>
          Describe the main risks associated with running an apiary (to bees, beekeeper and public) and outline
          practical steps you can take to reduce those risks as part of good management.
        </p>
      </section>

    </article>

    
    <div class="tk-next-row">
      <a href="#/module1-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      
      <a href="#/module2" class="tk-btn tk-btn-primary">
        Continue to Module 2 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module1.html");
}