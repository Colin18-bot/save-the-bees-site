import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { seasonalGuideData } from "../data/seasonalGuideData";

const monthIndex = new Date().getMonth();

export default function SeasonalGuide() {
  const [selectedId, setSelectedId] = useState(seasonalGuideData[monthIndex]?.id || "january");
  const [viewerOpen, setViewerOpen] = useState(false);

  const selected = useMemo(
    () => seasonalGuideData.find((item) => item.id === selectedId) || seasonalGuideData[0],
    [selectedId]
  );

  const selectedIndex = seasonalGuideData.findIndex((item) => item.id === selected.id);

  const goToMonth = (offset) => {
    const nextIndex =
      (selectedIndex + offset + seasonalGuideData.length) % seasonalGuideData.length;
    setSelectedId(seasonalGuideData[nextIndex].id);
  };

  return (
    <div className="min-h-screen bg-[#f7f7ef] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-[#1a3329] shadow-xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 text-white sm:p-8 lg:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-300">
                Premium seasonal guidance
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Year in the Apiary
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-green-50 sm:text-lg">
                A clean monthly guide for UK beekeepers. Check the current month, view the full
                infographic, and turn seasonal advice into practical hive actions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setViewerOpen(true)}
                  className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-[#1a3329] shadow hover:bg-yellow-300"
                >
                  View full guide
                </button>
                <Link
                  to="/todos/new"
                  className="rounded-xl border border-yellow-300/70 px-5 py-3 text-sm font-bold text-yellow-100 hover:bg-white/10"
                >
                  Create related task
                </Link>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="group relative min-h-[260px] overflow-hidden bg-black text-left lg:min-h-full"
              aria-label={`Open ${selected.month} full guide`}
            >
              <img
                src={selected.image}
                alt={`${selected.month} BeezKnees seasonal beekeeping guide infographic`}
                className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 text-[#1a3329] shadow-lg backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wider text-green-800">
                  Currently viewing
                </p>
                <p className="text-xl font-extrabold">{selected.month}</p>
                <p className="text-sm font-medium text-slate-700">
                  Tap to open the full infographic
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[#1a3329]">Choose a month</h2>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-[#1a3329]">
              {seasonalGuideData[monthIndex]?.month || "Current month"} is current
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
            {seasonalGuideData.map((item, index) => {
              const isSelected = item.id === selected.id;
              const isCurrent = index === monthIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`rounded-2xl border px-3 py-3 text-center text-sm font-bold transition ${
                    isSelected
                      ? "border-[#1a3329] bg-[#1a3329] text-white shadow"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-yellow-400 hover:bg-yellow-50"
                  }`}
                >
                  <span>{item.month.slice(0, 3)}</span>
                  {isCurrent && (
                    <span
                      className={`mt-1 block text-[10px] uppercase ${isSelected ? "text-yellow-300" : "text-green-700"}`}
                    >
                      Now
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-sm font-bold uppercase tracking-wider text-green-700">
              {selected.season}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#1a3329]">{selected.title}</h2>
            <p className="mt-2 text-base font-semibold text-slate-700">{selected.strapline}</p>

            <div className="mt-6 grid gap-4">
              <InfoBlock title="Key focus" items={selected.focus} tone="green" />
              <InfoBlock title="Risks to watch" items={selected.risks} tone="amber" />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                  Practical checklist
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#1a3329]">
                  Actions for {selected.month}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {selected.actions.map((action, index) => {
                const actionTitle = typeof action === "string" ? action : action.title;
                const actionKey =
                  typeof action === "string"
                    ? `${selected.id}-${index}`
                    : `${selected.id}-${action.id}`;

                return (
                  <div
                    key={actionKey}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800"
                  >
                    <div className="flex flex-1 flex-col gap-3">
                      <span>{actionTitle}</span>

                      <Link
                        to={`/todos/new?title=${encodeURIComponent(actionTitle)}&category=${encodeURIComponent(
                          typeof action === "string"
                            ? "Seasonal guide"
                            : action.category || "Seasonal guide"
                        )}&priority=${encodeURIComponent(
                          typeof action === "string" ? "Medium" : action.priority || "Medium"
                        )}&source=seasonal-guide&month=${encodeURIComponent(selected.month)}`}
                        className="w-fit rounded-lg bg-[#1a3329] px-3 py-2 text-xs font-bold text-white hover:bg-[#24483a]"
                      >
                        + Add task
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm text-slate-800 ring-1 ring-yellow-200">
              <p>
                <strong className="text-[#1a3329]">Educational Notice:</strong> The Year in the
                Apiary provides seasonal guidance for UK beekeepers. Weather, forage availability,
                local conditions and colony development vary considerably, so always use your own
                judgement when deciding whether a management action is appropriate.
              </p>

              <p className="mt-3">
                <strong className="text-[#1a3329]">Tip:</strong> Use the checklist for quick
                planning, then open the full guide when you want the detailed visual version.
              </p>
            </div>
          </div>
        </section>
      </div>

      {viewerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex flex-col bg-black/90 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="z-[10000] rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
              >
                ← Previous
              </button>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-yellow-300">
                  {selected.month}
                </p>
                <p className="text-xs text-white/80">Pinch/scroll to zoom on mobile or desktop</p>
              </div>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="z-[10000] rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
              >
                Next →
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-white p-2">
              <img
                src={selected.image}
                alt={`${selected.month} full seasonal beekeeping guide`}
                className="mx-auto h-auto max-w-full md:max-w-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setViewerOpen(false)}
              className="mt-3 z-[10000] rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-[#1a3329] hover:bg-yellow-300"
            >
              Close guide
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

function InfoBlock({ title, items, tone }) {
  const isAmber = tone === "amber";
  return (
    <div
      className={`rounded-2xl p-4 ring-1 ${isAmber ? "bg-amber-50 ring-amber-200" : "bg-green-50 ring-green-200"}`}
    >
      <h3 className="text-base font-extrabold text-[#1a3329]">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm font-medium text-slate-800">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isAmber ? "bg-amber-500" : "bg-green-700"}`}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
