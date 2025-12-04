// tutorials-js/views/module6.js
// SPA view for "Module 6 – Honey Bee Behaviour" questions
import { initAnswerBlocks } from "../answers-logic.js";
export function renderModule6(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Practice</div>
        <h2 class="tk-content-title">30 practice questions – Honey Bee Behaviour</h2>
        <p class="tk-content-subtitle">
          Answer these questions in your notebook or offline first. When you’re ready, compare with the model answers.
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
          Try to answer without notes first. Then open
          <strong>module6-answers</strong> to compare with the model answers and marking notes.
        </p>
      </div>
    </section>

    <article class="tk-reading" style="display:flex; flex-direction:column; gap:12px;">

      <!-- SECTION A -->
      <section>
        <h3>Section A – Colony organisation &amp; communication</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Questions on how the colony functions as a superorganism, division of labour and the role of pheromones and communication.
        </p>
      </section>

      <!-- Q1 -->
      <section>
        <h4>Question 1 – Definition of behaviour</h4>
        <p>
          What is meant by “behaviour” in the context of a honey bee colony, and why is it useful to think of the colony as a superorganism?
        </p>
      </section>

      <!-- Q2 -->
      <section>
        <h4>Question 2 – Division of labour</h4>
        <p>
          Describe how division of labour operates among worker bees from emergence to the end of their lives.
        </p>
      </section>

      <!-- Q3 -->
      <section>
        <h4>Question 3 – Age-related tasks</h4>
        <p>
          List typical tasks performed by young, middle-aged and older worker bees.
        </p>
      </section>

      <!-- Q4 -->
      <section>
        <h4>Question 4 – Trophallaxis</h4>
        <p>
          Explain what trophallaxis is and give two reasons why it is important for colony organisation.
        </p>
      </section>

      <!-- Q5 -->
      <section>
        <h4>Question 5 – Queen pheromones</h4>
        <p>
          Describe two main effects of queen pheromones on worker behaviour.
        </p>
      </section>

      <!-- Q6 -->
      <section>
        <h4>Question 6 – Brood pheromones</h4>
        <p>
          How do brood pheromones influence worker activities in the hive?
        </p>
      </section>

      <!-- Q7 -->
      <section>
        <h4>Question 7 – Alarm pheromones</h4>
        <p>
          What is the role of alarm pheromones, and how might a beekeeper accidentally trigger their release?
        </p>
      </section>

      <!-- Q8 -->
      <section>
        <h4>Question 8 – Orientation flights</h4>
        <p>
          Describe an orientation flight and explain why it is important for young bees.
        </p>
      </section>

      <!-- Q9 -->
      <section>
        <h4>Question 9 – Waggle dance</h4>
        <p>
          Briefly describe the waggle dance and what information it conveys to other bees.
        </p>
      </section>

      <!-- Q10 -->
      <section>
        <h4>Question 10 – Round dance</h4>
        <p>
          What is the round dance, and when is it used instead of the waggle dance?
        </p>
      </section>

      <!-- SECTION B -->
      <section>
        <h3>Section B – Defensive, hygienic &amp; reproductive behaviour</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Focus on defence, hygienic traits, swarming, supersedure and how colonies respond to threats or queen problems.
        </p>
      </section>

      <!-- Q11 -->
      <section>
        <h4>Question 11 – Guard bees</h4>
        <p>
          Describe the role of guard bees and two cues they may use to recognise intruders.
        </p>
      </section>

      <!-- Q12 -->
      <section>
        <h4>Question 12 – Defensive behaviour</h4>
        <p>
          List three factors that may influence how defensive a colony appears.
        </p>
      </section>

      <!-- Q13 -->
      <section>
        <h4>Question 13 – Stinging behaviour</h4>
        <p>
          Explain what happens when a worker bee stings a human or other mammal, and why this is fatal to the bee.
        </p>
      </section>

      <!-- Q14 -->
      <section>
        <h4>Question 14 – Robbing</h4>
        <p>
          What is robbing, and what signs might you see at the hive entrance?
        </p>
      </section>

      <!-- Q15 -->
      <section>
        <h4>Question 15 – Reducing robbing risk</h4>
        <p>
          Give three practical steps a beekeeper can take to reduce the risk of robbing.
        </p>
      </section>

      <!-- Q16 -->
      <section>
        <h4>Question 16 – Hygienic behaviour</h4>
        <p>
          Define hygienic behaviour and explain how it benefits the colony.
        </p>
      </section>

      <!-- Q17 -->
      <section>
        <h4>Question 17 – Grooming behaviour</h4>
        <p>
          What is grooming behaviour, and how may it help in dealing with external parasites?
        </p>
      </section>

      <!-- Q18 -->
      <section>
        <h4>Question 18 – Swarming cues</h4>
        <p>
          List three behavioural or physical signs inside the hive that suggest a colony is preparing to swarm.
        </p>
      </section>

      <!-- Q19 -->
      <section>
        <h4>Question 19 – Swarm clustering</h4>
        <p>
          Describe the behaviour of a swarm immediately after leaving the hive.
        </p>
      </section>

      <!-- Q20 -->
      <section>
        <h4>Question 20 – Supersedure vs swarming</h4>
        <p>
          How does the behaviour of a colony preparing to supersede a queen differ from one preparing to swarm?
        </p>
      </section>

      <!-- SECTION C -->
      <section>
        <h3>Section C – Foraging, navigation &amp; learning</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">
          Questions on foraging range, navigation, drifting, queenlessness and how experience and beekeeper handling influence behaviour over time.
        </p>
      </section>

      <!-- Q21 -->
      <section>
        <h4>Question 21 – Foraging range</h4>
        <p>
          What factors influence how far bees will forage from the hive?
        </p>
      </section>

      <!-- Q22 -->
      <section>
        <h4>Question 22 – Daily activity pattern</h4>
        <p>
          Describe the typical daily pattern of foraging activity and how it might change with weather.
        </p>
      </section>

      <!-- Q23 -->
      <section>
        <h4>Question 23 – Drifting</h4>
        <p>
          Describe what is meant by “drifting” and mention one way apiary layout can affect it.
        </p>
      </section>

      <!-- Q24 -->
      <section>
        <h4>Question 24 – Queenless colony behaviour</h4>
        <p>
          List three behavioural signs that suggest a colony may be queenless.
        </p>
      </section>

      <!-- Q25 -->
      <section>
        <h4>Question 25 – Laying workers</h4>
        <p>
          Explain how the behaviour and brood pattern of a colony with laying workers differs from one headed by a queen.
        </p>
      </section>

      <!-- Q26 -->
      <section>
        <h4>Question 26 – Orientation and landmarks</h4>
        <p>
          How do bees use landmarks and the sun to help them navigate?
        </p>
      </section>

      <!-- Q27 -->
      <section>
        <h4>Question 27 – Learning and memory</h4>
        <p>
          Give two examples that show bees are capable of learning and remembering information.
        </p>
      </section>

      <!-- Q28 -->
      <section>
        <h4>Question 28 – Influence of forage availability</h4>
        <p>
          How might changes in nectar or pollen availability affect foraging behaviour?
        </p>
      </section>

      <!-- Q29 -->
      <section>
        <h4>Question 29 – Handling and temperament</h4>
        <p>
          How can a beekeeper’s handling techniques positively or negatively affect colony behaviour over time?
        </p>
      </section>

      <!-- Q30 -->
      <section>
        <h4>Question 30 – Long-term selection by behaviour</h4>
        <p>
          Explain how consistently selecting colonies for good behaviour can influence the temperament of an apiary over several seasons.
        </p>
      </section>

    </article>

    <div class="tk-next-row">
      <a href="#/module6-answers" class="tk-btn tk-btn-secondary">
        View model answers
      </a>
      <a href="#/module7" class="tk-btn tk-btn-primary">
        Continue to Module 7 practice<span class="arrow">→</span>
      </a>
    </div>
  `;
   initAnswerBlocks(container, "module6.html");
}
