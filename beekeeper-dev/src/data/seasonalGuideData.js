export const seasonalGuideData = [
  {
    id: "january",
    month: "January",
    title: "January Beekeeping Guide",
    strapline: "Winter checks, fondant and spring preparation",
    season: "Winter",
    image: "/images/seasonal-guides/january-tips.png",
    focus: ["Heft hives and top up fondant if needed", "Check roofs, straps and entrances after storms", "Complete winter varroa treatment if due"],
    risks: ["Starvation if stores are not monitored", "Storm damage", "Disturbing the winter cluster unnecessarily"],
    actions: [
      { id: "check-stores", title: "Check hive stores / heft hives", category: "Stores & feeding", priority: "High" },
      { id: "add-fondant", title: "Add fondant to light colonies", category: "Stores & feeding", priority: "High" },
      { id: "check-weather-protection", title: "Check roofs, straps and weather protection", category: "Winter protection", priority: "Medium" },
      { id: "clear-entrances", title: "Clear hive entrances after snow or debris", category: "Hive checks", priority: "Medium" },
      { id: "plan-equipment", title: "Review records and plan spring equipment", category: "Planning", priority: "Low" }
    ]
  },
  {
    id: "february",
    month: "February",
    title: "February Beekeeping Guide",
    strapline: "Late winter checks, fondant and spring preparation",
    season: "Winter",
    image: "/images/seasonal-guides/february-tips.png",
    focus: ["Continue weight checks", "Watch for cleansing flights on mild days", "Plan inspections and equipment before spring"],
    risks: ["Stores used faster as brood rearing increases", "Mould and condensation", "Opening colonies too early"],
    actions: [
      { id: "check-stores", title: "Check hive stores / heft hives", category: "Stores & feeding", priority: "High" },
      { id: "add-fondant", title: "Top up fondant where needed", category: "Stores & feeding", priority: "High" },
      { id: "check-damp-ventilation", title: "Check for damp and ventilation issues", category: "Winter protection", priority: "Medium" },
      { id: "review-varroa-records", title: "Review varroa treatment records", category: "Varroa", priority: "Medium" },
      { id: "prepare-equipment", title: "Prepare spare frames and equipment", category: "Equipment", priority: "Low" }
    ]
  },
  {
    id: "march",
    month: "March",
    title: "March Beekeeping Guide",
    strapline: "Spring hive checks, brood and feeding",
    season: "Spring",
    image: "/images/seasonal-guides/march-tips.png",
    focus: ["Plan first full inspections when weather allows", "Check brood, queen status and food stores", "Prepare equipment and space if needed"],
    risks: ["Cold snaps causing starvation", "Chilling brood with long inspections", "Colonies expanding faster than expected"],
    actions: [
      { id: "check-stores", title: "Check food stores", category: "Stores & feeding", priority: "High" },
      { id: "spring-inspection", title: "Inspect on calm warm days", category: "Inspection", priority: "High" },
      { id: "assess-brood-pattern", title: "Assess brood pattern", category: "Colony health", priority: "High" },
      { id: "prepare-supers", title: "Prepare supers", category: "Equipment", priority: "Medium" },
      { id: "remove-mouse-guards", title: "Remove mouse guards when no longer needed", category: "Hive checks", priority: "Medium" }
    ]
  },
  {
    id: "april",
    month: "April",
    title: "April Beekeeping Guide",
    strapline: "Inspections, swarm control and supers",
    season: "Spring",
    image: "/images/seasonal-guides/april-tips.png",
    focus: ["Inspect every 7–10 days", "Check brood, queen and food stores", "Add supers when needed and prepare swarm control"],
    risks: ["Starvation during cold snaps", "Early swarm preparation", "Colonies becoming overcrowded"],
    actions: [
      { id: "check-stores", title: "Check food stores", category: "Stores & feeding", priority: "High" },
      { id: "check-queenright", title: "Confirm queenright status", category: "Queen checks", priority: "High" },
      { id: "check-queen-cells", title: "Look for queen cells", category: "Swarm control", priority: "High" },
      { id: "add-supers", title: "Add supers when bees cover frames", category: "Honey production", priority: "Medium" },
      { id: "update-records", title: "Record inspections and actions", category: "Records", priority: "Medium" }
    ]
  },
  {
    id: "may",
    month: "May",
    title: "May Apiary Master Guide",
    strapline: "Cool temperate UK climate",
    season: "Spring",
    image: "/images/seasonal-guides/may-tips.png",
    focus: ["Stay ahead of rapid colony growth", "Make inspections your main control tool", "Treat swarm control as the priority"],
    risks: ["Missing queen cells", "Congestion in brood box or supers", "Reacting too late to swarm signs"],
    actions: [
      { id: "weekly-inspection", title: "Inspect roughly every 7 days", category: "Inspection", priority: "High" },
      { id: "check-queen-cells", title: "Check queen cells properly", category: "Swarm control", priority: "High" },
      { id: "add-space", title: "Add space before congestion", category: "Swarm control", priority: "High" },
      { id: "prepare-split-equipment", title: "Prepare split equipment", category: "Swarm control", priority: "Medium" },
      { id: "update-records", title: "Keep clear records", category: "Records", priority: "Medium" }
    ]
  },
  {
    id: "june",
    month: "June",
    title: "June Apiary Master Guide",
    strapline: "Honey flow, swarm checks and peak season management",
    season: "Summer",
    image: "/images/seasonal-guides/june-tips.png",
    focus: ["Manage honey flow and supers", "Continue swarm checks", "Keep colonies healthy and productive"],
    risks: ["Missed queen cells", "Overcrowding during nectar flow", "Health issues hidden by large colonies"],
    actions: [
      { id: "weekly-inspection", title: "Inspect about every 7 days", category: "Inspection", priority: "High" },
      { id: "add-supers", title: "Add extra supers during nectar flow", category: "Honey production", priority: "High" },
      { id: "rotate-brood-frames", title: "Rotate old brood frames", category: "Hive management", priority: "Medium" },
      { id: "monitor-varroa", title: "Monitor varroa as part of the plan", category: "Varroa", priority: "Medium" },
      { id: "update-records", title: "Record queen cells and super changes", category: "Records", priority: "Medium" }
    ]
  },
  {
    id: "july",
    month: "July",
    title: "July Beekeeping Master Guide",
    strapline: "Honey harvest, swarm checks and mid-summer management",
    season: "Summer",
    image: "/images/seasonal-guides/july-tips.png",
    focus: ["Plan honey harvests", "Continue swarm checks", "Monitor varroa and colony health"],
    risks: ["Late swarms weakening colonies", "Congestion in brood and supers", "Disease signs becoming easier to miss"],
    actions: [
      { id: "check-supers-capping", title: "Check supers and capping", category: "Honey production", priority: "High" },
      { id: "clear-supers", title: "Clear bees from supers carefully", category: "Honey production", priority: "Medium" },
      { id: "monitor-varroa", title: "Monitor varroa", category: "Varroa", priority: "High" },
      { id: "support-water-forage", title: "Keep water and forage support available", category: "Colony support", priority: "Medium" },
      { id: "update-records", title: "Record harvests and inspections", category: "Records", priority: "Medium" }
    ]
  },
  {
    id: "august",
    month: "August",
    title: "August Beekeeping Master Guide",
    strapline: "Varroa, honey and winter preparation",
    season: "Late summer",
    image: "/images/seasonal-guides/august-tips.png",
    focus: ["Treat varroa where required", "Harvest capped honey and store supers safely", "Assess colony strength for winter"],
    risks: ["High mite levels", "Weak colonies", "Robbing, wasps and not enough stores"],
    actions: [
      { id: "check-mite-levels", title: "Check mite levels", category: "Varroa", priority: "High" },
      { id: "harvest-capped-honey", title: "Harvest capped honey", category: "Honey production", priority: "Medium" },
      { id: "feed-light-colonies", title: "Feed if stores are light", category: "Stores & feeding", priority: "High" },
      { id: "reduce-entrances", title: "Reduce entrances", category: "Hive checks", priority: "Medium" },
      { id: "unite-weak-colonies", title: "Unite weak colonies where appropriate", category: "Colony management", priority: "High" }
    ]
  },
  {
    id: "september",
    month: "September",
    title: "September Beekeeping Master Guide",
    strapline: "Feeding, varroa and winter preparation",
    season: "Autumn",
    image: "/images/seasonal-guides/september-tips.png",
    focus: ["Finish varroa treatments", "Build winter stores", "Combine weak colonies if needed"],
    risks: ["Low stores going into winter", "Wasps and robbing", "Mice finding unguarded hives"],
    actions: [
      { id: "finish-feeding", title: "Finish feeding by late September", category: "Stores & feeding", priority: "High" },
      { id: "check-queen-strength", title: "Check queen status and colony strength", category: "Queen checks", priority: "High" },
      { id: "fit-mouse-guards", title: "Fit mouse guards", category: "Winter protection", priority: "Medium" },
      { id: "reduce-entrances", title: "Reduce entrances", category: "Hive checks", priority: "Medium" },
      { id: "store-comb-safely", title: "Store comb safely", category: "Equipment", priority: "Medium" }
    ]
  },
  {
    id: "october",
    month: "October",
    title: "October Apiary Master Guide",
    strapline: "Fondant, insulation and winter preparation",
    season: "Autumn",
    image: "/images/seasonal-guides/october-tips.png",
    focus: ["Check stores and use fondant where needed", "Protect from pests", "Prepare hives for cold and wet weather"],
    risks: ["Small problems becoming winter losses", "Damp and poor ventilation", "Pests and unmanaged disease"],
    actions: [
      { id: "check-stores", title: "Check stores", category: "Stores & feeding", priority: "High" },
      { id: "fit-mouse-guards", title: "Fit mouse guards", category: "Winter protection", priority: "Medium" },
      { id: "check-weather-protection", title: "Check roofs and straps", category: "Winter protection", priority: "Medium" },
      { id: "clean-store-equipment", title: "Clean and store equipment", category: "Equipment", priority: "Low" },
      { id: "plant-spring-forage", title: "Plant for spring forage", category: "Forage", priority: "Low" }
    ]
  },
  {
    id: "november",
    month: "November",
    title: "November Beekeeping Tasks",
    strapline: "Winter protection, fondant feeding and quiet-season planning",
    season: "Winter preparation",
    image: "/images/seasonal-guides/november-tips.png",
    focus: ["Monitor stores", "Secure and weatherproof every hive", "Protect from mice and woodpeckers"],
    risks: ["Running short of stores", "Storm damage and damp", "Unnoticed winter disturbance"],
    actions: [
      { id: "check-stores", title: "Check hive stores / heft hives", category: "Stores & feeding", priority: "High" },
      { id: "add-fondant", title: "Add fondant if needed", category: "Stores & feeding", priority: "High" },
      { id: "check-mouse-guards", title: "Confirm mouse guards are fitted", category: "Winter protection", priority: "Medium" },
      { id: "update-records", title: "Review records", category: "Records", priority: "Low" },
      { id: "plan-equipment", title: "Plan equipment purchases", category: "Planning", priority: "Low" }
    ]
  },
  {
    id: "december",
    month: "December",
    title: "December Apiary Master Guide",
    strapline: "Fondant, oxalic acid and winter care",
    season: "Winter",
    image: "/images/seasonal-guides/december-tips.png",
    focus: ["Check winter stores", "Treat with oxalic acid if part of your plan", "Protect roofs, straps and entrances"],
    risks: ["Starvation", "Storm damage", "Disturbing the cluster unnecessarily"],
    actions: [
      { id: "check-stores", title: "Check hive stores / heft hives", category: "Stores & feeding", priority: "High" },
      { id: "add-fondant", title: "Add fondant to light colonies", category: "Stores & feeding", priority: "High" },
      { id: "oxalic-treatment", title: "Carry out oxalic treatment if appropriate", category: "Varroa", priority: "High" },
      { id: "check-after-storms", title: "Check hives after storms", category: "Winter protection", priority: "Medium" },
      { id: "update-records", title: "Update records", category: "Records", priority: "Low" }
    ]
  }
];