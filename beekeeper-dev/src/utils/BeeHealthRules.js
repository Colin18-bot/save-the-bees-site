// src/utils/BeeHealthRules.js
// v2.4: Route-based triage (UK beekeeping) — outcomes-first (120+ outcomes).
// Engine flags expected by BeeHealthHelper.jsx:
// - tri: <id>_yes / <id>_no / <id>_unknown
// - select: <id>_<value> (e.g. season_summer, onset_speed_fast, qb_population_change_dropped_a_lot)
// - multi: <id> === true (e.g. recent_feeding, recent_treatment)



const SITE_URL = "https://beezknees.co.uk";

const page = (label, slug) => ({
  label,
  url: `${SITE_URL}/${slug}`,
});


const OUTCOME_IMAGES = {
  disease_foulbrood_red_flag: [
    {
      fileName: "disease-foulbrood-red-flag.webp",
      alt: "Foulbrood infected brood with sunken perforated cappings",
      caption: "Sunken, perforated cappings and uneven brood pattern are classic foulbrood warning signs."
    }
  ],

  pests_asian_hornet_reporting: [
    {
      fileName: "pest-wasps.webp",
      alt: "Large wasp-like insect near a hive entrance",
      caption: "Suspected Asian hornet activity should be photographed if safe and reported through official routes."
    }
  ],

  pests_shb_suspicion: [
    {
      fileName: "stores-poor-quality-or-contaminated.webp",
      alt: "Slimy or poor-quality comb surface",
      caption: "Slimy or fermented comb is a serious warning sign and should be treated cautiously."
    }
  ],

  hornet_pressure_entrance: [
    {
      fileName: "pest-wasps.webp",
      alt: "Large wasp-like insects near a hive entrance",
      caption: "Hornets may hawk near hive entrances and cause stress or forager losses."
    }
  ],

  disease_varroa_dwv_pressure: [
    {
      fileName: "varroa-deformed-wing-virus.webp",
      alt: "Bee with deformed wings",
      caption: "Deformed wings can be associated with virus pressure often linked to varroa."
    }
  ],

  disease_chalkbrood_likely: [
    {
      fileName: "disease-chalkbrood.webp",
      alt: "Chalkbrood mummies in brood cells",
      caption: "Chalk-like white, grey, or black mummies may appear in cells, on the floor, or at the entrance."
    }
  ],

  disease_sacbrood_likely: [
    {
      fileName: "disease-sacbrood.webp",
      alt: "Sacbrood-like larval remains in cells",
      caption: "Sacbrood may appear as fluid-filled or slipper-shaped larval remains."
    }
  ],

  disease_chilled_brood_likely: [
    {
      fileName: "stress-chilled-brood.webp",
      alt: "Chilled brood pattern on comb",
      caption: "Chilled brood often affects brood at the edges or areas bees could not cover."
    }
  ],

  disease_poisoning_suspected: [
    {
      fileName: "dead-bees-poisoning-suspected.webp",
      alt: "Dead bees outside a hive entrance",
      caption: "Sudden piles of dead bees may need urgent investigation and documentation."
    }
  ],

  disease_nosema_dysentery_possible: [
    {
      fileName: "stress-damp-mould.webp",
      alt: "Damp or stressed hive conditions",
      caption: "Brown spotting or soiling can indicate gut stress, damp, feed issues, or confinement problems."
    }
  ],

  robbing_active_likely: [
    {
      fileName: "pest-robber-bees.webp",
      alt: "Robber bees fighting or forcing entry at a hive entrance",
      caption: "Look for fighting, frantic movement, bees forcing entry, or bees probing gaps."
    }
  ],

  robbing_risk_feeder_leak: [
    {
      fileName: "feeding-syrup-taken.webp",
      alt: "Bees around a feeder near a hive",
      caption: "Syrup leaks or spills can attract robber bees and wasps very quickly."
    }
  ],

  wasp_pressure_entrance: [
    {
      fileName: "pest-wasps.webp",
      alt: "Wasps near a hive entrance",
      caption: "Wasps may hover, probe the entrance, or target weak colonies."
    }
  ],

  queen_swarmed_recently: [
    {
      fileName: "queen-cells-swarm-prep.webp",
      alt: "Queen cells hanging from brood comb",
      caption: "Opened queen cells and a reduced adult population can fit a recent swarm."
    }
  ],

  queen_virgin_mating_window: [
    {
      fileName: "queen-cells-swarm-prep.webp",
      alt: "Queen cells on brood comb during a queen change",
      caption: "A brood break can occur while a virgin queen emerges, mates, and begins laying."
    }
  ],

  queen_supersedure_underway: [
    {
      fileName: "queen-cells-swarm-prep.webp",
      alt: "Queen cells on brood comb",
      caption: "Supersedure often involves queen replacement while the colony remains relatively stable."
    }
  ],

  queen_failing_or_poor_queen: [
    {
      fileName: "queen-failing-spotty-brood.webp",
      alt: "Patchy brood pattern on a brood frame",
      caption: "A patchy or erratic brood pattern can suggest queen quality, stress, or disease pressure."
    }
  ],

  queenless_likely: [
    {
      fileName: "queen-missing-no-eggs.webp",
      alt: "Brood frame with no obvious eggs or young brood",
      caption: "Absence of eggs, larvae, and sealed brood may suggest queenlessness."
    }
  ],

  queenless_possible_brood_break: [
    {
      fileName: "queen-missing-no-eggs.webp",
      alt: "Brood frame during a possible brood break",
      caption: "A brood break can look similar to queenlessness until the colony is rechecked."
    }
  ],

  laying_workers_suspected: [
    {
      fileName: "queen-laying-worker-brood.webp",
      alt: "Multiple eggs or uneven laying pattern in worker cells",
      caption: "Multiple eggs per cell or eggs on side walls can suggest laying workers."
    }
  ],

  drone_laying_queen_suspected: [
    {
      fileName: "queen-laying-worker-brood.webp",
      alt: "Drone brood pattern in worker cells",
      caption: "Bullet-shaped drone cappings in worker cells can suggest a drone-laying queen."
    }
  ],

  queen_brood_break_after_treatment_or_disturbance: [
    {
      fileName: "queen-missing-no-eggs.webp",
      alt: "Temporary brood break on a brood frame",
      caption: "Recent treatment, movement, harvest, or queen events can interrupt laying temporarily."
    }
  ],

  normal_orientation_flights: [
    {
      fileName: "normal-orientation-flights.webp",
      alt: "Bees flying around a hive entrance during orientation flights",
      caption: "Young bees may circle and face the hive while learning the hive location."
    }
  ],

  normal_cleansing_flights: [
    {
      fileName: "normal-orientation-flights.webp",
      alt: "Bees flying near a hive entrance after confinement",
      caption: "Cleansing flights are often seen after cold or wet weather confinement."
    }
  ],

  normal_summer_bearding: [
    {
      fileName: "normal-bearding.webp",
      alt: "Bees clustered outside a hive entrance",
      caption: "Bearding can happen in warm weather when bees gather outside to regulate hive temperature."
    }
  ],

  normal_fanning_ventilation: [
    {
      fileName: "stress-overheating.webp",
      alt: "Bees gathered at the entrance in warm conditions",
      caption: "Fanning can relate to ventilation, scenting, or hive organisation."
    }
  ],

  normal_drones_spring_summer: [
    {
      fileName: "normal-drones-present.webp",
      alt: "Drone brood and drones visible on comb",
      caption: "Drones are larger male bees and are commonly seen in spring and summer."
    }
  ],

  entrance_activity_not_flight_weather: [
    {
      fileName: "pest-robber-bees.webp",
      alt: "Unusual activity at a hive entrance",
      caption: "High entrance activity in poor flying weather may point to disturbance, feeding issues, or robbing pressure."
    }
  ],

  feeding_starvation_risk_imminent: [
    {
      fileName: "stores-starvation.webp",
      alt: "Low food stores on a brood frame",
      caption: "A very light hive or low stores should be treated urgently."
    }
  ],

  feeding_robbing_triggered_by_feeding: [
    {
      fileName: "feeding-syrup-taken.webp",
      alt: "Bees gathered around a feeder",
      caption: "Feeding leaks, exposed syrup, or open feeding can trigger robbing."
    }
  ],

  feeding_not_taking_syrup_because_flow: [
    {
      fileName: "normal-heavy-pollen.webp",
      alt: "Foraging bee with pollen during a nectar flow",
      caption: "Bees may ignore syrup when natural nectar is available."
    }
  ],

  feeding_not_taking_syrup_too_cold_switch_feed: [
    {
      fileName: "feeding-syrup-ignored.webp",
      alt: "Feeder with little bee activity",
      caption: "Fondant is often more suitable than syrup in cold conditions."
    }
  ],

  feeding_feeder_access_or_design_issue: [
    {
      fileName: "feeding-syrup-ignored.webp",
      alt: "Hive feeder with limited bee activity",
      caption: "Poor feeder alignment, missing ladders, or inaccessible feed can stop bees taking syrup."
    }
  ],

  feeding_syrup_ferment_or_off: [
    {
      fileName: "stores-poor-quality-or-contaminated.webp",
      alt: "Poor quality or contaminated stores",
      caption: "Old, cloudy, sour, or fermented syrup should be removed and replaced."
    }
  ],

  feeding_recent_treatment_or_brood_break_effect: [
    {
      fileName: "queen-missing-no-eggs.webp",
      alt: "Brood frame during temporary disruption",
      caption: "Recent treatments or brood breaks can temporarily change feeding behaviour."
    }
  ],

  feeding_weak_colony_processing_limit: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Small colony cluster on frames",
      caption: "Weak colonies may struggle to take, warm, defend, or process feed."
    }
  ],

  comb_no_flow_no_stimulus: [
    {
      fileName: "stores-low-food.webp",
      alt: "Frame with little available food or activity",
      caption: "Bees often draw comb best during a nectar flow or with careful stimulation feeding."
    }
  ],

  comb_colony_too_weak_to_draw: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Weak colony covering frames",
      caption: "Weak colonies may not have enough bees or warmth to draw foundation."
    }
  ],

  comb_temperature_limiting: [
    {
      fileName: "stress-chilled-brood.webp",
      alt: "Cold-stressed brood area",
      caption: "Chilly weather or cold nights can slow or stop wax drawing."
    }
  ],

  comb_too_much_space_added_too_early: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Hive frames with a developing colony",
      caption: "Excess space can make it harder for bees to heat, defend, and work the hive."
    }
  ],

  comb_foundation_condition_problem: [
    {
      fileName: "stores-poor-quality-or-contaminated.webp",
      alt: "Comb or stores in poor condition",
      caption: "Old, dry, damaged, or contaminated foundation may be ignored."
    }
  ],

  comb_plastic_not_waxed: [
    {
      fileName: "stores-low-food.webp",
      alt: "Frame surface with limited bee work",
      caption: "Plastic foundation is often accepted better when wax-coated."
    }
  ],

  comb_wrong_placement_cross_comb_risk: [
    {
      fileName: "stores-honey-bound.webp",
      alt: "Dense comb area on a frame",
      caption: "Cross comb can occur when spacing, guides, or available space are not right."
    }
  ],

  comb_super_ignored_not_ready_or_no_flow: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Hive box with bees on frames",
      caption: "Bees may ignore supers if the colony is not strong enough or there is no nectar flow."
    }
  ],

  comb_excluder_reluctance: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Bees working across hive frames",
      caption: "Bees may hesitate to cross a queen excluder unless conditions are right."
    }
  ],

  comb_inserting_foundation_mid_brood_risk: [
    {
      fileName: "stress-chilled-brood.webp",
      alt: "Brood comb affected by cold or poor coverage",
      caption: "Placing foundation in the brood nest can chill brood if the colony cannot cover it."
    }
  ],

  pests_wasps_pressure: [
    {
      fileName: "pest-wasps.webp",
      alt: "Wasps near a hive entrance",
      caption: "Wasp pressure can escalate quickly, especially around weak colonies."
    }
  ],

  pests_wasps_escalating_to_robbing: [
    {
      fileName: "pest-wasps.webp",
      alt: "Wasps and entrance pressure around a hive",
      caption: "Fighting, pressure at the entrance, and exposed stores can indicate escalation."
    }
  ],

  pests_hornet_hawking_generic: [
    {
      fileName: "pest-wasps.webp",
      alt: "Large wasp-like insect near hive entrance",
      caption: "Hornets may hover near entrances and intercept returning bees."
    }
  ],

  pests_wax_moth_secondary_weakness: [
    {
      fileName: "pest-wax-moth.webp",
      alt: "Wax moth larvae and webbing on comb",
      caption: "Wax moth webbing, tunnels, or cocoons often indicate weakness or unguarded comb."
    }
  ],

  pests_wax_moth_present_but_strong: [
    {
      fileName: "pest-wax-moth.webp",
      alt: "Limited wax moth signs on comb",
      caption: "A strong colony may cope with small or historical wax moth damage."
    }
  ],

  pests_mice_intrusion_likely: [
    {
      fileName: "pest-mice.webp",
      alt: "Mouse near a hive entrance",
      caption: "Gnawing, debris, shredded comb, or nesting material may suggest mouse intrusion."
    }
  ],

  pests_ants_nuisance: [
    {
      fileName: "pest-ants.webp",
      alt: "Ants around a hive stand",
      caption: "Ants are usually a nuisance but can be encouraged by spills or damp conditions."
    }
  ],

  postmortem_starvation_classic: [
    {
      fileName: "stores-starvation.webp",
      alt: "Starvation signs on comb",
      caption: "Dead bees head-first in cells is a classic starvation clue."
    }
  ],

  postmortem_isolation_starvation: [
    {
      fileName: "stores-low-food.webp",
      alt: "Food stores separated from bee cluster",
      caption: "A dead cluster with food still present can suggest isolation starvation or cold cluster loss."
    }
  ],

  postmortem_varroa_collapse: [
    {
      fileName: "varroa-high-load-brood.webp",
      alt: "Brood comb with signs of heavy varroa pressure",
      caption: "Collapse with food still present can be associated with varroa-related winter loss."
    }
  ],

  postmortem_wasp_or_robbing_collapse: [
    {
      fileName: "pest-robber-bees.webp",
      alt: "Robbing pressure at hive entrance",
      caption: "Torn cappings, debris, and stripped stores can suggest wasp attack or robbing."
    }
  ],

  postmortem_dysentery_nosema_possible: [
    {
      fileName: "stress-damp-mould.webp",
      alt: "Damp or soiled hive conditions",
      caption: "Heavy spotting can suggest gut stress, damp, confinement, or feed-related issues."
    }
  ],

  postmortem_absconding_or_near_empty: [
    {
      fileName: "queen-missing-no-eggs.webp",
      alt: "Near-empty hive frame with few bees",
      caption: "A near-empty hive needs careful checking before assuming a single cause."
    }
  ],

  dead_poisoning_strong_signal: [
    {
      fileName: "dead-bees-poisoning-suspected.webp",
      alt: "Dead bees outside a hive",
      caption: "Sudden large numbers of dead bees should be documented and investigated."
    }
  ],

  dead_poisoning_possible: [
    {
      fileName: "dead-bees-at-entrance.webp",
      alt: "Dead bees at a hive entrance",
      caption: "Dead bees can have several causes, so stores, weather, and varroa signs should also be checked."
    }
  ],

  dead_starvation_likely: [
    {
      fileName: "stores-starvation.webp",
      alt: "Low stores and starvation risk on comb",
      caption: "A light hive, crawling bees, or low stores may indicate urgent starvation risk."
    }
  ],

  dead_chilling_stress_likely: [
    {
      fileName: "stress-chilled-brood.webp",
      alt: "Cold-stressed brood or colony conditions",
      caption: "Cold stress is more likely in weak colonies, cold spells, or over-expanded hives."
    }
  ],

  dead_varroa_virus_signal_in_dead_route: [
    {
      fileName: "varroa-deformed-wing-virus.webp",
      alt: "Bee showing deformed wing symptoms",
      caption: "Deformed wings, crawling bees, and weakening can suggest varroa or virus pressure."
    }
  ],

  dead_crawling_multi_causes: [
    {
      fileName: "dead-bees-with-tongues-out.webp",
      alt: "Weak or dying bee on the ground",
      caption: "Crawling bees can relate to starvation, cold, varroa, virus pressure, or poisoning."
    }
  ],

  dead_small_numbers_normal_context: [
    {
      fileName: "dead-bees-at-entrance.webp",
      alt: "Small number of dead bees at the entrance",
      caption: "A small number of dead bees can be normal housekeeping."
    }
  ],

  dead_small_numbers_normal_context_unsure: [
    {
      fileName: "dead-bees-at-entrance.webp",
      alt: "Normal hive entrance debris and dead bees",
      caption: "Small numbers of dead bees should be judged in context and monitored for change."
    }
  ],

  dead_onset_sudden_triage: [
    {
      fileName: "dead-bees-poisoning-suspected.webp",
      alt: "Sudden bee losses near a hive",
      caption: "Sudden losses need urgent checks for stores, exposure, poisoning, and varroa or virus signs."
    }
  ],

  dead_onset_fast_triage: [
    {
      fileName: "dead-bees-at-entrance.webp",
      alt: "Fast-developing bee losses at a hive entrance",
      caption: "Fast losses should be checked against stores, weather, varroa signs, and possible exposure."
    }
  ],

  dead_onset_slow_triage: [
    {
      fileName: "dead-bees-at-entrance.webp",
      alt: "Gradual bee losses near a hive entrance",
      caption: "Slow losses may need repeated checks and comparison with colony strength."
    }
  ],

  dead_onset_ongoing_triage: [
    {
      fileName: "dead-bees-at-entrance.webp",
      alt: "Ongoing colony decline with dead bees present",
      caption: "Ongoing decline should be reviewed alongside stores, brood, queen status, and varroa pressure."
    }
  ],

  temperament_weather_defensive: [
    {
      fileName: "stress-overheating.webp",
      alt: "Bees gathered on a hive during stressful weather",
      caption: "Bees can become more defensive in cold, windy, hot, or unsettled weather."
    }
  ],

  temperament_robbery_related: [
    {
      fileName: "pest-robber-bees.webp",
      alt: "Defensive bees during robbing pressure",
      caption: "Robbing pressure can make a colony suddenly defensive."
    }
  ],

  temperament_recent_disturbance_related: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Opened hive after handling",
      caption: "Harvesting, moving, treating, or repeated inspections can temporarily affect temperament."
    }
  ],

  temperament_queen_event_related: [
    {
      fileName: "queen-cells-swarm-prep.webp",
      alt: "Queen cells and brood disruption",
      caption: "Queen loss, supersedure, or introduction can temporarily change colony behaviour."
    }
  ],

  temperament_genetics_or_failing_queen_possible: [
    {
      fileName: "queen-failing-spotty-brood.webp",
      alt: "Patchy brood pattern linked with queen concerns",
      caption: "Persistent defensiveness across good conditions may relate to queen quality, genetics, or stress."
    }
  ],

  temperament_sudden_change_flag: [
    {
      fileName: "pest-robber-bees.webp",
      alt: "Sudden defensive activity at a hive entrance",
      caption: "Sudden temperament change should prompt checks for robbing, queen issues, disturbance, and weather."
    }
  ],

  temperament_season_early_spring_note: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Early spring colony build-up",
      caption: "Early spring behaviour can be affected by cold, colony size, stores and disturbance."
    }
  ],

  temperament_season_spring_note: [
    {
      fileName: "normal-spring-build-up.webp",
      alt: "Spring colony build-up",
      caption: "Spring temperament can be affected by build-up, queen state, weather and forage conditions."
    }
  ],

  temperament_season_summer_note: [
    {
      fileName: "stress-overheating.webp",
      alt: "Summer bees around hive entrance",
      caption: "Summer temperament can be affected by heat, congestion, forage changes and disturbance."
    }
  ],

  temperament_season_autumn_note: [
    {
      fileName: "pest-wasps.webp",
      alt: "Late-season wasp pressure near hive",
      caption: "Autumn temperament can be affected by wasps, robbing pressure, feeding and forage dearth."
    }
  ],

  temperament_season_winter_note: [
    {
      fileName: "stores-low-food.webp",
      alt: "Winter stores and colony stress",
      caption: "Winter disturbance should be kept low and checked against stores, damp and colony strength."
    }
  ]
};
const LEARN_MORE_BY_OUTCOME = {
  // Entrance / normal behaviour
  normal_orientation_flights: [
    page("Read: Honey bee behaviour", "behaviour"),
  ],
  normal_cleansing_flights: [
    page("Read: Honey bee behaviour", "behaviour"),
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
  ],
  normal_summer_bearding: [
    page("Read: Honey bee behaviour", "behaviour"),
    page("Read: Summer beekeeping", "summer-beekeeping-uk"),
  ],
  normal_fanning_ventilation: [
    page("Read: Honey bee behaviour", "behaviour"),
  ],
  normal_drones_spring_summer: [
    page("Read: Honey bee behaviour", "behaviour"),
  ],
  entrance_activity_not_flight_weather: [
    page("Read: Honey bee behaviour", "behaviour"),
    page("Read: When to inspect bees", "when-to-inspect-bees-uk"),
  ],

  // Robbing / entrance conflict
  robbing_active_likely: [
    page("Read: Bee pests and robbing pressure", "bee-pests"),
    page("Read: Autumn beekeeping", "autumn-beekeeping-uk"),
  ],
  robbing_risk_feeder_leak: [
    page("Read: Feeding bees", "feeding-bees"),
    page("Read: Bee pests and robbing pressure", "bee-pests"),
  ],
  wasp_pressure_entrance: [
    page("Read: Bee pests", "bee-pests"),
  ],
  hornet_pressure_entrance: [
    page("Read: Bee pests", "bee-pests"),
  ],

  // Queen / brood state
  queen_swarmed_recently: [
    page("Read: Missed swarm guide", "missed-swarm"),
    page("Read: Swarm and queen guide", "swarm-queen"),
  ],
  queen_virgin_mating_window: [
    page("Read: Virgin queen timeline", "virgin-queen-timeline"),
    page("Read: Queen timeline", "queen-timeline"),
  ],
  queen_supersedure_underway: [
    page("Read: Supersedure queen cells", "supersedure-queen-cells"),
    page("Read: Supersedure action guide", "supersedure-action"),
  ],
  queen_failing_or_poor_queen: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
    page("Read: Brood pattern guide", "brood-pattern-guide"),
  ],
  queenless_likely: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
    page("Read: Can't find the queen", "cant-find-queen"),
  ],
  queenless_possible_brood_break: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
    page("Read: Virgin queen timeline", "virgin-queen-timeline"),
  ],
  laying_workers_suspected: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
  ],
  drone_laying_queen_suspected: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
    page("Read: Brood pattern guide", "brood-pattern-guide"),
  ],
  queen_brood_break_after_treatment_or_disturbance: [
    page("Read: Queen timeline", "queen-timeline"),
    page("Read: Varroa management", "varroa-management"),
  ],

  // Disease / parasites
  disease_varroa_dwv_pressure: [
    page("Read: Varroa symptoms", "varroa-symptoms-uk"),
    page("Read: Varroa monitoring methods", "varroa-monitoring-methods"),
  ],
  disease_foulbrood_red_flag: [
    page("Read: When to call a bee inspector", "when-to-call-bee-inspector-uk"),
    page("Read: Foulbrood vs chalkbrood", "foulbrood-vs-chalkbrood"),
  ],
  disease_chalkbrood_likely: [
    page("Read: Foulbrood vs chalkbrood", "foulbrood-vs-chalkbrood"),
    page("Read: Brood problems", "brood-problems-uk"),
  ],
  disease_sacbrood_likely: [
    page("Read: Viral diseases", "viral-diseases"),
    page("Read: Brood problems", "brood-problems-uk"),
  ],
  disease_chilled_brood_likely: [
    page("Read: Brood problems", "brood-problems-uk"),
    page("Read: First spring inspection", "first-spring-inspection"),
  ],
  disease_poisoning_suspected: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  disease_nosema_dysentery_possible: [
    page("Read: Other bee conditions", "other-conditions"),
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
  ],

  // Feeding / stores
  feeding_starvation_risk_imminent: [
    page("Read: Feeding bees", "feeding-bees"),
    page("Read: When to feed fondant", "when-to-feed-fondant-to-bees"),
  ],
  feeding_robbing_triggered_by_feeding: [
    page("Read: Feeding bees", "feeding-bees"),
    page("Read: Bee pests and robbing pressure", "bee-pests"),
  ],
  feeding_not_taking_syrup_because_flow: [
    page("Read: Feeding bees", "feeding-bees"),
  ],
  feeding_not_taking_syrup_too_cold_switch_feed: [
    page("Read: When to feed fondant", "when-to-feed-fondant-to-bees"),
  ],
  feeding_feeder_access_or_design_issue: [
    page("Read: Feeding bees", "feeding-bees"),
  ],
  feeding_syrup_ferment_or_off: [
    page("Read: Feeding bees", "feeding-bees"),
  ],
  feeding_recent_treatment_or_brood_break_effect: [
    page("Read: Varroa management", "varroa-management"),
    page("Read: Feeding bees", "feeding-bees"),
  ],
  feeding_weak_colony_processing_limit: [
    page("Read: Feeding bees in spring", "feeding-bees-in-spring-uk"),
    page("Read: Feeding bees", "feeding-bees"),
  ],

  // Comb / foundation / space
  comb_no_flow_no_stimulus: [
    page("Read: Spring build-up", "spring-build-up-bees"),
    page("Read: Feeding bees in spring", "feeding-bees-in-spring-uk"),
  ],
  comb_colony_too_weak_to_draw: [
    page("Read: Spring build-up", "spring-build-up-bees"),
  ],
  comb_temperature_limiting: [
    page("Read: Spring beekeeping", "spring-beekeeping-uk"),
  ],
  comb_too_much_space_added_too_early: [
    page("Read: Adding supers", "adding-supers-uk"),
    page("Read: Spring build-up", "spring-build-up-bees"),
  ],
  comb_foundation_condition_problem: [
    page("Read: Beekeeping equipment", "equipment"),
  ],
  comb_plastic_not_waxed: [
    page("Read: Beekeeping equipment", "equipment"),
  ],
  comb_wrong_placement_cross_comb_risk: [
    page("Read: Hive management", "hive-management"),
  ],
  comb_super_ignored_not_ready_or_no_flow: [
    page("Read: Adding supers", "adding-supers-uk"),
  ],
  comb_excluder_reluctance: [
    page("Read: Adding supers", "adding-supers-uk"),
  ],
  comb_inserting_foundation_mid_brood_risk: [
    page("Read: Brood pattern guide", "brood-pattern-guide"),
    page("Read: Hive management", "hive-management"),
  ],

  // Pests / predators
  pests_wasps_pressure: [
    page("Read: Bee pests", "bee-pests"),
  ],
  pests_wasps_escalating_to_robbing: [
    page("Read: Bee pests", "bee-pests"),
    page("Read: Autumn beekeeping", "autumn-beekeeping-uk"),
  ],
  pests_hornet_hawking_generic: [
    page("Read: Bee pests", "bee-pests"),
  ],
  pests_asian_hornet_reporting: [
    page("Read: Bee pests", "bee-pests"),
  ],
  pests_wax_moth_secondary_weakness: [
    page("Read: Bee pests", "bee-pests"),
  ],
  pests_wax_moth_present_but_strong: [
    page("Read: Bee pests", "bee-pests"),
  ],
  pests_mice_intrusion_likely: [
    page("Read: Bee pests", "bee-pests"),
    page("Read: Winter beekeeping", "winter-beekeeping-uk"),
  ],
  pests_ants_nuisance: [
    page("Read: Bee pests", "bee-pests"),
  ],
  pests_shb_suspicion: [
    page("Read: When to call a bee inspector", "when-to-call-bee-inspector-uk"),
    page("Read: Bee pests", "bee-pests"),
  ],

  // Post-mortem
  postmortem_starvation_classic: [
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
    page("Read: Feeding bees for winter", "feeding-bees-for-winter-uk"),
  ],
  postmortem_isolation_starvation: [
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
    page("Read: When to feed fondant", "when-to-feed-fondant-to-bees"),
  ],
  postmortem_varroa_collapse: [
    page("Read: Late summer varroa", "late-summer-varroa"),
    page("Read: Varroa management", "varroa-management"),
  ],
  postmortem_wasp_or_robbing_collapse: [
    page("Read: Bee pests", "bee-pests"),
    page("Read: Autumn beekeeping", "autumn-beekeeping-uk"),
  ],
  postmortem_dysentery_nosema_possible: [
    page("Read: Other bee conditions", "other-conditions"),
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
  ],
  postmortem_absconding_or_near_empty: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
    page("Read: Varroa symptoms", "varroa-symptoms-uk"),
  ],

  // Dead / dying bees
  dead_poisoning_strong_signal: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_poisoning_possible: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_starvation_likely: [
    page("Read: Feeding bees", "feeding-bees"),
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
  ],
  dead_chilling_stress_likely: [
    page("Read: Winter bee checks", "winter-bee-checks-uk"),
    page("Read: First spring inspection", "first-spring-inspection"),
  ],
  dead_varroa_virus_signal_in_dead_route: [
    page("Read: Varroa symptoms", "varroa-symptoms-uk"),
    page("Read: Viral diseases", "viral-diseases"),
  ],
  dead_crawling_multi_causes: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
    page("Read: Varroa symptoms", "varroa-symptoms-uk"),
  ],
  dead_small_numbers_normal_context: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_small_numbers_normal_context_unsure: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_onset_sudden_triage: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_onset_fast_triage: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_onset_slow_triage: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],
  dead_onset_ongoing_triage: [
    page("Read: Dead bees outside the hive", "dead-bees-outside-hive"),
  ],

  // Temperament
  temperament_weather_defensive: [
    page("Read: When to inspect bees", "when-to-inspect-bees-uk"),
  ],
  temperament_robbery_related: [
    page("Read: Bee pests", "bee-pests"),
  ],
  temperament_recent_disturbance_related: [
    page("Read: Hive management", "hive-management"),
  ],
  temperament_queen_event_related: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
  ],
  temperament_genetics_or_failing_queen_possible: [
    page("Read: Queenless or supersedure", "queenless-or-supersedure"),
  ],
  temperament_sudden_change_flag: [
    page("Read: Hive management", "hive-management"),
    page("Read: Bee pests", "bee-pests"),
  ],
  temperament_season_early_spring_note: [
    page("Read: Spring beekeeping", "spring-beekeeping-uk"),
  ],
  temperament_season_spring_note: [
    page("Read: Spring beekeeping", "spring-beekeeping-uk"),
  ],
  temperament_season_summer_note: [
    page("Read: Summer beekeeping", "summer-beekeeping-uk"),
  ],
  temperament_season_autumn_note: [
    page("Read: Autumn beekeeping", "autumn-beekeeping-uk"),
  ],
  temperament_season_winter_note: [
    page("Read: Winter beekeeping", "winter-beekeeping-uk"),
  ],
};

export const BEE_HEALTH_RULES = {
  version: "2.5.1-uk-post-mortem-varroa-update-fixed",

  // ---------------------------
  // SAFETY / PRINT DISCLAIMERS
  // ---------------------------
  safety: {
    topBanner: [
      "This is not a diagnosis — it’s a triage helper to guide what to check next.",
      "Use “Not sure” any time you haven’t opened the hive or can’t observe something reliably.",
      "If you suspect a notifiable disease/pest: do not move colonies/equipment and follow official UK guidance.",
      "If the colony is being robbed, starving, or collapsing rapidly — act immediately and seek local support if needed.",
    ],
    printFooter: [
      "BeezKnees Colony Health Check (triage). Not a diagnosis.",
      "For suspected notifiable disease/pest: isolate, don’t move kit, and contact official channels.",
      "Always follow product labels and local regulations for treatments.",
    ],
  },

  // ---------------------------
  // CONFIDENCE LABELS (must match BeeHealthHelper.jsx expectations)
  // confidenceLabelFromScore() uses: veryLikely.minOver, likely.minOver
  // ---------------------------
  confidence: {
    veryLikely: { label: "Very likely", minOver: 3 },
    likely: { label: "Likely", minOver: 1 },
    possible: { label: "Possible", minOver: 0 },
  },

  // ---------------------------
  // ROUTES (top-level triage)
  // ---------------------------
  routes: [
    {
      id: "route_entrance_activity",
      label: "Lots of flying / unusual entrance activity",
      description: "Orientation flights, robbing, wasps/hornets, bearding, cleansing flights, drones, etc.",
    },
    {
      id: "route_queen_brood",
      label: "Eggs / brood / queen concerns",
      description: "No eggs, odd brood pattern, queen cells, drone brood, laying workers, swarming, supersedure, etc.",
    },
    {
      id: "route_dead_dying",
      label: "Dead/dying bees / crawling / can’t fly",
      description: "Poisoning suspicion, starvation, chilling, disease, varroa/virus signs, etc.",
    },
    {
      id: "route_post_mortem",
      label: "Colony has died / empty hive / post-mortem",
      description: "Winter losses, starvation, isolation starvation, wasp attack, robbing, varroa-related collapse, absconding, etc.",
    },
    {
      id: "route_feeding_stores",
      label: "Feeding / stores / syrup not taken",
      description: "Nectar flow vs cold weather, feeder issues, weak colony, robbing risk, starvation risk.",
    },
    {
      id: "route_comb_building",
      label: "Comb / drawing foundation / building issues",
      description: "Strength/flow, stimulation feeding, timing, space, foundation acceptance, temperature.",
    },
    {
      id: "route_pests_predators",
      label: "Pests / predators suspected",
      description: "Wasps, hornets, ants, mice, wax moth, woodpecker, SHB (notifiable), etc.",
    },
    {
      id: "route_brood_disease",
      label: "Brood looks diseased / brood symptoms",
      description: "Chalkbrood, sacbrood, chilled brood, EFB/AFB red flags, etc.",
    },
    {
      id: "route_temperament",
      label: "Temperament / aggression changed",
      description: "Robbing pressure, queen issues, forage dearth, disturbance, genetics, etc.",
    },
    {
      id: "route_unsure",
      label: "Not sure / just want help checking",
      description: "Balanced triage across the main areas.",
    },
  ],

  // ---------------------------
  // QUESTIONS BANK
  // ---------------------------
  questions: {
    // Foundation — always first
    foundation: [
      {
        id: "primary_route",
        label: "What are you mainly seeing today?",
        kind: "select",
        options: [
          { value: "route_entrance_activity", label: "Lots of flying / unusual entrance activity" },
          { value: "route_queen_brood", label: "Eggs / brood / queen concerns" },
          { value: "route_dead_dying", label: "Dead/dying bees / crawling / can’t fly" },
          { value: "route_post_mortem", label: "Colony has died / empty hive / post-mortem" },
          { value: "route_feeding_stores", label: "Feeding / stores / syrup not taken" },
          { value: "route_comb_building", label: "Comb / drawing foundation / building issues" },
          { value: "route_pests_predators", label: "Pests / predators suspected" },
          { value: "route_brood_disease", label: "Brood looks diseased" },
          { value: "route_temperament", label: "Temperament / aggression changed" },
          { value: "route_unsure", label: "Not sure (help me narrow it down)" },
        ],
        help: "This doesn’t diagnose — it chooses the best question path to start with.",
      },
      {
        id: "inspection_level",
        label: "How much have you observed?",
        kind: "select",
        options: [
          { value: "entrance_only", label: "Entrance only (haven’t opened the hive)" },
          { value: "opened_quick", label: "Opened briefly (quick look)" },
          { value: "full_inspection", label: "Full inspection (frames checked)" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "If you haven’t opened the hive, we avoid brood-frame questions.",
      },
      {
        id: "season",
        label: "What time of year is it?",
        kind: "select",
        options: [
          { value: "early_spring", label: "Early spring (Feb–Mar)" },
          { value: "spring", label: "Spring (Apr–May)" },
          { value: "summer", label: "Summer (Jun–Aug)" },
          { value: "autumn", label: "Autumn (Sep–Oct)" },
          { value: "winter", label: "Winter (Nov–Jan)" },
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "onset_speed",
        label: "How quickly did this start?",
        kind: "select",
        options: [
          { value: "sudden", label: "Sudden (hours–1 day)" },
          { value: "fast", label: "Fast (2–7 days)" },
          { value: "slow", label: "Slow (1–4 weeks)" },
          { value: "ongoing", label: "Ongoing (1+ months)" },
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "colony_strength",
        label: "How strong is the colony — or if it has now collapsed, how strong was it recently?",
        kind: "select",
        options: [
          { value: "very_weak", label: "Very weak (tiny cluster / few seams)" },
          { value: "weak", label: "Weak" },
          { value: "medium", label: "Medium" },
          { value: "strong", label: "Strong" },
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "recent_changes",
        label: "What changed recently? (tick any that apply)",
        kind: "multi",
        options: [
          { id: "recent_move", label: "Hive moved" },
          { id: "recent_feeding", label: "Fed syrup/fondant recently" },
          { id: "recent_treatment", label: "Varroa treatment recently" },
          { id: "recent_queen_event", label: "Queen introduced / queen event" },
          { id: "recent_harvest", label: "Honey harvest / disturbance" },
          { id: "none_recent", label: "Nothing obvious changed" },
        ],
        help: "Optional but powerful: explains odd behaviour (brood break, feeding response, disturbance).",
      },
    ],

    // ROUTE: Entrance activity (entrance-only friendly)
    entrance_activity: [
      {
        id: "ea_warm_sunny",
        label: "Is it warm and sunny (flight-friendly)?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
      },
      {
        id: "ea_bees_circling_facing_hive",
        label: "Are many bees circling and facing the hive (learning flights)?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
        help: "Typical of orientation flights, especially on warm afternoons.",
      },
      {
        id: "ea_fighting_rolling",
        label: "Do you see fighting/rolling bees at the entrance?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
      },
      {
        id: "ea_bees_shiny_black_thieving",
        label: "Do bees move quickly and erratically at the entrance (darting, zig-zagging)?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
        help: "You may also notice some bees look darker or smoother than normal, with less fuzz. This can be a supporting clue for robbing, but the movement is the main thing to look for.",
      },
      {
        id: "ea_bearding",
        label: "Are lots of bees hanging outside in a beard?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
      },
      {
        id: "ea_fanning",
        label: "Are bees fanning at the entrance (wings vibrating)?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
      },
      {
        id: "ea_cleansing_flights",
        label: "Do you see many bees doing quick 'toilet flights' and returning?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
        help: "Common after confinement (winter/poor weather).",
      },
      {
        id: "ea_drones_visible",
        label: "Do you see lots of larger drones coming and going?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
      },
    ],

    // ROUTE: Queen & brood (only if opened frames ok)
    queen_brood: [
      {
        id: "qb_opened_hive",
        label: "Have you opened the hive and looked at frames?",
        kind: "tri",
        showIf: { any: ["route_queen_brood", "route_unsure"] },
      },
      {
        id: "qb_eggs_seen",
        label: "Did you see eggs today?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_young_larvae_seen",
        label: "Did you see young larvae (tiny C-shapes in royal jelly)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_sealed_worker_brood_seen",
        label: "Is there sealed worker brood present?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_queen_seen",
        label: "Did you see the queen today?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_queen_cells_seen",
        label: "Are there queen cells present?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_queen_cells_opened",
        label: "Are any queen cells opened (chewed open at bottom/side)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok", "qb_queen_cells_seen_yes"] },
      },
      {
        id: "qb_multiple_queen_cells",
        label: "Are there lots of queen cells (more than 4–5)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok", "qb_queen_cells_seen_yes"] },
      },
      {
        id: "qb_population_change",
        label: "Has the adult bee population changed recently?",
        kind: "select",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
        options: [
          { value: "dropped_a_lot", label: "Dropped a lot (noticeably fewer bees)" },
          { value: "slightly_down", label: "Slightly down" },
          { value: "about_same", label: "About the same" },
          { value: "increasing", label: "Increasing" },
          { value: "unknown", label: "Not sure" },
        ],
      },
      {
        id: "qb_multiple_eggs_per_cell",
        label: "Are there multiple eggs per cell (or eggs stuck to side walls)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_drone_brood_in_worker_cells",
        label: "Do you see drone brood in worker-sized cells (bullet caps in worker area)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_brood_pattern_poor",
        label: "Is the brood pattern patchy/erratic (lots of missed cells)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "symptom_deformed_wings",
        label: "Do you see bees with deformed/shrunken wings?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
      {
        id: "qb_visible_varroa",
        label: "Can you see small red/brown mites (varroa) on adult bees?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
        help: "They look like tiny reddish-brown dots on the bee’s body, often on the thorax or abdomen.",
      },
      {
        id: "qb_varroa_monitoring",
        label: "Have you checked mite levels, such as board drop, sugar roll, or alcohol wash?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
        help: "Even if you can’t see mites on bees, levels can still be high.",
      },
      {
        id: "symptom_ropey_larvae",
        label: "Do any larvae look brown/ropey (stringy) or smell foul?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
      },
    ],

    // ROUTE: Dead/dying
    dead_dying: [
      {
        id: "dd_piles_dead_bees",
        label: "Are there piles of dead bees (inside the hive or outside at the entrance)?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
      },
      {
        id: "dd_crawling_cant_fly",
        label: "Are many bees crawling / unable to fly?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
      },
      {
        id: "dd_tongues_out",
        label: "Do dead bees have tongues out?",
        kind: "tri",
        showIf: { all: ["dd_piles_dead_bees_yes"], any: ["route_dead_dying", "route_unsure"] },
      },
      {
        id: "dd_deformed_wings",
        label: "Do you see deformed wings?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
      },
      {
        id: "dd_visible_varroa",
        label: "Can you see small red/brown mites on adult bees?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
        help: "Visible mites on adult bees are a strong clue for significant Varroa pressure.",
      },
      {
        id: "dd_stores_very_light",
        label: "Is the hive very light (stores very low) when hefted?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
      },
      {
        id: "dd_cold_spell",
        label: "Has there been a cold spell / prolonged bad weather recently?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
      },
    ],

    post_mortem: [
      { id: "pm_dead_bees_present", label: "Are there dead bees still in the hive / on the floor / at the entrance?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
      { id: "pm_headfirst_cells", label: "Are many dead bees head-first in cells?", kind: "tri", showIf: { all: ["route_post_mortem", "pm_dead_bees_present_yes"] }, help: "This is a classic starvation clue." },
      { id: "pm_dead_cluster", label: "Is there still a dead cluster of bees together?", kind: "tri", showIf: { all: ["route_post_mortem", "pm_dead_bees_present_yes"] } },
      { id: "pm_stores_present", label: "Are there still food stores left in the hive?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
      { id: "pm_plenty_stores", label: "Are there still plenty of stores left?", kind: "tri", showIf: { all: ["route_post_mortem", "pm_stores_present_yes"] } },
      { id: "pm_dysentery_signs", label: "Is there obvious bee poo / brown spotting on frames, comb, or around the entrance?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
      { id: "pm_brood_present", label: "Was there brood still present when the colony died?", kind: "tri", showIf: { all: ["route_post_mortem"], not: ["inspection_level_entrance_only"] } },
      { id: "pm_brood_problem", label: "Did the brood look patchy / sunken / odd / unhealthy?", kind: "tri", showIf: { all: ["route_post_mortem", "pm_brood_present_yes"], not: ["inspection_level_entrance_only"] } },
      { id: "pm_visible_varroa", label: "Could you see small red/brown mites on bees before collapse — or can you still see them now?", kind: "tri", showIf: { all: ["route_post_mortem"] }, help: "Visible mites are a strong sign that Varroa may have played a major role." },
      { id: "pm_population_dropped", label: "Did the bee numbers drop sharply before the colony died?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
      { id: "pm_hive_empty_now", label: "Is the hive now mostly empty of bees?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
      { id: "pm_wasp_attack_signs", label: "Are there signs of wasp attack or robbing, such as chewed cappings, debris, torn comb, or fighting previously seen?", kind: "tri", showIf: { all: ["route_post_mortem"] }, help: "A weak colony can be overwhelmed by wasps or robber bees, especially in late summer/autumn." },
      { id: "pm_wasps_seen", label: "Were wasps seen bothering the hive before collapse?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
    ],

    // ROUTE: Feeding / stores (deepened)
    feeding_stores: [
      {
        id: "fs_why_feeding",
        label: "Why are you feeding right now?",
        kind: "select",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        options: [
          { value: "support_new_nuc", label: "Supporting a nuc / new colony" },
          { value: "low_stores", label: "Stores are low / colony feels light" },
          { value: "stimulate_build", label: "Stimulating comb build-up" },
          { value: "autumn_store_up", label: "Autumn: building winter stores" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "This changes what 'normal' looks like (flow vs cold vs weak colony vs autumn).",
      },
      {
        id: "fs_nectar_flow",
        label: "Is there a strong nectar flow (bees bringing in lots of nectar/pollen)?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "During a flow, bees often ignore syrup because they're busy bringing in real nectar.",
      },
      {
        id: "fs_weather_flight_ok",
        label: "Is it warm enough for flying and normal activity today?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "If it's cold or stormy, bees may not break cluster or take syrup well.",
      },
      {
        id: "fs_too_cold",
        label: "Is it too cold for bees to take syrup / for them to break cluster?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "If yes, fondant is usually safer than syrup (depending on season).",
      },
      {
        id: "fs_feed_type",
        label: "What are you offering?",
        kind: "select",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        options: [
          { value: "syrup_light", label: "Light syrup (1:1) / stimulant" },
          { value: "syrup_heavy", label: "Heavy syrup (2:1) / autumn stores" },
          { value: "fondant", label: "Fondant / candy" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "Different feeds work better in different temperatures and seasons.",
      },
      {
        id: "fs_feeder_type",
        label: "What feeder are you using?",
        kind: "select",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        options: [
          { value: "contact", label: "Contact feeder" },
          { value: "frame", label: "Frame feeder" },
          { value: "rapid", label: "Rapid/roof feeder" },
          { value: "baggie", label: "Baggie/ziplock feeder" },
          { value: "open", label: "Open feeding (not recommended)" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "Some feeders are easier for weak colonies; leaks can trigger robbing fast.",
      },
      {
        id: "fs_feeder_access",
        label: "Can bees clearly access the feed (floats/ladders/holes lined up)?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "Misalignment or lack of access is a common reason for 'not taking feed'.",
      },
      {
        id: "fs_feeder_leaks",
        label: "Any syrup leaks/spills around the hive/stand?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "Leaks can start robbing within minutes in late summer/autumn.",
      },
      {
        id: "fs_robbery_signs",
        label: "Robbing signs (frenzied entrance, fighting, bees darting)?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "If yes, feeding approach must change immediately.",
      },
      {
        id: "fs_colony_weak",
        label: "Is the colony weak (few seams / small cluster)?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "Weak colonies may not defend or process syrup well.",
      },
      {
        id: "fs_stores_low",
        label: "Are stores low / hive light?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "If yes, treat as urgent regardless of why feeding was started.",
      },
      {
        id: "fs_feed_consumption_none",
        label: "Has feed intake been basically zero for 48+ hours?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "This helps separate 'slow' from 'not accessible / too cold / flow'.",
      },
      {
        id: "fs_smell_ferment",
        label: "Does the syrup smell sour/fermented or look cloudy?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "Old/fermented syrup can be ignored and can upset bees.",
      },
      {
        id: "fs_recent_treatment_effect",
        label: "Was there a Varroa treatment very recently (last 7–10 days)?",
        kind: "tri",
        showIf: { any: ["route_feeding_stores", "route_unsure"] },
        help: "Some treatments and brood breaks can temporarily alter behaviour and intake.",
      },
    ],

    // ROUTE: Comb / drawing foundation (deepened)
    comb_building: [
      {
        id: "cb_what_not_drawing",
        label: "What exactly isn’t happening?",
        kind: "select",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        options: [
          { value: "not_touching_foundation", label: "They’re not touching new foundation" },
          { value: "drawing_patchy", label: "They draw a bit but it’s patchy/slow" },
          { value: "building_wrong_place", label: "They’re building comb in odd places (cross comb)" },
          { value: "ignoring_super", label: "They won’t go up into the super" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "Different causes: strength, temperature, flow, space management, and timing.",
      },
      {
        id: "cb_is_flow",
        label: "Is there a nectar flow (or are you stimulating with feed)?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Bees draw best during a flow or with appropriate stimulation feeding.",
      },
      {
        id: "cb_feed_present",
        label: "Are you currently feeding syrup (stimulation) to encourage drawing?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Small feeds can help — but can increase robbing risk in dearth.",
      },
      {
        id: "cb_colony_strong",
        label: "Is the colony strong enough to cover most frames (lots of bees)?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Weak colonies struggle to heat wax and commit workforce to building.",
      },
      {
        id: "cb_temperature_ok",
        label: "Is it warm enough for wax work (not chilly / cold nights)?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Cold nights can stop wax work even if days are sunny.",
      },
      {
        id: "cb_added_space_recently",
        label: "Have you added lots of space recently (extra box/supers/frames)?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Too much space can slow drawing (harder to heat/defend).",
      },
      {
        id: "cb_foundation_new_clean",
        label: "Is the foundation new/clean (not old/dry/contaminated)?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Old or contaminated foundation can be ignored.",
      },
      {
        id: "cb_foundation_type",
        label: "What foundation is it?",
        kind: "select",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        options: [
          { value: "wax", label: "Wax foundation" },
          { value: "plastic", label: "Plastic foundation" },
          { value: "starter_strip", label: "Starter strip / foundationless" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "Plastic often draws better if waxed; foundationless needs correct spacing.",
      },
      {
        id: "cb_plastic_waxed",
        label: "If plastic foundation: is it wax-coated?",
        kind: "tri",
        showIf: { all: ["route_comb_building", "cb_foundation_type_plastic"] },
        help: "Unwaxed plastic is commonly ignored.",
      },
      {
        id: "cb_box_position",
        label: "Where is the new foundation located?",
        kind: "select",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        options: [
          { value: "brood_nest_edge", label: "At the edge of the brood nest" },
          { value: "middle_brood", label: "Inserted in the middle of brood area" },
          { value: "super_above", label: "In a super above brood box" },
          { value: "unknown", label: "Not sure" },
        ],
        help: "Putting foundation in the wrong spot can chill brood or be ignored.",
      },
      {
        id: "cb_congestion",
        label: "Is the brood box congested (little space, lots of bees)?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Congestion + flow often drives comb building and swarming behaviours.",
      },
      {
        id: "cb_queen_excluder_in_way",
        label: "Is there a queen excluder on and they won’t go into the super?",
        kind: "tri",
        showIf: { any: ["route_comb_building", "route_unsure"] },
        help: "Sometimes bees hesitate to cross an excluder unless conditions are right.",
      },
    ],

    // ROUTE: Pests/predators
    pests_predators: [
      {
        id: "pp_wasps_pressure",
        label: "Wasps bothering the entrance (hovering/attempting entry)?",
        kind: "tri",
        showIf: { any: ["route_pests_predators", "route_unsure"] },
      },
      {
        id: "pp_hornet_hawking",
        label: "Large hornets 'hawking' at the entrance?",
        kind: "tri",
        showIf: { any: ["route_pests_predators", "route_unsure"] },
      },
      {
        id: "pp_hornet_persistent",
        label: "Seen on multiple days / persistent?",
        kind: "tri",
        showIf: { any: ["pp_hornet_hawking_yes"] },
      },
      {
        id: "pp_wax_moth_webbing",
        label: "Webbing/tunnels/cocoons on comb?",
        kind: "tri",
        showIf: { any: ["route_pests_predators", "route_unsure"] },
      },
      {
        id: "pp_mouse_signs",
        label: "Mouse signs (gnawing, debris, noises, shredded comb)?",
        kind: "tri",
        showIf: { any: ["route_pests_predators", "route_unsure"] },
      },
      {
        id: "pp_ants_seen",
        label: "Ants in/around the hive?",
        kind: "tri",
        showIf: { any: ["route_pests_predators", "route_unsure"] },
      },
      {
        id: "pp_slimy_fermented_frames",
        label: "Slimy/fermented frames / slime trails (rare but high significance)?",
        kind: "tri",
        showIf: { any: ["route_pests_predators", "route_unsure"] },
      },
    ],

   // ROUTE: Brood disease (hide if entrance-only)
brood_disease: [
  {
    id: "bd_chalk_mummies",
    label: "Chalk-like mummies (white/grey/black) in cells or on floor?",
    kind: "tri",
    showIf: {
      any: ["route_brood_disease", "route_unsure"],
      not: ["inspection_level_entrance_only"],
    },
  },
  {
    id: "bd_sacbrood",
    label: "Fluid-filled larvae / slipper-shaped remains?",
    kind: "tri",
    showIf: {
      any: ["route_brood_disease", "route_unsure"],
      not: ["inspection_level_entrance_only"],
    },
  },
  {
    id: "bd_chilled_pattern",
    label: "Brood death pattern after cold nights / brood on edges?",
    kind: "tri",
    showIf: {
      any: ["route_brood_disease", "route_unsure"],
      not: ["inspection_level_entrance_only"],
    },
  },
  {
    id: "bd_smell_foul",
    label: "Unpleasant smell from brood area?",
    kind: "tri",
    showIf: {
      any: ["route_brood_disease", "route_unsure"],
      not: ["inspection_level_entrance_only"],
    },
  },
  {
    id: "bd_ropey_larvae",
    label: "Brown/ropey larvae (stringy) or sunken/perforated cappings together?",
    kind: "tri",
    showIf: {
      any: ["route_brood_disease", "route_unsure"],
      not: ["inspection_level_entrance_only"],
    },
  },
],
    // ROUTE: Temperament
    temperament: [
      {
        id: "tm_changed_suddenly",
        label: "Did aggression change suddenly (rather than gradually)?",
        kind: "tri",
        showIf: { any: ["route_temperament", "route_unsure"] },
      },
      {
        id: "tm_robbery_pressure",
        label: "Is robbing pressure present (frenzied entrance, fighting)?",
        kind: "tri",
        showIf: { any: ["route_temperament", "route_unsure"] },
      },
      {
        id: "tm_queen_event",
        label: "Was there a recent queen event (supersedure, queen introduced, queen lost)?",
        kind: "tri",
        showIf: { any: ["route_temperament", "route_unsure"] },
      },
      {
        id: "tm_weather_windy",
        label: "Is the weather poor/windy/cold (bees defensive)?",
        kind: "tri",
        showIf: { any: ["route_temperament", "route_unsure"] },
      },
    ],
  },

  // ---------------------------
  // URGENT REPORTING (UK banners)
  // ---------------------------
  urgentReporting: [
    {
      mode: "asian_hornet",
      label: "Possible Asian hornet activity — urgent reporting advised",
      any: ["pp_hornet_hawking_yes", "pp_hornet_persistent_yes"],
    },
    {
      mode: "shb",
      label: "Small hive beetle suspicion — urgent reporting advised",
      any: ["pp_slimy_fermented_frames_yes"],
    },
    {
      mode: "foulbrood",
      label: "Possible foulbrood red flag — do not move equipment",
      any: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"],
    },
  ],

  // Absolute red flags for override (hard stop)
  redFlags: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"],

  // ---------------------------
  // OUTCOME LIBRARY (120+)
  // ---------------------------
  outcomes: buildOutcomeLibrary(),
};

// ---------------------------------------------------------
// Outcome Library Builder
// ---------------------------------------------------------
function buildOutcomeLibrary() {
  const O = {};

  const add = (key, def) => {
    O[key] = {
      ...def,
      learnMore: Array.isArray(def.learnMore)
        ? def.learnMore
        : LEARN_MORE_BY_OUTCOME[key] || [],
      images: Array.isArray(def.images)
        ? def.images
        : OUTCOME_IMAGES[key] || [],
    };
  };

  const basicActions = {
    monitor: ["Monitor over 24–72 hours. Update answers if symptoms change."],
    reduceDisturbance: ["Avoid repeated heavy disturbance until the situation stabilises."],
    seekHelp: ["If unsure, seek help from a local mentor/association before taking irreversible steps."],
    notifiable: [
      "Do not move colonies/frames/equipment off site.",
      "Do not apply treatments as a substitute for official inspection.",
      "Follow UK official guidance and contact the appropriate channels promptly.",
    ],
    robbingNow: [
      "Reduce entrance immediately (small gap).",
      "Stop syrup spills; feed internally only.",
      "Keep inspections short; avoid exposing honey.",
    ],
    starvationNow: [
      "Feed urgently (fondant in cold; syrup when warm enough).",
      "Re-check hive weight within 48–72 hours.",
    ],
  };

  // “Meaningful signals” used to stop context fillers dominating results
  // (If any of these are present, we exclude the generic context outcomes.)
  const meaningfulSignals = [
    // robbing/entrance conflict
    "ea_fighting_rolling_yes",
    "ea_bees_shiny_black_thieving_yes",
    "fs_robbery_signs_yes",
    "fs_feeder_leaks_yes",
    "tm_robbery_pressure_yes",

    // starvation / critical stores
    "fs_stores_low_yes",
    "dd_stores_very_light_yes",

    // dead/dying
    "dd_piles_dead_bees_yes",
    "dd_crawling_cant_fly_yes",
    "dd_tongues_out_yes",

    // queen/brood warning signals
    "qb_multiple_eggs_per_cell_yes",
    "qb_drone_brood_in_worker_cells_yes",
    "qb_brood_pattern_poor_yes",
    "qb_queen_cells_seen_yes",
    "qb_queen_cells_opened_yes",

    // disease flags
    "bd_ropey_larvae_yes",
    "symptom_ropey_larvae_yes",
    "bd_chalk_mummies_yes",
    "bd_sacbrood_yes",
    "bd_chilled_pattern_yes",
    "dd_deformed_wings_yes",
    "symptom_deformed_wings_yes",
    "qb_visible_varroa_yes",
    "dd_visible_varroa_yes",
    "pm_visible_varroa_yes",
    "pm_headfirst_cells_yes",
    "pm_dead_cluster_yes",
    "pm_dysentery_signs_yes",
    "pm_brood_problem_yes",
    "pm_population_dropped_yes",
    "pm_hive_empty_now_yes",
    "pm_wasp_attack_signs_yes",
    "pm_wasps_seen_yes",

    // pests/predators high significance
    "pp_hornet_hawking_yes",
    "pp_hornet_persistent_yes",
    "pp_slimy_fermented_frames_yes",
    "pp_wax_moth_webbing_yes",
    "pp_mouse_signs_yes",
  ];

  const seasons = ["early_spring", "spring", "summer", "autumn", "winter"];
  const onsets = ["sudden", "fast", "slow", "ongoing"];

// -------------------------
// A) ENTRANCE / ACTIVITY (tightened + nextChecks + excludes)
// -------------------------

add("normal_orientation_flights", {
  title: "Orientation flights (normal)",
  severity: "info",
  urgency: "normal",
  confidence: "strong",
  when: { all: ["ea_warm_sunny_yes", "ea_bees_circling_facing_hive_yes"] },
  excludeIf: {
    any: [
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "fs_robbery_signs_yes",
      "pp_wasps_pressure_yes",
      "pp_hornet_hawking_yes",
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
    ],
  },
  actions: [
    "No action needed. Avoid blocking the entrance.",
    "This often settles within 20–60 minutes (sometimes longer on very warm afternoons).",
    ...basicActions.monitor,
  ],
  nextChecks: ["ea_fighting_rolling", "ea_bees_shiny_black_thieving", "ea_drones_visible"],
});

add("normal_cleansing_flights", {
  title: "Cleansing flights after confinement (often normal)",
  severity: "info",
  urgency: "normal",
  confidence: "medium",
  when: { all: ["ea_cleansing_flights_yes"], any: ["season_winter", "season_early_spring"] },
  excludeIf: {
    any: [
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
      "ea_fighting_rolling_yes",
      "fs_robbery_signs_yes",
    ],
  },
  actions: [
    "Often normal after a cold spell or long confinement.",
    "Ensure water access nearby.",
    "If you see heavy soiling at the entrance/frames, consider damp/dysentery risk checks.",
    ...basicActions.monitor,
  ],
  nextChecks: ["dd_piles_dead_bees", "dd_crawling_cant_fly", "dd_cold_spell"],
});

add("normal_summer_bearding", {
  title: "Bearding due to heat/ventilation (often normal)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["ea_bearding_yes"], any: ["season_summer", "season_spring"] },
  excludeIf: {
    any: [
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "fs_robbery_signs_yes",
      "pp_wasps_pressure_yes",
      "pp_hornet_hawking_yes",
    ],
  },
  actions: [
    "Often normal in warm weather. Improve ventilation/shade and ensure water nearby.",
    "Avoid heavy inspections in the hottest part of the day.",
    "If bearding is extreme and ongoing, check congestion and space (supering).",
    ...basicActions.monitor,
  ],
  nextChecks: ["ea_fanning", "season", "colony_strength"],
});

add("normal_fanning_ventilation", {
  title: "Fanning at the entrance (ventilation / scenting — often normal)",
  severity: "info",
  urgency: "normal",
  confidence: "low",
  when: { all: ["ea_fanning_yes"] },
  excludeIf: {
    any: ["ea_fighting_rolling_yes", "ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes"],
  },
  actions: [
    "Often normal ventilation or scenting behaviour.",
    "If the entrance looks frantic or there’s fighting, treat as possible robbing instead.",
    ...basicActions.monitor,
  ],
  nextChecks: ["ea_fighting_rolling", "ea_bees_shiny_black_thieving", "fs_robbery_signs"],
});

add("normal_drones_spring_summer", {
  title: "Lots of drones visible (often normal in spring/summer)",
  severity: "info",
  urgency: "normal",
  confidence: "medium",
  when: { all: ["ea_drones_visible_yes"], any: ["season_spring", "season_summer"] },
  excludeIf: {
    any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes", "pp_hornet_hawking_yes"],
  },
  actions: ["Normal seasonal behaviour. No action needed.", ...basicActions.monitor],
  nextChecks: ["season", "ea_fighting_rolling"],
});

add("entrance_activity_not_flight_weather", {
  title: "High entrance activity but weather isn’t flight-friendly (check disturbance/feeding/robbery)",
  severity: "warning",
  urgency: "watch",
  confidence: "low",
  when: { all: ["ea_warm_sunny_no"], any: ["recent_harvest", "recent_feeding", "recent_move", "recent_treatment"] },
  actions: [
    "If it’s not flight weather but the hive is very busy/agitated, consider disturbance or feeding/robbing pressure.",
    "Keep inspections short and avoid exposing honey.",
    ...basicActions.monitor,
  ],
  nextChecks: ["recent_changes", "ea_fighting_rolling", "ea_bees_shiny_black_thieving", "fs_feeder_leaks"],
});

// -------------------------
// B) ROBBING / ENTRANCE CONFLICT (tightened)
// -------------------------

add("robbing_active_likely", {
  title: "Active robbing likely (urgent management)",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: ["ea_fighting_rolling_yes"],
    any: ["ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes", "tm_robbery_pressure_yes"],
  },
  excludeIf: {
    any: [
      "pp_hornet_hawking_yes", // could be hornet pressure instead
    ],
  },
  actions: [
    ...basicActions.robbingNow,
    "If the colony is weak, reduce entrance further and avoid exposing stores.",
    "If robbing is intense: consider a robbing screen and stop any open feeding immediately.",
  ],
  nextChecks: ["fs_feeder_leaks", "fs_robbery_signs", "pp_wasps_pressure", "pp_hornet_hawking", "colony_strength"],
});

add("robbing_risk_feeder_leak", {
  title: "Robbing risk increased due to syrup spills/leaks",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: { all: ["fs_feeder_leaks_yes"], any: ["fs_robbery_signs_yes", "ea_fighting_rolling_yes"] },
  actions: ["Stop leaks immediately. Clean spills.", ...basicActions.robbingNow],
  nextChecks: ["fs_feeder_leaks", "fs_feeder_access", "fs_feeder_type"],
});

add("wasp_pressure_entrance", {
  title: "Wasp pressure at the entrance (can look like 'constant fighting')",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["pp_wasps_pressure_yes"] },
  excludeIf: {
    any: ["pp_hornet_hawking_yes"],
  },
  actions: [
    "Reduce entrance for weak colonies; keep the colony able to defend.",
    "Avoid syrup spills and keep feeding internal and discreet.",
    "Consider traps away from the apiary (avoid attracting wasps to the hive line).",
    ...basicActions.monitor,
  ],
  nextChecks: ["ea_fighting_rolling", "colony_strength", "fs_feeder_leaks"],
});

add("hornet_pressure_entrance", {
  title: "Hornet hawking pressure at the entrance (treat as urgent if Asian hornet suspected)",
  severity: "alert",
  urgency: "report",
  confidence: "medium",
  when: { any: ["pp_hornet_hawking_yes", "pp_hornet_persistent_yes"] },
  actions: [
    "If safe, take a clear photo/video for identification.",
    "Do not attempt nest destruction yourself.",
    "Report promptly via official UK routes if you suspect Asian hornet.",
    ...basicActions.reduceDisturbance,
  ],
  nextChecks: ["pp_hornet_hawking", "pp_hornet_persistent", "pp_wasps_pressure"],
});

// -------------------------
// C) QUEEN / BROOD (deepened + tightened)
// -------------------------

add("queen_swarmed_recently", {
  title: "Likely swarm has occurred recently",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: [
      "route_queen_brood",
      "opened_frames_ok",
      "qb_eggs_seen_no",
      "qb_sealed_worker_brood_seen_yes",
      "qb_population_change_dropped_a_lot",
    ],
    any: ["qb_queen_cells_seen_yes", "qb_queen_cells_opened_yes"],
  },
  excludeIf: {
    any: [
      "qb_multiple_eggs_per_cell_yes", // points more to laying workers
      "qb_drone_brood_in_worker_cells_yes", // could be drone-layer/layers
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "No eggs but sealed worker brood still present suggests a brood break (common post-swarm).",
    "A big drop in adult bees supports a swarm event.",
    "Queen cells (especially opened) fit a recent queen turnover.",
  ],
  actions: [
    "Avoid heavy disturbance — let the colony stabilise.",
    "Re-check in 7–14 days for eggs (mating delay after swarming is normal).",
    "Ensure stores are adequate while they rebuild.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If there are still no eggs after ~3 weeks of suitable flying weather.",
    "If the colony is very weak and being robbed/pressured.",
  ],
  nextChecks: ["qb_queen_cells_opened", "qb_young_larvae_seen", "qb_population_change"],
});

add("queen_virgin_mating_window", {
  title: "Possible virgin queen / mating window (brood break)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: [
      "route_queen_brood",
      "opened_frames_ok",
      "qb_eggs_seen_no",
      "qb_sealed_worker_brood_seen_yes",
    ],
    any: ["qb_queen_cells_opened_yes", "recent_queen_event"],
  },
  excludeIf: {
    any: [
      "qb_population_change_dropped_a_lot", // if huge drop, swarm outcome likely above
      "qb_multiple_eggs_per_cell_yes",
      "qb_drone_brood_in_worker_cells_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "Sealed brood without eggs can simply mean the old queen has gone and the new one hasn’t started laying yet.",
    "Mating delays are common, especially if weather has been poor.",
  ],
  actions: [
    "Give time: 1–3+ weeks can be normal (weather dependent).",
    "Re-check in 7–10 days for eggs; avoid repeated heavy disturbance.",
    "Keep stores steady so they don’t stall.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If there are no eggs after ~3 weeks of decent flying weather.",
    "If the colony is shrinking rapidly or shows laying worker signs.",
  ],
  nextChecks: ["qb_eggs_seen", "qb_queen_cells_seen", "qb_population_change"],
});

add("queen_supersedure_underway", {
  title: "Supersedure likely underway (queen being replaced)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_queen_brood", "opened_frames_ok", "qb_queen_cells_seen_yes"],
    any: [
      "qb_brood_pattern_poor_yes",
      "qb_population_change_about_same",
      "qb_population_change_slightly_down",
      "recent_queen_event",
    ],
  },
  excludeIf: {
    any: [
      "qb_population_change_dropped_a_lot", // stronger swarm signal
      "qb_multiple_eggs_per_cell_yes",
      "qb_drone_brood_in_worker_cells_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "Queen cells plus an otherwise ‘not collapsed’ colony often fits supersedure rather than a swarm.",
    "Patchy brood pattern can trigger replacement of a failing queen.",
  ],
  actions: [
    "Avoid heavy manipulation while queen replacement is in progress.",
    "Re-check in 7–14 days for eggs and improving brood pattern.",
    "Keep a close eye on stores during the changeover.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If the colony becomes suddenly very weak or you see multiple eggs per cell / drone brood in worker cells.",
  ],
  nextChecks: ["qb_brood_pattern_poor", "qb_eggs_seen", "qb_population_change"],
});

add("queen_failing_or_poor_queen", {
  title: "Failing / poor queen likely (patchy brood pattern)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_queen_brood", "opened_frames_ok", "qb_brood_pattern_poor_yes"],
    any: ["qb_eggs_seen_yes", "qb_young_larvae_seen_yes", "qb_sealed_worker_brood_seen_yes"],
  },
  excludeIf: {
    any: [
      "qb_multiple_eggs_per_cell_yes",
      "qb_drone_brood_in_worker_cells_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "A patchy/erratic brood pattern can indicate an ageing queen, poor mating, or stress.",
    "It can also occur with Varroa/virus pressure — keep that in mind if wings are deformed.",
  ],
  actions: [
    "If you can: check Varroa/virus signals (especially if deformed wings are present).",
    "Consider requeening if pattern stays poor across 2 inspections (season dependent).",
    "Keep disturbance minimal and ensure steady stores.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If brood pattern worsens quickly or colony population drops noticeably.",
  ],
  nextChecks: ["symptom_deformed_wings", "qb_population_change", "qb_queen_cells_seen"],
});

add("queenless_likely", {
  title: "Queenless likely (needs confirmation)",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: [
      "route_queen_brood",
      "opened_frames_ok",
      "qb_eggs_seen_no",
      "qb_young_larvae_seen_no",
      "qb_sealed_worker_brood_seen_no",
    ],
    not: ["qb_queen_cells_seen_yes"],
  },
  excludeIf: {
    any: [
      "qb_multiple_eggs_per_cell_yes",
      "qb_drone_brood_in_worker_cells_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "No eggs, no larvae, and no sealed brood suggests no functioning queen and no recent brood.",
    "No queen cells present suggests they may be unable to raise a new queen.",
  ],
  actions: [
    "If you have another colony: add a frame with eggs/young larvae (so they can raise a queen).",
    "Before introducing a queen, check for laying worker signs.",
    ...basicActions.seekHelp,
  ],
  whenToWorry: [
    "If the colony is getting very small or is being robbed/pressured — act quickly.",
  ],
  nextChecks: ["qb_multiple_eggs_per_cell", "qb_drone_brood_in_worker_cells", "qb_queen_cells_seen"],
});

add("queenless_possible_brood_break", {
  title: "Possible brood break / queen status unclear (re-check soon)",
  severity: "info",
  urgency: "watch",
  confidence: "low",
  when: {
    all: ["route_queen_brood", "opened_frames_ok", "qb_eggs_seen_no"],
    any: ["qb_young_larvae_seen_no", "qb_sealed_worker_brood_seen_yes", "qb_queen_cells_seen_yes"],
  },
  excludeIf: {
    any: [
      "qb_multiple_eggs_per_cell_yes",
      "qb_drone_brood_in_worker_cells_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "Some scenarios look similar at first glance: swarmed, supersedure, virgin queen delay, or queen loss.",
    "A timed re-check is often the safest move before doing something irreversible.",
  ],
  actions: [
    "Re-check in 7–10 days for eggs and young larvae.",
    "Avoid heavy disturbance in the meantime.",
    "Keep stores steady while you wait.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If the population collapses rapidly or you start seeing multiple eggs per cell.",
  ],
  nextChecks: ["qb_young_larvae_seen", "qb_sealed_worker_brood_seen", "qb_population_change"],
});

add("laying_workers_suspected", {
  title: "Laying workers suspected (unfertilised eggs)",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: ["route_queen_brood", "opened_frames_ok", "qb_multiple_eggs_per_cell_yes"],
    any: ["qb_drone_brood_in_worker_cells_yes", "qb_eggs_seen_yes"],
  },
  excludeIf: {
    any: [
      // if you clearly saw a queen today, it’s less likely (not impossible to mis-ID, but avoid wrong steer)
      "qb_queen_seen_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "Multiple eggs per cell and eggs on side walls often indicate worker laying after prolonged queenlessness.",
    "This can be difficult to fix without a strong queen-right colony or experienced handling.",
  ],
  actions: [
    "This is tricky for beginners — requeening often fails unless managed carefully.",
    "Common approaches: combine with a strong queen-right colony via newspaper (after confirming details).",
    "Get local help before doing irreversible steps.",
    ...basicActions.seekHelp,
  ],
  whenToWorry: [
    "If the colony is very weak or being robbed — urgency increases quickly.",
  ],
  nextChecks: ["qb_drone_brood_in_worker_cells", "qb_queen_seen", "qb_population_change"],
});

add("drone_laying_queen_suspected", {
  title: "Drone-laying queen suspected (failing/unmated queen)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_queen_brood", "opened_frames_ok", "qb_drone_brood_in_worker_cells_yes"],
    not: ["qb_multiple_eggs_per_cell_yes"],
  },
  excludeIf: {
    any: ["symptom_ropey_larvae_yes", "bd_ropey_larvae_yes"],
  },
  why: [
    "Drone brood in worker-sized cells can indicate a queen laying only unfertilised eggs.",
    "If eggs are mostly single and well-placed, it points more to a queen than workers.",
  ],
  actions: [
    "Confirm egg pattern: single egg per cell vs multiple eggs (messy).",
    "Consider requeening if confirmed; timing/season matters.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If population drops and no worker brood is being produced.",
  ],
  nextChecks: ["qb_multiple_eggs_per_cell", "qb_eggs_seen", "qb_population_change"],
});

add("queen_brood_break_after_treatment_or_disturbance", {
  title: "Brood break / disruption after treatment or disturbance (possible)",
  severity: "info",
  urgency: "watch",
  confidence: "low",
  when: {
    all: ["route_queen_brood", "opened_frames_ok", "qb_eggs_seen_no"],
    any: ["recent_treatment", "recent_harvest", "recent_move", "recent_queen_event"],
  },
  excludeIf: {
    any: [
      "qb_multiple_eggs_per_cell_yes",
      "qb_drone_brood_in_worker_cells_yes",
      "symptom_ropey_larvae_yes",
      "bd_ropey_larvae_yes",
    ],
  },
  why: [
    "Treatments, moves, harvest disturbance, or queen events can temporarily interrupt laying or make it harder to spot eggs.",
  ],
  actions: [
    "Re-check in 7–10 days for eggs and young larvae.",
    "Keep handling minimal until you see the brood cycle re-establish.",
    ...basicActions.monitor,
  ],
  nextChecks: ["qb_young_larvae_seen", "qb_eggs_seen", "qb_sealed_worker_brood_seen"],
});

// -------------------------
// D) DISEASE / PARASITES (deepened + tightened)
// -------------------------

add("disease_varroa_dwv_pressure", {
  title: "Varroa / Deformed Wing Virus pressure likely",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: {
    any: [
      // queen/brood route
      "symptom_deformed_wings_yes",
      // dead/dying route
      "dd_deformed_wings_yes",
    ],
  },
  excludeIf: {
    any: [
      // if you have sudden piles of dead + tongues out, poisoning might be higher on the list too
      // (we don't suppress varroa entirely, but avoid mis-ranking it as the only cause)
      "dd_tongues_out_yes",
      // if foulbrood red flag exists, that overrides anyway
      "bd_ropey_larvae_yes",
      "symptom_ropey_larvae_yes",
    ],
  },
  why: [
    "Deformed wings are a strong field signal for virus expression often associated with high Varroa pressure.",
    "It can present alongside weakening, crawling bees, and patchy brood (but those can have other causes too).",
  ],
  actions: [
    "Check Varroa levels if you can (monitoring method appropriate to season).",
    "Review your seasonal Varroa plan; treat if thresholds indicate.",
    "Avoid combining colonies until you understand what’s happening (risk of spreading problems).",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If deformed wings are widespread, the colony is shrinking quickly, or you’re seeing lots of crawling bees.",
    "If you have repeated losses despite treatment — get local help to review plan/timing.",
  ],
});

add("disease_foulbrood_red_flag", {
  title: "Red flag: possible foulbrood (notifiable) — act immediately",
  severity: "alert",
  urgency: "report",
  confidence: "strong",
  when: {
    any: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"],
  },


  why: [
    "Ropey/brown larvae and foul smell can be consistent with notifiable brood disease patterns.",
    "Because consequences are serious, treat as notifiable until ruled out by an inspector.",
  ],
  actions: [
    ...basicActions.notifiable,
    "Minimise disturbance and prevent robbing (do not leave hive open).",
  ],
  whenToWorry: [
    "Immediately — do not wait for it to ‘improve’ on its own.",
  ],
});

add("disease_chalkbrood_likely", {
  title: "Chalkbrood likely",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { any: ["bd_chalk_mummies_yes"] },
  excludeIf: {
    any: [
      "inspection_level_entrance_only",
      // if foulbrood red flag exists, that takes priority
      "bd_ropey_larvae_yes",
      "symptom_ropey_larvae_yes",
    ],
  },

   why: [
    "Chalk-like mummies are a classic sign; it often improves as the colony strengthens and conditions dry out.",
  ],
  actions: [
    "Reduce excess space for weak colonies and improve ventilation.",
    "Check nutrition; avoid damp/mouldy conditions.",
    "Consider replacing worst affected comb over time (not in one go if colony is weak).",
    ...basicActions.monitor,
  ],
});

add("disease_sacbrood_likely", {
  title: "Sacbrood likely",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { any: ["bd_sacbrood_yes"] },
  excludeIf: {
    any: [
      "inspection_level_entrance_only",
      "bd_ropey_larvae_yes",
      "symptom_ropey_larvae_yes",
    ],
  },
  why: [
    "Fluid-filled larvae / slipper-shaped remains are consistent with sacbrood patterns.",
    "Often stress-related and can resolve as conditions improve.",
  ],
  actions: [
    "Reduce stress: keep inspections minimal and avoid chilling brood.",
    "Ensure steady nutrition (avoid boom/bust feed patterns).",
    ...basicActions.monitor,
  ],
});

add("disease_chilled_brood_likely", {
  title: "Chilled brood likely (temperature/coverage issue)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: {
    any: ["bd_chilled_pattern_yes", "dd_cold_spell_yes"],
  },
  excludeIf: {
    any: [
      "inspection_level_entrance_only",
      // notifiable override already handled elsewhere
      "bd_ropey_larvae_yes",
      "symptom_ropey_larvae_yes",
    ],
  },
  why: [
    "Cold nights + brood on edges / dead brood patterns often indicate inadequate coverage or too much space.",
  ],
  actions: [
    "Reduce space if bees can’t cover brood (especially early spring).",
    "Avoid splitting the brood nest with foundation during cool spells.",
    "Re-check when weather improves; patterns often stabilise.",
    ...basicActions.monitor,
  ],
});

add("disease_poisoning_suspected", {
  title: "Possible pesticide poisoning / acute exposure",
  severity: "warning",
  urgency: "urgent",
  confidence: "medium",
  when: {
    all: ["dd_piles_dead_bees_yes"],
    any: ["onset_speed_sudden", "dd_tongues_out_yes"],
  },
  excludeIf: {
    any: [
      // starvation can also produce big losses, so avoid mislabelling if stores are clearly critically low
      "dd_stores_very_light_yes",
      "fs_stores_low_yes",
      // if foulbrood red flag exists, that’s a separate urgent path
      "bd_ropey_larvae_yes",
      "symptom_ropey_larvae_yes",
    ],
  },
  why: [
    "Sudden piles of dead bees (especially with tongues out) can fit acute exposure patterns.",
    "This isn’t certain — but it’s worth treating as urgent and documenting.",
  ],
  actions: [
    "Reduce disturbance; document timing and symptoms (photos).",
    "Avoid feeding exposed honey back to bees until you’re confident it’s safe.",
    "Seek local support if severe/ongoing (association/inspector).",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "If losses continue over multiple days, or neighbouring colonies show similar sudden deaths.",
  ],
});

add("disease_nosema_dysentery_possible", {
  title: "Dysentery / gut stress possible (often linked to damp, confinement, or feed issues)",
  severity: "info",
  urgency: "watch",
  confidence: "low",
  when: {
    all: ["ea_cleansing_flights_yes"],
    any: ["season_winter", "season_early_spring"],
  },
  excludeIf: {
    any: [
      // if the key issue is robbing conflict, that’s higher priority than gut stress
      "ea_fighting_rolling_yes",
      "fs_robbery_signs_yes",
    ],
  },
  why: [
    "Heavy cleansing flights after confinement can be normal, but persistent soiling can indicate gut stress.",
    "Moisture and poor ventilation can worsen it.",
  ],
  actions: [
    "Improve ventilation and keep hive dry (avoid damp floors/stands).",
    "Avoid feeding fermented syrup.",
    "If you suspect dysentery, keep disturbance low and monitor stores.",
    ...basicActions.monitor,
  ],
});

  // -------------------------
  // E) FEEDING / STORES (tightened)
  // -------------------------

add("feeding_starvation_risk_imminent", {
  title: "Starvation risk (urgent feeding needed)",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: ["route_feeding_stores"],
    any: ["fs_stores_low_yes", "dd_stores_very_light_yes"],
  },
  excludeIf: {
    any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes", "ea_bees_shiny_black_thieving_yes"],
  },
  why: [
    "Low/heft-light stores is an immediate risk — colonies can collapse quickly once stores run out.",
  ],
  actions: [
    ...basicActions.starvationNow,
    "If the colony is very weak, reduce space so the cluster can stay warm and reach feed.",
  ],
  whenToWorry: [
    "If the colony remains light after 48–72 hours.",
    "If you see many crawling bees or rapid losses alongside low stores.",
  ],
  nextChecks: ["fs_too_cold", "fs_feed_type", "fs_colony_weak", "dd_crawling_cant_fly"],
});

add("feeding_robbing_triggered_by_feeding", {
  title: "Feeding is triggering robbing risk (change approach now)",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: ["route_feeding_stores"],
    any: ["fs_robbery_signs_yes", "fs_feeder_leaks_yes", "ea_fighting_rolling_yes", "ea_bees_shiny_black_thieving_yes"],
  },
  why: [
    "Syrup smell/spills can trigger robbing very fast, especially late summer/autumn.",
    "Robbing can overwhelm weak colonies quickly.",
  ],
  actions: [
    "Stop leaks/spills immediately and clean up syrup around the hive/stand.",
    ...basicActions.robbingNow,
    "Feed internally only (avoid open feeding).",
  ],
  whenToWorry: [
    "If fighting continues after entrance reduction.",
    "If the colony is weak and cannot defend.",
  ],
  nextChecks: ["fs_feeder_leaks", "fs_feeder_type", "fs_feeder_access", "fs_colony_weak"],
});

add("feeding_not_taking_syrup_because_flow", {
  title: "Not taking syrup because there’s a nectar flow (often normal)",
  severity: "info",
  urgency: "normal",
  confidence: "strong",
  when: {
    all: ["route_feeding_stores", "fs_nectar_flow_yes"],
    not: ["fs_stores_low_yes"],
  },
  excludeIf: {
    any: [
      // Robbing / conflict
      "fs_robbery_signs_yes",
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "fs_feeder_leaks_yes",
      // Dead/dying / collapse signals
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
      "dd_tongues_out_yes",
      // Sudden onset suggests “something else”
      "onset_speed_sudden",
    ],
  },
  why: [
    "During a strong flow, bees often ignore syrup because they prefer real nectar.",
  ],
  actions: [
    "Often normal. If stores are building, no action needed.",
    "If feeding a nuc/very small colony, use smaller internal feeds and avoid any spills.",
    ...basicActions.monitor,
  ],
  nextChecks: ["fs_weather_flight_ok", "fs_feeder_leaks", "fs_robbery_signs"],
});

add("feeding_not_taking_syrup_too_cold_switch_feed", {
  title: "Not taking syrup because it’s too cold (switch feed type)",
  severity: "info",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: ["route_feeding_stores", "fs_too_cold_yes"],
  },
  excludeIf: {
    any: [
      // If robbing is happening, cold isn’t the main issue to solve first
      "fs_robbery_signs_yes",
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      // If starvation is already flagged, handle as urgent starvation outcome
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
    ],
  },
  why: [
    "In cold weather bees may not break cluster or take syrup effectively.",
    "Fondant is often safer than syrup when temperatures are low.",
  ],
  actions: [
    "Switch to fondant/candy if cold (place within easy reach of the cluster).",
    "Avoid forcing bees to break cluster to reach feed.",
    "Avoid spills around the hive (robbing risk).",
    ...basicActions.monitor,
  ],
  nextChecks: ["fs_feed_type", "fs_weather_flight_ok", "fs_feeder_access"],
});

add("feeding_feeder_access_or_design_issue", {
  title: "Feeder access/design problem likely",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: ["route_feeding_stores"],
    any: ["fs_feeder_access_no", "fs_feed_consumption_none_yes"],
  },
  excludeIf: {
    any: [
      // Don’t muddy the waters if robbing/starvation is the main problem
      "fs_robbery_signs_yes",
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
    ],
  },
  why: [
    "If bees can’t physically access syrup (misalignment, missing floats/ladders), intake can be near-zero.",
    "Some feeders are unsuitable for weak colonies (drowning risk / hard-to-reach syrup).",
  ],
  actions: [
    "Check alignment of feeder holes/access points and add floats/ladders where needed.",
    "Try a feeder style that suits weak colonies (frame feeder/contact feeder).",
    "Confirm the feeder isn’t emptying via leaks rather than being consumed.",
    ...basicActions.monitor,
  ],
  nextChecks: ["fs_feeder_type", "fs_feeder_access", "fs_feeder_leaks", "fs_colony_weak"],
});

add("feeding_syrup_ferment_or_off", {
  title: "Syrup may be fermented/tainted (replace it)",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: ["route_feeding_stores", "fs_smell_ferment_yes"],
  },
  excludeIf: {
    any: [
      "fs_robbery_signs_yes",
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
    ],
  },
  why: [
    "Old or fermented syrup can be ignored and may upset bees.",
  ],
  actions: [
    "Remove and replace syrup with fresh feed.",
    "Clean the feeder before refilling to prevent recurring fermentation.",
    "In warm weather, avoid making syrup too far in advance.",
    ...basicActions.monitor,
  ],
  nextChecks: ["fs_feed_type", "fs_feeder_type", "fs_feed_consumption_none"],
});

add("feeding_recent_treatment_or_brood_break_effect", {
  title: "Recent Varroa treatment/brood break may be affecting behaviour",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_feeding_stores", "fs_recent_treatment_effect_yes"],
  },
  excludeIf: {
    any: [
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
      "fs_robbery_signs_yes",
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
    ],
  },
  why: [
    "Some treatments and brood breaks can temporarily change feeding/foraging behaviour.",
  ],
  actions: [
    "Keep disturbance low and monitor intake over 48–72 hours.",
    "Confirm feeder access and check that syrup is fresh and not leaking.",
    ...basicActions.monitor,
  ],
  nextChecks: ["fs_feeder_access", "fs_smell_ferment", "fs_feed_consumption_none"],
});

add("feeding_weak_colony_processing_limit", {
  title: "Colony may be too weak to take/process feed effectively",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_feeding_stores"],
    any: ["fs_colony_weak_yes", "colony_strength_weak", "colony_strength_very_weak"],
  },
  excludeIf: {
    any: [
      // If starvation is flagged, let starvation outcome lead
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
      // If robbing is present, that’s the immediate emergency
      "fs_robbery_signs_yes",
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      // If collapse/death is obvious, route should be dead/dying
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
    ],
  },
  why: [
    "Small clusters struggle to defend, heat syrup, and process feed quickly.",
    "They may also avoid breaking cluster if conditions are cool.",
  ],
  actions: [
    "Reduce space so the cluster can stay warm and defend the entrance.",
    "Use a feeder that allows easy access with minimal drowning risk.",
    "If cold, use fondant instead of syrup.",
    ...basicActions.monitor,
  ],
  nextChecks: ["fs_too_cold", "fs_feeder_type", "fs_feeder_access", "fs_robbery_signs"],
});

// -------------------------
// F) COMB / DRAWING / SPACE (deepened + tightened + aligned to your question IDs)
// -------------------------

add("comb_no_flow_no_stimulus", {
  title: "Not drawing comb because there’s no flow (or no stimulation)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_comb_building", "cb_is_flow_no"],
    not: ["cb_feed_present_yes"],
  },
  excludeIf: {
    any: [
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
      "ea_fighting_rolling_yes",
      "fs_robbery_signs_yes",
    ],
  },
  why: [
    "Bees draw wax best during a nectar flow or with controlled stimulation feeding.",
    "In a dearth, they conserve energy and wax production slows dramatically.",
  ],
  actions: [
    "If season-appropriate, provide small, controlled stimulation feeds (avoid spills/robbing).",
    "Ensure the colony has enough bees and warmth to commit to wax building.",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_feed_present", "cb_colony_strong", "cb_temperature_ok"],
});

add("comb_colony_too_weak_to_draw", {
  title: "Colony too weak to draw foundation (very common)",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: ["route_comb_building"],
    any: ["cb_colony_strong_no", "colony_strength_weak", "colony_strength_very_weak"],
  },
  excludeIf: {
    any: [
      "fs_stores_low_yes",
      "dd_stores_very_light_yes",
      "ea_fighting_rolling_yes",
      "fs_robbery_signs_yes",
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
    ],
  },
  why: [
    "Weak colonies struggle to heat wax and spare workforce for comb building.",
    "They also struggle if you give them too much space to heat/defend.",
  ],
  actions: [
    "Reduce excess space (avoid leaving boxes/frames they can’t cover).",
    "Delay adding more foundation until the colony is stronger and weather improves.",
    ...basicActions.monitor,
  ],
  nextChecks: ["colony_strength", "cb_added_space_recently", "cb_temperature_ok"],
});

add("comb_temperature_limiting", {
  title: "Too cold for wax work (temperature limiting)",
  severity: "info",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: ["route_comb_building"],
    any: ["cb_temperature_ok_no"],
  },
  excludeIf: {
    any: ["season_summer"], // summer can still have cold nights, but this stops it firing too broadly
  },
  why: [
    "Cold nights can stop wax work even if days are sunny.",
    "Bees won’t invest in wax if they can’t keep it warm and workable.",
  ],
  actions: [
    "Delay expansion until a warmer spell (especially at night).",
    "Avoid splitting the brood nest with foundation in cool conditions.",
    ...basicActions.monitor,
  ],
  nextChecks: ["season", "cb_box_position", "cb_added_space_recently"],
});

add("comb_too_much_space_added_too_early", {
  title: "Too much space added too early (slows comb and can chill brood)",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_comb_building", "cb_added_space_recently_yes"] },
  excludeIf: {
    any: ["colony_strength_strong", "cb_congestion_yes"], // strong + congested = adding space may be correct
  },
  why: [
    "Excess space is harder to heat and defend, so bees may stall on building.",
    "It can also lead to chilled brood if the brood nest is spread too thin.",
  ],
  actions: [
    "Reduce space and add frames/boxes more gradually as the colony expands.",
    "Keep new foundation close to where bees are active (but don’t chill brood).",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_congestion", "cb_box_position", "colony_strength"],
});

add("comb_foundation_condition_problem", {
  title: "Foundation condition issue (old/dry/contaminated) possible",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_comb_building", "cb_foundation_new_clean_no"] },
  excludeIf: { any: ["fs_stores_low_yes", "dd_stores_very_light_yes"] },
  why: [
    "Old, dry, or contaminated foundation is often ignored.",
    "Some colonies are picky unless conditions are perfect (flow + warmth).",
  ],
  actions: [
    "Swap for fresh foundation if possible.",
    "Encourage drawing during a flow or with careful stimulation feeding (avoid robbing risk).",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_is_flow", "cb_feed_present", "cb_foundation_type"],
});

add("comb_plastic_not_waxed", {
  title: "Plastic foundation not wax-coated (often ignored)",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_comb_building", "cb_plastic_waxed_no"] },
  excludeIf: { any: ["cb_foundation_type_wax", "cb_foundation_type_starter_strip"] },
  why: [
    "Unwaxed plastic is a very common reason bees won’t draw foundation.",
    "Wax coating gives them the ‘starter’ they need to begin building.",
  ],
  actions: [
    "Use wax-coated plastic foundation (or add wax coating if you know how).",
    "Try again during a flow / warm spell / with careful stimulation feeding.",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_foundation_type", "cb_is_flow", "cb_temperature_ok"],
});

add("comb_wrong_placement_cross_comb_risk", {
  title: "Comb built in odd places (cross comb) — placement/space issue likely",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_comb_building", "cb_what_not_drawing_building_wrong_place"] },
  excludeIf: {
    any: ["inspection_level_entrance_only"], // you can’t really confirm cross-comb without opening
  },
  why: [
    "Cross comb often happens with foundationless/starter strips, spacing errors, or too much empty space.",
    "If frames aren’t straight/close, bees build where it ‘makes sense’ to them.",
  ],
  actions: [
    "Correct frame spacing and ensure frames are pushed tight together.",
    "If foundationless, ensure a good straight guide and strong nectar flow.",
    "Fix early — cross comb gets harder to correct later.",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_foundation_type", "cb_added_space_recently", "cb_is_flow"],
});

add("comb_super_ignored_not_ready_or_no_flow", {
  title: "Not using the super yet (often timing/flow/strength)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_comb_building", "cb_what_not_drawing_ignoring_super"] },
  excludeIf: {
    any: ["cb_congestion_yes"], // if congested and still ignoring super, excluder/placement becomes more likely
  },
  why: [
    "Bees may ignore supers if there’s no flow, the colony isn’t strong enough, or nights are cold.",
    "They prioritise brood nest and stores before expanding upward.",
  ],
  actions: [
    "Add supers during a flow when the colony is strong and nights are mild.",
    "If you’re using foundation, consider adding a drawn comb frame as a lure (if you have one).",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_is_flow", "cb_colony_strong", "cb_temperature_ok", "cb_congestion"],
});

add("comb_excluder_reluctance", {
  title: "Bees reluctant to cross the queen excluder (common early season)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_comb_building", "cb_queen_excluder_in_way_yes"] },
  excludeIf: {
    any: ["cb_is_flow_no", "cb_colony_strong_no"], // if no flow or weak colony, excluder isn't the main problem
  },
  why: [
    "Some colonies hesitate to cross an excluder unless conditions are ideal (flow + strength).",
    "It can look like ‘they won’t use the super’ even when they’re simply not ready.",
  ],
  actions: [
    "Ensure the brood box is strong and there’s a nectar flow before expecting super work.",
    "If appropriate, confirm there’s drawn comb above (or add one drawn frame as a lure).",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_is_flow", "cb_colony_strong", "cb_congestion"],
});

add("comb_inserting_foundation_mid_brood_risk", {
  title: "Foundation inserted in brood nest may be slowing progress (and risks chilling brood)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_comb_building", "cb_box_position_middle_brood"],
    any: ["cb_temperature_ok_no", "season_early_spring", "season_spring"],
  },
  excludeIf: {
    any: ["colony_strength_strong", "cb_congestion_yes"], // strong congested colonies can sometimes handle it
  },
  why: [
    "Putting foundation in the middle of brood can chill brood if the colony can’t cover it.",
    "Bees may refuse to draw it there if conditions aren’t warm and strong enough.",
  ],
  actions: [
    "Move foundation to the edge of brood nest instead of splitting brood.",
    "Wait for warmer nights / stronger colony before attempting mid-brood insertion.",
    ...basicActions.monitor,
  ],
  nextChecks: ["cb_temperature_ok", "colony_strength", "cb_box_position"],
});

// -------------------------
// G) PESTS / PREDATORS (deepened + tightened)
// -------------------------

add("pests_wasps_pressure", {
  title: "Wasp pressure likely (manage before it becomes robbing)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_pests_predators"], any: ["pp_wasps_pressure_yes"] },
  excludeIf: {
    any: [
      // if these are true, this is no longer “wasps pressure” — it’s active robbing dynamics
      "ea_fighting_rolling_yes",
      "ea_bees_shiny_black_thieving_yes",
      "fs_robbery_signs_yes",
    ],
  },
  why: [
    "Wasps often probe entrances in late summer/autumn and target weak colonies.",
    "Early action prevents escalation into full robbing/colony collapse.",
  ],
  actions: [
    "Reduce entrance (especially for weak colonies).",
    "Avoid syrup spills and avoid leaving exposed honey/frames during inspections.",
    "Consider traps placed away from hives (so you don’t draw wasps to the entrance).",
    ...basicActions.monitor,
  ],
});

add("pests_wasps_escalating_to_robbing", {
  title: "Entrance conflict escalating (robbery risk high)",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: ["route_pests_predators", "pp_wasps_pressure_yes"],
    any: [
      "ea_fighting_rolling_yes",
      "fs_robbery_signs_yes",
      "ea_bees_shiny_black_thieving_yes",
    ],
  },
  why: [
    "Wasp pressure combined with fighting or robbing-style behaviour means the situation is escalating.",
  ],
  actions: [
    ...basicActions.robbingNow,
    "If it continues, consider moving feeding to evening only and keep entrances very small for weak colonies.",
  ],
});

add("pests_hornet_hawking_generic", {
  title: "Hornet hawking at the entrance (stress/forager losses possible)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_pests_predators"], any: ["pp_hornet_hawking_yes"] },
  excludeIf: {
    any: [
      // if slime/fermentation is present, SHB path takes priority
      "pp_slimy_fermented_frames_yes",
    ],
  },
  why: [
    "Persistent hawking can reduce foraging and increase stress, especially in weaker colonies.",
    "Identification matters: Asian hornet requires urgent reporting.",
  ],
  actions: [
    "If safe, get a clear photo/video for identification.",
    "If you suspect Asian hornet: report promptly via official UK reporting routes.",
    "Support the colony by keeping entrance defensible and avoiding syrup spills.",
    ...basicActions.monitor,
  ],
});

add("pests_asian_hornet_reporting", {
  title: "Possible Asian hornet activity — urgent reporting advised",
  severity: "alert",
  urgency: "report",
  confidence: "strong",
  when: { any: ["pp_hornet_hawking_yes", "pp_hornet_persistent_yes"] },
  actions: [
    "Do not attempt nest destruction yourself.",
    "If safe, take a clear photo/video for identification.",
    "Report promptly via official UK reporting routes if you suspect Asian hornet.",
    "Keep colonies calm and defensible; avoid feeding spills.",
  ],
});

add("pests_wax_moth_secondary_weakness", {
  title: "Wax moth activity (usually a symptom of a weak or stressed colony)",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_pests_predators"], any: ["pp_wax_moth_webbing_yes"] },
  excludeIf: {
    any: [
      // strong colonies usually keep wax moth in check
      "colony_strength_strong",
      // if SHB symptoms exist, take the SHB outcome instead
      "pp_slimy_fermented_frames_yes",
    ],
  },
  why: [
    "Wax moth usually becomes a problem when colonies are weak, queenless, or can’t patrol all comb.",
    "It often follows other issues (low population, starvation, brood break, robbing).",
  ],
  actions: [
    "Reduce excess space and remove severely damaged comb.",
    "Focus on strengthening colony: stores, warmth, queen status.",
    ...basicActions.monitor,
  ],
});

add("pests_wax_moth_present_but_strong", {
  title: "Wax moth signs found — but colony may cope if strong",
  severity: "info",
  urgency: "watch",
  confidence: "low",
  when: { all: ["route_pests_predators", "pp_wax_moth_webbing_yes"], any: ["colony_strength_strong"] },
  why: [
    "Strong colonies usually control wax moth — a small amount of damage may be historical or limited.",
  ],
  actions: [
    "Remove/replace badly damaged comb when convenient.",
    "Check you haven’t left unused comb/space that bees can’t patrol.",
    ...basicActions.monitor,
  ],
});

add("pests_mice_intrusion_likely", {
  title: "Mouse intrusion likely (especially in cooler months)",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_pests_predators"], any: ["pp_mouse_signs_yes"] },
  excludeIf: {
    any: [
      // very warm, mid-summer conditions make it less likely as a current issue
      "season_summer",
    ],
  },
  why: [
    "Mice seek warmth and food and can wreck comb/insulation and stress the colony.",
  ],
  actions: [
    "Fit an entrance reducer / mouse guard (season-appropriate).",
    "Remove debris and check comb damage.",
    "Avoid leaving gaps that allow re-entry.",
    ...basicActions.monitor,
  ],
});

add("pests_ants_nuisance", {
  title: "Ants present (usually nuisance rather than a colony-killer)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_pests_predators"], any: ["pp_ants_seen_yes"] },
  excludeIf: {
    any: [
      // if the entrance is already in conflict, focus on robbing/wasps first
      "ea_fighting_rolling_yes",
      "fs_robbery_signs_yes",
    ],
  },
  why: [
    "Ants often scavenge spills and can irritate bees, but rarely destroy a healthy colony.",
  ],
  actions: [
    "Keep stand area clean and dry; avoid syrup/honey spills.",
    "Use bee-safe barriers on the stand legs if persistent.",
    ...basicActions.monitor,
  ],
});

add("pests_shb_suspicion", {
  title: "Small hive beetle suspicion — urgent reporting advised (UK notifiable)",
  severity: "alert",
  urgency: "report",
  confidence: "strong",
  when: { any: ["pp_slimy_fermented_frames_yes"] },
  actions: [
    ...basicActions.notifiable,
    "Minimise disturbance until you receive official guidance.",
  ],
});

// -------------------------
// G.5) POST MORTEM OUTCOMES
// -------------------------

add("postmortem_starvation_classic", {
  title: "Post-mortem: starvation likely",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: { all: ["route_post_mortem"], any: ["pm_headfirst_cells_yes", "pm_stores_present_no"] },
  excludeIf: { any: ["pm_wasp_attack_signs_yes"] },
  why: [
    "Dead bees head-first in cells is a classic starvation sign.",
    "If there are no usable stores left, starvation becomes the leading explanation.",
  ],
  actions: [
    "Check the remaining combs carefully to confirm how much usable food was actually available.",
    "Review winter feeding timing and whether fondant/feed stayed within reach of the cluster.",
    "Check neighbouring colonies urgently if stores are also getting low.",
  ],
  whenToWorry: [
    "If more than one colony is becoming light.",
    "If cold weather is still ongoing and other colonies are marginal on stores.",
  ],
});

add("postmortem_isolation_starvation", {
  title: "Post-mortem: isolation starvation / cold cluster loss possible",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_post_mortem", "pm_dead_cluster_yes", "pm_plenty_stores_yes"] },
  excludeIf: { any: ["pm_wasp_attack_signs_yes"] },
  why: [
    "A dead cluster with stores still present often suggests bees could not move across to food.",
    "This is common in cold snaps, with small clusters, or when stores were present but not within reach.",
  ],
  actions: [
    "Review colony strength going into winter and how stores were positioned around the cluster.",
    "Reduce space and support weaker colonies earlier next season.",
    "Check other small colonies for isolation risk during cold spells.",
  ],
});

add("postmortem_varroa_collapse", {
  title: "Post-mortem: varroa-related collapse possible",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_post_mortem"], any: ["pm_visible_varroa_yes", "pm_population_dropped_yes", "pm_brood_problem_yes"] },
  excludeIf: { any: ["pm_wasp_attack_signs_yes", "pm_headfirst_cells_yes", "pm_stores_present_no"] },
  why: [
    "Colonies that collapse with food still present are often linked to high varroa loads going into winter.",
  ],
  actions: [
    "Review the timing and effectiveness of Varroa monitoring/treatments in that colony and across the apiary.",
    "Check your surviving colonies promptly rather than assuming this was an isolated loss.",
    "Avoid combining suspect dead-out material with other colonies until the wider picture is clearer.",
  ],
});

add("postmortem_wasp_or_robbing_collapse", {
  title: "Post-mortem: wasp attack / robbing likely contributed to collapse",
  severity: "warning",
  urgency: "watch",
  confidence: "strong",
  when: { all: ["route_post_mortem"], any: ["pm_wasp_attack_signs_yes", "pm_wasps_seen_yes"] },
  why: [
    "Signs of attack, torn comb, debris, or previous fighting fit wasp pressure or robbing.",
    "Weak colonies can be stripped very quickly, especially in late summer or autumn.",
  ],
  actions: [
    "Review whether the entrance was small enough and whether the colony was strong enough to defend itself.",
    "Be extra careful with late-season feeding and avoid syrup spills or exposed comb.",
    "Protect weaker colonies earlier if wasp pressure builds in the apiary.",
  ],
});

add("postmortem_dysentery_nosema_possible", {
  title: "Post-mortem: dysentery / gut stress possible",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_post_mortem", "pm_dysentery_signs_yes"] },
  excludeIf: { any: ["pm_wasp_attack_signs_yes"] },
  why: [
    "Brown spotting or obvious bee poo suggests gut stress and can fit dysentery-like patterns.",
  ],
  actions: [
    "Review ventilation, damp, and feed quality issues.",
    "Avoid reusing obviously contaminated material without checking local best practice.",
    "Monitor surviving colonies for similar soiling or poor spring build-up.",
  ],
});

add("postmortem_absconding_or_near_empty", {
  title: "Post-mortem: near-empty hive / disappearance pattern needs narrowing down",
  severity: "info",
  urgency: "watch",
  confidence: "low",
  when: { all: ["route_post_mortem", "pm_hive_empty_now_yes", "pm_stores_present_yes"] },
  excludeIf: {
    any: [
      "pm_wasp_attack_signs_yes",
      "pm_wasps_seen_yes",
      "pm_visible_varroa_yes",
      "pm_population_dropped_yes",
      "pm_headfirst_cells_yes",
    ],
  },
  why: [
    "A mostly empty hive with stores remaining can look like absconding, but it can also follow collapse for other reasons.",
  ],
  actions: [
    "Review season, colony strength, and any major disturbance or queen event before the loss.",
    "Check combs carefully for subtle clues before reusing equipment.",
    "Inspect the rest of the apiary rather than assuming a single simple cause.",
  ],
});

// -------------------------
// H) DEAD / DYING / POISONING / CHILLING (core)
// -------------------------

add("dead_poisoning_strong_signal", {
  title: "Strong signal: possible pesticide poisoning / acute exposure",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: {
    all: ["dd_piles_dead_bees_yes"],
    any: ["dd_tongues_out_yes", "onset_speed_sudden"],
  },
  excludeIf: {
    any: ["dd_stores_very_light_yes", "fs_stores_low_yes"], // don’t mislabel starvation as poisoning
  },
  actions: [
    "Reduce disturbance; document timing and symptoms (photos/video).",
    "If possible, note nearby spraying/weed control timing (same day/previous day).",
    "Avoid feeding exposed honey back to bees.",
    "If losses are severe/ongoing, seek local guidance urgently (association/inspector).",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "Rapidly increasing piles of dead bees over hours–1 day.",
    "Multiple colonies affected at the same apiary.",
    "Continuing losses for more than 24–48 hours.",
  ],
});

add("dead_poisoning_possible", {
  title: "Possible pesticide poisoning / exposure (needs checking)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["dd_piles_dead_bees_yes"],
    any: ["onset_speed_fast", "dd_tongues_out_unknown", "dd_tongues_out_yes"],
  },
  excludeIf: { any: ["dd_stores_very_light_yes", "fs_stores_low_yes"] },
  actions: [
    "Reduce disturbance and keep inspections short.",
    "Check stores and weather context to rule out starvation/chilling.",
    "Document symptoms and timeline; seek local help if unsure.",
    ...basicActions.monitor,
  ],
});

add("dead_starvation_likely", {
  title: "Starvation likely / stores critically low",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: { any: ["dd_stores_very_light_yes", "fs_stores_low_yes"] },
  excludeIf: {
    any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes"], // if robbing is active, advice differs
  },
  actions: [
    ...basicActions.starvationNow,
    "Reduce entrance if the colony is weak (to help defence).",
  ],
  whenToWorry: [
    "Crawling bees + very light hive.",
    "Brood present but very low stores (brood can starve fast).",
  ],
});

add("dead_chilling_stress_likely", {
  title: "Chilling / cold-stress likely contributing to losses",
  severity: "info",
  urgency: "watch",
  confidence: "strong",
  when: {
    all: ["dd_cold_spell_yes"],
    any: ["season_winter", "season_early_spring"],
  },
  excludeIf: { any: ["dd_stores_very_light_yes", "fs_stores_low_yes"] },
  actions: [
    "Reduce draughts and excess space; ensure adequate stores.",
    "Avoid opening the hive unless necessary during cold periods.",
    "If the colony is weak, keep the cluster compact (don’t over-expand).",
    ...basicActions.monitor,
  ],
});

add("dead_varroa_virus_signal_in_dead_route", {
  title: "Varroa/virus pressure possible (deformed wings / crawling)",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: {
    any: ["dd_deformed_wings_yes", "symptom_deformed_wings_yes", "dd_crawling_cant_fly_yes"],
  },
  excludeIf: { any: ["dd_stores_very_light_yes", "fs_stores_low_yes"] },
  actions: [
    "Check Varroa levels if you can (monitoring methods).",
    "Review your seasonal Varroa plan; treat if thresholds indicate.",
    "Avoid combining colonies until you understand what’s happening.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "Increasing numbers of bees with deformed wings.",
    "Rapid population drop alongside deformed wings.",
  ],
});

add("dead_crawling_multi_causes", {
  title: "Crawling / can’t fly — multiple possible causes (stores, cold, varroa/virus, poisoning)",
  severity: "warning",
  urgency: "watch",
  confidence: "low",
  when: { all: ["dd_crawling_cant_fly_yes"] },
  actions: [
    "Check stores (heft), cold spell history, and Varroa/virus signs.",
    "If sudden large losses occur, treat as urgent and document thoroughly.",
    ...basicActions.monitor,
  ],
});

add("dead_small_numbers_normal_context", {
  title: "A few dead bees can be normal housekeeping (context check)",
  severity: "info",
  urgency: "normal",
  confidence: "low",
  when: {
    all: ["route_dead_dying"],
    any: ["onset_speed_slow", "onset_speed_ongoing", "onset_speed_unknown"],
  },
  excludeIf: {
    any: [
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
      "dd_stores_very_light_yes",
      "fs_stores_low_yes",
    ],
  },
  actions: [
    "A small number of dead bees at the entrance can be normal.",
    "If numbers rise quickly, re-run this check with updated observations.",
    ...basicActions.monitor,
  ],
});

add("dead_small_numbers_normal_context_unsure", {
  title: "A few dead bees can be normal housekeeping (context check)",
  severity: "info",
  urgency: "normal",
  confidence: "low",
  when: {
    all: ["route_unsure"],
    any: ["onset_speed_slow", "onset_speed_ongoing", "onset_speed_unknown"],
  },
  excludeIf: {
    any: [
      "dd_piles_dead_bees_yes",
      "dd_crawling_cant_fly_yes",
      "dd_stores_very_light_yes",
      "fs_stores_low_yes",
    ],
  },
  actions: [
    "A small number of dead bees at the entrance can be normal.",
    "If numbers rise quickly, re-run this check with updated observations.",
    ...basicActions.monitor,
  ],
});

// Dead/dying variants by onset (keep these for coverage)
onsets.forEach((o) => {
  add(`dead_onset_${o}_triage`, {
    title: `Dead/dying bees with ${labelOnset(o)} onset — prioritise immediate checks`,
    severity: o === "sudden" ? "warning" : "info",
    urgency: o === "sudden" ? "urgent" : "watch",
    confidence: "low",
    when: { all: ["route_dead_dying", `onset_speed_${o}`] },
    actions: [
      "Confirm stores (heft), cold exposure, and Varroa/virus signs.",
      "If you suspect poisoning, document symptoms and timing promptly.",
      ...basicActions.monitor,
    ],
  });
});

 // -------------------------
// I) TEMPERAMENT (core)
// -------------------------
add("temperament_weather_defensive", {
  title: "Defensiveness likely due to poor weather",
  severity: "info",
  urgency: "normal",
  confidence: "strong",
  when: { all: ["tm_weather_windy_yes"] },
  actions: [
    "Avoid inspections in poor weather. Re-test temperament on a warm calm day.",
    "Use more smoke and minimise time with frames exposed.",
    ...basicActions.monitor,
  ],
});

add("temperament_robbery_related", {
  title: "Defensiveness likely linked to robbing pressure",
  severity: "warning",
  urgency: "urgent",
  confidence: "strong",
  when: { any: ["tm_robbery_pressure_yes", "fs_robbery_signs_yes", "ea_fighting_rolling_yes"] },
  actions: [
    ...basicActions.robbingNow,
    "Avoid exposing honey/syrup during inspections.",
  ],
  whenToWorry: [
    "Sustained fighting at entrance.",
    "Bees pinging/attacking far from the hive (high arousal).",
  ],
});

add("temperament_recent_disturbance_related", {
  title: "Temperament change possibly linked to disturbance (harvest/move/treatment)",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: {
    all: ["route_temperament"],
    any: ["recent_harvest", "recent_move", "recent_treatment"],
  },
  excludeIf: { any: ["tm_robbery_pressure_yes", "fs_robbery_signs_yes"] },
  actions: [
    "Give the colony time to settle after disturbance (a few days).",
    "Keep inspections short and avoid repeated disruption.",
    ...basicActions.monitor,
  ],
});

add("temperament_queen_event_related", {
  title: "Temperament change possibly linked to queen event",
  severity: "info",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["tm_queen_event_yes"] },
  excludeIf: { any: ["tm_robbery_pressure_yes", "fs_robbery_signs_yes"] },
  actions: [
    "Queen events can temporarily disrupt colony behaviour (brood break, re-organisation).",
    "Re-check once the queen situation stabilises.",
    ...basicActions.monitor,
  ],
});

add("temperament_genetics_or_failing_queen_possible", {
  title: "Possible genetics / failing queen contributing to defensiveness (needs pattern check)",
  severity: "warning",
  urgency: "watch",
  confidence: "low",
  when: {
    all: ["route_temperament", "tm_changed_suddenly_no"],
    not: ["tm_weather_windy_yes", "tm_robbery_pressure_yes", "tm_queen_event_yes"],
  },
  actions: [
    "If defensiveness is persistent across good weather and calm conditions, consider queen quality/genetics.",
    "Seek local mentor input before requeening — timing/season matters.",
    "Avoid inspecting without protection; keep sessions short.",
    ...basicActions.monitor,
  ],
  whenToWorry: [
    "Defensiveness persists over multiple calm, warm inspections.",
    "Colony becomes unmanageable/safety risk.",
  ],
});

add("temperament_sudden_change_flag", {
  title: "Sudden temperament change — prioritise robbing/queen loss/disturbance checks",
  severity: "warning",
  urgency: "watch",
  confidence: "medium",
  when: { all: ["route_temperament", "tm_changed_suddenly_yes"] },
  actions: [
    "Sudden changes are often situational (robbing pressure, queen event, disturbance, weather).",
    "Check entrance behaviour for fighting and review recent changes (move/harvest/treatment).",
    ...basicActions.monitor,
  ],
});

// Temperament variants by season (keep these for coverage)
seasons.forEach((s) => {
  add(`temperament_season_${s}_note`, {
    title: `Temperament context (${labelSeason(s)}) — forage and disturbance can affect behaviour`,
    severity: "info",
    urgency: "normal",
    confidence: "low",
    when: { all: ["route_temperament", `season_${s}`] },
    actions: ["Check robbing/wasp pressure and inspection conditions.", ...basicActions.monitor],
  });
});

// -------------------------
// J) CONTEXT FILLERS (still 120+, but no longer drown real outcomes)
// -------------------------
const routes = [
  "route_entrance_activity",
  "route_queen_brood",
  "route_dead_dying",
  "route_post_mortem",
  "route_feeding_stores",
  "route_comb_building",
  "route_pests_predators",
  "route_brood_disease",
  "route_temperament",
  "route_unsure",
];

let idx = 0;
routes.forEach((r) => {
  seasons.forEach((s) => {
    onsets.forEach((o) => {
      const key = `context_${r}_${s}_${o}_${idx++}`;
      add(key, {
        title: `${prettyRoute(r)} — context guidance (${labelSeason(s)}, ${labelOnset(o)})`,
        severity: "info",
        urgency: o === "sudden" ? "watch" : "normal",
        when: { all: [r, `season_${s}`, `onset_speed_${o}`] },
        // crucial: if ANY meaningful signal exists, skip the generic fillers
        excludeIf: { any: meaningfulSignals },
        actions: [
          "Use the suggested route questions to narrow the cause.",
          "If anything is rapidly worsening, treat as urgent and seek local support.",
          ...basicActions.monitor,
        ],
      });
    });
  });
});

return O;
}

// -------------------------
// Helper labels
// -------------------------
function labelSeason(s) {
  switch (s) {
    case "early_spring":
      return "Early spring";
    case "spring":
      return "Spring";
    case "summer":
      return "Summer";
    case "autumn":
      return "Autumn";
    case "winter":
      return "Winter";
    default:
      return "Unknown season";
  }
}

function labelOnset(o) {
  switch (o) {
    case "sudden":
      return "sudden";
    case "fast":
      return "fast";
    case "slow":
      return "slow";
    case "ongoing":
      return "ongoing";
    default:
      return "unknown";
  }
}

function prettyRoute(r) {
  return String(r || "")
    .replace("route_", "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
