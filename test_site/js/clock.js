const STORAGE_KEY = "beezknees_rule_saved_plans_v2";

const DATA = {
  queen: {
    label: "Queen",
    keyEvents: [
      { key: "egg", day: 0, title: "Egg laid", description: "This is the start point for queen development." },
      { key: "hatched", day: 3, title: "Egg hatches", description: "Larva appears and can be developed into a queen." },
      { key: "capped", day: 8, title: "Queen cell capped", description: "A critical point for swarm timing and queen replacement." },
      { key: "swarm", day: 8.5, title: "Prime swarm risk", description: "Colonies often swarm around the time the first queen cell is sealed." },
      { key: "emerged", day: 16, title: "Virgin queen emerges", description: "The new queen emerges from the sealed cell." },
      { key: "mating", day: 21, title: "Likely mating flights", description: "Usually several days after emergence, weather permitting." },
      { key: "laying", day: 26, title: "Egg laying may begin", description: "A successfully mated queen may begin laying around this point." }
    ],
    note: "Swarm note: if you start from eggs or open queen cells, the sealing date is the key countdown point."
  },
  worker: {
    label: "Worker",
    keyEvents: [
      { key: "egg", day: 0, title: "Egg laid", description: "A worker egg has been laid by the queen." },
      { key: "hatched", day: 3, title: "Egg hatches", description: "The larva is now being fed by nurse bees." },
      { key: "capped", day: 9, title: "Worker brood capped", description: "The worker larva becomes a pupa under a sealed capping." },
      { key: "emerged", day: 21, title: "Worker emerges", description: "A new adult worker bee emerges from the cell." },
      { key: "nurse", day: 24, title: "Early hive duties", description: "Young workers usually begin with cleaning and nursing duties." },
      { key: "foraging", day: 42, title: "Likely foraging age", description: "Many workers begin foraging later in adult life, depending on colony needs." }
    ],
    note: "Worker timing is useful for understanding brood gaps, colony buildup, and expected emergence after inspections."
  },
  drone: {
    label: "Drone",
    keyEvents: [
      { key: "egg", day: 0, title: "Egg laid", description: "A drone egg has been laid in a larger drone cell." },
      { key: "hatched", day: 3, title: "Egg hatches", description: "The drone larva is fed by worker bees." },
      { key: "capped", day: 10, title: "Drone brood capped", description: "The drone enters the sealed pupal stage." },
      { key: "emerged", day: 24, title: "Drone emerges", description: "An adult drone emerges from the cell." },
      { key: "mature", day: 38, title: "Sexual maturity", description: "Drones typically need extra days after emergence before mating flights." }
    ],
    note: "Drone brood remains capped for longer, which is one reason varroa mites often prefer it."
  }
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TASKS = {
  January: [
    { focus: "winter", title: "Check heft and food reserves", text: "Monitor colony weight and emergency feed if necessary without disturbing the cluster." },
    { focus: "health", title: "Review varroa records", text: "Use the quiet period to assess autumn treatment results and winter losses." }
  ],
  February: [
    { focus: "feeding", title: "Watch late-winter stores", text: "Colonies may consume stores rapidly as brood rearing begins." },
    { focus: "health", title: "Plan spring inspections", text: "Prepare clean kit, records and spare brood boxes before the season starts." }
  ],
  March: [
    { focus: "inspections", title: "Begin careful spring checks", text: "Inspect when weather allows and assess queenrightness, brood pattern and food reserves." },
    { focus: "feeding", title: "Support weak colonies", text: "Feed where needed and avoid colonies being held back by lack of stores." }
  ],
  April: [
    { focus: "inspections", title: "Expand with colony growth", text: "Brood nests build quickly now, so ensure adequate space and regular inspections." },
    { focus: "swarm", title: "Start swarm prevention early", text: "Watch for congestion, queen cells and the first real signs of swarming intent." },
    { focus: "breeding", title: "Prepare breeder colonies", text: "Select promising stocks if you plan queen rearing later in spring." }
  ],
  May: [
    { focus: "swarm", title: "Peak swarm vigilance", text: "This is often the key month for swarm control, splits and artificial swarm work." },
    { focus: "honey", title: "Build for main forage", text: "Strong brood production now can influence the strength of the summer crop." },
    { focus: "breeding", title: "Start queen rearing projects", text: "Conditions are often suitable for grafting, mating nucs and queen production." }
  ],
  June: [
    { focus: "honey", title: "Manage honey flow pressure", text: "Super in time, reduce congestion and keep strong colonies working productively." },
    { focus: "swarm", title: "Continue swarm checks", text: "Swarming risk may still be high in very strong colonies." },
    { focus: "breeding", title: "Monitor mating success", text: "Check virgins, mating nucs and early laying queens." }
  ],
  July: [
    { focus: "honey", title: "Track the main crop", text: "Watch supers closely and plan extraction around your local flow." },
    { focus: "health", title: "Assess colony condition after crop", text: "Check temperament, queen quality and brood pattern before late-season decisions." }
  ],
  August: [
    { focus: "health", title: "Prepare for varroa control", text: "Late summer is often the key time to manage mite pressure after the crop." },
    { focus: "feeding", title: "Begin winter preparation planning", text: "Assess stores, colony strength and which colonies may need support or combining." },
    { focus: "breeding", title: "Late-season mating decisions", text: "Only continue breeding where drones, weather and time still make sense." }
  ],
  September: [
    { focus: "feeding", title: "Complete winter feeding", text: "Aim to have colonies well provisioned before weather turns colder." },
    { focus: "winter", title: "Reduce entrances and tidy apiary", text: "Protect colonies from wasps, robbing and worsening weather." }
  ],
  October: [
    { focus: "winter", title: "Minimise disturbance", text: "Colonies should now be settled for winter with only essential intervention." },
    { focus: "health", title: "Review colony viability", text: "Make final decisions on weak units before winter losses worsen." }
  ],
  November: [
    { focus: "winter", title: "Monitor without opening hives", text: "Use external checks and only intervene if something clearly needs action." },
    { focus: "health", title: "Plan equipment maintenance", text: "Repair boxes, frames and roofs while colony activity is low." }
  ],
  December: [
    { focus: "winter", title: "Keep hives stable and dry", text: "Good wintering is often about leaving colonies alone and ensuring ventilation and shelter." },
    { focus: "health", title: "Review the season", text: "Use records to identify what worked well and where to improve next year." }
  ]
};

const beeType = document.getElementById("beeType");
const startDate = document.getElementById("startDate");
const startEvent = document.getElementById("startEvent");
const updateClockBtn = document.getElementById("updateClockBtn");
const todayClockBtn = document.getElementById("todayClockBtn");
const summaryHeadline = document.getElementById("summaryHeadline");
const summaryText = document.getElementById("summaryText");
const eventsList = document.getElementById("eventsList");
const beeNote = document.getElementById("beeNote");

const flowName = document.getElementById("flowName");
const apiaryNote = document.getElementById("apiaryNote");
const flowStart = document.getElementById("flowStart");
const flowEnd = document.getElementById("flowEnd");
const foragerLead = document.getElementById("foragerLead");
const updateHoneyBtn = document.getElementById("updateHoneyBtn");
const useExampleBtn = document.getElementById("useExampleBtn");
const honeyHeadline = document.getElementById("honeyHeadline");
const honeySummaryText = document.getElementById("honeySummaryText");
const eggWindowText = document.getElementById("eggWindowText");
const stimText = document.getElementById("stimText");
const honeyTimeline = document.getElementById("honeyTimeline");
const honeyAssumptions = document.getElementById("honeyAssumptions");

const desiredMatingDate = document.getElementById("desiredMatingDate");
const breedingApiary = document.getElementById("breedingApiary");
const droneMaturityLead = document.getElementById("droneMaturityLead");
const queenBuildMethod = document.getElementById("queenBuildMethod");
const queenSourceNote = document.getElementById("queenSourceNote");
const updateBreedingBtn = document.getElementById("updateBreedingBtn");
const useBreedingExampleBtn = document.getElementById("useBreedingExampleBtn");
const breedingHeadline = document.getElementById("breedingHeadline");
const breedingSummaryText = document.getElementById("breedingSummaryText");
const dronePlanText = document.getElementById("dronePlanText");
const queenPlanText = document.getElementById("queenPlanText");
const breedingTimeline = document.getElementById("breedingTimeline");
const breedingAssumptions = document.getElementById("breedingAssumptions");

const ruleMode = document.getElementById("ruleMode");
const ruleReferenceDate = document.getElementById("ruleReferenceDate");
const ruleManualLabel = document.getElementById("ruleManualLabel");
const updateRuleWheelBtn = document.getElementById("updateRuleWheelBtn");
const ruleTodayBtn = document.getElementById("ruleTodayBtn");
const ruleHeadline = document.getElementById("ruleHeadline");
const ruleSummaryText = document.getElementById("ruleSummaryText");
const ruleWorkerText = document.getElementById("ruleWorkerText");
const ruleQueenText = document.getElementById("ruleQueenText");
const ruleDroneText = document.getElementById("ruleDroneText");
const ruleCenterTitle = document.getElementById("ruleCenterTitle");
const ruleCenterMeta = document.getElementById("ruleCenterMeta");
const ruleNote = document.getElementById("ruleNote");
const ruleMonthLabels = document.getElementById("ruleMonthLabels");
const ruleMonthTicks = document.getElementById("ruleMonthTicks");
const ruleReferencePointer = document.getElementById("ruleReferencePointer");
const ruleWorkerMarker = document.getElementById("ruleWorkerMarker");
const ruleDroneMarker = document.getElementById("ruleDroneMarker");
const ruleQueenMarker = document.getElementById("ruleQueenMarker");
const ruleExtraMarker = document.getElementById("ruleExtraMarker");

const planName = document.getElementById("planName");
const planApiary = document.getElementById("planApiary");
const planNotes = document.getElementById("planNotes");
const savePlanBtn = document.getElementById("savePlanBtn");
const clearPlanFieldsBtn = document.getElementById("clearPlanFieldsBtn");
const savedPlansList = document.getElementById("savedPlansList");
const planStatus = document.getElementById("planStatus");

const weatherRegion = document.getElementById("weatherRegion");
const weatherPattern = document.getElementById("weatherPattern");
const weatherTempBand = document.getElementById("weatherTempBand");
const weatherRainRisk = document.getElementById("weatherRainRisk");
const weatherFlightRisk = document.getElementById("weatherFlightRisk");
const nectarStrength = document.getElementById("nectarStrength");
const weatherNotes = document.getElementById("weatherNotes");
const updateWeatherOverlayBtn = document.getElementById("updateWeatherOverlayBtn");
const weatherExampleBtn = document.getElementById("weatherExampleBtn");
const weatherStatus = document.getElementById("weatherStatus");
const weatherSummaryGrid = document.getElementById("weatherSummaryGrid");
const reminderGrid = document.getElementById("reminderGrid");
const reminderNote = document.getElementById("reminderNote");

const inspectionAdvisorGrid = document.getElementById("inspectionAdvisorGrid");
const swarmRiskGrid = document.getElementById("swarmRiskGrid");
const advisorNote = document.getElementById("advisorNote");

const comparePlanA = document.getElementById("comparePlanA");
const comparePlanB = document.getElementById("comparePlanB");
const runComparisonBtn = document.getElementById("runComparisonBtn");
const clearComparisonBtn = document.getElementById("clearComparisonBtn");
const comparisonResults = document.getElementById("comparisonResults");
const comparisonStatus = document.getElementById("comparisonStatus");

const taskMonth = document.getElementById("taskMonth");
const taskFocus = document.getElementById("taskFocus");
const taskApiaryNote = document.getElementById("taskApiaryNote");
const updateTaskCalendarBtn = document.getElementById("updateTaskCalendarBtn");
const useCurrentMonthBtn = document.getElementById("useCurrentMonthBtn");
const taskCalendarHeading = document.getElementById("taskCalendarHeading");
const taskCalendarIntro = document.getElementById("taskCalendarIntro");
const taskList = document.getElementById("taskList");
const taskCalendarStatus = document.getElementById("taskCalendarStatus");

const overviewMode = document.getElementById("overviewMode");
const overviewModeText = document.getElementById("overviewModeText");
const overviewPrimaryDate = document.getElementById("overviewPrimaryDate");
const overviewPrimaryText = document.getElementById("overviewPrimaryText");
const overviewAction = document.getElementById("overviewAction");
const overviewActionText = document.getElementById("overviewActionText");
const overviewUse = document.getElementById("overviewUse");
const overviewUseText = document.getElementById("overviewUseText");
const overviewSavedPlan = document.getElementById("overviewSavedPlan");
const overviewSavedPlanText = document.getElementById("overviewSavedPlanText");
const overviewReminderHeadline = document.getElementById("overviewReminderHeadline");
const overviewReminderText = document.getElementById("overviewReminderText");

const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".mode-panel");

let currentLoadedPlanName = "";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffDays(from, to) {
  const ms = 24 * 60 * 60 * 1000;
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / ms);
}

function getOffsetDay(type, eventKey) {
  const item = DATA[type];
  const match = item.keyEvents.find((ev) => ev.key === eventKey);
  return match ? match.day : 0;
}

function setToday(inputEl) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  inputEl.value = local;
}

function getCurrentMonthName() {
  return MONTH_NAMES[new Date().getMonth()];
}

function switchMode(mode) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${mode}`);
  });

  updateOverview(mode);
}

function getActiveMode() {
  const active = document.querySelector(".tab-btn.active");
  return active ? active.dataset.mode : "development";
}

function updateOverview(mode) {
  if (mode === "development") {
    const selectedDate = startDate.value ? new Date(startDate.value + "T12:00:00") : null;
    overviewMode.textContent = "Development Clock";
    overviewModeText.textContent = "Track queen, worker or drone timing from a known observation date.";
    overviewPrimaryDate.textContent = selectedDate ? formatDate(selectedDate) : "Not set";
    overviewPrimaryText.textContent = "Primary date is the development observation date.";
    overviewAction.textContent = "Review next colony events";
    overviewActionText.textContent = "Use this mode when you want to understand what should happen next after a known stage.";
    overviewUse.textContent = "Lifecycle timing";
    overviewUseText.textContent = "Best for swarm timing, brood checks and understanding queen, worker or drone development.";
  }

  if (mode === "honey") {
    const selectedDate = flowStart.value ? new Date(flowStart.value + "T12:00:00") : null;
    overviewMode.textContent = "Honey Flow Planning";
    overviewModeText.textContent = "Work backwards from a nectar flow to estimate when foragers need to be produced.";
    overviewPrimaryDate.textContent = selectedDate ? formatDate(selectedDate) : "Not set";
    overviewPrimaryText.textContent = "Primary date is the start of the target nectar flow.";
    overviewAction.textContent = "Stimulate brood in time";
    overviewActionText.textContent = "Use this mode to decide when colonies should be building worker brood ahead of a main honey crop.";
    overviewUse.textContent = "Honey production";
    overviewUseText.textContent = "Best for timing syrup feeding, brood stimulation and colony build-up for a known forage window.";
  }

  if (mode === "breeding") {
    const selectedDate = desiredMatingDate.value ? new Date(desiredMatingDate.value + "T12:00:00") : null;
    overviewMode.textContent = "Queen Breeding";
    overviewModeText.textContent = "Synchronise drone production and queen rearing with a target mating date.";
    overviewPrimaryDate.textContent = selectedDate ? formatDate(selectedDate) : "Not set";
    overviewPrimaryText.textContent = "Primary date is the desired mating point.";
    overviewAction.textContent = "Align drones and virgins";
    overviewActionText.textContent = "Use this mode to plan drone eggs, queen rearing start points and likely virgin emergence.";
    overviewUse.textContent = "Breeding synchronisation";
    overviewUseText.textContent = "Best for selected mating work, queen rearing and late-season drone planning.";
  }

  if (mode === "wheel") {
    const selectedDate = ruleReferenceDate.value ? new Date(ruleReferenceDate.value + "T12:00:00") : null;
    overviewMode.textContent = "Rule Wheel";
    overviewModeText.textContent = "View worker, queen and drone timing together on one annual circular calendar.";
    overviewPrimaryDate.textContent = selectedDate ? formatDate(selectedDate) : "Not set";
    overviewPrimaryText.textContent = "Primary date is the selected wheel reference date.";
    overviewAction.textContent = "Compare timing visually";
    overviewActionText.textContent = "Use this mode when you want a visual annual alignment rather than a simple linear calculation.";
    overviewUse.textContent = "Calendar alignment";
    overviewUseText.textContent = "Best for seeing how worker, queen and drone dates sit together on the same rule-style wheel.";
  }

  overviewSavedPlan.textContent = currentLoadedPlanName || "None loaded";
  overviewSavedPlanText.textContent = currentLoadedPlanName
    ? "This dashboard is currently showing a loaded saved plan."
    : "Save your current work so you can return to it later on this device.";
}

function renderDevelopment() {
  const type = beeType.value;
  const item = DATA[type];
  const selectedDate = startDate.value ? new Date(startDate.value + "T12:00:00") : new Date();
  const selectedEventKey = startEvent.value;
  const eventOffset = getOffsetDay(type, selectedEventKey);
  const eggDate = addDays(selectedDate, -eventOffset);

  summaryHeadline.textContent = `${item.keyEvents.find((e) => e.key === selectedEventKey)?.title || "Selected event"} on ${formatDate(selectedDate)}`;
  summaryText.textContent = `Using ${formatDate(selectedDate)} as the observed ${selectedEventKey} date, the dashboard back-calculates the original egg date as ${formatDate(eggDate)} and projects the next key colony events below.`;
  beeNote.textContent = item.note;

  eventsList.innerHTML = "";
  item.keyEvents.forEach((event) => {
    const actualDate = addDays(eggDate, event.day);
    const article = document.createElement("article");
    article.className = "event-item";
    article.innerHTML = `
      <div class="event-day">
        <strong>Day ${Math.round(event.day)}</strong>
        <span>${formatDate(actualDate)}</span>
      </div>
      <div class="event-copy">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
      </div>
    `;
    eventsList.appendChild(article);
  });
}

function renderHoneyPlanner() {
  if (!flowStart.value || !flowEnd.value) {
    honeyHeadline.textContent = "Honey flow planning summary";
    honeySummaryText.textContent = "Add your expected nectar flow period and the planner will calculate when eggs should be laid to produce foragers at the right time.";
    eggWindowText.textContent = "Not calculated yet.";
    stimText.textContent = "Not calculated yet.";
    honeyTimeline.innerHTML = "";
    honeyAssumptions.textContent = "Assumption: this planner uses worker development plus the selected age at which workers begin foraging.";
    return;
  }

  const start = new Date(flowStart.value + "T12:00:00");
  const end = new Date(flowEnd.value + "T12:00:00");
  const lead = Number(foragerLead.value);
  const nectarSource = flowName.value.trim() || "Main nectar flow";
  const apiaryText = apiaryNote.value.trim();

  const eggWindowStart = addDays(start, -lead);
  const eggWindowEnd = addDays(end, -lead);
  const stimulationStart = addDays(eggWindowStart, -7);
  const stimulationReview = addDays(eggWindowStart, -3);
  const superPrep = addDays(start, -7);

  honeyHeadline.textContent = `${nectarSource} planning summary`;
  honeySummaryText.textContent =
    `${nectarSource} is expected from ${formatDate(start)} to ${formatDate(end)}.` +
    `${apiaryText ? ` Note: ${apiaryText}.` : ""} ` +
    `Using an estimated ${lead}-day journey from egg to forager, the colony should be building worker brood well in advance of the flow.`;

  eggWindowText.textContent =
    `To produce foragers that are ready during this flow, worker eggs should be laid from ${formatDate(eggWindowStart)} to ${formatDate(eggWindowEnd)}.`;

  stimText.textContent =
    `Begin brood stimulation around ${formatDate(stimulationStart)}. Review colony strength and laying space again around ${formatDate(stimulationReview)}.`;

  const timelineItems = [
    { date: stimulationStart, tag: "Start", title: "Begin brood stimulation", description: "Feed if required, check stores, and create laying space ahead of the target flow." },
    { date: eggWindowStart, tag: "Eggs", title: "Earliest worker eggs for this flow", description: "Workers laid from this point should begin contributing as foragers at the start of the target flow." },
    { date: stimulationReview, tag: "Review", title: "Check brood expansion", description: "Confirm worker brood build-up and colony strength." },
    { date: superPrep, tag: "Prep", title: "Supering and preparation", description: "Reduce congestion and prepare for incoming nectar." },
    { date: start, tag: "Flow", title: "Peak forager window begins", description: "Planned worker force should start aligning with the nectar source." },
    { date: end, tag: "Flow", title: "Peak forager window ends", description: "Review crop progress and colony condition as the forage period tails off." }
  ];

  honeyTimeline.innerHTML = timelineItems.map((item) => `
    <article class="timeline-item">
      <div class="timeline-date-box blue">
        <strong>${item.tag}</strong>
        <span>${formatDate(item.date)}</span>
      </div>
      <div class="timeline-copy">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    </article>
  `).join("");

  honeyAssumptions.textContent =
    `Assumption: this planner uses a ${lead}-day estimate from worker egg to active forager. Use it as a guide alongside local weather, floral timing and colony strength.`;
}

function renderBreedingPlanner() {
  if (!desiredMatingDate.value) {
    breedingHeadline.textContent = "Breeding synchronisation summary";
    breedingSummaryText.textContent = "Add your desired mating date and the planner will calculate when drone production and queen rearing should begin.";
    dronePlanText.textContent = "Not calculated yet.";
    queenPlanText.textContent = "Not calculated yet.";
    breedingTimeline.innerHTML = "";
    breedingAssumptions.textContent = "Assumption: this planner uses a queen development period of 16 days and the selected drone maturity lead time.";
    return;
  }

  const matingDate = new Date(desiredMatingDate.value + "T12:00:00");
  const droneLead = Number(droneMaturityLead.value);
  const apiaryText = breedingApiary.value.trim();
  const sourceText = queenSourceNote.value.trim();
  const method = queenBuildMethod.value;

  const droneEggDate = addDays(matingDate, -droneLead);
  const droneStimStart = addDays(droneEggDate, -7);
  const droneReview = addDays(droneEggDate, -3);

  let queenActionDate;
  let virginEmergenceDate;
  let queenActionText;

  if (method === "virginOnDate") {
    virginEmergenceDate = matingDate;
    queenActionDate = addDays(virginEmergenceDate, -16);
    queenActionText = `To have a virgin queen ready on ${formatDate(matingDate)}, queen rearing should begin around ${formatDate(queenActionDate)}.`;
  } else {
    queenActionDate = matingDate;
    virginEmergenceDate = addDays(queenActionDate, 16);
    queenActionText = `If queen rearing starts on ${formatDate(matingDate)}, a virgin queen may emerge around ${formatDate(virginEmergenceDate)}.`;
  }

  const likelyEggLaying = addDays(matingDate, 5);

  breedingHeadline.textContent = "Breeding synchronisation summary";
  breedingSummaryText.textContent =
    `Desired mating date: ${formatDate(matingDate)}.` +
    `${apiaryText ? ` Note: ${apiaryText}.` : ""}` +
    `${sourceText ? ` Queen source note: ${sourceText}.` : ""}`;

  dronePlanText.textContent =
    `Drone eggs should be laid around ${formatDate(droneEggDate)}. Begin drone stimulation around ${formatDate(droneStimStart)} and review again around ${formatDate(droneReview)}.`;

  queenPlanText.textContent = queenActionText;

  const timelineItems = [
    { date: droneStimStart, tag: "Drones", title: "Begin drone stimulation", description: "Encourage drone production in selected colonies." },
    { date: droneReview, tag: "Review", title: "Review drone build-up", description: "Confirm drone brood is being raised and colonies remain strong." },
    { date: droneEggDate, tag: "Eggs", title: "Target drone egg date", description: "Drone eggs from this point should mature for the planned mating period." },
    { date: queenActionDate, tag: "Queens", title: "Begin queen rearing", description: method === "virginOnDate" ? "Start queen-rearing action so virgins are ready by the target mating date." : "Chosen queen-rearing start point for the later emergence calculation." },
    { date: virginEmergenceDate, tag: "Virgin", title: "Virgin queen emergence", description: "Expected virgin emergence based on a 16-day queen development cycle." },
    { date: matingDate, tag: "Mate", title: "Desired mating point", description: "Target point where mature drones and virgin queens should overlap." },
    { date: likelyEggLaying, tag: "Laying", title: "Possible first egg laying", description: "If mating is successful, egg laying may begin several days later." }
  ];

  breedingTimeline.innerHTML = timelineItems.map((item) => `
    <article class="timeline-item">
      <div class="timeline-date-box purple">
        <strong>${item.tag}</strong>
        <span>${formatDate(item.date)}</span>
      </div>
      <div class="timeline-copy">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    </article>
  `).join("");

  breedingAssumptions.textContent =
    `Assumption: this planner uses a ${droneLead}-day estimate from drone egg to mature flying drone and a 16-day queen development period.`;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysInYear(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return Math.round((end - start) / 86400000);
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1, 12);
  return Math.floor((date - start) / 86400000);
}

function angleFromDate(date) {
  const total = daysInYear(date.getFullYear());
  const fraction = dayOfYear(date) / total;
  return (fraction * 360) - 90;
}

function polarPoint(angleDeg, radius) {
  const rad = angleDeg * Math.PI / 180;
  return {
    x: 320 + Math.cos(rad) * radius,
    y: 320 + Math.sin(rad) * radius
  };
}

function clearSvgGroup(group) {
  while (group.firstChild) group.removeChild(group.firstChild);
}

function drawMonthRing(year) {
  clearSvgGroup(ruleMonthLabels);
  clearSvgGroup(ruleMonthTicks);

  for (let i = 0; i < 12; i += 1) {
    const monthDate = new Date(year, i, 1, 12);
    const angle = angleFromDate(monthDate);
    const labelPt = polarPoint(angle, 286);
    const tickOuter = polarPoint(angle, 270);
    const tickInner = polarPoint(angle, 248);

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", tickOuter.x);
    line.setAttribute("y1", tickOuter.y);
    line.setAttribute("x2", tickInner.x);
    line.setAttribute("y2", tickInner.y);
    line.setAttribute("stroke", "#94a3b8");
    line.setAttribute("stroke-width", "2");
    ruleMonthTicks.appendChild(line);

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", labelPt.x);
    text.setAttribute("y", labelPt.y);
    text.setAttribute("fill", "#334155");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-weight", "700");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = MONTHS[i];
    ruleMonthLabels.appendChild(text);
  }
}

function drawPointer(group, date, color, radius, label, width = 6) {
  clearSvgGroup(group);
  if (!date) return;

  const angle = angleFromDate(date);
  const outer = polarPoint(angle, radius);
  const inner = polarPoint(angle, 74);

  const line = document.createElementNS(SVG_NS, "line");
  line.setAttribute("x1", inner.x);
  line.setAttribute("y1", inner.y);
  line.setAttribute("x2", outer.x);
  line.setAttribute("y2", outer.y);
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", String(width));
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("filter", "url(#softShadow)");
  group.appendChild(line);

  const dot = document.createElementNS(SVG_NS, "circle");
  dot.setAttribute("cx", outer.x);
  dot.setAttribute("cy", outer.y);
  dot.setAttribute("r", "9");
  dot.setAttribute("fill", color);
  dot.setAttribute("stroke", "#fff");
  dot.setAttribute("stroke-width", "4");
  group.appendChild(dot);

  const labelPt = polarPoint(angle, radius + 24);
  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", labelPt.x);
  text.setAttribute("y", labelPt.y);
  text.setAttribute("fill", color);
  text.setAttribute("font-size", "13");
  text.setAttribute("font-weight", "700");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.textContent = label;
  group.appendChild(text);
}

function renderRuleWheel() {
  const mode = ruleMode.value;

  let refDate = ruleReferenceDate.value ? new Date(ruleReferenceDate.value + "T12:00:00") : null;
  let workerDate = null;
  let queenDate = null;
  let droneDate = null;
  let extraDate = null;

  let headline = "Digital Beekeeper’s Rule summary";
  let summary = "Select a mode to map your chosen dates onto the circular calendar.";
  let workerText = "Not calculated yet.";
  let queenText = "Not calculated yet.";
  let droneText = "Not calculated yet.";
  let centerTitle = "Rule Wheel";
  let centerMeta = "Planning alignment";
  let note = "This wheel is a modern digital interpretation of the Beekeeper’s Rule. It is designed as a planning guide rather than an exact biological guarantee.";

  if (mode === "reference") {
    if (!refDate) refDate = new Date();
    const type = beeType.value;
    const item = DATA[type];
    const eventOffset = getOffsetDay(type, startEvent.value);
    const eggDate = addDays(refDate, -eventOffset);

    workerDate = type === "worker" ? eggDate : addDays(eggDate, 40);
    queenDate = type === "queen" ? addDays(eggDate, 16) : addDays(refDate, 16);
    droneDate = addDays(refDate, 38);
    extraDate = eggDate;

    headline = "Reference lifecycle alignment";
    summary = `Using ${formatDate(refDate)} as the selected reference date, the wheel plots linked worker, queen and drone timing onto the same annual calendar.`;
    workerText = `Worker reference shown at ${formatDate(workerDate)}.`;
    queenText = `Queen reference shown at ${formatDate(queenDate)}.`;
    droneText = `Drone reference shown at ${formatDate(droneDate)}.`;
    centerTitle = item.label;
    centerMeta = `${ruleManualLabel.value.trim() || "Reference lifecycle mode"}`;
    note = "Reference mode is useful for seeing how one selected colony event aligns with later worker, queen and drone timing on the calendar.";
  }

  if (mode === "honey") {
    const start = flowStart.value ? new Date(flowStart.value + "T12:00:00") : null;
    const end = flowEnd.value ? new Date(flowEnd.value + "T12:00:00") : null;
    const lead = Number(foragerLead.value);

    if (start) {
      refDate = start;
      workerDate = addDays(start, -lead);
      queenDate = addDays(start, -16);
      droneDate = addDays(start, -38);
      extraDate = end;

      const source = flowName.value.trim() || "Main nectar flow";
      headline = `${source} wheel alignment`;
      summary = `${source} starts on ${formatDate(start)}${end ? ` and runs to ${formatDate(end)}` : ""}. The wheel shows the reference nectar date alongside worker, queen and drone timing offsets.`;
      workerText = `Worker eggs for foragers aligned at ${formatDate(workerDate)} using a ${lead}-day forager lead.`;
      queenText = `Queen comparison marker shown at ${formatDate(queenDate)}.`;
      droneText = `Drone comparison marker shown at ${formatDate(droneDate)}.`;
      centerTitle = "Honey Flow";
      centerMeta = source;
      note = "In honey mode, the orange marker is the nectar-flow reference and the blue marker is the worker-egg point for forager production.";
    }
  }

  if (mode === "breeding") {
    const mating = desiredMatingDate.value ? new Date(desiredMatingDate.value + "T12:00:00") : null;
    const droneLead = Number(droneMaturityLead.value);

    if (mating) {
      refDate = mating;
      droneDate = addDays(mating, -droneLead);

      if (queenBuildMethod.value === "virginOnDate") {
        queenDate = addDays(mating, -16);
        extraDate = mating;
      } else {
        queenDate = mating;
        extraDate = addDays(mating, 16);
      }

      workerDate = addDays(mating, -40);

      headline = "Breeding synchronisation wheel";
      summary = `Desired mating date: ${formatDate(mating)}. The wheel plots drone, queen and worker comparison timing against the same calendar reference.`;
      workerText = `Worker comparison marker shown at ${formatDate(workerDate)} using a 40-day worker comparison.`;
      queenText = queenBuildMethod.value === "virginOnDate"
        ? `Queen rearing should begin around ${formatDate(queenDate)} so a virgin is ready on ${formatDate(mating)}.`
        : `Queen rearing start marker is ${formatDate(queenDate)}, with expected virgin emergence around ${formatDate(extraDate)}.`;
      droneText = `Drone eggs should be laid around ${formatDate(droneDate)} using a ${droneLead}-day drone maturity lead.`;
      centerTitle = "Breeding";
      centerMeta = breedingApiary.value.trim() || "Mating alignment";
      note = "In breeding mode, the orange marker is the desired mating point, the purple marker is the drone egg date, and the green marker is the queen-rearing timing marker.";
    }
  }

  if (!refDate) refDate = new Date();

  drawMonthRing(refDate.getFullYear());
  drawPointer(ruleReferencePointer, refDate, "#c98118", 256, "Ref", 7);
  drawPointer(ruleWorkerMarker, workerDate, "#1d4ed8", 216, "Worker", 6);
  drawPointer(ruleDroneMarker, droneDate, "#7c3aed", 176, "Drone", 6);
  drawPointer(ruleQueenMarker, queenDate, "#2f6f3e", 136, "Queen", 6);
  drawPointer(ruleExtraMarker, extraDate, "#9f1d1d", 96, "Extra", 5);

  ruleHeadline.textContent = headline;
  ruleSummaryText.textContent = summary;
  ruleWorkerText.textContent = workerText;
  ruleQueenText.textContent = queenText;
  ruleDroneText.textContent = droneText;
  ruleCenterTitle.textContent = centerTitle;
  ruleCenterMeta.textContent = centerMeta;
  ruleNote.textContent = note;
}

function collectCurrentState() {
  return {
    activeMode: getActiveMode(),
    planMeta: {
      planName: planName.value.trim(),
      planApiary: planApiary.value.trim(),
      planNotes: planNotes.value.trim()
    },
    development: {
      beeType: beeType.value,
      startDate: startDate.value,
      startEvent: startEvent.value
    },
    honey: {
      flowName: flowName.value.trim(),
      apiaryNote: apiaryNote.value.trim(),
      flowStart: flowStart.value,
      flowEnd: flowEnd.value,
      foragerLead: foragerLead.value
    },
    breeding: {
      desiredMatingDate: desiredMatingDate.value,
      breedingApiary: breedingApiary.value.trim(),
      droneMaturityLead: droneMaturityLead.value,
      queenBuildMethod: queenBuildMethod.value,
      queenSourceNote: queenSourceNote.value.trim()
    },
    wheel: {
      ruleMode: ruleMode.value,
      ruleReferenceDate: ruleReferenceDate.value,
      ruleManualLabel: ruleManualLabel.value.trim()
    },
    overlay: {
      weatherRegion: weatherRegion.value.trim(),
      weatherPattern: weatherPattern.value,
      weatherTempBand: weatherTempBand.value,
      weatherRainRisk: weatherRainRisk.value,
      weatherFlightRisk: weatherFlightRisk.value,
      nectarStrength: nectarStrength.value,
      weatherNotes: weatherNotes.value.trim()
    },
    taskCalendar: {
      taskMonth: taskMonth.value,
      taskFocus: taskFocus.value,
      taskApiaryNote: taskApiaryNote.value.trim()
    },
    savedAt: new Date().toISOString()
  };
}

function applyState(state) {
  if (!state) return;

  if (state.planMeta) {
    planName.value = state.planMeta.planName || "";
    planApiary.value = state.planMeta.planApiary || "";
    planNotes.value = state.planMeta.planNotes || "";
  }

  if (state.development) {
    beeType.value = state.development.beeType || "queen";
    startDate.value = state.development.startDate || "";
    startEvent.value = state.development.startEvent || "egg";
  }

  if (state.honey) {
    flowName.value = state.honey.flowName || "";
    apiaryNote.value = state.honey.apiaryNote || "";
    flowStart.value = state.honey.flowStart || "";
    flowEnd.value = state.honey.flowEnd || "";
    foragerLead.value = state.honey.foragerLead || "40";
  }

  if (state.breeding) {
    desiredMatingDate.value = state.breeding.desiredMatingDate || "";
    breedingApiary.value = state.breeding.breedingApiary || "";
    droneMaturityLead.value = state.breeding.droneMaturityLead || "38";
    queenBuildMethod.value = state.breeding.queenBuildMethod || "virginOnDate";
    queenSourceNote.value = state.breeding.queenSourceNote || "";
  }

  if (state.wheel) {
    ruleMode.value = state.wheel.ruleMode || "honey";
    ruleReferenceDate.value = state.wheel.ruleReferenceDate || "";
    ruleManualLabel.value = state.wheel.ruleManualLabel || "";
  }

  if (state.overlay) {
    weatherRegion.value = state.overlay.weatherRegion || "";
    weatherPattern.value = state.overlay.weatherPattern || "mixed";
    weatherTempBand.value = state.overlay.weatherTempBand || "moderate";
    weatherRainRisk.value = state.overlay.weatherRainRisk || "moderate";
    weatherFlightRisk.value = state.overlay.weatherFlightRisk || "fair";
    nectarStrength.value = state.overlay.nectarStrength || "building";
    weatherNotes.value = state.overlay.weatherNotes || "";
  }

  if (state.taskCalendar) {
    taskMonth.value = state.taskCalendar.taskMonth || getCurrentMonthName();
    taskFocus.value = state.taskCalendar.taskFocus || "all";
    taskApiaryNote.value = state.taskCalendar.taskApiaryNote || "";
  }

  renderAll();
  switchMode(state.activeMode || "development");
}

function getSavedPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setSavedPlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function saveCurrentPlan() {
  const name = planName.value.trim();
  if (!name) {
    planStatus.textContent = "Please enter a plan name before saving.";
    return;
  }

  const allPlans = getSavedPlans();
  const state = collectCurrentState();
  const existingIndex = allPlans.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());

  const savedPlan = {
    name,
    apiary: planApiary.value.trim(),
    notes: planNotes.value.trim(),
    state,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    allPlans[existingIndex] = savedPlan;
    planStatus.textContent = `Plan updated: ${name}`;
  } else {
    allPlans.unshift(savedPlan);
    planStatus.textContent = `Plan saved: ${name}`;
  }

  currentLoadedPlanName = name;
  setSavedPlans(allPlans);
  renderSavedPlans();
  populateComparisonSelectors();
  updateOverview(getActiveMode());
}

function loadPlan(name) {
  const allPlans = getSavedPlans();
  const match = allPlans.find((p) => p.name === name);
  if (!match) {
    planStatus.textContent = "That saved plan could not be found.";
    return;
  }

  currentLoadedPlanName = match.name;
  applyState(match.state);
  planStatus.textContent = `Plan loaded: ${match.name}`;
  updateOverview(getActiveMode());
}

function deletePlan(name) {
  const allPlans = getSavedPlans().filter((p) => p.name !== name);
  setSavedPlans(allPlans);

  if (currentLoadedPlanName === name) {
    currentLoadedPlanName = "";
  }

  renderSavedPlans();
  populateComparisonSelectors();
  comparisonResults.innerHTML = "";
  comparisonStatus.textContent = `Plan deleted: ${name}`;
  planStatus.textContent = `Plan deleted: ${name}`;
  updateOverview(getActiveMode());
}

function renderSavedPlans() {
  const allPlans = getSavedPlans();
  if (!allPlans.length) {
    savedPlansList.innerHTML = `
      <div class="info-card">
        <strong>No saved plans yet</strong>
        <p>Save a named plan above and it will appear here for loading, updating or deleting.</p>
      </div>
    `;
    return;
  }

  savedPlansList.innerHTML = allPlans.map((plan) => {
    const updated = new Date(plan.updatedAt);
    const mode = plan.state?.activeMode || "development";
    return `
      <article class="plan-item">
        <div class="plan-item-header">
          <div>
            <strong>${escapeHtml(plan.name)}</strong>
            <div class="plan-meta">
              ${plan.apiary ? `Apiary: ${escapeHtml(plan.apiary)} · ` : ""}
              Updated: ${formatDate(updated)}
            </div>
          </div>
          ${currentLoadedPlanName === plan.name ? '<span class="plan-tag">Loaded</span>' : ""}
        </div>

        ${plan.notes ? `<div class="plan-meta">${escapeHtml(plan.notes)}</div>` : ""}

        <div class="plan-tags">
          <span class="plan-tag">Mode: ${escapeHtml(mode)}</span>
          ${plan.state?.honey?.flowName ? `<span class="plan-tag">${escapeHtml(plan.state.honey.flowName)}</span>` : ""}
          ${plan.state?.breeding?.desiredMatingDate ? `<span class="plan-tag">Breeding date saved</span>` : ""}
        </div>

        <div class="plan-actions">
          <button class="btn btn-primary" type="button" data-load-plan="${escapeHtmlAttr(plan.name)}">Load</button>
          <button class="btn btn-danger" type="button" data-delete-plan="${escapeHtmlAttr(plan.name)}">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  savedPlansList.querySelectorAll("[data-load-plan]").forEach((btn) => {
    btn.addEventListener("click", () => loadPlan(btn.getAttribute("data-load-plan")));
  });

  savedPlansList.querySelectorAll("[data-delete-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-delete-plan");
      const ok = window.confirm(`Delete saved plan "${name}"?`);
      if (ok) deletePlan(name);
    });
  });
}

function clearPlanFields() {
  planName.value = "";
  planApiary.value = "";
  planNotes.value = "";
  planStatus.textContent = "Plan fields cleared.";
}

function populateComparisonSelectors() {
  const plans = getSavedPlans();
  const options = ['<option value="">Select a saved plan</option>'].concat(
    plans.map((p) => `<option value="${escapeHtmlAttr(p.name)}">${escapeHtml(p.name)}</option>`)
  ).join("");

  comparePlanA.innerHTML = options;
  comparePlanB.innerHTML = options;
}

function getPlanByName(name) {
  return getSavedPlans().find((p) => p.name === name);
}

function safeDateText(val) {
  if (!val) return "—";
  try {
    return formatDate(new Date(val + "T12:00:00"));
  } catch {
    return "—";
  }
}

function renderComparison() {
  const aName = comparePlanA.value;
  const bName = comparePlanB.value;

  if (!aName || !bName) {
    comparisonResults.innerHTML = "";
    comparisonStatus.textContent = "Select two saved plans to compare.";
    return;
  }

  if (aName === bName) {
    comparisonResults.innerHTML = "";
    comparisonStatus.textContent = "Please choose two different saved plans.";
    return;
  }

  const planA = getPlanByName(aName);
  const planB = getPlanByName(bName);

  if (!planA || !planB) {
    comparisonResults.innerHTML = "";
    comparisonStatus.textContent = "One or both selected plans could not be found.";
    return;
  }

  const aState = planA.state || {};
  const bState = planB.state || {};

  comparisonResults.innerHTML = `
    <div class="compare-results">
      <div class="compare-box">
        <strong>${escapeHtml(planA.name)}</strong>
        <p>${planA.apiary ? `Apiary: ${escapeHtml(planA.apiary)}` : "Apiary not set"}</p>
        <div class="compare-row">
          <strong class="compare-title">Mode</strong>
          <p>${escapeHtml(aState.activeMode || "development")}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Development date</strong>
          <p>${safeDateText(aState.development?.startDate)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Honey flow start</strong>
          <p>${safeDateText(aState.honey?.flowStart)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Honey flow end</strong>
          <p>${safeDateText(aState.honey?.flowEnd)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Breeding date</strong>
          <p>${safeDateText(aState.breeding?.desiredMatingDate)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Notes</strong>
          <p>${escapeHtml(planA.notes || "—")}</p>
        </div>
      </div>

      <div class="compare-box">
        <strong>${escapeHtml(planB.name)}</strong>
        <p>${planB.apiary ? `Apiary: ${escapeHtml(planB.apiary)}` : "Apiary not set"}</p>
        <div class="compare-row">
          <strong class="compare-title">Mode</strong>
          <p>${escapeHtml(bState.activeMode || "development")}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Development date</strong>
          <p>${safeDateText(bState.development?.startDate)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Honey flow start</strong>
          <p>${safeDateText(bState.honey?.flowStart)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Honey flow end</strong>
          <p>${safeDateText(bState.honey?.flowEnd)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Breeding date</strong>
          <p>${safeDateText(bState.breeding?.desiredMatingDate)}</p>
        </div>
        <div class="compare-row">
          <strong class="compare-title">Notes</strong>
          <p>${escapeHtml(planB.notes || "—")}</p>
        </div>
      </div>
    </div>
    <div class="note-box" style="margin-top:12px;">
      Comparison hint: look closely at nectar flow start dates, breeding dates and overall mode. That often reveals which apiary needs action first.
    </div>
  `;

  comparisonStatus.textContent = `Comparing "${aName}" with "${bName}".`;
}

function clearComparison() {
  comparePlanA.value = "";
  comparePlanB.value = "";
  comparisonResults.innerHTML = "";
  comparisonStatus.textContent = "Comparison cleared.";
}

function renderTaskCalendar() {
  const month = taskMonth.value || getCurrentMonthName();
  const focus = taskFocus.value || "all";
  const note = taskApiaryNote.value.trim();
  const monthTasks = TASKS[month] || [];
  const filtered = monthTasks.filter((task) => focus === "all" || task.focus === focus);

  taskCalendarHeading.textContent = `${month} Seasonal Tasks`;
  taskCalendarIntro.textContent = note
    ? `Task prompts for ${month}. Apiary note: ${note}.`
    : `Task prompts for ${month}.`;

  if (!filtered.length) {
    taskList.innerHTML = `
      <div class="info-card">
        <strong>No tasks matched this filter</strong>
        <p>Try selecting “All tasks” or a different month.</p>
      </div>
    `;
    taskCalendarStatus.textContent = "No tasks matched the selected filter.";
    return;
  }

  taskList.innerHTML = filtered.map((task) => `
    <article class="task-card">
      <strong>${escapeHtml(task.title)}</strong>
      <p>${escapeHtml(task.text)}</p>
      <div class="task-meta">
        <span class="task-chip">${escapeHtml(month)}</span>
        <span class="task-chip">${escapeHtml(task.focus)}</span>
        ${note ? `<span class="task-chip">${escapeHtml(note)}</span>` : ""}
      </div>
    </article>
  `).join("");

  taskCalendarStatus.textContent = `${filtered.length} seasonal task${filtered.length === 1 ? "" : "s"} shown for ${month}.`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}

function setExampleFlow() {
  flowName.value = "Lime";
  apiaryNote.value = "Typical example from the classic Beekeeper’s Rule";
  flowStart.value = "2026-06-24";
  flowEnd.value = "2026-07-22";
  foragerLead.value = "40";
  renderHoneyPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
}

function setExampleOverlay() {
  weatherRegion.value = "South Wales coastal apiary";
  weatherPattern.value = "settled";
  weatherTempBand.value = "good";
  weatherRainRisk.value = "low";
  weatherFlightRisk.value = "good";
  nectarStrength.value = "strong";
  weatherNotes.value = "Warm bright spell, decent flying by late morning, bramble building strongly.";
  renderOverlayAndReminders();
}

function renderOverlaySummary() {
  weatherSummaryGrid.innerHTML = `
    <div class="weather-chip-card">
      <strong>Region / context</strong>
      <p>${escapeHtml(weatherRegion.value.trim() || "Not set")}</p>
    </div>
    <div class="weather-chip-card">
      <strong>Forecast pattern</strong>
      <p>${escapeHtml(weatherPattern.value)}</p>
    </div>
    <div class="weather-chip-card">
      <strong>Flying conditions</strong>
      <p>${escapeHtml(weatherFlightRisk.value)}</p>
    </div>
    <div class="weather-chip-card">
      <strong>Nectar flow strength</strong>
      <p>${escapeHtml(nectarStrength.value)}</p>
    </div>
    <div class="weather-chip-card">
      <strong>Temperature band</strong>
      <p>${escapeHtml(weatherTempBand.value)}</p>
    </div>
    <div class="weather-chip-card">
      <strong>Rain / interruption risk</strong>
      <p>${escapeHtml(weatherRainRisk.value)}</p>
    </div>
  `;
}

function buildReminderLogic() {
  const mode = getActiveMode();
  const reminders = [];
  const today = new Date();

  const pattern = weatherPattern.value;
  const temp = weatherTempBand.value;
  const rain = weatherRainRisk.value;
  const flight = weatherFlightRisk.value;
  const nectar = nectarStrength.value;

  if (pattern === "wet" || rain === "high") {
    reminders.push({
      title: "Weather caution",
      text: "Inspection conditions look poor. Avoid disruptive full inspections unless the colony situation is urgent.",
      level: "urgent"
    });
  } else if (pattern === "cold" || temp === "low" || flight === "poor") {
    reminders.push({
      title: "Cold / poor flying caution",
      text: "Use shorter inspections and prioritise only essential checks if colony opening conditions remain poor.",
      level: "warn"
    });
  } else if (pattern === "settled" && (flight === "good" || flight === "excellent")) {
    reminders.push({
      title: "Good inspection window",
      text: "Conditions look suitable for calmer inspection work if colony timing says a check is due.",
      level: "good"
    });
  }

  if (mode === "development") {
    const type = beeType.value;
    const selectedDate = startDate.value ? new Date(startDate.value + "T12:00:00") : today;
    const offset = getOffsetDay(type, startEvent.value);
    const eggDate = addDays(selectedDate, -offset);
    const cycleDay = Math.max(0, diffDays(eggDate, today));

    if (type === "queen") {
      if (cycleDay >= 6 && cycleDay <= 9) {
        reminders.push({
          title: "Swarm-risk inspection due",
          text: `Queen development is around day ${cycleDay}. Check urgently for sealed or nearly sealed queen cells and swarm pressure.`,
          level: "urgent"
        });
      } else if (cycleDay >= 10 && cycleDay <= 16) {
        reminders.push({
          title: "Virgin emergence watch",
          text: `Queen development is around day ${cycleDay}. Minimise disruption if emergence timing is near and only inspect with a clear reason.`,
          level: "warn"
        });
      } else {
        reminders.push({
          title: "Development follow-up",
          text: `Current estimated queen cycle day is ${cycleDay}. Recheck against colony signs before choosing the next visit.`,
          level: "good"
        });
      }
    } else {
      reminders.push({
        title: "Brood-stage follow-up",
        text: `Estimated ${type} development day is ${cycleDay}. Use this mainly as a brood timing reference rather than an urgent swarm trigger.`,
        level: "good"
      });
    }
  }

  if (mode === "honey") {
    if (flowStart.value) {
      const start = new Date(flowStart.value + "T12:00:00");
      const daysToFlow = diffDays(today, start);

      if (daysToFlow <= 10 && daysToFlow >= -7) {
        reminders.push({
          title: "Pre-flow colony check",
          text: "Main nectar flow is close. Confirm laying space, supering, congestion risk and whether foragers are building well.",
          level: nectar === "strong" || nectar === "peak" ? "urgent" : "warn"
        });
      } else if (daysToFlow > 10) {
        reminders.push({
          title: "Brood build-up timing",
          text: `Main flow is about ${daysToFlow} days away. Review whether colonies are building strongly enough for the intended crop.`,
          level: "good"
        });
      } else {
        reminders.push({
          title: "Flow already underway",
          text: "If the flow has started, prioritise super management, congestion control and calm honey-crop inspections.",
          level: nectar === "peak" ? "urgent" : "good"
        });
      }
    }
  }

  if (mode === "breeding") {
    if (desiredMatingDate.value) {
      const matingDate = new Date(desiredMatingDate.value + "T12:00:00");
      const daysToMating = diffDays(today, matingDate);

      if (daysToMating <= 7 && daysToMating >= -3) {
        reminders.push({
          title: "Breeding follow-up check",
          text: "Mating timing is very close. Review drone presence, weather suitability and virgin queen status before the key window passes.",
          level: (flight === "good" || flight === "excellent") ? "urgent" : "warn"
        });
      } else if (daysToMating > 7) {
        reminders.push({
          title: "Breeding preparation",
          text: `Target mating point is about ${daysToMating} days away. Check drone build-up and queen-rearing readiness.`,
          level: "good"
        });
      } else {
        reminders.push({
          title: "Post-mating verification",
          text: "The mating window may already have passed. Plan a calm check for signs of successful mating and first eggs.",
          level: "warn"
        });
      }
    }
  }

  if (mode === "wheel") {
    reminders.push({
      title: "Use wheel as a comparison tool",
      text: "The Rule Wheel is best used to compare dates visually. Use Development, Honey or Breeding mode for the practical inspection decision.",
      level: "good"
    });
  }

  if (nectar === "strong" || nectar === "peak") {
    reminders.push({
      title: "Strong nectar caution",
      text: "A strong flow can hide congestion problems. Colonies may still need swarm-space management even when they look busy and productive.",
      level: "warn"
    });
  }

  if (flight === "poor" && nectar !== "none") {
    reminders.push({
      title: "Forage available but flying poor",
      text: "Forage may be present, but colony performance could still be held back by poor flying weather.",
      level: "warn"
    });
  }

  if (weatherNotes.value.trim()) {
    reminders.push({
      title: "Local note recorded",
      text: weatherNotes.value.trim(),
      level: "good"
    });
  }

  return reminders.slice(0, 6);
}

function renderOverlayAndReminders() {
  renderOverlaySummary();

  const reminders = buildReminderLogic();
  reminderGrid.innerHTML = reminders.map((r) => `
    <article class="reminder-card ${r.level}">
      <strong>${escapeHtml(r.title)}</strong>
      <p>${escapeHtml(r.text)}</p>
    </article>
  `).join("");

  weatherStatus.textContent = "Overlay updated and reminder logic refreshed.";
  reminderNote.textContent = "Reminder logic is advisory. Always combine it with what you actually see in the colony.";

  if (reminders[0]) {
    overviewReminderHeadline.textContent = reminders[0].title;
    overviewReminderText.textContent = reminders[0].text;
  } else {
    overviewReminderHeadline.textContent = "No reminder generated";
    overviewReminderText.textContent = "Add more planning detail to improve guidance.";
  }

  renderInspectionAdvisor();
  renderSwarmRisk();
}

function renderInspectionAdvisor() {
  const mode = getActiveMode();
  const pattern = weatherPattern.value;
  const temp = weatherTempBand.value;
  const rain = weatherRainRisk.value;
  const flight = weatherFlightRisk.value;
  const nectar = nectarStrength.value;

  let headline = "Inspection timing not yet assessed";
  let bestTime = "Update the overlay";
  let reason = "Add conditions to generate inspection timing guidance.";
  let followUp = "Use the overlay controls above.";

  if (rain === "high" || pattern === "wet" || flight === "poor") {
    headline = "Inspection not recommended today";
    bestTime = "Wait for a better weather window";
    reason = "Poor flying weather, high rain risk or unstable conditions make inspections less reliable and more disruptive.";
    followUp = "Only inspect urgently if there is a genuine colony concern.";
  } else if (pattern === "settled" && (flight === "good" || flight === "excellent") && (temp === "good" || temp === "moderate")) {
    headline = "Best inspection window looks favourable";
    bestTime = "Late morning to mid-afternoon";
    reason = "Flying conditions are suitable, weather is more settled and colony checks should be easier to read.";
    followUp = nectar === "strong" || nectar === "peak"
      ? "Because forage is strong, check carefully for congestion and swarm-space pressure."
      : "Use a calm, normal inspection and confirm brood, stores and space.";
  } else if (temp === "low" || pattern === "cold") {
    headline = "Use a short inspection window";
    bestTime = "Warmest part of the day only";
    reason = "Lower temperatures can make full inspections less suitable, especially if colonies are not flying strongly.";
    followUp = "Prioritise only essential checks and avoid unnecessary disruption.";
  } else {
    headline = "Reasonable inspection window";
    bestTime = "When flying improves and rain risk stays low";
    reason = "Conditions are mixed rather than poor, so inspections may still be possible if colony timing justifies it.";
    followUp = "Use shorter inspections if conditions are inconsistent.";
  }

  if (mode === "development" && beeType.value === "queen" && startDate.value) {
    const selectedDate = new Date(startDate.value + "T12:00:00");
    const offset = getOffsetDay(beeType.value, startEvent.value);
    const eggDate = addDays(selectedDate, -offset);
    const cycleDay = Math.max(0, diffDays(eggDate, new Date()));

    if (cycleDay >= 6 && cycleDay <= 9) {
      headline = "Inspect urgently if weather allows";
      bestTime = "Next suitable calm inspection window";
      reason = `Estimated queen cycle day is ${cycleDay}, which can coincide with the main swarm-risk period.`;
      followUp = "Look carefully for sealed or nearly sealed queen cells and colony congestion.";
    }
  }

  if (mode === "honey" && (nectar === "strong" || nectar === "peak")) {
    followUp = "Because nectar flow is strong, include a check for super space and swarm pressure.";
  }

  if (mode === "breeding") {
    followUp = "Keep inspections calm and purposeful so mating or queen-rearing timing is not disrupted unnecessarily.";
  }

  inspectionAdvisorGrid.innerHTML = `
    <article class="advisor-card">
      <strong>Inspection Timing Advice</strong>
      <p>${escapeHtml(headline)}</p>
    </article>
    <article class="advisor-card">
      <strong>Best Time</strong>
      <p>${escapeHtml(bestTime)}</p>
    </article>
    <article class="advisor-card">
      <strong>Reason</strong>
      <p>${escapeHtml(reason)}</p>
    </article>
    <article class="advisor-card">
      <strong>Follow-up</strong>
      <p>${escapeHtml(followUp)}</p>
    </article>
  `;
}

function renderSwarmRisk() {
  const mode = getActiveMode();
  const pattern = weatherPattern.value;
  const temp = weatherTempBand.value;
  const rain = weatherRainRisk.value;
  const flight = weatherFlightRisk.value;
  const nectar = nectarStrength.value;

  let score = 0;
  const reasons = [];

  if (mode === "development" && beeType.value === "queen" && startDate.value) {
    const selectedDate = new Date(startDate.value + "T12:00:00");
    const offset = getOffsetDay(beeType.value, startEvent.value);
    const eggDate = addDays(selectedDate, -offset);
    const cycleDay = Math.max(0, diffDays(eggDate, new Date()));

    if (cycleDay >= 6 && cycleDay <= 9) {
      score += 4;
      reasons.push(`Queen cycle is around day ${cycleDay}, which is a key swarm-risk period.`);
    } else if (cycleDay >= 10 && cycleDay <= 16) {
      score += 2;
      reasons.push(`Queen cycle is around day ${cycleDay}, so colony timing still needs careful interpretation.`);
    }
  }

  if (nectar === "strong") {
    score += 2;
    reasons.push("Nectar flow is strong, which can increase congestion pressure.");
  }

  if (nectar === "peak") {
    score += 3;
    reasons.push("Peak nectar flow can increase crowding and swarm pressure.");
  }

  if (flight === "good") {
    score += 1;
    reasons.push("Good flying weather supports active colony behaviour.");
  }

  if (flight === "excellent") {
    score += 2;
    reasons.push("Excellent flying weather can support strong swarm conditions.");
  }

  if (temp === "high" || pattern === "hot") {
    score += 1;
    reasons.push("Warm or hot conditions can support strong colony expansion and movement.");
  }

  if (rain === "high" || pattern === "wet") {
    score -= 3;
    reasons.push("Poor weather reduces immediate swarm likelihood, though pressure may still be building.");
  }

  if (temp === "low" || pattern === "cold" || flight === "poor") {
    score -= 2;
    reasons.push("Cold or poor-flying conditions reduce immediate swarm activity.");
  }

  let level = "low";
  let levelText = "Low";
  let advice = "No strong swarm trigger is showing from the current timing and overlay conditions.";

  if (score >= 5) {
    level = "high";
    levelText = "High";
    advice = "Inspect urgently for queen cells, congestion and space pressure at the next suitable opportunity.";
  } else if (score >= 2) {
    level = "moderate";
    levelText = "Moderate";
    advice = "Swarm pressure may be building. Check colony space, brood nest condition and queen cell development.";
  }

  if (!reasons.length) {
    reasons.push("No strong swarm indicators have been triggered by the current settings.");
  }

  swarmRiskGrid.innerHTML = `
    <article class="swarm-risk-card ${level}">
      <strong>Swarm Risk Level</strong>
      <p>${escapeHtml(levelText)}</p>
    </article>
    <article class="swarm-risk-card ${level}">
      <strong>Risk Score</strong>
      <p>${escapeHtml(String(score))}</p>
    </article>
    <article class="swarm-risk-card ${level}">
      <strong>Main Drivers</strong>
      <p>${escapeHtml(reasons.join(" "))}</p>
    </article>
    <article class="swarm-risk-card ${level}">
      <strong>Advice</strong>
      <p>${escapeHtml(advice)}</p>
    </article>
  `;

  advisorNote.textContent = "Inspection timing and swarm risk are guidance tools only. Always confirm decisions against live colony conditions, queen cell status and actual forage/weather behaviour.";
}

function setBreedingExample() {
  desiredMatingDate.value = "2026-09-02";
  breedingApiary.value = "Late summer breeding example";
  droneMaturityLead.value = "38";
  queenBuildMethod.value = "virginOnDate";
  queenSourceNote.value = "Selected stock for manageable temperament and productivity";
  renderBreedingPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
}

function populateMonthSelector() {
  taskMonth.innerHTML = MONTH_NAMES.map((m) => `<option value="${m}">${m}</option>`).join("");
}

function renderAll() {
  renderDevelopment();
  renderHoneyPlanner();
  renderBreedingPlanner();
  renderRuleWheel();
  renderTaskCalendar();
  renderOverlayAndReminders();
  updateOverview(getActiveMode());
}

updateClockBtn.addEventListener("click", () => {
  renderDevelopment();
  renderRuleWheel();
  renderOverlayAndReminders();
});

todayClockBtn.addEventListener("click", () => {
  setToday(startDate);
  renderDevelopment();
  renderOverlayAndReminders();
});

updateHoneyBtn.addEventListener("click", () => {
  renderHoneyPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

useExampleBtn.addEventListener("click", setExampleFlow);

updateBreedingBtn.addEventListener("click", () => {
  renderBreedingPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

useBreedingExampleBtn.addEventListener("click", setBreedingExample);

updateRuleWheelBtn.addEventListener("click", () => {
  renderRuleWheel();
  renderOverlayAndReminders();
});

ruleTodayBtn.addEventListener("click", () => {
  setToday(ruleReferenceDate);
  renderRuleWheel();
  renderOverlayAndReminders();
});

savePlanBtn.addEventListener("click", saveCurrentPlan);
clearPlanFieldsBtn.addEventListener("click", clearPlanFields);

updateWeatherOverlayBtn.addEventListener("click", renderOverlayAndReminders);
weatherExampleBtn.addEventListener("click", setExampleOverlay);

runComparisonBtn.addEventListener("click", renderComparison);
clearComparisonBtn.addEventListener("click", clearComparison);

updateTaskCalendarBtn.addEventListener("click", renderTaskCalendar);
useCurrentMonthBtn.addEventListener("click", () => {
  taskMonth.value = getCurrentMonthName();
  renderTaskCalendar();
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchMode(btn.dataset.mode);
    renderOverlayAndReminders();
  });
});

beeType.addEventListener("change", () => {
  renderDevelopment();
  renderRuleWheel();
  renderOverlayAndReminders();
});

startEvent.addEventListener("change", () => {
  renderDevelopment();
  renderRuleWheel();
  renderOverlayAndReminders();
});

startDate.addEventListener("change", () => {
  renderDevelopment();
  renderOverlayAndReminders();
});

flowStart.addEventListener("change", () => {
  renderHoneyPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

flowEnd.addEventListener("change", () => {
  renderHoneyPlanner();
  renderOverlayAndReminders();
});

foragerLead.addEventListener("change", () => {
  renderHoneyPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

desiredMatingDate.addEventListener("change", () => {
  renderBreedingPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

droneMaturityLead.addEventListener("change", () => {
  renderBreedingPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

queenBuildMethod.addEventListener("change", () => {
  renderBreedingPlanner();
  renderRuleWheel();
  renderOverlayAndReminders();
});

ruleMode.addEventListener("change", () => {
  renderRuleWheel();
  renderOverlayAndReminders();
});

ruleReferenceDate.addEventListener("change", () => {
  renderRuleWheel();
  renderOverlayAndReminders();
});

taskMonth.addEventListener("change", renderTaskCalendar);
taskFocus.addEventListener("change", renderTaskCalendar);

populateMonthSelector();
taskMonth.value = getCurrentMonthName();
setToday(startDate);
setToday(ruleReferenceDate);
renderDevelopment();
renderHoneyPlanner();
renderBreedingPlanner();
renderRuleWheel();
renderTaskCalendar();
renderSavedPlans();
populateComparisonSelectors();
renderOverlayAndReminders();
updateOverview("development");