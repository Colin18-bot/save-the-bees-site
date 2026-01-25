// src/pages/step-by-step-apiary-siting.jsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function StepByStepApiarySiting() {
  const navigate = useNavigate();
  const sections = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "quick-checklist", label: "Quick checklist" },
      { id: "step-by-step", label: "Step-by-step" },
      { id: "uk-notes", label: "UK notes" },
      { id: "red-flags", label: "Red flags" },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        title: "Permission, access, and boundaries",
        why: "Most apiary problems are actually people/access issues. Get the basics nailed down first.",
        doThis: [
          "Get clear permission (written if possible).",
          "Confirm year-round access (winter mud, locked gates, livestock rotations).",
          "Agree exactly where you can place hives and where you can stand/work.",
          "Ask about planned changes (building works, tree felling, fencing changes).",
        ],
        avoid: [
          "Sites you can’t access in winter or after rain.",
          "Informal permission that might be withdrawn unexpectedly.",
          "Working areas that force you into public view or conflict.",
        ],
      },
      {
        title: "Choose your working area (not just the ‘nice view’)",
        why: "You need room to inspect safely: space to lift boxes, put kit down, and step back if needed.",
        doThis: [
          "Pick stable, flat-ish ground with safe footing.",
          "Allow space behind/alongside hives for you + boxes + kit.",
          "Think: where will the roof/supers go during inspections?",
          "Plan a realistic route from car to apiary carrying equipment.",
        ],
        avoid: [
          "Cramped corners where you can’t step back.",
          "Uneven ground that makes stacking boxes unsafe.",
          "Routes that cross public paths or animal lanes.",
        ],
      },
      {
        title: "People, pets, and flight paths",
        why: "Siting is mostly about managing bee traffic and reducing nuisance risk.",
        doThis: [
          "Aim entrances away from footpaths, gardens, play areas, and property lines.",
          "Use a hedge/fence/screen to lift flight lines above head height.",
          "Keep distance from places people pause (benches, gates, stiles, water taps).",
          "Think about summer activity levels, not just winter quietness.",
        ],
        avoid: [
          "Entrances facing directly into a path or doorway.",
          "Locations where people stand still close to hive fronts.",
          "Blind corners where someone appears suddenly in the flight line.",
        ],
      },
      {
        title: "Wind, sun, and microclimate",
        why: "A sheltered, sensible microclimate usually means calmer bees and easier inspections.",
        doThis: [
          "Shelter from prevailing wind (hedge, fence, woodland edge).",
          "Morning sun is helpful (encourages early flying).",
          "Avoid frost pockets and damp hollows where cold air settles.",
          "If exposed, plan windbreaks before installing bees.",
        ],
        avoid: [
          "Hilltops and wind tunnels.",
          "Constant deep shade (cold, damp, slower spring build-up).",
          "Low wet ground that stays boggy into spring.",
        ],
      },
      {
        title: "Water and nuisance prevention",
        why: "If you don’t provide water early, bees may choose someone’s pond, gutter, or birdbath.",
        doThis: [
          "Provide a reliable water source from day one (pebbles/floaters).",
          "Top up in warm spells — consistency matters.",
          "Keep water near the apiary to reduce roaming.",
        ],
        avoid: [
          "Assuming ‘they’ll find a puddle’ — they may choose a neighbour’s favourite spot.",
          "Sites directly beside household ponds/water features if you can’t provide an alternative.",
        ],
      },
      {
        title: "Forage and local risk",
        why: "Forage is important — but predictable access and low nuisance risk usually matter more.",
        doThis: [
          "Think seasonally: spring blossom, summer flows, late ivy, etc.",
          "Avoid high-risk spraying areas if routine pesticide use is heavy.",
          "If near crops, place hives to reduce direct drift across public areas.",
        ],
        avoid: [
          "Putting hives right next to frequently sprayed crops with no alternative forage nearby.",
          "Assuming ‘plenty of flowers’ cancels out practical site problems.",
        ],
      },
      {
        title: "Security, visibility, and practical risk",
        why: "A great apiary is one you can keep safe and quietly maintained.",
        doThis: [
          "Reduce visibility from roads/paths where possible (lower theft/vandalism risk).",
          "Consider how you’d secure hives (straps, anchors, chains) if needed.",
          "Make sure you can visit quickly in emergencies (storms, swarms, damage).",
        ],
        avoid: [
          "Highly visible roadside placements.",
          "Sites with regular public footfall right beside the hives.",
        ],
      },
      {
        title: "Layout plan (space, stands, expansion)",
        why: "A tidy layout makes inspections smoother and reduces accidents.",
        doThis: [
          "Plan for expansion (nuc box space, extra colony, swarm control kit).",
          "Use solid stands off damp ground.",
          "Leave working gaps between hives so you’re not in entrances.",
          "Use small visual differences to reduce drifting (colour/landmarks).",
        ],
        avoid: [
          "No room to add a nuc/split when you need it most.",
          "Hives too close together (harder inspections, more drifting).",
        ],
      },
      {
        title: "Record the site (GPS + notes + photos)",
        why: "Future you will thank you: access notes and photos prevent mistakes later.",
        doThis: [
          "Save the GPS pin and an access description (parking, gates, codes).",
          "Photograph the site from 2–3 angles.",
          "Note hazards and ‘site routine’ items (water top-ups, livestock warnings).",
        ],
        avoid: ["Relying on memory for access details or layout."],
      },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Apiary Siting Guide</h1>
          <p className="mt-1 text-sm text-slate-600">
            A practical step-by-step guide to choosing a safe, workable apiary location.
          </p>
        </div>

        <button
  type="button"
  onClick={() => navigate(-1)}
  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
>
  Back
</button>

      </div>

      {/* Jump links */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Jump to</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <p>
              This guide focuses on what matters most for siting an apiary:{" "}
              <span className="font-semibold">permission</span>,{" "}
              <span className="font-semibold">access</span>,{" "}
              <span className="font-semibold">flight paths</span>, and{" "}
              <span className="font-semibold">microclimate</span>.
            </p>
            <p>
              If you’re unsure between two sites, pick the one that is easier to access, gives you more working
              space, and keeps bees away from people.
            </p>
          </div>
        </div>
      </section>

      {/* Quick checklist */}
      <section id="quick-checklist" className="mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Quick checklist</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Permission confirmed and ongoing access agreed",
              "Safe parking + year-round access route",
              "Enough working space behind/alongside hives",
              "Entrances can face away from paths/people",
              "Hedge/fence/screen available to lift flight lines",
              "Shelter from prevailing wind",
              "Morning sun / not deep shade all day",
              "Not a damp hollow or flood-prone spot",
              "Water provided from day one",
              "Room to expand (nuc, extra hive, swarm kit)",
              "Lower visibility / reduced theft risk",
              "GPS pin + site notes recorded",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mt-0.5 h-5 w-5 rounded border border-slate-300 bg-white" />
                <div className="text-sm text-slate-800">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <section id="step-by-step" className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Step-by-step</h2>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.why}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">Do this</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {step.doThis.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <div className="text-sm font-semibold text-rose-900">Avoid</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-900">
                    {step.avoid.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UK notes */}
      <section id="uk-notes" className="mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">UK notes</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <p>
              In the UK, most siting trouble comes from nuisance/complaints and poor access. A simple screen that
              lifts flight lines, plus reliable water from day one, prevents a lot of friction.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Think about summer footfall (not just winter quiet).</li>
              <li>Windbreaks make inspections calmer and more predictable.</li>
              <li>Record access notes properly (it saves headaches later).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Red flags */}
      <section id="red-flags" className="mb-10">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <h2 className="text-lg font-semibold text-rose-900">Red flags</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-900">
            <li>Entrances would face directly into a path, gate, doorway, or play area.</li>
            <li>You can’t inspect without being approached closely by the public.</li>
            <li>The site becomes inaccessible for long periods (mud, locked access, livestock).</li>
            <li>It’s a damp hollow / constant deep shade / flood-prone area.</li>
            <li>High theft/vandalism risk with no practical way to reduce visibility.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}