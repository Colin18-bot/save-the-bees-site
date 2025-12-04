// Tutorials/js/views/glossary.js
// SPA view for "Glossary" page
// Follows the same pattern as Tutorials/js/views/modules.js

export function renderGlossary(container) {
  container.innerHTML = `
    <header class="tk-content-header">
      <div class="tk-content-heading">
        <div class="tk-content-eyebrow">Reference</div>
        <h2 class="tk-content-title">Key terms and phrases (A–Z)</h2>
        <p class="tk-content-subtitle">
          This glossary isn’t meant to replace formal textbooks or the official syllabus, but it can help
          when a question uses a term you don’t see every day.
        </p>
      </div>
    </header>

    <section class="tk-card">
      <div class="tk-card-body tk-reading">
        <dl>
          <dt>AFB (American Foulbrood)</dt>
          <dd>
            A serious bacterial brood disease caused by <em>Paenibacillus larvae</em>. Highly infectious and
            notifiable; affected colonies are usually destroyed under official guidance.
          </dd>

          <dt>Apiary</dt>
          <dd>
            A site where one or more colonies of honey bees are kept. In exam questions, “apiary management”
            usually refers to the overall organisation and routine of all colonies on the site.
          </dd>

          <dt>Brood</dt>
          <dd>
            The eggs, larvae and pupae of honey bees developing in the comb. Questions often distinguish
            between healthy brood and brood affected by disease or poor laying patterns.
          </dd>

          <dt>Brood pattern</dt>
          <dd>
            The overall appearance of sealed brood on the comb. A good brood pattern is usually compact and
            even, with few empty cells in the central area, indicating a productive, healthy queen.
          </dd>

          <dt>CBPV / CBPVQ (Chronic Bee Paralysis Virus)</dt>
          <dd>
            A viral disease of adult bees that can cause trembling, hairless shiny bees and piles of dead
            bees at the entrance. “CBPVQ” may be used as a memory aid checklist in notes and training.
          </dd>

          <dt>Colony</dt>
          <dd>
            A complete honey bee community consisting of a queen, workers and (at certain times) drones,
            plus the comb and stores they live on.
          </dd>

          <dt>Comb</dt>
          <dd>
            The wax structure built by bees containing cells for brood rearing and storage of honey and pollen.
          </dd>

          <dt>Crown board</dt>
          <dd>
            A board placed above the brood box, often with feed holes. It helps retain heat and gives a
            convenient cover when inspecting or feeding.
          </dd>

          <dt>Dummy board</dt>
          <dd>
            A solid board used at the side of a brood box instead of frames. Helps maintain correct bee
            space and can make inspections easier and tidier.
          </dd>

          <dt>Drone</dt>
          <dd>
            A male honey bee whose primary role is to mate with a virgin queen. Drones do not collect
            nectar or pollen.
          </dd>

          <dt>Drone brood</dt>
          <dd>
            Brood that will develop into drones (male bees). Typically found in larger cells with domed
            cappings compared to worker brood.
          </dd>

          <dt>EFB (European Foulbrood)</dt>
          <dd>
            A bacterial brood disease caused by <em>Melissococcus plutonius</em>. Notifiable. Often affects
            unsealed larvae, which may twist in their cells and die before capping.
          </dd>

          <dt>Fondant / Candy</dt>
          <dd>
            A semi-solid sugar feed (often white fondant or candy) used mainly for emergency or winter
            feeding when syrup would be unsuitable.
          </dd>

          <dt>Forage</dt>
          <dd>
            The nectar and pollen sources available to bees in the surrounding area. Many exam questions
            link forage availability to swarming, nectar flows and colony build-up.
          </dd>

          <dt>Hive</dt>
          <dd>
            The man-made structure containing a colony and its combs. In some exam questions the term is
            used loosely to refer to both the box and the bees.
          </dd>

          <dt>PPE (Personal Protective Equipment)</dt>
          <dd>
            Protective clothing used when working with bees, typically including a bee suit or jacket,
            veil, gloves and suitable footwear.
          </dd>

          <dt>Queen cell</dt>
          <dd>
            A specially enlarged cell in which a queen is reared. Often mentioned in questions on swarm
            control, supersedure and emergency queen rearing.
          </dd>

          <dt>Queen excluder</dt>
          <dd>
            A grid placed between the brood box and supers that allows workers to pass through but not
            the queen, preventing her from laying in the honey supers.
          </dd>

          <dt>Queenlessness</dt>
          <dd>
            The state of a colony that has no queen or no effective laying queen. Often associated with
            a lack of eggs and young brood and changes in behaviour.
          </dd>

          <dt>Robbing</dt>
          <dd>
            When bees from one colony steal honey from another. Exams may ask about recognising and
            preventing robbing, especially during dearth periods.
          </dd>

          <dt>SHB (Small Hive Beetle)</dt>
          <dd>
            An invasive pest (<em>Aethina tumida</em>) that can damage comb, ferment honey and cause serious
            colony problems. Notifiable in countries where it is not established.
          </dd>

          <dt>Shook swarm</dt>
          <dd>
            A management procedure where all adult bees are shaken into a clean hive with new comb or
            foundation, leaving old comb to be removed. Used in some disease control and comb replacement
            strategies.
          </dd>

          <dt>Super</dt>
          <dd>
            A box placed above the brood chamber to provide space for bees to store surplus honey,
            typically harvested by the beekeeper.
          </dd>

          <dt>Swarm control</dt>
          <dd>
            The range of management techniques used to prevent or deal with natural swarming, such as
            providing space, artificial swarming or removing queen cells appropriately.
          </dd>

          <dt>Varroa</dt>
          <dd>
            A parasitic mite (<em>Varroa destructor</em>) that feeds on developing and adult bees.
            Questions frequently cover monitoring methods, treatment options and thresholds.
          </dd>

          <dt>Virgin queen</dt>
          <dd>
            A queen that has emerged from her cell but has not yet mated. Her behaviour and appearance
            may differ from a fully mated, laying queen.
          </dd>

          <dt>Worker</dt>
          <dd>
            A female bee that performs most of the tasks in the colony, including foraging, brood care,
            comb building and guarding.
          </dd>
        </dl>
      </div>
    </section>
  `;
}
