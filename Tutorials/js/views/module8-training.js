// Tutorials/js/views/module8-training.js
// SPA view for "Module 8 – Management, Health & History" TRAINING content
import { initAnswerBlocks } from "../answers-logic.js";

export function renderModule8Training(container) {
  document.title = "Module 8 – Training • BeezKnees Training";

  container.innerHTML = `
    <section class="tk-module-overview">
      <header class="tk-content-header">
        <div class="tk-content-heading">
          <div class="tk-content-eyebrow">Module 8</div>
          <h1 class="tk-content-title">Management, Health &amp; History – Training</h1>
          <p class="tk-content-subtitle">
            This module brings together practical management, bee health awareness and the historical
            background of beekeeping. It helps you see today's practices in context.
          </p>
        </div>

        <div class="tk-training-progress-wrapper">
          <span data-training-progress class="tk-training-progress-text">
            0% complete
          </span>
        </div>
      </header>

      <div class="tk-card-grid">
        <article class="tk-card">
          <h2>What you should be able to do after this training</h2>
          <ul>
            <li>Describe key management aims and how they relate to bee health and welfare.</li>
            <li>Outline management across the beekeeping year.</li>
            <li>Explain how beekeeping has changed over time.</li>
            <li>Discuss the role of bees in agriculture and the wider environment.</li>
            <li>Understand the beekeeper’s responsibilities to bees, neighbours and the public.</li>
          </ul>
        </article>

        <article class="tk-card">
          <h2>How to use this page</h2>
          <ol>
            <li>Use these sections to tie together knowledge from earlier modules.</li>
            <li>Make note of historical points and how they influence modern practices.</li>
            <li>Mark sections complete when you feel you could give a short talk or essay answer on that topic.</li>
          </ol>
        </article>
      </div>
    </section>

    <!-- SECTION 1 -->
    <section id="m8-section-1" class="tk-section" data-training-section="1">
      <h2>1. Aims of good hive management</h2>
      <p>
        Good management balances the needs of the bees, the beekeeper and the wider community.
        It is about much more than just obtaining honey.
      </p>
      <h3>Main aims</h3>
      <ul>
        <li>Healthy, thriving colonies with acceptable temperament.</li>
        <li>Reasonable honey crop or pollination performance.</li>
        <li>Respect for neighbours, livestock and the public.</li>
        <li>Compliance with legal and welfare expectations.</li>
      </ul>
      <p>
        Many exam questions in this module ask you to justify management choices. Always link
        actions back to these core aims when you explain your reasoning.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="1">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 2 -->
    <section id="m8-section-2" class="tk-section" data-training-section="2">
      <h2>2. Management through the beekeeping year (overview)</h2>
      <p>
        This section summarises how management priorities shift through the year. Earlier modules
        cover the details; here we think in terms of the “story” of the season.
      </p>
      <h3>Spring</h3>
      <ul>
        <li>Assess winter survival and strength.</li>
        <li>Ensure adequate food and space for brood expansion.</li>
        <li>Monitor for disease and early swarming signs.</li>
      </ul>
      <h3>Summer</h3>
      <ul>
        <li>Manage swarming risk and supers.</li>
        <li>Inspect regularly for health and queen performance.</li>
        <li>Take honey crops when ripe and conditions allow.</li>
      </ul>
      <h3>Autumn and winter</h3>
      <ul>
        <li>Prepare colonies for winter with sound queens and adequate stores.</li>
        <li>Control Varroa and monitor health.</li>
        <li>Check hive security, ventilation and protection from pests.</li>
      </ul>
      <p>
        This overview is useful when planning answers about management strategies or explaining
        why certain actions happen at particular times of year.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="2">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 3 -->
    <section id="m8-section-3" class="tk-section" data-training-section="3">
      <h2>3. Bee health and welfare principles</h2>
      <p>
        Bee health depends on good nutrition, disease control, appropriate hive conditions and
        sensible management. Welfare includes avoiding unnecessary stress and suffering.
      </p>
      <h3>Key principles</h3>
      <ul>
        <li>Provide adequate space, food and ventilation.</li>
        <li>Monitor for and manage pests and diseases promptly.</li>
        <li>Avoid rough handling and excessive disturbance.</li>
        <li>Replace failing queens and unhealthy comb.</li>
      </ul>
      <p>
        In exam answers, you can refer to bee “welfare” alongside health when justifying decisions
        such as combining weak colonies or requeening aggressive ones.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="3">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 4 -->
    <section id="m8-section-4" class="tk-section" data-training-section="4">
      <h2>4. Relationships with neighbours and the public</h2>
      <p>
        Beekeeping has a social dimension. Poorly sited or managed hives can cause friction with
        neighbours or the public and may lead to restrictions.
      </p>
      <h3>Good practice</h3>
      <ul>
        <li>Site hives so flight lines do not cross paths, gardens or livestock.</li>
        <li>Manage temperament and requeen overly defensive colonies.</li>
        <li>Communicate constructively with neighbours about bees and stings.</li>
        <li>Consider signage or barriers where appropriate.</li>
      </ul>
      <p>
        Examiners expect candidates to show awareness of these responsibilities, not just what
        happens inside the hive box.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="4">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 5 -->
    <section id="m8-section-5" class="tk-section" data-training-section="5">
      <h2>5. Bees, pollination and the wider environment</h2>
      <p>
        Honey bees are important pollinators, but they share this role with many wild bees and
        other insects. Good beekeeping recognises the wider ecological picture.
      </p>
      <h3>Pollination role</h3>
      <ul>
        <li>Honey bees contribute to pollination of crops and wild plants.</li>
        <li>Beekeepers may provide colonies for crop pollination in some systems.</li>
      </ul>
      <h3>Environmental considerations</h3>
      <ul>
        <li>High hive density may affect local forage and wild pollinators.</li>
        <li>Flower-rich habitats and reduced pesticide use support all pollinators.</li>
      </ul>
      <p>
        In exam essays, you can gain marks by showing awareness of these broader environmental
        connections, not just hive-level management.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="5">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 6 -->
    <section id="m8-section-6" class="tk-section" data-training-section="6">
      <h2>6. Brief history of beekeeping and hive design</h2>
      <p>
        Modern beekeeping has developed from simple nest-raiding through skeps and early hives
        to today’s movable-frame systems.
      </p>
      <h3>Key historical ideas</h3>
      <ul>
        <li>Realisation that bees can be kept in man-made structures near home.</li>
        <li>Development of methods that allow honey harvest without destroying colonies.</li>
        <li>Movable frames enabling inspection and disease control.</li>
      </ul>
      <p>
        You do not need detailed dates, but you should understand how historical developments
        support today’s inspections, swarm control and disease management.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="6">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 7 -->
    <section id="m8-section-7" class="tk-section" data-training-section="7">
      <h2>7. Changes in management and disease control over time</h2>
      <p>
        As new pests and diseases appear, and as expectations of welfare and productivity change,
        management practices evolve.
      </p>
      <h3>Examples of change</h3>
      <ul>
        <li>Introduction of Varroa control strategies.</li>
        <li>Improved understanding of nutrition and forage.</li>
        <li>Shift from purely honey-focused keeping to wider pollination and conservation roles.</li>
      </ul>
      <p>
        Historical awareness can strengthen exam answers that ask “how and why” management has
        changed, especially in relation to diseases and new challenges.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="7">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 8 -->
    <section id="m8-section-8" class="tk-section" data-training-section="8">
      <h2>8. Modern challenges: pests, pesticides and climate</h2>
      <p>
        Contemporary beekeeping faces multiple pressures, including pests, pesticide exposure and
        climate-related changes in weather and forage.
      </p>
      <h3>Key challenges</h3>
      <ul>
        <li>Managing Varroa and associated viruses.</li>
        <li>Changing patterns of forage availability.</li>
        <li>Exposure to agricultural and garden chemicals.</li>
      </ul>
      <p>
        Candidates who show they appreciate these challenges, and can suggest sensible management
        responses, will stand out in exam answers.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="8">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 9 -->
    <section id="m8-section-9" class="tk-section" data-training-section="9">
      <h2>9. Role of associations, education and support</h2>
      <p>
        Local and national beekeeping associations play an important role in training, sharing
        good practice and coordinating responses to disease and other issues.
      </p>
      <h3>Association roles</h3>
      <ul>
        <li>Training new and experienced beekeepers.</li>
        <li>Sharing up-to-date information on disease and management.</li>
        <li>Facilitating breeding and selection schemes.</li>
      </ul>
      <p>
        Mentioning association support and education in exam essays shows a realistic view of
        how most beekeepers actually gain and maintain their skills.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="9">
          Mark this section as complete
        </button>
      </div>
    </section>

    <!-- SECTION 10 -->
    <section id="m8-section-10" class="tk-section" data-training-section="10">
      <h2>10. Pulling it together for Module 8 answers</h2>
      <p>
        Module 8 often asks for longer, more discursive answers. This is your chance to show that
        you can combine practical experience, health awareness and historical context.
      </p>
      <h3>Answer structure ideas</h3>
      <ul>
        <li>Start with the management aim or challenge.</li>
        <li>Add relevant biology or behaviour where appropriate.</li>
        <li>Explain practical steps and link them to health and welfare.</li>
        <li>Where suitable, mention historical or environmental context.</li>
      </ul>
      <p>
        Practise outlining answers using these steps. Note phrases that feel natural to you and
        use them consistently in practice and mock exams.
      </p>
      <div class="tk-section-actions">
        <button type="button" class="tk-btn tk-btn-secondary" data-mark-complete="10">
          Mark this section as complete
        </button>
      </div>
    </section>
  `;

  initAnswerBlocks(container);

  if (window.BKTraining && typeof window.BKTraining.initTrainingProgressForModule === "function") {
    window.BKTraining.initTrainingProgressForModule(container, "module8", 10);
  }
}
