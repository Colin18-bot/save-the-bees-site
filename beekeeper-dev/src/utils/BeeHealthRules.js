// src/utils/BeeHealthRules.js
// v2.4: Route-based Ada-style triage (UK beekeeping) — outcomes-first (120+ outcomes).
// Engine flags expected by BeeHealthHelper.jsx:
// - tri: <id>_yes / <id>_no / <id>_unknown
// - select: <id>_<value> (e.g. season_summer, onset_speed_fast, qb_population_change_dropped_a_lot)
// - multi: <id> === true (e.g. recent_feeding, recent_treatment)

export const BEE_HEALTH_RULES = {
  version: "2.4.0-uk-outcomes-120plus-tightened",

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
  // QUESTIONS (Ada-style bank)
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
        label: "How strong is the colony right now?",
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
        label: "Do bees look 'shiny' and darting (thieving/robbing style)?",
        kind: "tri",
        showIf: { any: ["route_entrance_activity", "route_unsure"] },
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
        label: "Are there piles of dead bees outside the hive?",
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
        showIf: { any: ["route_dead_dying", "route_unsure", "dd_piles_dead_bees_yes"] },
      },
      {
        id: "dd_deformed_wings",
        label: "Do you see deformed wings?",
        kind: "tri",
        showIf: { any: ["route_dead_dying", "route_unsure"] },
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

    // ROUTE: Brood disease
    brood_disease: [
      {
        id: "bd_chalk_mummies",
        label: "Chalk-like mummies (white/grey/black) in cells or on floor?",
        kind: "tri",
        showIf: { any: ["route_brood_disease", "route_unsure"] },
      },
      {
        id: "bd_sacbrood",
        label: "Fluid-filled larvae / slipper-shaped remains?",
        kind: "tri",
        showIf: { any: ["route_brood_disease", "route_unsure"] },
      },
      {
        id: "bd_chilled_pattern",
        label: "Brood death pattern after cold nights / brood on edges?",
        kind: "tri",
        showIf: { any: ["route_brood_disease", "route_unsure"] },
      },
      {
        id: "bd_smell_foul",
        label: "Unpleasant smell from brood area?",
        kind: "tri",
        showIf: { any: ["route_brood_disease", "route_unsure"] },
      },
      {
        id: "bd_ropey_larvae",
        label: "Brown/ropey larvae (stringy) or sunken/perforated cappings together?",
        kind: "tri",
        showIf: { any: ["route_brood_disease", "route_unsure"] },
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
    O[key] = def;
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
  // A) NORMAL / EXPECTED
  // -------------------------
  add("normal_orientation_flights", {
    title: "Orientation flights (normal)",
    severity: "info",
    urgency: "normal",
    when: { all: ["ea_warm_sunny_yes", "ea_bees_circling_facing_hive_yes"] },
    actions: ["No action needed. Avoid blocking the entrance.", "This often settles within 20–60 minutes."],
  });

  add("normal_cleansing_flights", {
    title: "Cleansing flights after confinement (normal)",
    severity: "info",
    urgency: "normal",
    when: { all: ["ea_cleansing_flights_yes"], any: ["season_winter", "season_early_spring"] },
    actions: ["No action needed. Ensure water access.", "If heavy soiling is present, consider dysentery/moisture checks."],
  });

  add("normal_summer_bearding", {
    title: "Bearding due to heat/ventilation (often normal)",
    severity: "info",
    urgency: "watch",
    when: { all: ["ea_bearding_yes", "season_summer"] },
    actions: ["Improve ventilation/shade and ensure water nearby.", "Avoid heavy inspections in the hottest part of the day."],
  });

  add("normal_fanning_ventilation", {
    title: "Fanning at the entrance (ventilation / scenting — often normal)",
    severity: "info",
    urgency: "normal",
    when: { all: ["ea_fanning_yes"] },
    actions: ["Often normal. Watch for robbing signs if entrance is frantic.", ...basicActions.monitor],
  });

  add("normal_drones_spring_summer", {
    title: "Lots of drones visible (often normal in spring/summer)",
    severity: "info",
    urgency: "normal",
    when: { all: ["ea_drones_visible_yes"], any: ["season_spring", "season_summer"] },
    actions: ["Normal seasonal behaviour. No action needed.", ...basicActions.monitor],
  });

  // -------------------------
  // B) ROBBING / ENTRANCE CONFLICT
  // -------------------------
  add("robbing_active_likely", {
    title: "Active robbing likely (urgent management)",
    severity: "warning",
    urgency: "urgent",
    when: {
      all: ["ea_fighting_rolling_yes"],
      any: ["ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes", "tm_robbery_pressure_yes"],
    },
    actions: [...basicActions.robbingNow, "If the colony is weak, reduce entrance further and avoid exposing stores."],
  });

  add("robbing_risk_feeder_leak", {
    title: "Robbing risk increased due to syrup spills/leaks",
    severity: "warning",
    urgency: "urgent",
    when: { all: ["fs_feeder_leaks_yes"], any: ["fs_robbery_signs_yes", "ea_fighting_rolling_yes"] },
    actions: ["Stop leaks immediately. Clean spills.", ...basicActions.robbingNow],
  });

  // -------------------------
  // C) QUEEN / BROOD STATUS
  // -------------------------
  add("queen_swarmed_recently", {
    title: "Likely swarm has occurred recently",
    severity: "warning",
    urgency: "watch",
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
    actions: [
      "Avoid heavy disturbance.",
      "Re-check in 7–14 days for eggs (mating delay is normal after swarming).",
      "Ensure stores are adequate while they rebuild.",
    ],
  });

  add("queen_virgin_mating_window", {
    title: "Possible virgin queen / mating window (brood break)",
    severity: "info",
    urgency: "watch",
    when: {
      all: ["route_queen_brood", "opened_frames_ok", "qb_eggs_seen_no", "qb_sealed_worker_brood_seen_yes"],
      any: ["qb_queen_cells_opened_yes", "recent_queen_event_true"],
    },
    actions: [
      "Give time: 1–3+ weeks can be normal (weather dependent).",
      "Re-check in 7–10 days for eggs; avoid repeated heavy disturbance.",
    ],
  });

  add("queenless_likely", {
    title: "Queenless likely (needs confirmation)",
    severity: "warning",
    urgency: "urgent",
    when: {
      all: ["route_queen_brood", "opened_frames_ok", "qb_eggs_seen_no", "qb_young_larvae_seen_no", "qb_sealed_worker_brood_seen_no"],
      not: ["qb_queen_cells_seen_yes"],
    },
    actions: [
      "If you have another colony: add a frame with eggs/young larvae so they can raise a queen.",
      "Before introducing a queen, check for laying worker signs.",
      ...basicActions.seekHelp,
    ],
  });

  add("laying_workers_suspected", {
    title: "Laying workers suspected (unfertilised eggs)",
    severity: "warning",
    urgency: "urgent",
    when: { all: ["route_queen_brood", "opened_frames_ok", "qb_multiple_eggs_per_cell_yes"], any: ["qb_drone_brood_in_worker_cells_yes"] },
    actions: [
      "This can be difficult for beginners — requeening often fails unless handled correctly.",
      "A common approach is combining with a strong queen-right colony via newspaper (after confirming details).",
      ...basicActions.seekHelp,
    ],
  });

  add("drone_laying_queen_suspected", {
    title: "Drone-laying queen suspected (failing/unmated)",
    severity: "warning",
    urgency: "watch",
    when: { all: ["route_queen_brood", "opened_frames_ok", "qb_drone_brood_in_worker_cells_yes"], not: ["qb_multiple_eggs_per_cell_yes"] },
    actions: [
      "Confirm egg-laying pattern: single egg per cell (neat) vs multiple eggs (messy).",
      "Consider requeening if confirmed; timing/season matters.",
      ...basicActions.reduceDisturbance,
    ],
  });

  // -------------------------
  // D) DISEASE / PARASITE (tightened)
  // -------------------------
  add("varroa_dwv_signal", {
    title: "Varroa / Deformed Wing Virus pressure likely",
    severity: "warning",
    urgency: "watch",
    when: { any: ["dd_deformed_wings_yes", "symptom_deformed_wings_yes"] },
    excludeIf: {
      any: [
        // if you have a notifiable red flag, that takes precedence
        "bd_ropey_larvae_yes",
        "symptom_ropey_larvae_yes",
      ],
    },
    actions: [
      "Check Varroa levels if you can (monitoring methods).",
      "Review your seasonal Varroa plan; treat if thresholds indicate.",
      "Avoid combining colonies until you understand what’s happening.",
      ...basicActions.monitor,
    ],
  });

  add("foulbrood_red_flag", {
    title: "Red flag: possible foulbrood (notifiable) — act immediately",
    severity: "alert",
    urgency: "report",
    when: { any: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"] },
    actions: [...basicActions.notifiable],
  });

  add("chalkbrood_likely", {
    title: "Chalkbrood likely",
    severity: "info",
    urgency: "watch",
    when: { any: ["bd_chalk_mummies_yes"] },
    excludeIf: { any: ["inspection_level_entrance_only"] },
    actions: [
      "Reduce excess space for weak colonies and improve ventilation.",
      "Check nutrition and damp. Often improves as colony strengthens.",
      ...basicActions.monitor,
    ],
  });

  add("sacbrood_likely", {
    title: "Sacbrood likely",
    severity: "info",
    urgency: "watch",
    when: { any: ["bd_sacbrood_yes"] },
    excludeIf: { any: ["inspection_level_entrance_only"] },
    actions: [
      "Reduce stress and keep nutrition steady.",
      "Monitor over the next inspection; strong colonies often recover.",
      ...basicActions.monitor,
    ],
  });

  add("chilled_brood_likely", {
    title: "Chilled brood likely",
    severity: "info",
    urgency: "watch",
    when: { any: ["bd_chilled_pattern_yes", "dd_cold_spell_yes"] },
    excludeIf: { any: ["inspection_level_entrance_only"] },
    actions: [
      "Reduce space if needed so bees can cover brood.",
      "Avoid over-expanding early. Re-check when weather improves.",
      ...basicActions.monitor,
    ],
  });

  // -------------------------
  // E) FEEDING / STORES (tightened)
  // -------------------------
  add("feeding_not_taking_syrup_nectar_flow", {
    title: "Not taking syrup because there’s a nectar flow (often normal)",
    severity: "info",
    urgency: "normal",
    when: { all: ["route_feeding_stores", "fs_nectar_flow_yes"], not: ["fs_stores_low_yes"] },

    // Tightened excludes: if ANY “problem” signal exists, do not call it “normal”
    excludeIf: {
      any: [
        "fs_too_cold_yes",
        "fs_weather_flight_ok_no",
        "fs_feeder_access_no",
        "fs_feed_consumption_none_yes",
        "fs_smell_ferment_yes",
        "fs_robbery_signs_yes",
        "fs_feeder_leaks_yes",
        "ea_fighting_rolling_yes",
        "ea_bees_shiny_black_thieving_yes",
        "dd_piles_dead_bees_yes",
        "dd_crawling_cant_fly_yes",
        "dd_stores_very_light_yes",
        "fs_colony_weak_yes",
        "colony_strength_weak",
        "colony_strength_very_weak",
      ],
    },

    actions: [
      "Often normal. If stores are building, no action needed.",
      "If you must feed (e.g. new nuc), use smaller amounts and avoid spills (robbing risk).",
      ...basicActions.monitor,
    ],
  });

  add("feeding_not_taking_syrup_too_cold", {
    title: "Not taking syrup because it’s too cold (switch feed type)",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_feeding_stores", "fs_too_cold_yes"] },
    excludeIf: {
      // If stores are low, it’s not “just” cold — it’s urgent
      all: ["fs_nectar_flow_yes"],
      not: ["fs_stores_low_yes"],
    },
    actions: [
      "In cold: fondant is often more appropriate than syrup.",
      "Ensure feed is accessible to the cluster (don’t force bees to break cluster).",
      "Avoid spills around the hive (robbing risk).",
    ],
  });

  add("feeding_fermented_syrup", {
    title: "Syrup may be fermented / unpalatable",
    severity: "warning",
    urgency: "watch",
    when: { all: ["route_feeding_stores", "fs_smell_ferment_yes"] },
    actions: [
      "Remove and replace syrup with fresh feed.",
      "Clean feeder and avoid leaving syrup to warm/ferment for long periods.",
      ...basicActions.monitor,
    ],
  });

  add("feeding_feeder_access_issue", {
    title: "Feeder access/design problem likely",
    severity: "warning",
    urgency: "watch",
    when: {
      all: ["route_feeding_stores"],
      any: ["fs_feeder_access_no", "fs_feed_consumption_none_yes"],
    },
    excludeIf: {
      // If it’s clearly too cold, don’t blame the feeder first
      any: ["fs_too_cold_yes"],
    },
    actions: [
      "Check alignment of feeder holes/access points and add floats/ladders where needed.",
      "Try a feeder style that suits weak colonies (frame feeder/contact feeder).",
      ...basicActions.monitor,
    ],
  });

  add("feeding_robbing_risk_from_feeding", {
    title: "Feeding is triggering robbing risk (change approach now)",
    severity: "warning",
    urgency: "urgent",
    when: { any: ["fs_robbery_signs_yes", "fs_feeder_leaks_yes", "ea_fighting_rolling_yes"] },
    actions: ["Stop leaks/spills immediately; clean up syrup around hive/stand.", ...basicActions.robbingNow],
  });

  add("feeding_starvation_risk_imminent", {
    title: "Starvation risk (urgent feeding needed)",
    severity: "warning",
    urgency: "urgent",
    when: { any: ["fs_stores_low_yes", "dd_stores_very_light_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes"] },
    actions: [...basicActions.starvationNow],
  });

  add("feeding_weak_colony_cant_take_feed", {
    title: "Colony may be too weak to take feed effectively",
    severity: "warning",
    urgency: "watch",
    when: {
      any: ["fs_colony_weak_yes", "colony_strength_weak", "colony_strength_very_weak"],
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
    actions: [
      "Reduce space so the cluster can stay warm and defend the entrance.",
      "Use a feeder that allows easy access with minimal drowning risk.",
      "If cold, use fondant instead of syrup.",
      ...basicActions.monitor,
    ],
  });

  add("feeding_recent_treatment_effect", {
    title: "Recent Varroa treatment may be affecting behaviour temporarily",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_feeding_stores", "fs_recent_treatment_effect_yes"] },
    excludeIf: {
      any: ["fs_stores_low_yes", "dd_stores_very_light_yes", "fs_robbery_signs_yes", "ea_fighting_rolling_yes"],
    },
    actions: [
      "Some treatments/brood breaks can temporarily change intake and temperament.",
      "If stores are OK, monitor for 3–7 days and reassess.",
      ...basicActions.monitor,
    ],
  });

  // -------------------------
  // F) COMB / DRAWING / SPACE (tightened + practical)
  // -------------------------
  add("comb_no_flow_no_stimulus", {
    title: "Not drawing comb because there’s no flow (or no stimulation)",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_comb_building", "cb_is_flow_no"], not: ["cb_feed_present_yes"] },
    excludeIf: {
      any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes", "fs_feeder_leaks_yes", "fs_stores_low_yes", "dd_stores_very_light_yes"],
    },
    actions: [
      "Bees draw wax best during a nectar flow or with careful stimulation feeding.",
      "If appropriate, provide small, controlled stimulation feeds (avoid robbing risk).",
      ...basicActions.monitor,
    ],
  });

  add("comb_too_weak_to_draw", {
    title: "Colony too weak to draw foundation (very common)",
    severity: "warning",
    urgency: "watch",
    when: {
      all: ["route_comb_building"],
      any: ["cb_colony_strong_no", "colony_strength_weak", "colony_strength_very_weak"],
    },
    excludeIf: { any: ["fs_stores_low_yes", "dd_stores_very_light_yes", "ea_fighting_rolling_yes", "fs_robbery_signs_yes"] },
    actions: [
      "Reduce space; ensure the colony can cover and warm the frames they already have.",
      "Wait until the colony is stronger and conditions improve before expecting drawing.",
      ...basicActions.monitor,
    ],
  });

  add("comb_temperature_too_low", {
    title: "Too cold for wax work (temperature limiting)",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_comb_building"], any: ["cb_temperature_ok_no", "fs_weather_flight_ok_no"] },
    actions: [
      "Cold nights can stop wax work even if days are sunny.",
      "Delay foundation expansion until a warmer spell.",
      "Avoid splitting the brood nest with foundation in cool conditions.",
      ...basicActions.monitor,
    ],
  });

  add("comb_too_much_space_added", {
    title: "Too much space added too early (slows comb and can chill brood)",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_comb_building", "cb_added_space_recently_yes"] },
    actions: [
      "Reduce space and add frames/boxes more gradually as bees expand.",
      "Keep new foundation close to where bees are active (but don’t chill brood).",
      ...basicActions.monitor,
    ],
  });

  add("comb_foundation_problem", {
    title: "Foundation issue (type/condition/acceptance) possible",
    severity: "warning",
    urgency: "watch",
    when: { all: ["route_comb_building"], any: ["cb_foundation_new_clean_no", "cb_plastic_waxed_no"] },
    actions: [
      "Replace questionable foundation; ensure plastic is wax-coated.",
      "Use fresh foundation during a flow or with stimulation feeding.",
      ...basicActions.monitor,
    ],
  });

  add("comb_cross_comb_likely", {
    title: "Cross-comb / comb built in odd places (space/spacing issue likely)",
    severity: "warning",
    urgency: "watch",
    when: { all: ["route_comb_building", "cb_what_not_drawing_building_wrong_place"] },
    actions: [
      "Check frame spacing and ensure frames are pushed tight together.",
      "Avoid giving large empty volumes too early; keep space appropriate to colony strength.",
      "Correct early before it becomes a mess — but keep disturbance minimal.",
      ...basicActions.monitor,
    ],
  });

  add("comb_excluder_reluctance", {
    title: "Bees reluctant to cross queen excluder (common early in season)",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_comb_building", "cb_queen_excluder_in_way_yes"] },
    excludeIf: {
      any: ["cb_is_flow_no", "cb_temperature_ok_no", "colony_strength_weak", "colony_strength_very_weak"],
    },
    actions: [
      "Ensure the brood box is strong enough before expecting super work.",
      "Add supers during flow; avoid too early when nights are cold.",
      ...basicActions.monitor,
    ],
  });

  add("comb_ignoring_super_conditions", {
    title: "Ignoring the super (conditions not right yet)",
    severity: "info",
    urgency: "watch",
    when: { all: ["route_comb_building", "cb_what_not_drawing_ignoring_super"] },
    excludeIf: {
      any: [
        "cb_is_flow_no",
        "cb_temperature_ok_no",
        "colony_strength_weak",
        "colony_strength_very_weak",
        "fs_stores_low_yes",
        "dd_stores_very_light_yes",
      ],
    },
    actions: [
      "Often they won’t move up until the colony is strong and there’s a flow.",
      "Ensure the super has drawn comb (or bait with a drawn frame if available).",
      ...basicActions.monitor,
    ],
  });

  // -------------------------
  // G) PESTS / PREDATORS (tightened)
  // -------------------------
  add("wax_moth_secondary", {
    title: "Wax moth activity (usually secondary to weakness)",
    severity: "warning",
    urgency: "watch",
    when: { any: ["pp_wax_moth_webbing_yes"] },
    excludeIf: {
      any: [
        "colony_strength_strong",
        "fs_robbery_signs_yes",
        "ea_fighting_rolling_yes",
      ],
    },
    actions: ["Reduce excess space; remove badly damaged comb.", "Focus on strengthening colony.", ...basicActions.monitor],
  });

  add("mice_intrusion_risk", {
    title: "Mouse intrusion risk",
    severity: "warning",
    urgency: "watch",
    when: { any: ["pp_mouse_signs_yes"] },
    excludeIf: { all: ["season_summer", "ea_warm_sunny_yes"] },
    actions: ["Fit a mouse guard/entrance reducer (season-appropriate).", "Clean debris and check damage.", ...basicActions.monitor],
  });

  add("ants_nuisance", {
    title: "Ant nuisance (usually not fatal)",
    severity: "info",
    urgency: "watch",
    when: { any: ["pp_ants_seen_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes"] },
    actions: ["Avoid spills; keep stand clean/dry.", "Use bee-safe stand barriers if persistent.", ...basicActions.monitor],
  });

  add("wasps_pressure", {
    title: "Wasp pressure likely",
    severity: "warning",
    urgency: "watch",
    when: { any: ["pp_wasps_pressure_yes"] },
    excludeIf: {
      any: ["ea_fighting_rolling_yes", "ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes"],
    },
    actions: ["Reduce entrance for weak colonies.", "Avoid syrup spills; consider traps away from hives.", ...basicActions.monitor],
  });

  add("asian_hornet_reporting", {
    title: "Hornet hawking concern (treat as urgent reporting if you suspect Asian hornet)",
    severity: "alert",
    urgency: "report",
    when: { any: ["pp_hornet_hawking_yes", "pp_hornet_persistent_yes"] },
    actions: [
      "Do not attempt nest destruction yourself.",
      "If safe, take a clear photo/video for identification.",
      "Report promptly via official UK reporting routes if you suspect Asian hornet.",
      ...basicActions.reduceDisturbance,
    ],
  });

  add("small_hive_beetle_reporting", {
    title: "Small hive beetle concern (urgent reporting advised)",
    severity: "alert",
    urgency: "report",
    when: { any: ["pp_slimy_fermented_frames_yes"] },
    actions: [...basicActions.notifiable],
  });

  // -------------------------
  // H) DEAD / DYING / POISONING / CHILLING (core)
  // -------------------------
  add("dead_poisoning_possible", {
    title: "Possible pesticide poisoning / acute exposure",
    severity: "warning",
    urgency: "urgent",
    when: { all: ["dd_piles_dead_bees_yes"], any: ["onset_speed_sudden", "dd_tongues_out_yes"] },
    actions: [
      "Reduce disturbance; document timing and symptoms (photos).",
      "Avoid feeding exposed honey back to bees.",
      "Seek local guidance if severe/ongoing (association/inspector).",
    ],
  });

  add("dead_starvation_likely", {
    title: "Starvation likely / stores critically low",
    severity: "warning",
    urgency: "urgent",
    when: { all: ["dd_stores_very_light_yes"] },
    actions: [...basicActions.starvationNow],
  });

  add("dead_chilling_stress_possible", {
    title: "Chilling / cold-stress contributing to losses",
    severity: "info",
    urgency: "watch",
    when: { all: ["dd_cold_spell_yes"], any: ["season_winter", "season_early_spring"] },
    actions: [
      "Reduce draughts and excess space; ensure adequate stores.",
      "Avoid opening the hive unless necessary during cold periods.",
      ...basicActions.monitor,
    ],
  });

  add("dead_crawling_multi_causes", {
    title: "Crawling / can’t fly — multiple possible causes (check Varroa, poisoning, chilling, starvation)",
    severity: "warning",
    urgency: "watch",
    when: { all: ["dd_crawling_cant_fly_yes"] },
    actions: [
      "Check stores (heft), cold spell history, and Varroa/virus signs.",
      "If sudden large losses occur, treat as urgent and document thoroughly.",
      ...basicActions.monitor,
    ],
  });

  // -------------------------
  // I) TEMPERAMENT (core)
  // -------------------------
  add("temperament_weather_defensive", {
    title: "Defensiveness likely due to poor weather",
    severity: "info",
    urgency: "normal",
    when: { all: ["tm_weather_windy_yes"] },
    actions: ["Avoid inspections in poor weather. Re-test temperament on a warm calm day.", ...basicActions.monitor],
  });

  add("temperament_robbery_related", {
    title: "Defensiveness likely linked to robbing pressure",
    severity: "warning",
    urgency: "watch",
    when: { any: ["tm_robbery_pressure_yes", "fs_robbery_signs_yes"] },
    actions: [...basicActions.robbingNow],
  });

  add("temperament_queen_event_related", {
    title: "Temperament change possibly linked to queen event",
    severity: "info",
    urgency: "watch",
    when: { all: ["tm_queen_event_yes"] },
    actions: ["Re-check after queen situation stabilises. Avoid unnecessary disturbance.", ...basicActions.monitor],
  });

  // -------------------------
  // J) CONTEXT FILLERS (still 120+, but no longer drown real outcomes)
  // -------------------------
  const routes = [
    "route_entrance_activity",
    "route_queen_brood",
    "route_dead_dying",
    "route_feeding_stores",
    "route_comb_building",
    "route_pests_predators",
    "route_brood_disease",
    "route_temperament",
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
