const BEE_HEALTH_RULES = {
  version: "2.5.1-uk-post-mortem-varroa-update-fixed",
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
  confidence: {
    veryLikely: { label: "Very likely", minOver: 3 },
    likely: { label: "Likely", minOver: 1 },
    possible: { label: "Possible", minOver: 0 },
  },
  routes: [
    { id: "route_entrance_activity", label: "Lots of flying / unusual entrance activity", description: "Orientation flights, robbing, wasps/hornets, bearding, cleansing flights, drones, etc." },
    { id: "route_queen_brood", label: "Eggs / brood / queen concerns", description: "No eggs, odd brood pattern, queen cells, drone brood, laying workers, swarming, supersedure, etc." },
    { id: "route_dead_dying", label: "Dead/dying bees / crawling / can’t fly", description: "Poisoning suspicion, starvation, chilling, disease, varroa/virus signs, etc." },
    { id: "route_post_mortem", label: "Colony has died / empty hive / post-mortem", description: "Winter losses, starvation, isolation starvation, wasp attack, robbing, varroa-related collapse, absconding, etc." },
    { id: "route_feeding_stores", label: "Feeding / stores / syrup not taken", description: "Nectar flow vs cold weather, feeder issues, weak colony, robbing risk, starvation risk." },
    { id: "route_comb_building", label: "Comb / drawing foundation / building issues", description: "Strength/flow, stimulation feeding, timing, space, foundation acceptance, temperature." },
    { id: "route_pests_predators", label: "Pests / predators suspected", description: "Wasps, hornets, ants, mice, wax moth, woodpecker, SHB (notifiable), etc." },
    { id: "route_brood_disease", label: "Brood looks diseased / brood symptoms", description: "Chalkbrood, sacbrood, chilled brood, EFB/AFB red flags, etc." },
    { id: "route_temperament", label: "Temperament / aggression changed", description: "Robbing pressure, queen issues, forage dearth, disturbance, genetics, etc." },
    { id: "route_unsure", label: "Not sure / just want help checking", description: "Balanced triage across the main areas." },
  ],
  questions: {
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
        help: "This doesn’t diagnose — it chooses the best question path to start with."
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
        help: "If you haven’t opened the hive, we avoid brood-frame questions."
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
        ]
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
        ]
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
        ]
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
        help: "Optional but powerful: explains odd behaviour (brood break, feeding response, disturbance)."
      },
    ],
    entrance_activity: [
      { id: "ea_warm_sunny", label: "Is it warm and sunny (flight-friendly)?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] } },
      { id: "ea_bees_circling_facing_hive", label: "Are many bees circling and facing the hive (learning flights)?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] }, help: "Typical of orientation flights, especially on warm afternoons." },
      { id: "ea_fighting_rolling", label: "Do you see fighting/rolling bees at the entrance?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] } },
      { id: "ea_bees_shiny_black_thieving", label: "Do bees look 'shiny' and darting (thieving/robbing style)?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] } },
      { id: "ea_bearding", label: "Are lots of bees hanging outside in a beard?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] } },
      { id: "ea_fanning", label: "Are bees fanning at the entrance (wings vibrating)?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] } },
      { id: "ea_cleansing_flights", label: "Do you see many bees doing quick 'toilet flights' and returning?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] }, help: "Common after confinement (winter/poor weather)." },
      { id: "ea_drones_visible", label: "Do you see lots of larger drones coming and going?", kind: "tri", showIf: { any: ["route_entrance_activity", "route_unsure"] } },
    ],

    queen_brood: [
      { id: "qb_opened_hive", label: "Have you opened the hive and looked at frames?", kind: "tri", showIf: { any: ["route_queen_brood", "route_unsure"] } },
      { id: "qb_eggs_seen", label: "Did you see eggs today?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_young_larvae_seen", label: "Did you see young larvae (tiny C-shapes in royal jelly)?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_sealed_worker_brood_seen", label: "Is there sealed worker brood present?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_queen_seen", label: "Did you see the queen today?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_queen_cells_seen", label: "Are there queen cells present?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_queen_cells_opened", label: "Are any queen cells opened (chewed open at bottom/side)?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok", "qb_queen_cells_seen_yes"] } },
      { id: "qb_multiple_queen_cells", label: "Are there lots of queen cells (more than 4–5)?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok", "qb_queen_cells_seen_yes"] } },
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
        ]
      },
      { id: "qb_multiple_eggs_per_cell", label: "Are there multiple eggs per cell (or eggs stuck to side walls)?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_drone_brood_in_worker_cells", label: "Do you see drone brood in worker-sized cells (bullet caps in worker area)?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "qb_brood_pattern_poor", label: "Is the brood pattern patchy/erratic (lots of missed cells)?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      { id: "symptom_deformed_wings", label: "Do you see bees with deformed/shrunken wings?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
      {
        id: "qb_visible_varroa",
        label: "Can you see small red/brown mites (varroa) on adult bees?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
        help: "They look like tiny reddish-brown dots on the bee’s body (often on the thorax or abdomen)."
      },
      {
        id: "qb_varroa_monitoring",
        label: "Have you checked mite levels (e.g. board drop, sugar roll, alcohol wash)?",
        kind: "tri",
        showIf: { all: ["route_queen_brood", "opened_frames_ok"] },
        help: "Even if you can’t see mites on bees, levels can still be high."
      },
      { id: "symptom_ropey_larvae", label: "Do any larvae look brown/ropey (stringy) or smell foul?", kind: "tri", showIf: { all: ["route_queen_brood", "opened_frames_ok"] } },
    ],

    dead_dying: [
      { id: "dd_piles_dead_bees", label: "Are there piles of dead bees (inside the hive or outside at the entrance)?", kind: "tri", showIf: { any: ["route_dead_dying", "route_unsure"] } },
      { id: "dd_crawling_cant_fly", label: "Are many bees crawling / unable to fly?", kind: "tri", showIf: { any: ["route_dead_dying", "route_unsure"] } },
      { id: "dd_tongues_out", label: "Do dead bees have tongues out?", kind: "tri", showIf: { all: ["dd_piles_dead_bees_yes"], any: ["route_dead_dying", "route_unsure"] } },
      { id: "dd_deformed_wings", label: "Do you see deformed wings?", kind: "tri", showIf: { any: ["route_dead_dying", "route_unsure"] } },
      { id: "dd_visible_varroa", label: "Can you see small red/brown mites on adult bees?", kind: "tri", showIf: { any: ["route_dead_dying", "route_unsure"] }, help: "Visible mites on adult bees are a strong clue for significant Varroa pressure." },
      { id: "dd_stores_very_light", label: "Is the hive very light (stores very low) when hefted?", kind: "tri", showIf: { any: ["route_dead_dying", "route_unsure"] } },
      { id: "dd_cold_spell", label: "Has there been a cold spell / prolonged bad weather recently?", kind: "tri", showIf: { any: ["route_dead_dying", "route_unsure"] } },
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
      { id: "pm_wasp_attack_signs", label: "Are there signs of wasp attack or robbing (chewed cappings, debris, torn comb, fighting previously seen)?", kind: "tri", showIf: { all: ["route_post_mortem"] }, help: "A weak colony can be overwhelmed by wasps or robber bees, especially in late summer/autumn." },
      { id: "pm_wasps_seen", label: "Were wasps seen bothering the hive before collapse?", kind: "tri", showIf: { all: ["route_post_mortem"] } },
    ],

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
        help: "This changes what 'normal' looks like (flow vs cold vs weak colony vs autumn)."
      },
      { id: "fs_nectar_flow", label: "Is there a strong nectar flow (bees bringing in lots of nectar/pollen)?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "During a flow, bees often ignore syrup because they're busy bringing in real nectar." },
      { id: "fs_weather_flight_ok", label: "Is it warm enough for flying and normal activity today?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "If it's cold or stormy, bees may not break cluster or take syrup well." },
      { id: "fs_too_cold", label: "Is it too cold for bees to take syrup / for them to break cluster?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "If yes, fondant is usually safer than syrup (depending on season)." },
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
        help: "Different feeds work better in different temperatures and seasons."
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
        help: "Some feeders are easier for weak colonies; leaks can trigger robbing fast."
      },
      { id: "fs_feeder_access", label: "Can bees clearly access the feed (floats/ladders/holes lined up)?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "Misalignment or lack of access is a common reason for 'not taking feed'." },
      { id: "fs_feeder_leaks", label: "Any syrup leaks/spills around the hive/stand?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "Leaks can start robbing within minutes in late summer/autumn." },
      { id: "fs_robbery_signs", label: "Robbing signs (frenzied entrance, fighting, bees darting)?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "If yes, feeding approach must change immediately." },
      { id: "fs_colony_weak", label: "Is the colony weak (few seams / small cluster)?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "Weak colonies may not defend or process syrup well." },
      { id: "fs_stores_low", label: "Are stores low / hive light?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "If yes, treat as urgent regardless of why feeding was started." },
      { id: "fs_feed_consumption_none", label: "Has feed intake been basically zero for 48+ hours?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "This helps separate 'slow' from 'not accessible / too cold / flow'." },
      { id: "fs_smell_ferment", label: "Does the syrup smell sour/fermented or look cloudy?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "Old/fermented syrup can be ignored and can upset bees." },
      { id: "fs_recent_treatment_effect", label: "Was there a Varroa treatment very recently (last 7–10 days)?", kind: "tri", showIf: { any: ["route_feeding_stores", "route_unsure"] }, help: "Some treatments and brood breaks can temporarily alter behaviour and intake." },
    ],

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
        help: "Different causes: strength, temperature, flow, space management, and timing."
      },
      { id: "cb_is_flow", label: "Is there a nectar flow (or are you stimulating with feed)?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Bees draw best during a flow or with appropriate stimulation feeding." },
      { id: "cb_feed_present", label: "Are you currently feeding syrup (stimulation) to encourage drawing?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Small feeds can help — but can increase robbing risk in dearth." },
      { id: "cb_colony_strong", label: "Is the colony strong enough to cover most frames (lots of bees)?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Weak colonies struggle to heat wax and commit workforce to building." },
      { id: "cb_temperature_ok", label: "Is it warm enough for wax work (not chilly / cold nights)?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Cold nights can stop wax work even if days are sunny." },
      { id: "cb_added_space_recently", label: "Have you added lots of space recently (extra box/supers/frames)?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Too much space can slow drawing (harder to heat/defend)." },
      { id: "cb_foundation_new_clean", label: "Is the foundation new/clean (not old/dry/contaminated)?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Old or contaminated foundation can be ignored." },
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
        help: "Plastic often draws better if waxed; foundationless needs correct spacing."
      },
      { id: "cb_plastic_waxed", label: "If plastic foundation: is it wax-coated?", kind: "tri", showIf: { all: ["route_comb_building", "cb_foundation_type_plastic"] }, help: "Unwaxed plastic is commonly ignored." },
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
        help: "Putting foundation in the wrong spot can chill brood or be ignored."
      },
      { id: "cb_congestion", label: "Is the brood box congested (little space, lots of bees)?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Congestion + flow often drives comb building and swarming behaviours." },
      { id: "cb_queen_excluder_in_way", label: "Is there a queen excluder on and they won’t go into the super?", kind: "tri", showIf: { any: ["route_comb_building", "route_unsure"] }, help: "Sometimes bees hesitate to cross an excluder unless conditions are right." },
    ],

    pests_predators: [
      { id: "pp_wasps_pressure", label: "Wasps bothering the entrance (hovering/attempting entry)?", kind: "tri", showIf: { any: ["route_pests_predators", "route_unsure"] } },
      { id: "pp_hornet_hawking", label: "Large hornets 'hawking' at the entrance?", kind: "tri", showIf: { any: ["route_pests_predators", "route_unsure"] } },
      { id: "pp_hornet_persistent", label: "Seen on multiple days / persistent?", kind: "tri", showIf: { any: ["pp_hornet_hawking_yes"] } },
      { id: "pp_wax_moth_webbing", label: "Webbing/tunnels/cocoons on comb?", kind: "tri", showIf: { any: ["route_pests_predators", "route_unsure"] } },
      { id: "pp_mouse_signs", label: "Mouse signs (gnawing, debris, noises, shredded comb)?", kind: "tri", showIf: { any: ["route_pests_predators", "route_unsure"] } },
      { id: "pp_ants_seen", label: "Ants in/around the hive?", kind: "tri", showIf: { any: ["route_pests_predators", "route_unsure"] } },
      { id: "pp_slimy_fermented_frames", label: "Slimy/fermented frames / slime trails (rare but high significance)?", kind: "tri", showIf: { any: ["route_pests_predators", "route_unsure"] } },
    ],

    brood_disease: [
      { id: "bd_chalk_mummies", label: "Chalk-like mummies (white/grey/black) in cells or on floor?", kind: "tri", showIf: { any: ["route_brood_disease", "route_unsure"], not: ["inspection_level_entrance_only"] } },
      { id: "bd_sacbrood", label: "Fluid-filled larvae / slipper-shaped remains?", kind: "tri", showIf: { any: ["route_brood_disease", "route_unsure"], not: ["inspection_level_entrance_only"] } },
      { id: "bd_chilled_pattern", label: "Brood death pattern after cold nights / brood on edges?", kind: "tri", showIf: { any: ["route_brood_disease", "route_unsure"], not: ["inspection_level_entrance_only"] } },
      { id: "bd_smell_foul", label: "Unpleasant smell from brood area?", kind: "tri", showIf: { any: ["route_brood_disease", "route_unsure"], not: ["inspection_level_entrance_only"] } },
      { id: "bd_ropey_larvae", label: "Brown/ropey larvae (stringy) or sunken/perforated cappings together?", kind: "tri", showIf: { any: ["route_brood_disease", "route_unsure"], not: ["inspection_level_entrance_only"] } },
    ],

    temperament: [
      { id: "tm_changed_suddenly", label: "Did aggression change suddenly (rather than gradually)?", kind: "tri", showIf: { any: ["route_temperament", "route_unsure"] } },
      { id: "tm_robbery_pressure", label: "Is robbing pressure present (frenzied entrance, fighting)?", kind: "tri", showIf: { any: ["route_temperament", "route_unsure"] } },
      { id: "tm_queen_event", label: "Was there a recent queen event (supersedure, queen introduced, queen lost)?", kind: "tri", showIf: { any: ["route_temperament", "route_unsure"] } },
      { id: "tm_weather_windy", label: "Is the weather poor/windy/cold (bees defensive)?", kind: "tri", showIf: { any: ["route_temperament", "route_unsure"] } },
    ],
  },

  urgentReporting: [
    { mode: "asian_hornet", label: "Possible Asian hornet activity — urgent reporting advised", any: ["pp_hornet_hawking_yes", "pp_hornet_persistent_yes"] },
    { mode: "shb", label: "Small hive beetle suspicion — urgent reporting advised", any: ["pp_slimy_fermented_frames_yes"] },
    { mode: "foulbrood", label: "Possible foulbrood red flag — do not move equipment", any: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"] },
  ],

  redFlags: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"],
  outcomes: buildOutcomeLibrary(),
};

function buildOutcomeLibrary() {
  const O = {};
  const add = (key, def) => { O[key] = def; };

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

  const meaningfulSignals = [
    "ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_robbery_signs_yes","fs_feeder_leaks_yes","tm_robbery_pressure_yes",
    "fs_stores_low_yes","dd_stores_very_light_yes","dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes","dd_tongues_out_yes",
    "qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","qb_brood_pattern_poor_yes","qb_queen_cells_seen_yes","qb_queen_cells_opened_yes",
    "bd_ropey_larvae_yes","symptom_ropey_larvae_yes","bd_chalk_mummies_yes","bd_sacbrood_yes","bd_chilled_pattern_yes","dd_deformed_wings_yes","symptom_deformed_wings_yes",
    "qb_visible_varroa_yes","dd_visible_varroa_yes","pm_visible_varroa_yes",
    "pm_headfirst_cells_yes","pm_dead_cluster_yes","pm_dysentery_signs_yes","pm_brood_problem_yes","pm_population_dropped_yes","pm_hive_empty_now_yes","pm_wasp_attack_signs_yes","pm_wasps_seen_yes",
    "pp_hornet_hawking_yes","pp_hornet_persistent_yes","pp_slimy_fermented_frames_yes","pp_wax_moth_webbing_yes","pp_mouse_signs_yes",
  ];

  const seasons = ["early_spring", "spring", "summer", "autumn", "winter"];
  const onsets = ["sudden", "fast", "slow", "ongoing"];

  add("normal_orientation_flights", {
    title: "Orientation flights (normal)",
    severity: "info",
    urgency: "normal",
    confidence: "strong",
    when: { all: ["ea_warm_sunny_yes", "ea_bees_circling_facing_hive_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes", "ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes", "pp_wasps_pressure_yes", "pp_hornet_hawking_yes", "dd_piles_dead_bees_yes", "dd_crawling_cant_fly_yes"] },
    actions: ["No action needed. Avoid blocking the entrance.","This often settles within 20–60 minutes (sometimes longer on very warm afternoons).", ...basicActions.monitor],
    nextChecks: ["ea_fighting_rolling", "ea_bees_shiny_black_thieving", "ea_drones_visible"]
  });

  add("normal_cleansing_flights", {
    title: "Cleansing flights after confinement (often normal)",
    severity: "info",
    urgency: "normal",
    confidence: "medium",
    when: { all: ["ea_cleansing_flights_yes"], any: ["season_winter", "season_early_spring"] },
    excludeIf: { any: ["dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes","ea_fighting_rolling_yes","fs_robbery_signs_yes"] },
    actions: ["Often normal after a cold spell or long confinement.","Ensure water access nearby.","If you see heavy soiling at the entrance/frames, consider damp/dysentery risk checks.", ...basicActions.monitor],
    nextChecks: ["dd_piles_dead_bees", "dd_crawling_cant_fly", "dd_cold_spell"]
  });

  add("normal_summer_bearding", {
    title: "Bearding due to heat/ventilation (often normal)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["ea_bearding_yes"], any: ["season_summer", "season_spring"] },
    excludeIf: { any: ["ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_robbery_signs_yes","pp_wasps_pressure_yes","pp_hornet_hawking_yes"] },
    actions: ["Often normal in warm weather. Improve ventilation/shade and ensure water nearby.","Avoid heavy inspections in the hottest part of the day.","If bearding is extreme and ongoing, check congestion and space (supering).", ...basicActions.monitor],
    nextChecks: ["ea_fanning", "season", "colony_strength"]
  });

  add("normal_fanning_ventilation", {
    title: "Fanning at the entrance (ventilation / scenting — often normal)",
    severity: "info",
    urgency: "normal",
    confidence: "low",
    when: { all: ["ea_fanning_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes", "ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes"] },
    actions: ["Often normal ventilation or scenting behaviour.","If the entrance looks frantic or there’s fighting, treat as possible robbing instead.", ...basicActions.monitor],
    nextChecks: ["ea_fighting_rolling", "ea_bees_shiny_black_thieving", "fs_robbery_signs"]
  });

  add("normal_drones_spring_summer", {
    title: "Lots of drones visible (often normal in spring/summer)",
    severity: "info",
    urgency: "normal",
    confidence: "medium",
    when: { all: ["ea_drones_visible_yes"], any: ["season_spring", "season_summer"] },
    excludeIf: { any: ["ea_fighting_rolling_yes", "fs_robbery_signs_yes", "pp_hornet_hawking_yes"] },
    actions: ["Normal seasonal behaviour. No action needed.", ...basicActions.monitor],
    nextChecks: ["season", "ea_fighting_rolling"]
  });

  add("entrance_activity_not_flight_weather", {
    title: "High entrance activity but weather isn’t flight-friendly (check disturbance/feeding/robbery)",
    severity: "warning",
    urgency: "watch",
    confidence: "low",
    when: { all: ["ea_warm_sunny_no"], any: ["recent_harvest", "recent_feeding", "recent_move", "recent_treatment"] },
    actions: ["If it’s not flight weather but the hive is very busy/agitated, consider disturbance or feeding/robbing pressure.","Keep inspections short and avoid exposing honey.", ...basicActions.monitor],
    nextChecks: ["recent_changes", "ea_fighting_rolling", "ea_bees_shiny_black_thieving", "fs_feeder_leaks"]
  });

  add("robbing_active_likely", {
    title: "Active robbing likely (urgent management)",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["ea_fighting_rolling_yes"], any: ["ea_bees_shiny_black_thieving_yes", "fs_robbery_signs_yes", "tm_robbery_pressure_yes"] },
    excludeIf: { any: ["pp_hornet_hawking_yes"] },
    actions: [...basicActions.robbingNow, "If the colony is weak, reduce entrance further and avoid exposing stores.", "If robbing is intense: consider a robbing screen and stop any open feeding immediately."],
    nextChecks: ["fs_feeder_leaks", "fs_robbery_signs", "pp_wasps_pressure", "pp_hornet_hawking", "colony_strength"]
  });

  add("robbing_risk_feeder_leak", {
    title: "Robbing risk increased due to syrup spills/leaks",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["fs_feeder_leaks_yes"], any: ["fs_robbery_signs_yes", "ea_fighting_rolling_yes"] },
    actions: ["Stop leaks immediately. Clean spills.", ...basicActions.robbingNow],
    nextChecks: ["fs_feeder_leaks", "fs_feeder_access", "fs_feeder_type"]
  });

  add("wasp_pressure_entrance", {
    title: "Wasp pressure at the entrance (can look like 'constant fighting')",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["pp_wasps_pressure_yes"] },
    excludeIf: { any: ["pp_hornet_hawking_yes"] },
    actions: ["Reduce entrance for weak colonies; keep the colony able to defend.","Avoid syrup spills and keep feeding internal and discreet.","Consider traps away from the apiary (avoid attracting wasps to the hive line).", ...basicActions.monitor],
    nextChecks: ["ea_fighting_rolling", "colony_strength", "fs_feeder_leaks"]
  });

  add("hornet_pressure_entrance", {
    title: "Hornet hawking pressure at the entrance (treat as urgent if Asian hornet suspected)",
    severity: "alert",
    urgency: "report",
    confidence: "medium",
    when: { any: ["pp_hornet_hawking_yes", "pp_hornet_persistent_yes"] },
    actions: ["If safe, take a clear photo/video for identification.","Do not attempt nest destruction yourself.","Report promptly via official UK routes if you suspect Asian hornet.", ...basicActions.reduceDisturbance],
    nextChecks: ["pp_hornet_hawking", "pp_hornet_persistent", "pp_wasps_pressure"]
  });

  add("queen_swarmed_recently", {
    title: "Likely swarm has occurred recently",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_eggs_seen_no","qb_sealed_worker_brood_seen_yes","qb_population_change_dropped_a_lot"], any: ["qb_queen_cells_seen_yes","qb_queen_cells_opened_yes"] },
    excludeIf: { any: ["qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["No eggs but sealed worker brood still present suggests a brood break (common post-swarm).","A big drop in adult bees supports a swarm event.","Queen cells (especially opened) fit a recent queen turnover."],
    actions: ["Avoid heavy disturbance — let the colony stabilise.","Re-check in 7–14 days for eggs (mating delay after swarming is normal).","Ensure stores are adequate while they rebuild.", ...basicActions.monitor],
    whenToWorry: ["If there are still no eggs after ~3 weeks of suitable flying weather.","If the colony is very weak and being robbed/pressured."],
    nextChecks: ["qb_queen_cells_opened", "qb_young_larvae_seen", "qb_population_change"]
  });

  add("queen_virgin_mating_window", {
    title: "Possible virgin queen / mating window (brood break)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_eggs_seen_no","qb_sealed_worker_brood_seen_yes"], any: ["qb_queen_cells_opened_yes","recent_queen_event"] },
    excludeIf: { any: ["qb_population_change_dropped_a_lot","qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["Sealed brood without eggs can simply mean the old queen has gone and the new one hasn’t started laying yet.","Mating delays are common, especially if weather has been poor."],
    actions: ["Give time: 1–3+ weeks can be normal (weather dependent).","Re-check in 7–10 days for eggs; avoid repeated heavy disturbance.","Keep stores steady so they don’t stall.", ...basicActions.monitor],
    whenToWorry: ["If there are no eggs after ~3 weeks of decent flying weather.","If the colony is shrinking rapidly or shows laying worker signs."],
    nextChecks: ["qb_eggs_seen", "qb_queen_cells_seen", "qb_population_change"]
  });

  add("queen_supersedure_underway", {
    title: "Supersedure likely underway (queen being replaced)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_queen_cells_seen_yes"], any: ["qb_brood_pattern_poor_yes","qb_population_change_about_same","qb_population_change_slightly_down","recent_queen_event"] },
    excludeIf: { any: ["qb_population_change_dropped_a_lot","qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["Queen cells plus an otherwise ‘not collapsed’ colony often fits supersedure rather than a swarm.","Patchy brood pattern can trigger replacement of a failing queen."],
    actions: ["Avoid heavy manipulation while queen replacement is in progress.","Re-check in 7–14 days for eggs and improving brood pattern.","Keep a close eye on stores during the changeover.", ...basicActions.monitor],
    whenToWorry: ["If the colony becomes suddenly very weak or you see multiple eggs per cell / drone brood in worker cells."],
    nextChecks: ["qb_brood_pattern_poor", "qb_eggs_seen", "qb_population_change"]
  });

  add("queen_failing_or_poor_queen", {
    title: "Failing / poor queen likely (patchy brood pattern)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_brood_pattern_poor_yes"], any: ["qb_eggs_seen_yes","qb_young_larvae_seen_yes","qb_sealed_worker_brood_seen_yes"] },
    excludeIf: { any: ["qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["A patchy/erratic brood pattern can indicate an ageing queen, poor mating, or stress.","It can also occur with Varroa/virus pressure — keep that in mind if wings are deformed."],
    actions: ["If you can: check Varroa/virus signals (especially if deformed wings are present).","Consider requeening if pattern stays poor across 2 inspections (season dependent).","Keep disturbance minimal and ensure steady stores.", ...basicActions.monitor],
    whenToWorry: ["If brood pattern worsens quickly or colony population drops noticeably."],
    nextChecks: ["symptom_deformed_wings", "qb_population_change", "qb_queen_cells_seen"]
  });

  add("queenless_likely", {
    title: "Queenless likely (needs confirmation)",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_eggs_seen_no","qb_young_larvae_seen_no","qb_sealed_worker_brood_seen_no"], not: ["qb_queen_cells_seen_yes"] },
    excludeIf: { any: ["qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["No eggs, no larvae, and no sealed brood suggests no functioning queen and no recent brood.","No queen cells present suggests they may be unable to raise a new queen."],
    actions: ["If you have another colony: add a frame with eggs/young larvae (so they can raise a queen).","Before introducing a queen, check for laying worker signs.", ...basicActions.seekHelp],
    whenToWorry: ["If the colony is getting very small or is being robbed/pressured — act quickly."],
    nextChecks: ["qb_multiple_eggs_per_cell", "qb_drone_brood_in_worker_cells", "qb_queen_cells_seen"]
  });

  add("queenless_possible_brood_break", {
    title: "Possible brood break / queen status unclear (re-check soon)",
    severity: "info",
    urgency: "watch",
    confidence: "low",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_eggs_seen_no"], any: ["qb_young_larvae_seen_no","qb_sealed_worker_brood_seen_yes","qb_queen_cells_seen_yes"] },
    excludeIf: { any: ["qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["Some scenarios look similar at first glance: swarmed, supersedure, virgin queen delay, or queen loss.","A timed re-check is often the safest move before doing something irreversible."],
    actions: ["Re-check in 7–10 days for eggs and young larvae.","Avoid heavy disturbance in the meantime.","Keep stores steady while you wait.", ...basicActions.monitor],
    whenToWorry: ["If the population collapses rapidly or you start seeing multiple eggs per cell."],
    nextChecks: ["qb_young_larvae_seen", "qb_sealed_worker_brood_seen", "qb_population_change"]
  });

  add("laying_workers_suspected", {
    title: "Laying workers suspected (unfertilised eggs)",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_multiple_eggs_per_cell_yes"], any: ["qb_drone_brood_in_worker_cells_yes","qb_eggs_seen_yes"] },
    excludeIf: { any: ["qb_queen_seen_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["Multiple eggs per cell and eggs on side walls often indicate worker laying after prolonged queenlessness.","This can be difficult to fix without a strong queen-right colony or experienced handling."],
    actions: ["This is tricky for beginners — requeening often fails unless managed carefully.","Common approaches: combine with a strong queen-right colony via newspaper (after confirming details).","Get local help before doing irreversible steps.", ...basicActions.seekHelp],
    whenToWorry: ["If the colony is very weak or being robbed — urgency increases quickly."],
    nextChecks: ["qb_drone_brood_in_worker_cells", "qb_queen_seen", "qb_population_change"]
  });

  add("drone_laying_queen_suspected", {
    title: "Drone-laying queen suspected (failing/unmated queen)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_drone_brood_in_worker_cells_yes"], not: ["qb_multiple_eggs_per_cell_yes"] },
    excludeIf: { any: ["symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["Drone brood in worker-sized cells can indicate a queen laying only unfertilised eggs.","If eggs are mostly single and well-placed, it points more to a queen than workers."],
    actions: ["Confirm egg pattern: single egg per cell vs multiple eggs (messy).","Consider requeening if confirmed; timing/season matters.", ...basicActions.monitor],
    whenToWorry: ["If population drops and no worker brood is being produced."],
    nextChecks: ["qb_multiple_eggs_per_cell", "qb_eggs_seen", "qb_population_change"]
  });

  add("queen_brood_break_after_treatment_or_disturbance", {
    title: "Brood break / disruption after treatment or disturbance (possible)",
    severity: "info",
    urgency: "watch",
    confidence: "low",
    when: { all: ["route_queen_brood","opened_frames_ok","qb_eggs_seen_no"], any: ["recent_treatment","recent_harvest","recent_move","recent_queen_event"] },
    excludeIf: { any: ["qb_multiple_eggs_per_cell_yes","qb_drone_brood_in_worker_cells_yes","symptom_ropey_larvae_yes","bd_ropey_larvae_yes"] },
    why: ["Treatments, moves, harvest disturbance, or queen events can temporarily interrupt laying or make it harder to spot eggs."],
    actions: ["Re-check in 7–10 days for eggs and young larvae.","Keep handling minimal until you see the brood cycle re-establish.", ...basicActions.monitor],
    nextChecks: ["qb_young_larvae_seen", "qb_eggs_seen", "qb_sealed_worker_brood_seen"]
  });

  add("queen_varroa_monitoring_not_done", {
    title: "Varroa levels have not been checked yet (important next step)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: {
      all: ["route_queen_brood", "opened_frames_ok"],
      any: ["qb_varroa_monitoring_no", "qb_varroa_monitoring_unknown"]
    },
    excludeIf: {
      any: ["bd_ropey_larvae_yes", "symptom_ropey_larvae_yes"]
    },
    why: [
      "You have not confirmed mite levels yet, so Varroa pressure has not been ruled in or ruled out.",
      "Colonies can carry significant Varroa loads even when mites are not obvious on adult bees."
    ],
    actions: [
      "Use an appropriate monitoring method for the season if you can (for example board drop, sugar roll, or alcohol wash).",
      "Interpret the result alongside any visible clues such as deformed wings, patchy brood, or colony decline.",
      "If the colony is deteriorating, do not rely only on whether you can physically see mites on bees.",
      ...basicActions.monitor
    ],
    whenToWorry: [
      "If you also see deformed wings, patchy brood, or a shrinking adult population.",
      "If another colony in the apiary is also showing decline."
    ],
    nextChecks: ["qb_visible_varroa", "symptom_deformed_wings", "qb_brood_pattern_poor"]
  });

  add("disease_varroa_dwv_pressure", {
    title: "Varroa / Deformed Wing Virus pressure likely",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { any: ["symptom_deformed_wings_yes","dd_deformed_wings_yes","qb_visible_varroa_yes","dd_visible_varroa_yes","pm_visible_varroa_yes"] },
    excludeIf: { any: ["dd_tongues_out_yes","bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: [
      "Deformed wings are a strong field signal for virus expression often associated with high Varroa pressure.",
      "Visible mites on adult bees is a strong indicator of significant varroa load."
    ],
    actions: [
      "Check Varroa levels if you can (monitoring method appropriate to season).",
      "Review your seasonal Varroa plan; treat if thresholds indicate.",
      "Avoid combining colonies until you understand what’s happening (risk of spreading problems).",
      ...basicActions.monitor
    ],
    whenToWorry: [
      "If deformed wings are widespread, the colony is shrinking quickly, or you’re seeing lots of crawling bees.",
      "If you have repeated losses despite treatment — get local help to review plan/timing."
    ]
  });

  add("disease_foulbrood_red_flag", {
    title: "Red flag: possible foulbrood (notifiable) — act immediately",
    severity: "alert",
    urgency: "report",
    confidence: "strong",
    when: { any: ["bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: ["Ropey/brown larvae and foul smell can be consistent with notifiable brood disease patterns.","Because consequences are serious, treat as notifiable until ruled out by an inspector."],
    actions: [...basicActions.notifiable,"Minimise disturbance and prevent robbing (do not leave hive open)."],
    whenToWorry: ["Immediately — do not wait for it to ‘improve’ on its own."]
  });

  add("disease_chalkbrood_likely", {
    title: "Chalkbrood likely",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { any: ["bd_chalk_mummies_yes"] },
    excludeIf: { any: ["inspection_level_entrance_only","bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: ["Chalk-like mummies are a classic sign; it often improves as the colony strengthens and conditions dry out."],
    actions: ["Reduce excess space for weak colonies and improve ventilation.","Check nutrition; avoid damp/mouldy conditions.","Consider replacing worst affected comb over time (not in one go if colony is weak).", ...basicActions.monitor]
  });

  add("disease_sacbrood_likely", {
    title: "Sacbrood likely",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { any: ["bd_sacbrood_yes"] },
    excludeIf: { any: ["inspection_level_entrance_only","bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: ["Fluid-filled larvae / slipper-shaped remains are consistent with sacbrood patterns.","Often stress-related and can resolve as conditions improve."],
    actions: ["Reduce stress: keep inspections minimal and avoid chilling brood.","Ensure steady nutrition (avoid boom/bust feed patterns).", ...basicActions.monitor]
  });

  add("disease_chilled_brood_likely", {
    title: "Chilled brood likely (temperature/coverage issue)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { any: ["bd_chilled_pattern_yes","dd_cold_spell_yes"] },
    excludeIf: { any: ["inspection_level_entrance_only","bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: ["Cold nights + brood on edges / dead brood patterns often indicate inadequate coverage or too much space."],
    actions: ["Reduce space if bees can’t cover brood (especially early spring).","Avoid splitting the brood nest with foundation during cool spells.","Re-check when weather improves; patterns often stabilise.", ...basicActions.monitor]
  });

  add("disease_poisoning_suspected", {
    title: "Possible pesticide poisoning / acute exposure",
    severity: "warning",
    urgency: "urgent",
    confidence: "medium",
    when: { all: ["dd_piles_dead_bees_yes"], any: ["onset_speed_sudden","dd_tongues_out_yes"] },
    excludeIf: { any: ["dd_stores_very_light_yes","fs_stores_low_yes","bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: ["Sudden piles of dead bees (especially with tongues out) can fit acute exposure patterns.","This isn’t certain — but it’s worth treating as urgent and documenting."],
    actions: ["Reduce disturbance; document timing and symptoms (photos).","Avoid feeding exposed honey back to bees until you’re confident it’s safe.","Seek local support if severe/ongoing (association/inspector).", ...basicActions.monitor],
    whenToWorry: ["If losses continue over multiple days, or neighbouring colonies show similar sudden deaths."]
  });

  add("disease_nosema_dysentery_possible", {
    title: "Dysentery / gut stress possible (often linked to damp, confinement, or feed issues)",
    severity: "info",
    urgency: "watch",
    confidence: "low",
    when: { all: ["ea_cleansing_flights_yes"], any: ["season_winter","season_early_spring"] },
    excludeIf: { any: ["ea_fighting_rolling_yes","fs_robbery_signs_yes"] },
    why: ["Heavy cleansing flights after confinement can be normal, but persistent soiling can indicate gut stress.","Moisture and poor ventilation can worsen it."],
    actions: ["Improve ventilation and keep hive dry (avoid damp floors/stands).","Avoid feeding fermented syrup.","If you suspect dysentery, keep disturbance low and monitor stores.", ...basicActions.monitor]
  });

  add("feeding_starvation_risk_imminent", {
    title: "Starvation risk (urgent feeding needed)",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["route_feeding_stores"], any: ["fs_stores_low_yes","dd_stores_very_light_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes","fs_robbery_signs_yes","ea_bees_shiny_black_thieving_yes"] },
    why: ["Low/heft-light stores is an immediate risk — colonies can collapse quickly once stores run out."],
    actions: [...basicActions.starvationNow,"If the colony is very weak, reduce space so the cluster can stay warm and defend the entrance."],
    whenToWorry: ["If the colony remains light after 48–72 hours.","If you see many crawling bees or rapid losses alongside low stores."],
    nextChecks: ["fs_too_cold", "fs_feed_type", "fs_colony_weak", "dd_crawling_cant_fly"]
  });

  add("feeding_robbing_triggered_by_feeding", {
    title: "Feeding is triggering robbing risk (change approach now)",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["route_feeding_stores"], any: ["fs_robbery_signs_yes","fs_feeder_leaks_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes"] },
    why: ["Syrup smell/spills can trigger robbing very fast, especially late summer/autumn.","Robbing can overwhelm weak colonies quickly."],
    actions: ["Stop leaks/spills immediately and clean up syrup around the hive/stand.", ...basicActions.robbingNow, "Feed internally only (avoid open feeding)."],
    whenToWorry: ["If fighting continues after entrance reduction.","If the colony is weak and cannot defend."],
    nextChecks: ["fs_feeder_leaks", "fs_feeder_type", "fs_feeder_access", "fs_colony_weak"]
  });

  add("feeding_not_taking_syrup_because_flow", {
    title: "Not taking syrup because there’s a nectar flow (often normal)",
    severity: "info",
    urgency: "normal",
    confidence: "strong",
    when: { all: ["route_feeding_stores","fs_nectar_flow_yes"], not: ["fs_stores_low_yes"] },
    excludeIf: { any: ["fs_robbery_signs_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_feeder_leaks_yes","dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes","dd_tongues_out_yes","onset_speed_sudden"] },
    why: ["During a strong flow, bees often ignore syrup because they prefer real nectar."],
    actions: ["Often normal. If stores are building, no action needed.","If feeding a nuc/very small colony, use smaller internal feeds and avoid any spills.", ...basicActions.monitor],
    nextChecks: ["fs_weather_flight_ok", "fs_feeder_leaks", "fs_robbery_signs"]
  });

  add("feeding_not_taking_syrup_too_cold_switch_feed", {
    title: "Not taking syrup because it’s too cold (switch feed type)",
    severity: "info",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_feeding_stores","fs_too_cold_yes"] },
    excludeIf: { any: ["fs_robbery_signs_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_stores_low_yes","dd_stores_very_light_yes"] },
    why: ["In cold weather bees may not break cluster or take syrup effectively.","Fondant is often safer than syrup when temperatures are low."],
    actions: ["Switch to fondant/candy if cold (place within easy reach of the cluster).","Avoid forcing bees to break cluster to reach feed.","Avoid spills around the hive (robbing risk).", ...basicActions.monitor],
    nextChecks: ["fs_feed_type", "fs_weather_flight_ok", "fs_feeder_access"]
  });

  add("feeding_feeder_access_or_design_issue", {
    title: "Feeder access/design problem likely",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_feeding_stores"], any: ["fs_feeder_access_no","fs_feed_consumption_none_yes"] },
    excludeIf: { any: ["fs_robbery_signs_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_stores_low_yes","dd_stores_very_light_yes"] },
    why: ["If bees can’t physically access syrup (misalignment, missing floats/ladders), intake can be near-zero.","Some feeders are unsuitable for weak colonies (drowning risk / hard-to-reach syrup)."],
    actions: ["Check alignment of feeder holes/access points and add floats/ladders where needed.","Try a feeder style that suits weak colonies (frame feeder/contact feeder).","Confirm the feeder isn’t emptying via leaks rather than being consumed.", ...basicActions.monitor],
    nextChecks: ["fs_feeder_type", "fs_feeder_access", "fs_feeder_leaks", "fs_colony_weak"]
  });

  add("feeding_syrup_ferment_or_off", {
    title: "Syrup may be fermented/tainted (replace it)",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_feeding_stores","fs_smell_ferment_yes"] },
    excludeIf: { any: ["fs_robbery_signs_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_stores_low_yes","dd_stores_very_light_yes"] },
    why: ["Old or fermented syrup can be ignored and may upset bees."],
    actions: ["Remove and replace syrup with fresh feed.","Clean the feeder before refilling to prevent recurring fermentation.","In warm weather, avoid making syrup too far in advance.", ...basicActions.monitor],
    nextChecks: ["fs_feed_type", "fs_feeder_type", "fs_feed_consumption_none"]
  });

  add("feeding_recent_treatment_or_brood_break_effect", {
    title: "Recent Varroa treatment/brood break may be affecting behaviour",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_feeding_stores","fs_recent_treatment_effect_yes"] },
    excludeIf: { any: ["fs_stores_low_yes","dd_stores_very_light_yes","fs_robbery_signs_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes"] },
    why: ["Some treatments and brood breaks can temporarily change feeding/foraging behaviour."],
    actions: ["Keep disturbance low and monitor intake over 48–72 hours.","Confirm feeder access and check that syrup is fresh and not leaking.", ...basicActions.monitor],
    nextChecks: ["fs_feeder_access", "fs_smell_ferment", "fs_feed_consumption_none"]
  });

  add("feeding_weak_colony_processing_limit", {
    title: "Colony may be too weak to take/process feed effectively",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_feeding_stores"], any: ["fs_colony_weak_yes","colony_strength_weak","colony_strength_very_weak"] },
    excludeIf: { any: ["fs_stores_low_yes","dd_stores_very_light_yes","fs_robbery_signs_yes","ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes"] },
    why: ["Small clusters struggle to defend, heat syrup, and process feed quickly.","They may also avoid breaking cluster if conditions are cool."],
    actions: ["Reduce space so the cluster can stay warm and defend the entrance.","Use a feeder that allows easy access with minimal drowning risk.","If cold, use fondant instead of syrup.", ...basicActions.monitor],
    nextChecks: ["fs_too_cold", "fs_feeder_type", "fs_feeder_access", "fs_robbery_signs"]
  });

  add("comb_no_flow_no_stimulus", {
    title: "Not drawing comb because there’s no flow (or no stimulation)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_comb_building","cb_is_flow_no"], not: ["cb_feed_present_yes"] },
    excludeIf: { any: ["fs_stores_low_yes","dd_stores_very_light_yes","ea_fighting_rolling_yes","fs_robbery_signs_yes"] },
    why: ["Bees draw wax best during a nectar flow or with controlled stimulation feeding.","In a dearth, they conserve energy and wax production slows dramatically."],
    actions: ["If season-appropriate, provide small, controlled stimulation feeds (avoid spills/robbing).","Ensure the colony has enough bees and warmth to commit to wax building.", ...basicActions.monitor],
    nextChecks: ["cb_feed_present", "cb_colony_strong", "cb_temperature_ok"]
  });

  add("comb_colony_too_weak_to_draw", {
    title: "Colony too weak to draw foundation (very common)",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_comb_building"], any: ["cb_colony_strong_no","colony_strength_weak","colony_strength_very_weak"] },
    excludeIf: { any: ["fs_stores_low_yes","dd_stores_very_light_yes","ea_fighting_rolling_yes","fs_robbery_signs_yes","dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes"] },
    why: ["Weak colonies struggle to heat wax and spare workforce for comb building.","They also struggle if you give them too much space to heat/defend."],
    actions: ["Reduce excess space (avoid leaving boxes/frames they can’t cover).","Delay adding more foundation until the colony is stronger and weather improves.", ...basicActions.monitor],
    nextChecks: ["colony_strength", "cb_added_space_recently", "cb_temperature_ok"]
  });

  add("comb_temperature_limiting", {
    title: "Too cold for wax work (temperature limiting)",
    severity: "info",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_comb_building"], any: ["cb_temperature_ok_no"] },
    excludeIf: { any: ["season_summer"] },
    why: ["Cold nights can stop wax work even if days are sunny.","Bees won’t invest in wax if they can’t keep it warm and workable."],
    actions: ["Delay expansion until a warmer spell (especially at night).","Avoid splitting the brood nest with foundation in cool conditions.", ...basicActions.monitor],
    nextChecks: ["season", "cb_box_position", "cb_added_space_recently"]
  });

  add("comb_too_much_space_added_too_early", {
    title: "Too much space added too early (slows comb and can chill brood)",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_comb_building","cb_added_space_recently_yes"] },
    excludeIf: { any: ["colony_strength_strong","cb_congestion_yes"] },
    why: ["Excess space is harder to heat and defend, so bees may stall on building.","It can also lead to chilled brood if the brood nest is spread too thin."],
    actions: ["Reduce space and add frames/boxes more gradually as the colony expands.","Keep new foundation close to where bees are active (but don’t chill brood).", ...basicActions.monitor],
    nextChecks: ["cb_congestion", "cb_box_position", "colony_strength"]
  });

  add("comb_foundation_condition_problem", {
    title: "Foundation condition issue (old/dry/contaminated) possible",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_comb_building","cb_foundation_new_clean_no"] },
    excludeIf: { any: ["fs_stores_low_yes","dd_stores_very_light_yes"] },
    why: ["Old, dry, or contaminated foundation is often ignored.","Some colonies are picky unless conditions are perfect (flow + warmth)."],
    actions: ["Swap for fresh foundation if possible.","Encourage drawing during a flow or with careful stimulation feeding (avoid robbing risk).", ...basicActions.monitor],
    nextChecks: ["cb_is_flow", "cb_feed_present", "cb_foundation_type"]
  });

  add("comb_plastic_not_waxed", {
    title: "Plastic foundation not wax-coated (often ignored)",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_comb_building","cb_plastic_waxed_no"] },
    excludeIf: { any: ["cb_foundation_type_wax","cb_foundation_type_starter_strip"] },
    why: ["Unwaxed plastic is a very common reason bees won’t draw foundation.","Wax coating gives them the ‘starter’ they need to begin building."],
    actions: ["Use wax-coated plastic foundation (or add wax coating if you know how).","Try again during a flow / warm spell / with careful stimulation feeding.", ...basicActions.monitor],
    nextChecks: ["cb_foundation_type", "cb_is_flow", "cb_temperature_ok"]
  });

  add("comb_wrong_placement_cross_comb_risk", {
    title: "Comb built in odd places (cross comb) — placement/space issue likely",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_comb_building","cb_what_not_drawing_building_wrong_place"] },
    excludeIf: { any: ["inspection_level_entrance_only"] },
    why: ["Cross comb often happens with foundationless/starter strips, spacing errors, or too much empty space.","If frames aren’t straight/close, bees build where it ‘makes sense’ to them."],
    actions: ["Correct frame spacing and ensure frames are pushed tight together.","If foundationless, ensure a good straight guide and strong nectar flow.","Fix early — cross comb gets harder to correct later.", ...basicActions.monitor],
    nextChecks: ["cb_foundation_type", "cb_added_space_recently", "cb_is_flow"]
  });

  add("comb_super_ignored_not_ready_or_no_flow", {
    title: "Not using the super yet (often timing/flow/strength)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_comb_building","cb_what_not_drawing_ignoring_super"] },
    excludeIf: { any: ["cb_congestion_yes"] },
    why: ["Bees may ignore supers if there’s no flow, the colony isn’t strong enough, or nights are cold.","They prioritise brood nest and stores before expanding upward."],
    actions: ["Add supers during a flow when the colony is strong and nights are mild.","If you’re using foundation, consider adding a drawn comb frame as a lure (if you have one).", ...basicActions.monitor],
    nextChecks: ["cb_is_flow", "cb_colony_strong", "cb_temperature_ok", "cb_congestion"]
  });

  add("comb_excluder_reluctance", {
    title: "Bees reluctant to cross the queen excluder (common early season)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_comb_building","cb_queen_excluder_in_way_yes"] },
    excludeIf: { any: ["cb_is_flow_no","cb_colony_strong_no"] },
    why: ["Some colonies hesitate to cross an excluder unless conditions are ideal (flow + strength).","It can look like ‘they won’t use the super’ even when they’re simply not ready."],
    actions: ["Ensure the brood box is strong and there’s a nectar flow before expecting super work.","If appropriate, confirm there’s drawn comb above (or add one drawn frame as a lure).", ...basicActions.monitor],
    nextChecks: ["cb_is_flow", "cb_colony_strong", "cb_congestion"]
  });

  add("comb_inserting_foundation_mid_brood_risk", {
    title: "Foundation inserted in brood nest may be slowing progress (and risks chilling brood)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_comb_building","cb_box_position_middle_brood"], any: ["cb_temperature_ok_no","season_early_spring","season_spring"] },
    excludeIf: { any: ["colony_strength_strong","cb_congestion_yes"] },
    why: ["Putting foundation in the middle of brood can chill brood if the colony can’t cover it.","Bees may refuse to draw it there if conditions aren’t warm and strong enough."],
    actions: ["Move foundation to the edge of brood nest instead of splitting brood.","Wait for warmer nights / stronger colony before attempting mid-brood insertion.", ...basicActions.monitor],
    nextChecks: ["cb_temperature_ok", "colony_strength", "cb_box_position"]
  });

  add("pests_wasps_pressure", {
    title: "Wasp pressure likely (manage before it becomes robbing)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_pests_predators"], any: ["pp_wasps_pressure_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes","ea_bees_shiny_black_thieving_yes","fs_robbery_signs_yes"] },
    why: ["Wasps often probe entrances in late summer/autumn and target weak colonies.","Early action prevents escalation into full robbing/colony collapse."],
    actions: ["Reduce entrance (especially for weak colonies).","Avoid syrup spills and avoid leaving exposed honey/frames during inspections.","Consider traps placed away from hives (so you don’t draw wasps to the entrance).", ...basicActions.monitor]
  });

  add("pests_wasps_escalating_to_robbing", {
    title: "Entrance conflict escalating (robbery risk high)",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["route_pests_predators","pp_wasps_pressure_yes"], any: ["ea_fighting_rolling_yes","fs_robbery_signs_yes","ea_bees_shiny_black_thieving_yes"] },
    why: ["Wasp pressure combined with fighting or robbing-style behaviour means the situation is escalating."],
    actions: [...basicActions.robbingNow, "If it continues, consider moving feeding to evening only and keep entrances very small for weak colonies."]
  });

  add("pests_hornet_hawking_generic", {
    title: "Hornet hawking at the entrance (stress/forager losses possible)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_pests_predators"], any: ["pp_hornet_hawking_yes"] },
    excludeIf: { any: ["pp_slimy_fermented_frames_yes"] },
    why: ["Persistent hawking can reduce foraging and increase stress, especially in weaker colonies.","Identification matters: Asian hornet requires urgent reporting."],
    actions: ["If safe, get a clear photo/video for identification.","If you suspect Asian hornet: report promptly via official UK reporting routes.","Support the colony by keeping entrance defensible and avoiding syrup spills.", ...basicActions.monitor]
  });

  add("pests_asian_hornet_reporting", {
    title: "Possible Asian hornet activity — urgent reporting advised",
    severity: "alert",
    urgency: "report",
    confidence: "strong",
    when: { any: ["pp_hornet_hawking_yes","pp_hornet_persistent_yes"] },
    actions: ["Do not attempt nest destruction yourself.","If safe, take a clear photo/video for identification.","Report promptly via official UK reporting routes if you suspect Asian hornet.","Keep colonies calm and defensible; avoid feeding spills."]
  });

  add("pests_wax_moth_secondary_weakness", {
    title: "Wax moth activity (usually a symptom of a weak or stressed colony)",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_pests_predators"], any: ["pp_wax_moth_webbing_yes"] },
    excludeIf: { any: ["colony_strength_strong","pp_slimy_fermented_frames_yes"] },
    why: ["Wax moth usually becomes a problem when colonies are weak, queenless, or can’t patrol all comb.","It often follows other issues (low population, starvation, brood break, robbing)."],
    actions: ["Reduce excess space and remove severely damaged comb.","Focus on strengthening colony: stores, warmth, queen status.", ...basicActions.monitor]
  });

  add("pests_wax_moth_present_but_strong", {
    title: "Wax moth signs found — but colony may cope if strong",
    severity: "info",
    urgency: "watch",
    confidence: "low",
    when: { all: ["route_pests_predators","pp_wax_moth_webbing_yes"], any: ["colony_strength_strong"] },
    why: ["Strong colonies usually control wax moth — a small amount of damage may be historical or limited."],
    actions: ["Remove/replace badly damaged comb when convenient.","Check you haven’t left unused comb/space that bees can’t patrol.", ...basicActions.monitor]
  });

  add("pests_mice_intrusion_likely", {
    title: "Mouse intrusion likely (especially in cooler months)",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_pests_predators"], any: ["pp_mouse_signs_yes"] },
    excludeIf: { any: ["season_summer"] },
    why: ["Mice seek warmth and food and can wreck comb/insulation and stress the colony."],
    actions: ["Fit an entrance reducer / mouse guard (season-appropriate).","Remove debris and check comb damage.","Avoid leaving gaps that allow re-entry.", ...basicActions.monitor]
  });

  add("pests_ants_nuisance", {
    title: "Ants present (usually nuisance rather than a colony-killer)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_pests_predators"], any: ["pp_ants_seen_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes","fs_robbery_signs_yes"] },
    why: ["Ants often scavenge spills and can irritate bees, but rarely destroy a healthy colony."],
    actions: ["Keep stand area clean and dry; avoid syrup/honey spills.","Use bee-safe barriers on the stand legs if persistent.", ...basicActions.monitor]
  });

  add("pests_shb_suspicion", {
    title: "Small hive beetle suspicion — urgent reporting advised (UK notifiable)",
    severity: "alert",
    urgency: "report",
    confidence: "strong",
    when: { any: ["pp_slimy_fermented_frames_yes"] },
    actions: [...basicActions.notifiable, "Minimise disturbance until you receive official guidance."]
  });

  add("dead_poisoning_strong_signal", {
    title: "Strong signal: possible pesticide poisoning / acute exposure",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["dd_piles_dead_bees_yes"], any: ["dd_tongues_out_yes","onset_speed_sudden"] },
    excludeIf: { any: ["dd_stores_very_light_yes","fs_stores_low_yes"] },
    actions: ["Reduce disturbance; document timing and symptoms (photos/video).","If possible, note nearby spraying/weed control timing (same day/previous day).","Avoid feeding exposed honey back to bees.","If losses are severe/ongoing, seek local guidance urgently (association/inspector).", ...basicActions.monitor],
    whenToWorry: ["Rapidly increasing piles of dead bees over hours–1 day.","Multiple colonies affected at the same apiary.","Continuing losses for more than 24–48 hours."]
  });

  add("dead_poisoning_possible", {
    title: "Possible pesticide poisoning / exposure (needs checking)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["dd_piles_dead_bees_yes"], any: ["onset_speed_fast","dd_tongues_out_unknown","dd_tongues_out_yes"] },
    excludeIf: { any: ["dd_stores_very_light_yes","fs_stores_low_yes"] },
    actions: ["Reduce disturbance and keep inspections short.","Check stores and weather context to rule out starvation/chilling.","Document symptoms and timeline; seek local help if unsure.", ...basicActions.monitor]
  });

  add("dead_starvation_likely", {
    title: "Starvation likely / stores critically low",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { any: ["dd_stores_very_light_yes","fs_stores_low_yes"] },
    excludeIf: { any: ["ea_fighting_rolling_yes","fs_robbery_signs_yes"] },
    actions: [...basicActions.starvationNow, "Reduce entrance if the colony is weak (to help defence)."],
    whenToWorry: ["Crawling bees + very light hive.","Brood present but very low stores (brood can starve fast)."]
  });

  add("dead_chilling_stress_likely", {
    title: "Chilling / cold-stress likely contributing to losses",
    severity: "info",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["dd_cold_spell_yes"], any: ["season_winter","season_early_spring"] },
    excludeIf: { any: ["dd_stores_very_light_yes","fs_stores_low_yes"] },
    actions: ["Reduce draughts and excess space; ensure adequate stores.","Avoid opening the hive unless necessary during cold periods.","If the colony is weak, keep the cluster compact (don’t over-expand).", ...basicActions.monitor]
  });

  add("dead_varroa_virus_signal_in_dead_route", {
    title: "Varroa/virus pressure possible (deformed wings / crawling / visible mites)",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { any: ["dd_deformed_wings_yes","symptom_deformed_wings_yes","dd_crawling_cant_fly_yes","dd_visible_varroa_yes"] },
    excludeIf: { any: ["dd_stores_very_light_yes","fs_stores_low_yes"] },
    why: [
      "Crawling bees and deformed wings can fit Varroa/virus pressure.",
      "Visible mites on adult bees strengthens that suspicion."
    ],
    actions: [
      "Check Varroa levels if you can (monitoring methods).",
      "Review your seasonal Varroa plan; treat if thresholds indicate.",
      "Avoid combining colonies until you understand what’s happening.",
      ...basicActions.monitor
    ],
    whenToWorry: [
      "Increasing numbers of bees with deformed wings.",
      "Rapid population drop alongside deformed wings or visible mites."
    ]
  });

  add("dead_visible_varroa_signal", {
    title: "Visible Varroa mites seen on adult bees",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { any: ["dd_visible_varroa_yes","qb_visible_varroa_yes","pm_visible_varroa_yes"] },
    excludeIf: { any: ["bd_ropey_larvae_yes","symptom_ropey_larvae_yes"] },
    why: ["Visible red/brown mites on adult bees usually suggests a significant Varroa burden rather than a low background level.","This fits especially strongly if there are also deformed wings, crawling bees, or a colony that dwindled before collapse."],
    actions: ["Treat this as an important Varroa clue and review monitoring/treatment history.","Check other colonies too — if one colony shows visible mites, others may also be under pressure.","Avoid combining colonies until you understand the cause.", ...basicActions.monitor],
    whenToWorry: ["Visible mites plus deformed wings or rapid colony decline.","A winter dead-out following a shrinking adult bee population."]
  });

  add("postmortem_starvation_classic", {
    title: "Post-mortem: starvation likely",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { all: ["route_post_mortem"], any: ["pm_headfirst_cells_yes","pm_stores_present_no"] },
    excludeIf: { any: ["pm_wasp_attack_signs_yes"] },
    why: ["Dead bees head-first in cells is a classic starvation sign.","If there are no usable stores left, starvation becomes the leading explanation."],
    actions: ["Check the remaining combs carefully to confirm how much usable food was actually available.","Review winter feeding timing and whether fondant/feed stayed within reach of the cluster.","Check neighbouring colonies urgently if stores are also getting low."],
    whenToWorry: ["If more than one colony is becoming light.","If cold weather is still ongoing and other colonies are marginal on stores."]
  });

  add("postmortem_isolation_starvation", {
    title: "Post-mortem: isolation starvation / cold cluster loss possible",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_post_mortem","pm_dead_cluster_yes","pm_plenty_stores_yes"] },
    excludeIf: { any: ["pm_wasp_attack_signs_yes"] },
    why: ["A dead cluster with stores still present often suggests bees could not move across to food.","This is common in cold snaps, with small clusters, or when stores were present but not within reach."],
    actions: ["Review colony strength going into winter and how stores were positioned around the cluster.","Reduce space and support weaker colonies earlier next season.","Check other small colonies for isolation risk during cold spells."],
    whenToWorry: ["If other weak colonies are still in cold conditions.","If dead-outs follow a recent prolonged cold snap."]
  });

  add("postmortem_dysentery_nosema_possible", {
    title: "Post-mortem: dysentery / gut stress / possible Nosema pattern",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_post_mortem","pm_dysentery_signs_yes"] },
    excludeIf: { any: ["pm_wasp_attack_signs_yes"] },
    why: ["Brown spotting or obvious bee poo suggests gut stress and can fit dysentery-like patterns.","Damp, confinement, poor wintering conditions, or Nosema-type stress can contribute."],
    actions: ["Review ventilation, damp, and feed quality issues.","Avoid reusing obviously contaminated material without checking local best practice.","Monitor surviving colonies for similar soiling or poor spring build-up."],
    whenToWorry: ["If multiple colonies show heavy spotting.","If surviving colonies are also weak and failing to build."]
  });

  add("postmortem_wasp_or_robbing_collapse", {
    title: "Post-mortem: wasp attack / robbing likely contributed to collapse",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_post_mortem"], any: ["pm_wasp_attack_signs_yes","pm_wasps_seen_yes"] },
    why: ["Signs of attack, torn comb, debris, or previous fighting fit wasp pressure or robbing rather than simple absconding.","Weak colonies can be stripped very quickly, especially in late summer or autumn."],
    actions: ["Review whether the entrance was small enough and whether the colony was strong enough to defend itself.","Be extra careful with late-season feeding and avoid syrup spills or exposed comb.","Protect weaker colonies earlier if wasp pressure builds in the apiary."],
    whenToWorry: ["If other weak colonies nearby are still under attack.","If you are seeing wasps probing multiple hives now."]
  });

  add("postmortem_varroa_collapse", {
    title: "Post-mortem: varroa-related collapse possible",
    severity: "warning",
    urgency: "watch",
    confidence: "strong",
    when: { all: ["route_post_mortem"], any: ["pm_visible_varroa_yes","pm_population_dropped_yes","pm_brood_problem_yes"] },
    excludeIf: { any: ["pm_wasp_attack_signs_yes","pm_headfirst_cells_yes","pm_stores_present_no"] },
    why: ["Colonies that collapse with food still present are often linked to high varroa loads going into winter."],
    actions: ["Review the timing and effectiveness of Varroa monitoring/treatments in that colony and across the apiary.","Check your surviving colonies promptly rather than assuming this was an isolated loss.","Avoid combining suspect dead-out material with other colonies until the wider picture is clearer."],
    whenToWorry: ["If another colony is also dwindling.","If visible mites or deformed wings are being seen elsewhere in the apiary."]
  });

  add("postmortem_absconding_or_near_empty", {
    title: "Post-mortem: near-empty hive / disappearance pattern needs narrowing down",
    severity: "info",
    urgency: "watch",
    confidence: "low",
    when: { all: ["route_post_mortem","pm_hive_empty_now_yes","pm_stores_present_yes"] },
    excludeIf: { any: ["pm_wasp_attack_signs_yes","pm_wasps_seen_yes","pm_visible_varroa_yes","pm_population_dropped_yes","pm_headfirst_cells_yes"] },
    why: [
      "A mostly empty hive with stores remaining can look like absconding, but it can also follow collapse for other reasons.",
      "If there are no strong signs of attack, starvation, or Varroa, keep the conclusion cautious rather than jumping straight to absconding."
    ],
    actions: [
      "Review season, colony strength, and any major disturbance or queen event before the loss.",
      "Check combs carefully for subtle clues before reusing equipment.",
      "Treat this as a prompt to inspect the rest of the apiary rather than assuming a single simple cause."
    ],
    whenToWorry: [
      "If another colony starts dwindling or disappearing.",
      "If you later notice signs that point more clearly to robbing, wasp attack, or Varroa."
    ]
  });

  add("dead_crawling_multi_causes", {
    title: "Crawling / can’t fly — multiple possible causes (stores, cold, varroa/virus, poisoning)",
    severity: "warning",
    urgency: "watch",
    confidence: "low",
    when: { all: ["dd_crawling_cant_fly_yes"] },
    actions: ["Check stores (heft), cold spell history, and Varroa/virus signs.","If sudden large losses occur, treat as urgent and document thoroughly.", ...basicActions.monitor]
  });

  add("dead_small_numbers_normal_context", {
    title: "A few dead bees can be normal housekeeping (context check)",
    severity: "info",
    urgency: "normal",
    confidence: "low",
    when: { all: ["route_dead_dying"], any: ["onset_speed_slow","onset_speed_ongoing","onset_speed_unknown"] },
    excludeIf: { any: ["dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes","dd_stores_very_light_yes","fs_stores_low_yes"] },
    actions: ["A small number of dead bees at the entrance can be normal.","If numbers rise quickly, re-run this check with updated observations.", ...basicActions.monitor]
  });

  add("dead_small_numbers_normal_context_unsure", {
    title: "A few dead bees can be normal housekeeping (context check)",
    severity: "info",
    urgency: "normal",
    confidence: "low",
    when: { all: ["route_unsure"], any: ["onset_speed_slow","onset_speed_ongoing","onset_speed_unknown"] },
    excludeIf: { any: ["dd_piles_dead_bees_yes","dd_crawling_cant_fly_yes","dd_stores_very_light_yes","fs_stores_low_yes"] },
    actions: ["A small number of dead bees at the entrance can be normal.","If numbers rise quickly, re-run this check with updated observations.", ...basicActions.monitor]
  });

  onsets.forEach((o) => {
    add(`dead_onset_${o}_triage`, {
      title: `Dead/dying bees with ${labelOnset(o)} onset — prioritise immediate checks`,
      severity: o === "sudden" ? "warning" : "info",
      urgency: o === "sudden" ? "urgent" : "watch",
      confidence: "low",
      when: { all: ["route_dead_dying", `onset_speed_${o}`] },
      actions: ["Confirm stores (heft), cold exposure, and Varroa/virus signs.","If you suspect poisoning, document symptoms and timing promptly.", ...basicActions.monitor]
    });
  });

  add("temperament_weather_defensive", {
    title: "Defensiveness likely due to poor weather",
    severity: "info",
    urgency: "normal",
    confidence: "strong",
    when: { all: ["tm_weather_windy_yes"] },
    actions: ["Avoid inspections in poor weather. Re-test temperament on a warm calm day.","Use more smoke and minimise time with frames exposed.", ...basicActions.monitor]
  });

  add("temperament_robbery_related", {
    title: "Defensiveness likely linked to robbing pressure",
    severity: "warning",
    urgency: "urgent",
    confidence: "strong",
    when: { any: ["tm_robbery_pressure_yes","fs_robbery_signs_yes","ea_fighting_rolling_yes"] },
    actions: [...basicActions.robbingNow, "Avoid exposing honey/syrup during inspections."],
    whenToWorry: ["Sustained fighting at entrance.","Bees pinging/attacking far from the hive (high arousal)."]
  });

  add("temperament_recent_disturbance_related", {
    title: "Temperament change possibly linked to disturbance (harvest/move/treatment)",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_temperament"], any: ["recent_harvest","recent_move","recent_treatment"] },
    excludeIf: { any: ["tm_robbery_pressure_yes","fs_robbery_signs_yes"] },
    actions: ["Give the colony time to settle after disturbance (a few days).","Keep inspections short and avoid repeated disruption.", ...basicActions.monitor]
  });

  add("temperament_queen_event_related", {
    title: "Temperament change possibly linked to queen event",
    severity: "info",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["tm_queen_event_yes"] },
    excludeIf: { any: ["tm_robbery_pressure_yes","fs_robbery_signs_yes"] },
    actions: ["Queen events can temporarily disrupt colony behaviour (brood break, re-organisation).","Re-check once the queen situation stabilises.", ...basicActions.monitor]
  });

  add("temperament_genetics_or_failing_queen_possible", {
    title: "Possible genetics / failing queen contributing to defensiveness (needs pattern check)",
    severity: "warning",
    urgency: "watch",
    confidence: "low",
    when: { all: ["route_temperament","tm_changed_suddenly_no"], not: ["tm_weather_windy_yes","tm_robbery_pressure_yes","tm_queen_event_yes"] },
    actions: ["If defensiveness is persistent across good weather and calm conditions, consider queen quality/genetics.","Seek local mentor input before requeening — timing/season matters.","Avoid inspecting without protection; keep sessions short.", ...basicActions.monitor],
    whenToWorry: ["Defensiveness persists over multiple calm, warm inspections.","Colony becomes unmanageable/safety risk."]
  });

  add("temperament_sudden_change_flag", {
    title: "Sudden temperament change — prioritise robbing/queen loss/disturbance checks",
    severity: "warning",
    urgency: "watch",
    confidence: "medium",
    when: { all: ["route_temperament","tm_changed_suddenly_yes"] },
    actions: ["Sudden changes are often situational (robbing pressure, queen event, disturbance, weather).","Check entrance behaviour for fighting and review recent changes (move/harvest/treatment).", ...basicActions.monitor]
  });

  seasons.forEach((s) => {
    add(`temperament_season_${s}_note`, {
      title: `Temperament context (${labelSeason(s)}) — forage and disturbance can affect behaviour`,
      severity: "info",
      urgency: "normal",
      confidence: "low",
      when: { all: ["route_temperament", `season_${s}`] },
      actions: ["Check robbing/wasp pressure and inspection conditions.", ...basicActions.monitor]
    });
  });

  const routes = ["route_entrance_activity","route_queen_brood","route_dead_dying","route_post_mortem","route_feeding_stores","route_comb_building","route_pests_predators","route_brood_disease","route_temperament","route_unsure"];
  let idx = 0;
  routes.forEach((r) => {
    seasons.forEach((s) => {
      onsets.forEach((o) => {
        add(`context_${r}_${s}_${o}_${idx++}`, {
          title: `${prettyRoute(r)} — context guidance (${labelSeason(s)}, ${labelOnset(o)})`,
          severity: "info",
          urgency: o === "sudden" ? "watch" : "normal",
          when: { all: [r, `season_${s}`, `onset_speed_${o}`] },
          excludeIf: { any: meaningfulSignals },
          actions: ["Use the suggested route questions to narrow the cause.","If anything is rapidly worsening, treat as urgent and seek local support.", ...basicActions.monitor]
        });
      });
    });
  });

  return O;
}

function labelSeason(s) {
  switch (s) {
    case "early_spring": return "Early spring";
    case "spring": return "Spring";
    case "summer": return "Summer";
    case "autumn": return "Autumn";
    case "winter": return "Winter";
    default: return "Unknown season";
  }
}

function labelOnset(o) {
  switch (o) {
    case "sudden": return "sudden";
    case "fast": return "fast";
    case "slow": return "slow";
    case "ongoing": return "ongoing";
    default: return "unknown";
  }
}

function prettyRoute(r) {
  return String(r || "").replace("route_", "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

(function () {
  if (!document.body || document.body.id !== "colony-health-triage-page") {
    return;
  }

  const el = {
    topBannerList: document.getElementById("topBannerList"),
    debugPanel: document.getElementById("debugPanel"),
    debugAnswers: document.getElementById("debugAnswers"),
    debugFlags: document.getElementById("debugFlags"),
    guidedView: document.getElementById("guidedView"),
    allView: document.getElementById("allView"),
    resultsView: document.getElementById("resultsView"),
    resetBtn: document.getElementById("resetBtn"),
    modeBtn: document.getElementById("modeBtn"),
    debugBtn: document.getElementById("debugBtn"),
  };

  if (
    !el.topBannerList ||
    !el.guidedView ||
    !el.allView ||
    !el.resultsView ||
    !el.resetBtn ||
    !el.modeBtn ||
    !el.debugBtn
  ) {
    return;
  }

  const state = {
    mode: "guided",
    showDebug: false,
    currentId: null,
    highlightId: null,
    results: null,
    answers: {
      primary_route: "",
      inspection_level: "",
      season: "",
      onset_speed: "",
      colony_strength: ""
    },
    history: []
  };

  function init() {
    renderTopBanner();
    bindToolbar();
    render();
  }

  function renderTopBanner() {
    el.topBannerList.innerHTML = "";
    (BEE_HEALTH_RULES.safety.topBanner || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      el.topBannerList.appendChild(li);
    });
  }

  function bindToolbar() {
    el.resetBtn.addEventListener("click", () => {
      state.mode = "guided";
      state.showDebug = false;
      state.currentId = null;
      state.highlightId = null;
      state.results = null;
      state.history = [];
      state.answers = {
        primary_route: "",
        inspection_level: "",
        season: "",
        onset_speed: "",
        colony_strength: ""
      };
      render();
    });

    el.modeBtn.addEventListener("click", () => {
      state.mode = state.mode === "guided" ? "all" : "guided";
      state.results = null;
      if (state.mode === "guided" && !state.currentId) {
        state.currentId = computedNextId();
      }
      render();
    });

    el.debugBtn.addEventListener("click", () => {
      state.showDebug = !state.showDebug;
      render();
    });
  }

  function isTri(v) {
    return v === "yes" || v === "no" || v === "unknown";
  }

  function cloneAnswers() {
    return JSON.parse(JSON.stringify(state.answers));
  }

  function setAnswer(id, value) {
    state.history.push(cloneAnswers());
    state.answers[id] = value;
    state.results = null;
    if (state.mode === "guided") {
      const next = computedNextId();
      state.currentId = next;
      state.highlightId = next;
      setTimeout(() => scrollToQuestion(next), 30);
    }
    render();
  }

  function toggleMulti(id) {
    state.history.push(cloneAnswers());
    state.answers[id] = !state.answers[id];
    state.results = null;
    render();
  }

  function goBackOne() {
    const prev = state.history.pop();
    if (!prev) return;
    state.answers = prev;
    state.results = null;
    state.currentId = computedNextId();
    state.highlightId = state.currentId;
    render();
    setTimeout(() => scrollToQuestion(state.currentId), 30);
  }

  function scrollToQuestion(id) {
    if (!id) return;
    const node = document.getElementById("q-" + id);
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function flags() {
    const f = {};
    Object.entries(state.answers).forEach(([k, v]) => {
      if (typeof v === "string" && v && !isTri(v)) f[`${k}_${v}`] = true;
      if (typeof v === "boolean") f[k] = v;
      if (isTri(v)) {
        f[`${k}_${v}`] = true;
        if (v === "yes") f[k] = true;
      }
    });

    if (state.answers.primary_route) f[state.answers.primary_route] = true;

    f.opened_frames_ok =
      state.answers.inspection_level === "opened_quick" ||
      state.answers.inspection_level === "full_inspection";

    f.season_winter_or_early_spring = !!(f.season_winter || f.season_early_spring);

    if (state.answers.primary_route === "route_unsure" && f.opened_frames_ok) {
      f.route_queen_brood = true;
    }

    return f;
  }

  function evalClause(clause, currentFlags) {
    if (!clause) return true;
    const any = clause.any || [];
    const all = clause.all || [];
    const not = clause.not || [];
    const anyOk = any.length === 0 ? true : any.some(k => !!currentFlags[k]);
    const allOk = all.length === 0 ? true : all.every(k => !!currentFlags[k]);
    const notOk = not.length === 0 ? true : not.every(k => !currentFlags[k]);
    return anyOk && allOk && notOk;
  }

  function routeKey() {
    const r = state.answers.primary_route;
    const map = {
      route_entrance_activity: "entrance_activity",
      route_queen_brood: "queen_brood",
      route_dead_dying: "dead_dying",
      route_post_mortem: "post_mortem",
      route_feeding_stores: "feeding_stores",
      route_comb_building: "comb_building",
      route_pests_predators: "pests_predators",
      route_brood_disease: "brood_disease",
      route_temperament: "temperament",
    };
    return map[r] || null;
  }

  function allQuestionsInOrder() {
    const currentFlags = flags();
    const foundation = BEE_HEALTH_RULES.questions.foundation || [];
    const selectedRoute = state.answers.primary_route;

    if (!selectedRoute) {
      return [...foundation].filter(Boolean);
    }

    if (selectedRoute === "route_unsure") {
      const unsureOrder = [
        "entrance_activity",
        "dead_dying",
        "post_mortem",
        "queen_brood",
        "pests_predators",
        "brood_disease",
        "feeding_stores",
        "temperament",
        "comb_building"
      ];

      const unsureQuestions = unsureOrder.flatMap((key) =>
        (BEE_HEALTH_RULES.questions[key] || []).filter(q => evalClause(q.showIf, currentFlags))
      );

      return [...foundation, ...unsureQuestions].filter(Boolean);
    }

    const rk = routeKey();
    const routeQuestions = rk
      ? (BEE_HEALTH_RULES.questions[rk] || []).filter(q => evalClause(q.showIf, currentFlags))
      : [];

    return [...foundation, ...routeQuestions].filter(Boolean);
  }

  function computedNextId() {
    const list = allQuestionsInOrder();
    for (const q of list) {
      if (q.kind === "select" && !state.answers[q.id]) return q.id;
      if (q.kind === "tri" && !isTri(state.answers[q.id])) return q.id;
    }
    return null;
  }

  function allAnswered() {
    return !computedNextId();
  }

  function qLabelMap() {
    const m = new Map();
    allQuestionsInOrder().forEach(q => m.set(q.id, q.label || q.id));
    return m;
  }

  function normalizeWhen(whenObj) {
    const out = Object.assign({}, whenObj || {});
    if (out.any2) {
      out.any = [...(out.any || []), ...(Array.isArray(out.any2) ? out.any2 : [])];
      delete out.any2;
    }
    if ((out.any || []).includes("season_winter_or_early_spring")) {
      out.any = (out.any || []).filter(x => x !== "season_winter_or_early_spring").concat(["season_winter", "season_early_spring"]);
    }
    return out;
  }

  function getUrgentHit(currentFlags) {
    for (const rule of BEE_HEALTH_RULES.urgentReporting || []) {
      const any = rule.any || [];
      const all = rule.all || [];
      const not = rule.not || [];
      const anyOk = any.length ? any.some(k => currentFlags[k] === true) : false;
      const allOk = all.length ? all.every(k => currentFlags[k] === true) : true;
      const notOk = not.length ? not.every(k => currentFlags[k] !== true) : true;
      if (anyOk && allOk && notOk) return rule;
    }
    return null;
  }

  function confidenceLabelFromScore(score, threshold) {
    const cfg = BEE_HEALTH_RULES.confidence || {
      veryLikely: { label: "Very likely", minOver: 3 },
      likely: { label: "Likely", minOver: 1 },
      possible: { label: "Possible", minOver: 0 },
    };
    const over = score - threshold;
    if (over >= ((cfg.veryLikely && cfg.veryLikely.minOver) ?? 3)) return (cfg.veryLikely && cfg.veryLikely.label) || "Very likely";
    if (over >= ((cfg.likely && cfg.likely.minOver) ?? 1)) return (cfg.likely && cfg.likely.label) || "Likely";
    return (cfg.possible && cfg.possible.label) || "Possible";
  }

  function ruleScore(whenObj, currentFlags) {
    const when = normalizeWhen(whenObj);
    const all = when.all || [];
    const any = when.any || [];
    let score = 0;
    for (const k of all) if (currentFlags[k] === true) score += 2;
    const anyMatched = any.filter(k => currentFlags[k] === true);
    if (any.length) {
      if (anyMatched.length > 0) score += 2;
      score += anyMatched.length;
    }
    const threshold = all.length * 2 + (any.length ? 2 : 0);
    return { score, threshold };
  }

  function runAssessment() {
    const currentFlags = flags();
    const urgentHit = getUrgentHit(currentFlags);
    const redHit = (BEE_HEALTH_RULES.redFlags || []).find(k => currentFlags[k] === true);

    if (redHit) {
      state.results = { type: "override", redHit, urgentHit, top: [], nextChecks: [] };
      render();
      return;
    }

    const matched = [];
    for (const [key, def] of Object.entries(BEE_HEALTH_RULES.outcomes || {})) {
      const when = normalizeWhen(def.when || {});
      const ok = evalClause({ all: when.all || [], any: when.any || [], not: when.not || [] }, currentFlags);
      if (!ok) continue;
      if (def.excludeIf && evalClause(def.excludeIf, currentFlags)) continue;

      const { score, threshold } = ruleScore(def.when || {}, currentFlags);
      const confidenceText = def.confidenceHint || def.confidence || confidenceLabelFromScore(score, threshold);
      const rawNext = def.nextChecks || def.followUp || def.checks || [];

      matched.push({
        key,
        title: def.title,
        severity: def.severity || "info",
        urgency: def.urgency || "normal",
        confidence: confidenceText,
        why: def.why || [],
        actions: def.actions || [],
        whenToWorry: def.whenToWorry || [],
        nextChecks: Array.isArray(rawNext) ? rawNext : []
      });
    }

    const sevRank = s => s === "alert" ? 3 : s === "warning" ? 2 : 1;
    const confRank = c =>
      String(c).toLowerCase().includes("very") || String(c).toLowerCase().includes("strong") ? 3 :
      String(c).toLowerCase().includes("likely") || String(c).toLowerCase().includes("medium") ? 2 : 1;

    matched.sort((a, b) => {
      const d1 = sevRank(b.severity) - sevRank(a.severity);
      if (d1 !== 0) return d1;
      const d2 = confRank(b.confidence) - confRank(a.confidence);
      if (d2 !== 0) return d2;
      return a.key.localeCompare(b.key);
    });

    const top = matched.slice(0, 5);
    const validQIds = new Set(allQuestionsInOrder().map(q => q.id));
    const nextChecks = [];
    const seen = new Set();

    top.forEach(r => {
      (r.nextChecks || []).forEach(id => {
        if (!id || !validQIds.has(id) || seen.has(id)) return;
        seen.add(id);
        nextChecks.push(id);
      });
    });

    state.results = { type: "normal", urgentHit, top, nextChecks };
    render();
  }

  function jumpToQuestion(id) {
    if (!id) return;
    state.mode = "all";
    render();
    setTimeout(() => {
      scrollToQuestion(id);
      const node = document.getElementById("q-" + id);
      if (node) {
        node.classList.add("highlight");
        setTimeout(() => node.classList.remove("highlight"), 1600);
      }
    }, 50);
  }

  function createSelectCard(q, value, highlight) {
    const wrap = document.createElement("div");
    wrap.className = "question" + (highlight ? " highlight" : "");
    wrap.id = "q-" + q.id;
    wrap.innerHTML = `
      <div class="question-title">${escapeHtml(q.label)}</div>
      ${q.help ? `<div class="question-help">${escapeHtml(q.help)}</div>` : ""}
    `;

    const select = document.createElement("select");
    const start = document.createElement("option");
    start.value = "";
    start.textContent = "Select…";
    select.appendChild(start);

    (q.options || []).forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      if (value === o.value) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", e => setAnswer(q.id, e.target.value));
    wrap.appendChild(select);
    return wrap;
  }

  function createTriCard(q, value, highlight) {
    const wrap = document.createElement("div");
    wrap.className = "question" + (highlight ? " highlight" : "");
    wrap.id = "q-" + q.id;
    wrap.innerHTML = `
      <div class="question-title">${escapeHtml(q.label)}</div>
      ${q.help ? `<div class="question-help">${escapeHtml(q.help)}</div>` : ""}
    `;

    const row = document.createElement("div");
    row.className = "tri-row";

    [["yes","Yes"],["no","No"],["unknown","Not sure"]].forEach(([v,label]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tri-btn" + (value === v ? " active" : "");
      btn.textContent = label;
      btn.addEventListener("click", () => setAnswer(q.id, v));
      row.appendChild(btn);
    });

    wrap.appendChild(row);
    return wrap;
  }

  function createMultiCard(q, answers) {
    const wrap = document.createElement("div");
    wrap.className = "question multi";
    wrap.id = "q-" + q.id;
    wrap.innerHTML = `
      <div class="question-title">${escapeHtml(q.label)}</div>
      ${q.help ? `<div class="question-help">${escapeHtml(q.help)}</div>` : ""}
    `;

    const grid = document.createElement("div");
    grid.className = "grid-2";

    (q.options || []).forEach(opt => {
      const label = document.createElement("label");
      label.className = "check-label small";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!answers[opt.id];
      input.addEventListener("change", () => toggleMulti(opt.id));

      const span = document.createElement("span");
      span.textContent = opt.label;

      label.appendChild(input);
      label.appendChild(span);
      grid.appendChild(label);
    });

    wrap.appendChild(grid);
    return wrap;
  }

  function renderGuided() {
    el.guidedView.innerHTML = "";
    el.allView.classList.add("hidden");
    el.guidedView.classList.remove("hidden");

    const card = document.createElement("div");
    card.className = "card no-print";

    const nextId = computedNextId();
    const allQs = allQuestionsInOrder();
    const currentId = state.currentId || nextId;
    state.currentId = currentId;
    const currentQuestion = allQs.find(q => q.id === currentId) || null;
    const canGoBack = state.history.length > 0;

    const top = document.createElement("div");
    top.className = "toolbar";
    top.innerHTML = `
      <div class="section-title">Next question</div>
      <div class="toolbar-actions">
        <button type="button" id="backBtn" ${canGoBack ? "" : "disabled"}>← Back</button>
        <button type="button" id="askNextBtn" ${nextId ? "" : "disabled"}>Ask next →</button>
      </div>
    `;
    card.appendChild(top);

    if (!currentQuestion) {
      if (!allAnswered()) {
        const msg = document.createElement("div");
        msg.className = "small muted";
        msg.textContent = "Click “Ask next” to start.";
        card.appendChild(msg);
      }
    } else {
      let qNode;
      if (currentQuestion.kind === "select") qNode = createSelectCard(currentQuestion, state.answers[currentQuestion.id] || "", state.highlightId === currentQuestion.id);
      if (currentQuestion.kind === "tri") qNode = createTriCard(currentQuestion, state.answers[currentQuestion.id], state.highlightId === currentQuestion.id);
      if (currentQuestion.kind === "multi") qNode = createMultiCard(currentQuestion, state.answers);

      if (qNode) {
        qNode.style.marginTop = "14px";
        card.appendChild(qNode);
      }
    }

    if (allAnswered()) {
      const box = document.createElement("div");
      box.style.marginTop = "16px";
      box.appendChild(completionBanner());
      card.appendChild(box);
    }

    el.guidedView.appendChild(card);

    const backBtn = card.querySelector("#backBtn");
    const askNextBtn = card.querySelector("#askNextBtn");
    if (backBtn) backBtn.addEventListener("click", goBackOne);
    if (askNextBtn) {
      askNextBtn.addEventListener("click", () => {
        state.currentId = computedNextId();
        state.highlightId = state.currentId;
        render();
        setTimeout(() => scrollToQuestion(state.currentId), 30);
      });
    }
  }

  function completionBanner() {
    const wrap = document.createElement("div");
    wrap.className = "card banner-green";
    wrap.innerHTML = `
      <div style="font-size:1.1rem;font-weight:700">Results ready</div>
      <p class="small" style="margin-top:6px">${state.results ? "You’ve already generated results. If you change any answers, click Get results again." : "You’ve answered all relevant questions. Click Get results to see guidance below."}</p>
    `;

    const row = document.createElement("div");
    row.style.marginTop = "12px";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "primary";
    btn.textContent = "Get results";
    btn.addEventListener("click", runAssessment);

    row.appendChild(btn);
    wrap.appendChild(row);
    return wrap;
  }

  function renderAll() {
    el.allView.innerHTML = "";
    el.guidedView.classList.add("hidden");
    el.allView.classList.remove("hidden");

    const card = document.createElement("div");
    card.className = "card no-print";

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = "All questions";
    card.appendChild(title);

    allQuestionsInOrder().forEach(q => {
      let node = null;
      if (q.kind === "select") node = createSelectCard(q, state.answers[q.id] || "", false);
      if (q.kind === "tri") node = createTriCard(q, state.answers[q.id], false);
      if (q.kind === "multi") node = createMultiCard(q, state.answers);
      if (node) {
        node.style.marginTop = "14px";
        card.appendChild(node);
      }
    });

    const actionRow = document.createElement("div");
    actionRow.style.marginTop = "18px";
    actionRow.innerHTML = `<button type="button" class="primary" id="getResultsAllBtn">Get results</button> <span class="small muted" style="margin-left:8px">If you change answers, click Get results again.</span>`;
    card.appendChild(actionRow);
    el.allView.appendChild(card);

    actionRow.querySelector("#getResultsAllBtn").addEventListener("click", runAssessment);
  }

  function renderResults() {
    el.resultsView.innerHTML = "";
    const results = state.results;

    if (!results) {
      const box = document.createElement("div");
      box.className = "card";
      box.innerHTML = `<div class="section-title">Results</div><p class="small muted">Answer the questions above, then click <strong>Get results</strong>.</p>`;
      el.resultsView.appendChild(box);
      return;
    }

    if (results.type === "override") {
      const alert = document.createElement("div");
      alert.className = "result-alert";
      alert.innerHTML = `
        <h3>Important — immediate action required</h3>
        <p class="small" style="margin-top:8px">A red-flag sign was selected. This can be consistent with a <strong>notifiable</strong> brood disease. <strong>Do not move</strong> colonies or equipment off site.</p>
      `;
      el.resultsView.appendChild(alert);
      el.resultsView.appendChild(safetyBox());

      const printBox = document.createElement("div");
      printBox.className = "no-print";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Print results";
      btn.addEventListener("click", () => window.print());

      printBox.appendChild(btn);
      el.resultsView.appendChild(printBox);
      return;
    }

    const header = document.createElement("div");
    header.className = "card no-print";
    header.innerHTML = `
      <div class="result-head">
        <div>
          <div class="section-title">Results</div>
          <p class="small muted">These are guidance suggestions based on your answers.</p>
        </div>
      </div>
    `;

    const printBtn = document.createElement("button");
    printBtn.type = "button";
    printBtn.textContent = "Print results";
    printBtn.addEventListener("click", () => window.print());
    header.querySelector(".result-head").appendChild(printBtn);
    el.resultsView.appendChild(header);

    if (results.urgentHit) {
      const urgent = document.createElement("div");
      urgent.className = "result-alert";
      urgent.innerHTML = `<h3>${escapeHtml(results.urgentHit.label)}</h3>`;
      el.resultsView.appendChild(urgent);
    }

    el.resultsView.appendChild(safetyBox());

    if ((results.nextChecks || []).length) {
      const next = document.createElement("div");
      next.className = "card no-print";
      next.innerHTML = `<div class="section-title">Recommended next checks</div><div class="small muted">Click one to jump to that question.</div>`;

      const buttons = document.createElement("div");
      buttons.className = "jump-buttons";

      const labels = qLabelMap();
      results.nextChecks.forEach(id => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = labels.get(id) || id;
        btn.addEventListener("click", () => jumpToQuestion(id));
        buttons.appendChild(btn);
      });

      next.appendChild(buttons);
      el.resultsView.appendChild(next);
    }

    if ((results.top || []).length) {
      results.top.forEach(r => {
        const card = document.createElement("div");
        const cls = r.severity === "alert" ? "result-alert" : r.severity === "warning" ? "result-warning" : "result-info";
        card.className = cls;
        card.innerHTML = `
          <div class="result-head">
            <h3>${escapeHtml(r.title)}</h3>
            <div class="right-meta"><div><strong>${escapeHtml(r.urgency)}</strong></div><div>${escapeHtml(String(r.confidence || ""))}</div></div>
          </div>
        `;

        if ((r.why || []).length) card.appendChild(listBlock("Why", r.why));
        if ((r.actions || []).length) card.appendChild(listBlock("What to do now", r.actions));
        if ((r.whenToWorry || []).length) card.appendChild(listBlock("When to worry / get help", r.whenToWorry));

        el.resultsView.appendChild(card);
      });
    } else {
      const none = document.createElement("div");
      none.className = "card banner-green";
      none.innerHTML = `<h3>No clear issue identified</h3><p class="small" style="margin-top:6px">Try switching your route at the top or adding more observations.</p>`;
      el.resultsView.appendChild(none);
    }
  }

  function listBlock(title, items) {
    const wrap = document.createElement("div");
    wrap.style.marginTop = "14px";

    const hd = document.createElement("div");
    hd.className = "section-title small";
    hd.textContent = title;
    wrap.appendChild(hd);

    const ul = document.createElement("ul");
    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });

    wrap.appendChild(ul);
    return wrap;
  }

  function safetyBox() {
    const box = document.createElement("div");
    box.className = "card";
    box.innerHTML = `
      <div class="section-title">Safety / inspector-safe notes</div>
      <ul>
        <li>This is guidance only — it does not diagnose disease.</li>
        <li>If notifiable disease/pest is suspected: <strong>do not move</strong> colonies, frames, bees, or equipment off site.</li>
        <li>Avoid combining colonies or swapping frames until you understand what’s happening.</li>
        <li>If severe or uncertain, get help from your association, mentor, or official routes.</li>
      </ul>
    `;
    return box;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderDebug() {
    const currentFlags = flags();
    if (el.debugPanel) el.debugPanel.classList.toggle("hidden", !state.showDebug);
    if (el.debugAnswers) el.debugAnswers.textContent = JSON.stringify(state.answers, null, 2);
    if (el.debugFlags) el.debugFlags.textContent = JSON.stringify(currentFlags, null, 2);
    if (el.debugBtn) el.debugBtn.textContent = state.showDebug ? "Hide debug" : "Show debug";
    if (el.modeBtn) el.modeBtn.textContent = state.mode === "guided" ? "Expand all" : "Guided mode";
  }

  function render() {
    renderDebug();
    if (state.mode === "guided") renderGuided();
    else renderAll();
    renderResults();
  }

  init();
})();