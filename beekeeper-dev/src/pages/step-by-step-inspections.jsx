// src/pages/step-by-step-inspections.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Step-by-step hive inspection guidance page (BeezKnees)
 * - Visual support via simple inline SVG “cards” and clear diagrams
 * - Season-aware hints (UK-friendly)
 * - Mandatory vs Optional clearly highlighted
 *
 * Notes:
 * - Keep this page independent from your inspection form so the form stays fast and uncluttered.
 * - Add a route to this page (example at bottom of this file).
 */

const SEASONS_UK = [
  { key: "winter", label: "Winter", months: [11, 0, 1] }, // Dec, Jan, Feb (JS Date: 0=Jan)
  { key: "spring", label: "Spring", months: [2, 3, 4] }, // Mar, Apr, May
  { key: "summer", label: "Summer", months: [5, 6, 7] }, // Jun, Jul, Aug
  { key: "autumn", label: "Autumn", months: [8, 9, 10] }, // Sep, Oct, Nov
];

function getSeasonKey(monthIndex) {
  const season = SEASONS_UK.find((s) => s.months.includes(monthIndex));
  return season?.key || "spring";
}

const seasonAdvice = {
  spring: {
    title: "Spring focus (UK): build-up + swarm prevention",
    bullets: [
      "Inspect regularly during build-up (often every 7–10 days if weather allows).",
      "Prioritise space management: avoid congestion (add brood space/supers as needed).",
      "Be especially alert for queen cells and swarm signs once colonies are booming.",
      "Cold snaps are common—avoid prolonged open-hive time on cooler days.",
    ],
    caution:
      "Spring inspections can trigger chilling of brood if you’re slow or the weather turns. Be efficient: plan your goal before you open.",
  },
  summer: {
    title: "Summer focus (UK): honey flow + ventilation + varroa awareness",
    bullets: [
      "Keep inspections purposeful—don’t over-disturb during nectar flow.",
      "Check supers/space, ventilation, and watch for overheating in strong sun.",
      "Monitor varroa pressure and plan post-harvest management.",
      "Watch for queen performance dips during drought/poor forage.",
    ],
    caution:
      "In hot weather, avoid leaving brood boxes open. Keep frames shaded and return them promptly.",
  },
  autumn: {
    title: "Autumn focus (UK): winter prep + feeding decisions + treatment follow-through",
    bullets: [
      "Confirm stores and decide on feeding early enough to be effective.",
      "Check colony strength and consider combining weak colonies (where appropriate).",
      "Ensure varroa management has been completed/checked and follow guidance.",
      "Reduce entrances if needed and check hive weather-proofing.",
    ],
    caution:
      "Late-season inspections can stress colonies. Keep it short and focus on readiness for winter.",
  },
  winter: {
    title: "Winter focus (UK): minimal disturbance + survival checks",
    bullets: [
      "Avoid full inspections—do external checks, hefting, and entrance checks instead.",
      "Check for blocked entrances, woodpecker damage, and water ingress.",
      "Only open the hive if there’s a clear problem and conditions are suitable.",
      "Use calm, quick checks on warmer days if absolutely necessary.",
    ],
    caution:
      "Opening a colony in winter can do more harm than good. Prioritise external checks unless there’s an urgent issue.",
  },
};

const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
};

const Callout = ({ title, children, tone = "sky" }) => {
  const tones = {
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      {title ? <div className="mb-2 font-semibold">{title}</div> : null}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
};

const VisualCard = ({ title, subtitle, svg, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-10 w-10 flex-none rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center">
        {svg}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-slate-900">{title}</div>
        {subtitle ? <div className="text-xs text-slate-600 mt-0.5">{subtitle}</div> : null}
      </div>
    </div>
    {children ? <div className="mt-3 text-sm text-slate-700 leading-relaxed">{children}</div> : null}
  </div>
);

const MiniHiveSvg = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 8l6-4 6 4v12H6V8z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M6 11h12" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 20h8" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const EyeSvg = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const FrameSvg = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 4h10v16H7V4z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 7h6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 11h6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 15h6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ShieldSvg = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ClockSvg = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const Step = ({
  idx,
  title,
  mandatory = true,
  time,
  visualTitle,
  visualBody,
  whatToDo,
  whatToLookFor,
  seasonHint,
  optionalAddOns = [],
  commonMistakes = [],
}) => (
  <section id={`step-${idx}`} className="scroll-mt-28">
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                {idx}. {title}
              </h2>
              {mandatory ? <Badge tone="emerald">Mandatory</Badge> : <Badge tone="amber">Optional</Badge>}
              {time ? <Badge tone="slate">{time}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Visual Support */}
          <div className="lg:col-span-1">
            <VisualCard title={visualTitle} subtitle="Visual support (quick reference)" svg={FrameSvg}>
              <div className="space-y-2">
                <p className="text-sm text-slate-700">{visualBody}</p>
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-700">Tip</div>
                  <div className="text-sm text-slate-700 mt-1">
                    Use this page like a “field guide” — read at home, then glance quickly in the apiary.
                  </div>
                </div>
              </div>
            </VisualCard>
          </div>

          {/* What to do */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 p-4 h-full">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">What to do</div>
                <Badge tone="sky">Do this</Badge>
              </div>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-700">
                {whatToDo.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* What to look for */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 p-4 h-full">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">What to look for</div>
                <Badge tone="slate">Observe</Badge>
              </div>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-slate-700">
                {whatToLookFor.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Season-aware hint */}
        {seasonHint ? (
          <div className="mt-4">
            <Callout title="Season-aware hint" tone="amber">
              {seasonHint}
            </Callout>
          </div>
        ) : null}

        {/* Optional add-ons */}
        {optionalAddOns?.length ? (
          <div className="mt-4">
            <Callout title="Optional add-ons" tone="slate">
              <ul className="list-disc pl-5 space-y-1">
                {optionalAddOns.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </Callout>
          </div>
        ) : null}

        {/* Common mistakes */}
        {commonMistakes?.length ? (
          <div className="mt-4">
            <Callout title="Common mistakes to avoid" tone="rose">
              <ul className="list-disc pl-5 space-y-1">
                {commonMistakes.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </Callout>
          </div>
        ) : null}
      </div>
    </div>
  </section>
);

export default function StepByStepInspections() {
  const [expanded, setExpanded] = useState(false);

  const now = useMemo(() => new Date(), []);
  const seasonKey = useMemo(() => getSeasonKey(now.getMonth()), [now]);
  const season = seasonAdvice[seasonKey];

  const steps = useMemo(
    () => [
      {
        idx: 1,
        title: "Observe the entrance before opening",
        mandatory: true,
        time: "1–2 min",
        visualTitle: "Entrance check",
        visualBody:
          "Stand to one side. Watch flight activity, pollen coming in, and how bees behave around the entrance.",
        whatToDo: [
          "Watch for steady foraging and normal traffic.",
          "Check the entrance is clear (no grass/debris blocking).",
          "Note weather conditions (wind, temperature, showers).",
          "Decide your goal for today before you open the hive (e.g., queen status, swarm check, stores).",
        ],
        whatToLookFor: [
          "Pollen incoming (often suggests brood rearing).",
          "Defensive or unusually agitated behaviour at the entrance.",
          "Dead bees / crawling bees in unusual numbers.",
          "Robbing signs (fighting, bees darting in/out aggressively).",
        ],
        seasonHint:
          seasonKey === "winter"
            ? "Winter: stick to external checks unless you have a strong reason to open. Heft the hive and check the entrance is clear."
            : seasonKey === "spring"
            ? "Spring: entrance activity can ramp up quickly—don’t assume strong activity means everything is fine inside. Still inspect efficiently."
            : seasonKey === "autumn"
            ? "Autumn: watch for robbing pressure. Reduce entrances where appropriate and avoid spilling syrup."
            : "Summer: during a strong flow, flight lines can look intense—focus on whether bees are bringing pollen/nectar and behaving normally.",
        commonMistakes: [
          "Opening the hive without a clear purpose (leads to long, disruptive inspections).",
          "Standing directly in the flight path and getting annoyed bees ‘for free’.",
        ],
      },
      {
        idx: 2,
        title: "Prepare tools and open the hive calmly",
        mandatory: true,
        time: "2–4 min",
        visualTitle: "Smooth opening",
        visualBody:
          "A few gentle puffs of smoke, slow movements, and careful lifting keeps bees calmer and reduces crushing.",
        whatToDo: [
          "Light the smoker and confirm it’s producing cool smoke.",
          "Apply a small amount of smoke at the entrance and under the crown board (if used).",
          "Remove roof and crown board carefully; keep parts stable and nearby.",
          "Avoid banging boxes or scraping aggressively unless needed.",
        ],
        whatToLookFor: [
          "Brace comb or burr comb under the crown board.",
          "Bees clustering unusually at the top (heat/ventilation or space issues).",
          "Early queen cells (especially along edges if you can see them).",
        ],
        seasonHint:
          seasonKey === "spring"
            ? "Spring: keep the hive open time short to avoid chilling brood on cooler days. Have your kit ready first."
            : seasonKey === "summer"
            ? "Summer: keep brood frames shaded; avoid exposing them to direct sun for long."
            : seasonKey === "autumn"
            ? "Autumn: minimise disturbance—get in, confirm what you need, and close up."
            : "Winter: avoid opening unless essential and conditions are suitable.",
        optionalAddOns: ["Use a stand/tray for the roof/crown board to avoid grass and wobble.", "Take a quick photo of the top bars for later review."],
        commonMistakes: ["Over-smoking (can drive bees and make them harder to handle).", "Leaving the hive open while you ‘think’ — decide the plan first."],
      },
      {
        idx: 3,
        title: "Check stores and space (quick first pass)",
        mandatory: true,
        time: "2–5 min",
        visualTitle: "Stores snapshot",
        visualBody:
          "Check outer frames first. This gives fast insight into honey/pollen stores and whether the colony needs support.",
        whatToDo: [
          "Start with an outer frame (usually stores) and work inward.",
          "Estimate stores: honey/nectar and pollen bands.",
          "Note available space: are frames packed with bees/nectar?",
          "If the colony is light, plan feeding decisions before closing.",
        ],
        whatToLookFor: [
          "Heavily backfilled brood nest (nectar where eggs should be).",
          "Low stores / very light frames.",
          "Mouldy or damaged comb (may need replacement planning).",
        ],
        seasonHint:
          seasonKey === "autumn"
            ? "Autumn: stores are critical—make feeding decisions early enough to matter. Avoid leaving it too late."
            : seasonKey === "spring"
            ? "Spring: a colony can starve quickly during poor weather. A quick stores check is essential even if your main goal is swarm prevention."
            : seasonKey === "winter"
            ? "Winter: do not pull frames—use hefting and external checks unless there’s an urgent issue."
            : "Summer: ensure the colony has space above during a flow; congestion can trigger swarm impulses even in summer.",
        optionalAddOns: ["Record approximate frames of stores (e.g., ‘2 heavy stores frames’).", "If you use scales, log hive weight/estimate."],
      },
      {
        idx: 4,
        title: "Inspect the brood area (eggs, larvae, pattern)",
        mandatory: true,
        time: "5–10 min",
        visualTitle: "Brood health check",
        visualBody:
          "You don’t need to find the queen every time. Eggs + a good brood pattern usually confirm a laying queen.",
        whatToDo: [
          "Work carefully through brood frames.",
          "Hold frames so the light catches the bottom of cells (eggs are easiest to spot this way).",
          "Assess brood pattern and count frames with brood (rough estimate is fine).",
          "Be gentle: keep frames over the brood box to avoid dropping the queen.",
        ],
        whatToLookFor: [
          "Eggs (single eggs centered in cell) and young larvae.",
          "Even brood pattern (good coverage, fewer missed cells).",
          "Capped brood: healthy cappings are generally even and tidy.",
          "Signs of brood issues (sunken/perforated cappings, odd smells, unusual larvae).",
        ],
        seasonHint:
          seasonKey === "spring"
            ? "Spring: brood expansion is rapid. Confirm the colony has enough space and consider early swarm pressure."
            : seasonKey === "summer"
            ? "Summer: watch for queen slowdown during dearth; brood pattern may shrink—focus on whether it matches forage conditions."
            : seasonKey === "autumn"
            ? "Autumn: brood reduces naturally. Your key question becomes: ‘Is this colony strong enough and well-provisioned for winter?’"
            : "Winter: avoid brood-frame inspections. If you must open, do it fast and only on a suitable day.",
        optionalAddOns: ["If you mark queens, note the mark colour/visibility.", "Snap a quick photo of brood frames for later comparison."],
        commonMistakes: ["Spending too long hunting the queen every inspection.", "Holding frames away from the hive where drops are catastrophic."],
      },
      {
        idx: 5,
        title: "Swarm and queen-cell check (when relevant)",
        mandatory: false,
        time: "3–6 min",
        visualTitle: "Queen cells 101",
        visualBody:
          "Queen cells often appear along lower frame edges or in pockets. Distinguish cups vs charged cells vs capped cells.",
        whatToDo: [
          "Check frame bottoms/edges and between frames for queen cells.",
          "If you find queen cells, note: location, number, stage (cup/charged/capped).",
          "Decide actions based on season and your management approach (avoid rushed decisions).",
        ],
        whatToLookFor: [
          "Queen cups (empty) vs charged queen cells (larva + royal jelly).",
          "Capped queen cells (swarm likely imminent depending on stage).",
          "Backfilling and congestion signs supporting swarm intent.",
        ],
        seasonHint:
          seasonKey === "spring"
            ? "Spring: this is your high-priority optional step—often effectively mandatory during swarm season."
            : seasonKey === "summer"
            ? "Summer: still check if colonies are strong or congested, especially early summer."
            : seasonKey === "autumn"
            ? "Autumn: queen cells may be supersedure-related rather than swarming. Context matters."
            : "Winter: generally not relevant.",
        optionalAddOns: [
          "Add a note like ‘Swarm risk: low/medium/high’ to help you plan next inspection timing.",
          "If you raise queens, record cell type and intended action clearly.",
        ],
      },
      {
        idx: 6,
        title: "Pests and disease awareness (quick scan)",
        mandatory: true,
        time: "2–5 min",
        visualTitle: "Health scan",
        visualBody:
          "This is about early spotting. If you suspect a serious issue, reduce disturbance and seek advice.",
        whatToDo: [
          "Scan brood and bees for unusual signs while you’re already viewing frames.",
          "Note any visible varroa, deformed wings, or patchy brood concerns.",
          "Record concerns clearly so you can track changes over time.",
        ],
        whatToLookFor: [
          "Deformed wing virus signs (bees with crumpled wings).",
          "Unusual brood cappings or dead larvae patterns.",
          "Mite presence or heavy mite-drop evidence (if you monitor).",
          "Odd smells or slime (rare, but noteworthy).",
        ],
        seasonHint:
          seasonKey === "autumn"
            ? "Autumn: ensure varroa management isn’t ‘forgotten’—this is a key time to confirm your plan has been followed through."
            : seasonKey === "summer"
            ? "Summer: plan ahead for post-honey-flow management so you’re not reacting late."
            : seasonKey === "spring"
            ? "Spring: early detection helps prevent escalation as colony populations explode."
            : "Winter: focus on external signs and dead-outs; avoid opening unless urgent.",
        commonMistakes: [
          "Writing vague notes like ‘seems fine’ (hard to learn from later).",
          "Trying to ‘fix everything’ mid-inspection without a plan (record first, act purposefully).",
        ],
      },
      {
        idx: 7,
        title: "Hive condition & hardware check",
        mandatory: true,
        time: "2–4 min",
        visualTitle: "Hive condition",
        visualBody:
          "Quick checks prevent later headaches: damaged frames, bad spacing, water ingress, and unstable boxes.",
        whatToDo: [
          "Check frame spacing and ensure frames go back in the right order.",
          "Look for damaged frames, broken lugs, or excessive burr comb.",
          "Confirm the hive is stable and weather-tight before you close.",
        ],
        whatToLookFor: [
          "Warped boxes, gaps, or damp under roof/crown board.",
          "Rot, loose joints, or signs of pests in corners.",
          "Frames that should be replaced soon (dark, misshapen comb).",
        ],
        seasonHint:
          seasonKey === "autumn"
            ? "Autumn: prioritise weather-tightness. Fix issues now, not mid-winter."
            : seasonKey === "winter"
            ? "Winter: do external checks for damage and water ingress; open only if needed."
            : "Spring/Summer: plan comb rotation and repairs during calmer periods.",
      },
      {
        idx: 8,
        title: "Close up safely and record the inspection",
        mandatory: true,
        time: "2–4 min",
        visualTitle: "Close & log",
        visualBody:
          "Closing calmly reduces bees crushed, keeps the queen safe, and locks in good records while they’re fresh.",
        whatToDo: [
          "Reassemble frames in the same order and keep the brood nest intact.",
          "Replace crown board and roof carefully; avoid crushing bees.",
          "Record key outcomes: queen status (evidence), brood, stores, actions, follow-up.",
          "Set your next inspection intent (what you plan to check next time).",
        ],
        whatToLookFor: [
          "Bees fanning or overly defensive at close (note behaviour).",
          "Gaps/tilt that could let rain in.",
          "Loose roofs or unstable straps in windy sites.",
        ],
        seasonHint:
          seasonKey === "spring"
            ? "Spring: set the next inspection date/goal clearly (swarm season moves fast)."
            : seasonKey === "autumn"
            ? "Autumn: record stores decisions and any treatment follow-up dates clearly."
            : seasonKey === "winter"
            ? "Winter: record external checks (hefting/entrance) even if you didn’t open the hive."
            : "Summer: record honey-flow observations and super management decisions.",
        optionalAddOns: [
          "Attach a photo (brood frame, queen cell, stores frame) as evidence for later.",
          "Add a ‘Follow-up’ note: ‘check for queen cells’, ‘confirm stores’, ‘confirm laying pattern’.",
        ],
      },
    ],
    [seasonKey]
  );

  const mandatoryCount = steps.filter((s) => s.mandatory).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Step-by-Step Hive Inspections</h2>
                <Badge tone="emerald">{mandatoryCount} mandatory steps</Badge>
                <Badge tone="amber">Optional steps included</Badge>
              </div>
              <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl">
                A practical inspection guide you can read at home and use as a quick field reference. Season-aware hints are
                tailored for UK-style conditions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/inspections/new"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Start a new inspection
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Print this guide
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  {expanded ? "Collapse overview" : "Expand overview"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-semibold">Season mode:</span>
                <Badge tone="sky">{season?.title}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                <Callout title="Right now" tone="amber">
                  <ul className="list-disc pl-5 space-y-1">
                    {season?.bullets?.slice(0, expanded ? season.bullets.length : 2).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </Callout>
                {expanded ? (
                  <Callout title="Season caution" tone="rose">
                    {season?.caution}
                  </Callout>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Quick legend */}
        <div className="grid gap-4 md:grid-cols-3">
          <VisualCard title="Mandatory vs Optional" subtitle="How to use the labels" svg={ShieldSvg}>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Mandatory</strong> = core checks you should do on most inspections.
              </li>
              <li>
                <strong>Optional</strong> = do when relevant (season, colony state, your goals).
              </li>
              <li>Optional can become “effectively mandatory” during swarm season.</li>
            </ul>
          </VisualCard>

          <VisualCard title="Be efficient" subtitle="Reduce stress + chilling" svg={ClockSvg}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Decide your purpose before opening.</li>
              <li>Keep brood frames over the box.</li>
              <li>Short, purposeful inspections beat long “explorations”.</li>
            </ul>
          </VisualCard>

          <VisualCard title="Observe first" subtitle="The hive tells you a lot" svg={EyeSvg}>
            <ul className="list-disc pl-5 space-y-1">
              <li>Entrance behaviour can reveal robbing or weakness.</li>
              <li>Weather matters — adapt frequency and speed.</li>
              <li>Record what you saw, not just what you did.</li>
            </ul>
          </VisualCard>
        </div>

        {/* Table of contents */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-slate-900">Quick navigation</div>
              <div className="text-sm text-slate-600 mt-1">Jump straight to the step you’re on.</div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge tone="emerald">Mandatory</Badge>
              <Badge tone="amber">Optional</Badge>
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <a
                key={s.idx}
                href={`#step-${s.idx}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {s.idx}. {s.title}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{s.time}</div>
                </div>
                {s.mandatory ? <Badge tone="emerald">Mandatory</Badge> : <Badge tone="amber">Optional</Badge>}
              </a>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-6">
          {steps.map((s) => (
            <Step key={s.idx} {...s} />
          ))}
        </div>

        {/* Footer / guidance */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Callout title="Good records beat perfect memory" tone="emerald">
            Focus your notes on evidence and outcomes:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Queen status: “eggs seen” / “queen seen” / “no eggs”</li>
              <li>Brood: frames and pattern</li>
              <li>Stores: sufficient / low / feeding needed</li>
              <li>Actions taken + follow-up date/goal</li>
            </ul>
          </Callout>

          <Callout title="When not to inspect" tone="rose">
            If conditions are poor, consider postponing:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Cold, wet, or very windy weather</li>
              <li>Short daylight windows (winter)</li>
              <li>When you don’t have a clear purpose</li>
            </ul>
          </Callout>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center">
                {MiniHiveSvg}
              </div>
              <div>
                <div className="font-semibold text-slate-900">Ready to record your findings?</div>
                <div className="text-sm text-slate-600">Use the inspection form for logging — keep this page as your guide.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/inspections/new"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Go to New Inspection
              </Link>
             
            </div>
          </div>
        </div>

     
      </div>
    </div>
  );
}

/**
 * Example route (in your router file):
 *
 * import StepByStepInspections from "./pages/step-by-step-inspections";
 *
 * <Route path="/inspections/step-by-step" element={<StepByStepInspections />} />
 *
 */
