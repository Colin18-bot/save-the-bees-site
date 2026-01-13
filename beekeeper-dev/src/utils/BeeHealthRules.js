// src/utils/beeHealthRules.js

// showIf / excludeIf clause format:
// { any: ["flagA","flagB"], all:["flagC"], not:["flagD"] }
// - any: true if ANY are truthy
// - all: true if ALL are truthy
// - not: true if ALL are falsy

export const BEE_HEALTH_RULES = {
  // Confidence labels (used by UI)
  confidence: {
    possible: { label: "Possible", minOver: 0 },
    likely: { label: "Likely", minOver: 2 },
    veryLikely: { label: "Very likely", minOver: 5 },
  },

  /**
   * IMPROVEMENT #1: UK reporting / notifiable logic
   *
   * - redFlags: these are "hard stop" overrides (suspected notifiable foulbrood style)
   *   Your UI already uses this for the absolute override flow.
   *
   * - urgentReporting: additional "high significance" triggers where the UI should
   *   show a strong reporting banner, but NOT necessarily block normal results.
   *   (Asian hornet + Small hive beetle are the big ones for the UK.)
   *
   * NOTE: The current BeeHealthHelper.jsx only uses redFlags for override.
   * We’re adding urgentReporting now so the rules are ready. You can wire it in
   * later without changing the rule format again.
   */

  // Absolute safety override (notifiable suspicion)
  redFlags: ["ropey_larvae", "glue_like_smell", "sunken_and_perforated_cappings"],

  // NEW: urgent reporting triggers (not a hard stop, but should show prominent banner)
  urgentReporting: [
    {
      id: "asian_hornet_reporting",
      mode: "asian_hornet", // matches UKReportingPanel modes
      label: "Asian hornet suspected (urgent reporting advised)",
      // Trigger on hawking; persistent strengthens confidence (handled in scoring too)
      any: ["hornet_hawking", "hornet_seen_multiple_days"],
    },
    {
      id: "small_hive_beetle_reporting",
      mode: "shb",
      label: "Small hive beetle suspected (urgent reporting advised)",
      any: ["slimy_fermented_frames"],
    },
  ],

  // Wizard steps (what the UI shows)
  wizard: [
    { id: "context", title: "Context" },
    { id: "concern", title: "Main concern" },
    { id: "observations", title: "Observations" },
    { id: "results", title: "Results" },
  ],

  // Question bank (adaptive)
  questions: {
    context: [
      {
        id: "season",
        type: "select",
        label: "Season",
        options: [
          { value: "early_spring", label: "Early spring (Feb–Mar)" },
          { value: "spring", label: "Spring (Apr–May)" },
          { value: "summer", label: "Summer (Jun–Aug)" },
          { value: "autumn", label: "Autumn (Sep–Oct)" },
          { value: "winter", label: "Winter (Nov–Jan)" },
          // IMPROVEMENT #2: explicit Not sure
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "colony_strength",
        type: "select",
        label: "Colony strength",
        options: [
          { value: "strong", label: "Strong" },
          { value: "moderate", label: "Moderate" },
          { value: "weak", label: "Weak" },
          { value: "very_weak", label: "Very weak" },
          // IMPROVEMENT #2: explicit Not sure
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "onset_speed",
        type: "select",
        label: "How quickly did this start?",
        options: [
          { value: "sudden", label: "Sudden (hours–1 day)" },
          { value: "fast", label: "Fast (2–7 days)" },
          { value: "slow", label: "Slow (1–4 weeks)" },
          { value: "ongoing", label: "Ongoing (1+ months)" },
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "recent_changes",
        type: "multi",
        label: "What changed recently? (tick any)",
        options: [
          { id: "recent_move", label: "Hive moved" },
          { id: "recent_feeding", label: "Fed syrup/fondant recently" },
          { id: "recent_treatment", label: "Varroa treatment recently" },
          { id: "recent_queen_event", label: "Queen introduced / queen event" },
          { id: "recent_harvest", label: "Honey harvest / disturbance" },
          { id: "none_recent", label: "Nothing obvious" },
        ],
      },
    ],

    concern: [
      {
        id: "main_concern",
        type: "select",
        label: "What’s your main concern?",
        options: [
          { value: "brood", label: "Brood looks abnormal" },
          { value: "adults", label: "Adult bees look abnormal" },
          { value: "behaviour", label: "Unusual colony behaviour" },
          { value: "collapse", label: "Sudden drop in population" },
          { value: "pests", label: "Varroa / pests suspected" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
    ],

    brood: [
      { id: "patchy_brood", type: "check", label: "Patchy brood pattern", showIf: { any: ["broodMode"] } },
      { id: "very_patchy_brood", type: "check", label: "Very patchy / lots of empty cells", showIf: { any: ["broodMode"] } },
      { id: "unsealed_brood", type: "check", label: "Mostly unsealed brood affected", showIf: { any: ["broodMode"] } },

      { id: "chalk_like_larvae", type: "check", label: "Chalk-like / dried larvae (mummies)", showIf: { any: ["broodMode"] } },
      { id: "mummies_on_floor", type: "check", label: "Mummies seen on floor/at entrance", showIf: { any: ["chalk_like_larvae"] } },

      { id: "fluid_filled_larvae", type: "check", label: "Fluid-filled larvae", showIf: { any: ["broodMode"] } },
      { id: "slipper_shaped_larvae", type: "check", label: "Slipper-shaped remains", showIf: { any: ["fluid_filled_larvae"] } },

      { id: "brood_death_patterned", type: "check", label: "Brood death in patterns (often after cold nights)", showIf: { any: ["broodMode"] } },
      { id: "brood_on_edge", type: "check", label: "Mostly on outer frames/edges of brood nest", showIf: { any: ["brood_death_patterned"] } },

      { id: "smell_present", type: "check", label: "Unpleasant smell from brood area", showIf: { any: ["broodMode"] } },
      { id: "glue_like_smell", type: "check", label: "Glue-like smell (RED FLAG)", showIf: { any: ["smell_present"] } },

      { id: "ropey_larvae", type: "check", label: "Melted or ropey larvae (RED FLAG)", showIf: { any: ["broodMode"] } },
      { id: "sunken_and_perforated_cappings", type: "check", label: "Sunken + perforated cappings together (RED FLAG)", showIf: { any: ["broodMode"] } },

      { id: "chewed_cappings", type: "check", label: "Cappings chewed/removed (hygienic behaviour)", showIf: { any: ["broodMode"] } },
    ],

    adults_varroa: [
      { id: "mites_on_bees", type: "check", label: "Mites seen on adult bees", showIf: { any: ["adultMode", "pestMode"] } },
      { id: "mites_on_drone_brood", type: "check", label: "Mites seen in drone brood", showIf: { any: ["adultMode", "pestMode"] } },
      { id: "positive_varroa_test", type: "check", label: "Varroa monitoring/test positive", showIf: { any: ["adultMode", "pestMode"] } },
      { id: "high_mite_drop", type: "check", label: "High mite drop / heavy load suspected", showIf: { any: ["varroa_present"] } },

      { id: "deformed_wings", type: "check", label: "Deformed wings", showIf: { any: ["adultMode"] } },
      { id: "crawling_bees", type: "check", label: "Bees crawling / unable to fly", showIf: { any: ["adultMode", "collapseMode"] } },

      { id: "shiny_bees", type: "check", label: "Shiny / hairless bees", showIf: { any: ["adultMode"] } },
      { id: "trembling_bees", type: "check", label: "Trembling / shaking bees", showIf: { any: ["adultMode", "shiny_bees"] } },
      { id: "many_affected", type: "check", label: "Many bees affected at once (noticeable cluster)", showIf: { any: ["crawling_bees", "trembling_bees", "shiny_bees"] } },

      { id: "piles_of_dead_bees", type: "check", label: "Piles of dead bees outside the hive", showIf: { any: ["collapseMode", "adultMode"] } },
      { id: "tongues_out", type: "check", label: "Dead bees with tongues out", showIf: { any: ["piles_of_dead_bees"] } },
    ],

    pests_predators: [
      { id: "webbing_or_tunnels", type: "check", label: "Webbing or tunnels on comb", showIf: { any: ["pestMode", "unsureMode"] } },
      { id: "damage_unused_frames", type: "check", label: "Damage mostly on unused frames/corners", showIf: { any: ["webbing_or_tunnels"] } },
      { id: "warm_conditions", type: "check", label: "Warm conditions", showIf: { any: ["webbing_or_tunnels", "pestMode"] } },
      { id: "cocoons_present", type: "check", label: "Cocoons / larvae trails visible", showIf: { any: ["webbing_or_tunnels"] } },

      { id: "ants_seen", type: "check", label: "Ants seen in/around hive", showIf: { any: ["pestMode", "unsureMode"] } },

      { id: "fighting_at_entrance", type: "check", label: "Fighting at the entrance", showIf: { any: ["pestMode", "behaviourMode", "unsureMode"] } },
      { id: "robbing_signs", type: "check", label: "Robbing signs (frenzied traffic/attacks)", showIf: { any: ["fighting_at_entrance"] } },

      { id: "mouse_signs", type: "check", label: "Mouse signs (gnawing/debris/noises)", showIf: { any: ["pestMode", "winter", "autumn"] } },

      { id: "hornet_hawking", type: "check", label: "Large hornets ‘hawking’ at entrance (ALERT)", showIf: { any: ["pestMode", "behaviourMode", "unsureMode"] } },
      { id: "hornet_seen_multiple_days", type: "check", label: "Seen on multiple days / persistent", showIf: { any: ["hornet_hawking"] } },

      { id: "slimy_fermented_frames", type: "check", label: "Slimy/fermented frames (ALERT)", showIf: { any: ["pestMode", "unsureMode"] } },
    ],

    stores_behaviour: [
      { id: "stores_low", type: "check", label: "Stores low", showIf: { any: ["behaviourMode", "collapseMode", "unsureMode"] } },
      { id: "stores_none", type: "check", label: "Stores none / very light hive", showIf: { any: ["stores_low", "behaviourMode", "collapseMode", "unsureMode"] } },
      { id: "reduced_activity", type: "check", label: "Reduced activity for the season", showIf: { any: ["behaviourMode", "collapseMode", "unsureMode"] } },

      { id: "soiling", type: "check", label: "Soiling at entrance/frames (dysentery symptom)", showIf: { any: ["behaviourMode", "winter", "early_spring", "unsureMode"] } },
      { id: "prolonged_bad_weather", type: "check", label: "Prolonged bad weather / confinement", showIf: { any: ["behaviourMode", "winter", "early_spring", "unsureMode"] } },
      { id: "poor_spring_build_up", type: "check", label: "Poor spring build-up", showIf: { any: ["early_spring", "spring", "unsureMode"] } },

      { id: "bearding", type: "check", label: "Bearding / crowding at entrance", showIf: { any: ["behaviourMode", "summer", "spring", "unsureMode"] } },
      { id: "poor_ventilation", type: "check", label: "Poor ventilation / excess condensation", showIf: { any: ["bearding", "behaviourMode", "unsureMode"] } },

      { id: "declining_population", type: "check", label: "Declining population", showIf: { any: ["collapseMode", "behaviourMode", "unsureMode"] } },
      { id: "erratic_laying", type: "check", label: "Erratic laying pattern", showIf: { any: ["broodMode", "declining_population"] } },
      { id: "drone_brood_in_worker_cells", type: "check", label: "Drone brood in worker cells", showIf: { any: ["broodMode", "declining_population"] } },
    ],
  },

  // Output templates (user-facing) — unchanged from your file
  templates: {
    chalkbrood: {
      severity: "info",
      title: "Chalkbrood",
      why: ["Chalk-like larvae reported", "Often linked to stress/cold snaps"],
      checks: ["Look for mummified larvae in cells/on the floor", "Check colony strength and space"],
      steps: ["Reduce excess space for weak colonies", "Improve ventilation and reduce damp", "Recheck in 7–10 days"],
    },
    sacbrood: {
      severity: "info",
      title: "Sacbrood",
      why: ["Fluid-filled larvae / slipper-shaped remains", "Often affects unsealed brood"],
      checks: ["Confirm ‘sac’ appearance", "Assess colony strength and queen performance"],
      steps: ["Reduce stress and keep nutrition steady", "Monitor next inspection (often self-resolves in strong colonies)"],
    },
    chilled_brood: {
      severity: "info",
      title: "Chilled brood",
      why: ["Cold/confinement pattern reported", "Often on outer brood areas"],
      checks: ["Check if loss is on edges/outer frames", "Confirm colony can cover brood"],
      steps: ["Reduce space if needed", "Avoid early over-expansion", "Reassess when weather improves"],
    },
    queen_failure: {
      severity: "info",
      title: "Queen problems (failing queen / laying worker risk)",
      why: ["Poor laying indicators and declining population"],
      checks: ["Look for eggs and young larvae", "Assess pattern carefully"],
      steps: ["Monitor next inspection", "Consider requeening if persistent"],
    },
    starvation: {
      severity: "warning",
      title: "Starvation / low stores",
      why: ["Low/no stores and reduced activity reported"],
      checks: ["Check stores on frames + heft", "Confirm bees have access to food in cluster"],
      steps: ["Feed appropriately for the season", "Recheck within a few days if flying is limited"],
    },
    overcrowding_stress: {
      severity: "info",
      title: "Overcrowding / stress",
      why: ["Bearding/ventilation signs and strong colony context"],
      checks: ["Check space and ventilation", "Check for queen cells in swarm season"],
      steps: ["Provide space where appropriate", "Reduce disturbance and avoid overheating"],
    },
    varroa: {
      severity: "warning",
      title: "Varroa infestation",
      why: ["Varroa indicators reported", "Can weaken colonies and drive secondary problems"],
      checks: ["Confirm infestation level with monitoring", "Review recent treatments and timing"],
      steps: ["Treat based on season + level", "Continue monitoring after treatment"],
    },
    dwv: {
      severity: "warning",
      title: "Deformed Wing Virus (Varroa-associated)",
      why: ["Deformed wings/crawling bees (often Varroa-linked)"],
      checks: ["Assess Varroa levels", "Look for more affected bees"],
      steps: ["Prioritise Varroa control", "Monitor colony strength closely"],
    },
    parasitic_mite_syndrome: {
      severity: "warning",
      title: "Parasitic Mite Syndrome pattern (Varroa-related)",
      why: ["Varroa indicators plus brood issues/decline"],
      checks: ["Confirm Varroa levels", "Assess brood pattern and colony strength"],
      steps: ["Prioritise Varroa control", "Reassess brood after action and weather improvement"],
    },
    wax_moth: {
      severity: "warning",
      title: "Wax moth activity",
      why: ["Webbing/tunnels on comb and damage in unused areas", "Often secondary to weakness"],
      checks: ["Inspect corners/unused comb", "Confirm colony can cover all frames", "Look for cocoons/trails"],
      steps: ["Reduce excess space", "Remove badly damaged frames", "Focus on strengthening colony"],
    },
    ants: {
      severity: "info",
      title: "Ant nuisance",
      why: ["Ant activity reported"],
      checks: ["Check feeder areas for spills", "Confirm colony strength"],
      steps: ["Keep area clean of spills", "Monitor (usually nuisance not fatal)"],
    },
    wasps_robbing: {
      severity: "warning",
      title: "Robbing / wasp pressure",
      why: ["Fighting/robbing signs reported"],
      checks: ["Observe entrance behaviour", "Check stores aren’t being stripped quickly"],
      steps: ["Reduce entrance size", "Avoid spills", "Keep inspections short under pressure"],
    },
    mice: {
      severity: "warning",
      title: "Mouse intrusion risk",
      why: ["Mouse signs reported"],
      checks: ["Look for gnawing/debris on floor", "Check entrance size"],
      steps: ["Fit a mouse guard/entrance reducer (season-appropriate)", "Clean debris and monitor"],
    },
    asian_hornet: {
      severity: "alert",
      title: "Asian hornet concern (reporting advised)",
      why: ["Persistent ‘hawking’/predation behaviour reported"],
      checks: ["Observe from a safe distance", "Do not attempt nest destruction"],
      steps: ["Report via official UK routes promptly", "Reduce stress and keep entrances defensible"],
    },
    small_hive_beetle: {
      severity: "alert",
      title: "Small hive beetle concern (awareness / reporting advised)",
      why: ["Slimy/fermented frame signs reported (rare but high significance in the UK)"],
      checks: ["Do not move equipment off site", "Seek official guidance promptly"],
      steps: ["Report for advice", "Maintain strict biosecurity and avoid moving combs/boxes"],
    },
    cbpv: {
      severity: "info",
      title: "Chronic Bee Paralysis Virus pattern (possible)",
      why: ["Shiny/hairless bees and/or trembling/crawling behaviour"],
      checks: ["Confirm symptoms persist across inspections", "Check stress factors (crowding, disturbance)"],
      steps: ["Reduce stress where possible", "Monitor behaviour and strength"],
    },
    dysentery: {
      severity: "info",
      title: "Dysentery symptoms",
      why: ["Soiling + confinement conditions reported"],
      checks: ["Consider how long bees have been confined", "Check stores and ventilation"],
      steps: ["Improve ventilation where appropriate", "Monitor spring build-up and cleanliness"],
    },
    nosema: {
      severity: "info",
      title: "Nosema (contextual possibility)",
      why: ["Poor spring build-up and/or dysentery reported"],
      checks: ["Review nutrition/hygiene and stress history", "Consider testing if persistent"],
      steps: ["Support colony with good nutrition and hygiene", "Monitor strength over time"],
      note: "Not a diagnosis. Nosema needs laboratory confirmation.",
    },
    pesticide_poisoning: {
      severity: "warning",
      title: "Possible pesticide poisoning / acute exposure",
      why: ["Sudden onset and piles of dead bees reported"],
      checks: ["Do not feed exposed honey back to colonies", "Record timing and nearby activity if known"],
      steps: ["Reduce disturbance", "Consider seeking local guidance (association/inspector) if severe or ongoing"],
      note: "This is pattern-based and not definitive.",
    },
  },

  // Scoring + exclusions (unchanged)
  conditions: {
    chalkbrood: {
      threshold: 6,
      excludeIf: { any: ["ropey_larvae", "glue_like_smell", "sunken_and_perforated_cappings"] },
      scores: {
        chalk_like_larvae: 5,
        mummies_on_floor: 2,
        patchy_brood: 2,
        weak_colony: 2,
        spring: 1,
        smell_present: -2,
      },
    },

    sacbrood: {
      threshold: 6,
      excludeIf: { any: ["ropey_larvae", "glue_like_smell", "sunken_and_perforated_cappings"] },
      scores: {
        fluid_filled_larvae: 4,
        slipper_shaped_larvae: 3,
        unsealed_brood: 2,
        spring: 1,
        smell_present: -2,
      },
    },

    chilled_brood: {
      threshold: 6,
      excludeIf: { any: ["glue_like_smell", "ropey_larvae"] },
      scores: {
        prolonged_bad_weather: 2,
        early_spring: 2,
        brood_death_patterned: 3,
        brood_on_edge: 2,
        weak_colony: 2,
        smell_present: -3,
        summer: -2,
      },
    },

    queen_failure: {
      threshold: 7,
      excludeIf: { any: ["ropey_larvae", "glue_like_smell"] },
      scores: {
        very_patchy_brood: 3,
        erratic_laying: 3,
        drone_brood_in_worker_cells: 4,
        declining_population: 2,
      },
    },

    starvation: {
      threshold: 6,
      scores: {
        stores_none: 6,
        stores_low: 3,
        reduced_activity: 2,
        winter: 1,
        early_spring: 1,
        weak_colony: 1,
      },
    },

    overcrowding_stress: {
      threshold: 6,
      scores: {
        bearding: 3,
        poor_ventilation: 2,
        strong_colony: 2,
        spring: 1,
        summer: 1,
      },
    },

    varroa: {
      threshold: 6,
      scores: {
        mites_on_bees: 5,
        mites_on_drone_brood: 4,
        positive_varroa_test: 4,
        high_mite_drop: 2,
        weak_colony: 2,
        patchy_brood: 1,
      },
    },

    dwv: {
      threshold: 6,
      excludeIf: { any: ["shiny_bees", "trembling_bees"] },
      scores: {
        deformed_wings: 5,
        crawling_bees: 2,
        varroa_present: 3,
        no_varroa_signs: -3,
      },
    },

    parasitic_mite_syndrome: {
      threshold: 7,
      scores: {
        varroa_present: 4,
        patchy_brood: 2,
        declining_population: 2,
        weak_colony: 2,
        deformed_wings: 1,
      },
    },

    wax_moth: {
      threshold: 7,
      excludeIf: { all: ["strong_colony"] },
      scores: {
        webbing_or_tunnels: 5,
        damage_unused_frames: 3,
        cocoons_present: 2,
        warm_conditions: 2,
        weak_colony: 3,
        winter: -2,
      },
    },

    ants: {
      threshold: 4,
      scores: { ants_seen: 4, weak_colony: 1 },
    },

    wasps_robbing: {
      threshold: 6,
      scores: {
        fighting_at_entrance: 4,
        robbing_signs: 3,
        autumn: 2,
        reduced_activity: 1,
      },
    },

    mice: {
      threshold: 5,
      scores: { mouse_signs: 5, autumn: 1, winter: 1 },
    },

    asian_hornet: {
      threshold: 6,
      scores: { hornet_hawking: 5, hornet_seen_multiple_days: 2 },
    },

    small_hive_beetle: {
      threshold: 5,
      scores: { slimy_fermented_frames: 5 },
    },

    cbpv: {
      threshold: 7,
      excludeIf: { any: ["deformed_wings"] },
      scores: {
        shiny_bees: 4,
        trembling_bees: 3,
        crawling_bees: 2,
        many_affected: 2,
      },
    },

    dysentery: {
      threshold: 6,
      scores: { soiling: 4, prolonged_bad_weather: 2, winter: 1, early_spring: 1 },
    },

    nosema: {
      threshold: 6,
      contextualOnly: true,
      scores: { poor_spring_build_up: 3, soiling: 2, weak_colony: 2, early_spring: 1, spring: 1 },
    },

    pesticide_poisoning: {
      threshold: 7,
      scores: {
        onset_sudden: 3,
        piles_of_dead_bees: 4,
        tongues_out: 3,
        crawling_bees: 1,
      },
    },
  },

  // Dominant-cause suppression (keeps results clean and useful)
  dominance: [
    {
      dominant: "varroa",
      minOverThreshold: 4,
      suppress: ["dwv", "parasitic_mite_syndrome"],
      note:
        "Varroa is strongly indicated. Secondary Varroa-linked patterns are folded into the Varroa guidance.",
    },
    {
      dominant: "starvation",
      minOverThreshold: 2,
      suppress: ["chilled_brood", "nosema"],
      note:
        "Low stores is the priority to address first. Reassess after feeding/conditions improve.",
    },
  ],
};
