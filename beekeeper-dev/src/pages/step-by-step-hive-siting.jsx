// src/pages/step-by-step-hive-siting.jsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function StepByStepHiveSiting() {
  const navigate = useNavigate();
  const sections = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "quick-checklist", label: "Quick checklist" },
      { id: "step-by-step", label: "Step-by-step" },
      { id: "layout-tips", label: "Layout tips" },
      { id: "red-flags", label: "Red flags" },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        title: "Pick the exact spot (and your inspection stance)",
        why: "Where you stand, where boxes go, and whether you can step back safely matters a lot.",
        doThis: [
          "Choose firm, level ground for the stand.",
          "Make sure you can stand comfortably behind/side of the hive to inspect.",
          "Plan where supers/roof will go during inspections.",
          "Remove trip hazards (holes, roots, loose stones).",
        ],
        avoid: [
          "Placing the hive where you’ll be forced into the entrance flight line.",
          "A position where you can’t step back safely.",
        ],
      },
      {
        title: "Orient the entrance to reduce nuisance",
        why: "Entrance direction + a simple screen prevents most problems with people and pets.",
        doThis: [
          "Face entrances away from footpaths, gates, seating areas, and neighbours.",
          "Use a fence/hedge/screen to lift flight lines above head height.",
          "If multiple hives, add small visual differences (colour/landmarks) to reduce drifting.",
        ],
        avoid: [
          "Entrances pointing into open walking routes or where people stop.",
          "Straight, open flight paths at head height.",
        ],
      },
      {
        title: "Stand height and stability",
        why: "A stable stand reduces damp, protects the floor, and stops wobble during inspections.",
        doThis: [
          "Use a solid stand that doesn’t rock (off damp ground).",
          "Aim for a comfortable working height (less bending).",
          "Prevent sinking over time (pavers/feet if needed).",
        ],
        avoid: ["Directly on wet soil or grass that stays damp.", "Improvised stands that tilt under load."],
      },
      {
        title: "Wind, shade, and overheating",
        why: "Shelter helps; too much damp shade slows colonies; too much sun can overheat.",
        doThis: [
          "Shelter from prevailing wind if possible.",
          "Morning sun helps; dappled shade can be useful in high summer.",
          "Make sure airflow/ventilation is possible during hot spells.",
        ],
        avoid: [
          "Constant deep shade and damp conditions.",
          "A heat trap with full sun all day and no airflow (especially in enclosed spaces).",
        ],
      },
      {
        title: "Space between hives (and room for swarm control)",
        why: "Crowding makes inspections awkward and increases drifting/confusion.",
        doThis: [
          "Leave enough space to work each hive without bumping another.",
          "Plan room for a nuc or spare box — you often need it quickly.",
          "Stagger hives slightly or use landmarks to reduce drifting.",
        ],
        avoid: ["Hives so close you can’t open one without interfering with another."],
      },
      {
        title: "Water: provide it before they choose one",
        why: "Bees learn water sources fast. You want them trained to your water source, not someone’s pond.",
        doThis: [
          "Provide water from day one (pebbles/floaters to prevent drowning).",
          "Keep it topped up in warm weather.",
          "If near houses, make it especially reliable early season.",
        ],
        avoid: ["Relying on a neighbour’s pond/gutter/birdbath as the default water source."],
      },
      {
        title: "Practical safety: livestock, machinery, and your route",
        why: "A lot of accidents happen moving kit, not during the inspection itself.",
        doThis: [
          "Keep hives out of livestock lanes and away from rubbing/leaning points.",
          "Avoid siting where machinery operates close by.",
          "Plan a safe route for carrying supers and equipment.",
        ],
        avoid: [
          "Placing hives where animals can push/knock them.",
          "Siting beside gates that get used constantly (or slam).",
        ],
      },
      {
        title: "Record the setup (photo + notes)",
        why: "A repeatable layout makes troubleshooting and expansion much easier.",
        doThis: [
          "Take a photo of each hive and entrance direction.",
          "Note any site specifics (windbreak, shade times, water location).",
          "If you move the hive later, note why and how far.",
        ],
        avoid: ["No record of the layout — it gets messy when you add more colonies."],
      },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hive Siting Guide</h2>
          <p className="mt-1 text-sm text-slate-600">
            Step-by-step guidance to place your hive safely, reduce nuisance, and make inspections easier.
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
              This guide is about the <span className="font-semibold">exact hive placement</span> within your apiary:
              entrance direction, working space, stand stability, shelter, and practical safety.
            </p>
            <p>
              If you only do one improvement:{" "}
              <span className="font-semibold">
                point the entrance away from people and use a screen to lift the flight line
              </span>
              .
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
              "Firm, level spot for the stand",
              "Comfortable place to stand during inspection",
              "Space beside the hive for boxes/kit",
              "Entrance not facing paths/gates/seating/neighbours",
              "Screen/hedge/fence to lift flight lines",
              "Stand won’t wobble or sink",
              "Shelter from wind; not deep shade all day",
              "Water provided close by (with floaters/pebbles)",
              "Space between hives to work safely",
              "Room for a nuc/spare box (swarm control)",
              "Out of livestock routes / machinery routes",
              "Photo + notes recorded for the layout",
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-900">
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

      {/* Layout tips */}
      <section id="layout-tips" className="mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Layout tips</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Keep a clear “working lane” so you’re not stepping into entrances.</li>
            <li>Small colour/marker differences help reduce drifting when hives are close.</li>
            <li>Leave space for a nuc box or spare brood box — swarm control needs room.</li>
            <li>Try to keep stand height and spacing consistent as you expand.</li>
          </ul>
        </div>
      </section>

      {/* Red flags */}
      <section id="red-flags" className="mb-10">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <h2 className="text-lg font-semibold text-rose-900">Red flags</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-900">
            <li>The entrance points into a footpath, gate, seating area, or where people stop.</li>
            <li>You’re forced to stand in the flight line to inspect.</li>
            <li>The stand is unstable or will sink/tilt over time.</li>
            <li>Livestock can rub against the hive or knock it.</li>
            <li>There’s no safe space to set boxes down during inspections.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}