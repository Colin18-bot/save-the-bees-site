import React, { useEffect, useMemo, useRef, useState } from "react";

// Presentation-only: receives the result of buildBeekeeperNotesStructured(...).
// This component does not fetch weather, access hive records, or manage subscriptions.
const SECTION_IDS = ["weather", "priorities", "jobs", "knowledge"];
const SECTION_ICONS = {
  weather: "🌦️",
  priorities: "📆",
  jobs: "🛠️",
  knowledge: "💡",
};
const DEFAULT_TITLES = {
  weather: "Important Weather Information",
  priorities: "This Month's Priorities",
  jobs: "Practical Jobs Around the Apiary",
  knowledge: "Seasonal Knowledge",
};

function readPreference(storageKey) {
  if (!storageKey || typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return Object.fromEntries(SECTION_IDS.map((key) => [key, parsed[key] === true]));
  } catch {
    return null;
  }
}

export default function SeasonalBeekeeperNotes({
  advisory,
  storageKey = "hivetag_seasonal_notes_weather_v1",
  className = "",
  theme = "dark",
}) {
  // Each page should pass its own storageKey so its expansion state is independent.
  const [expanded, setExpanded] = useState(() => readPreference(storageKey) || {});
  const previousWarning = useRef(null);

  const sections = useMemo(
    () => SECTION_IDS.map((id) => ({
      id,
      title: advisory?.sections?.[id]?.title || DEFAULT_TITLES[id],
      notes: Array.isArray(advisory?.sections?.[id]?.notes) ? advisory.sections[id].notes : [],
    })),
    [advisory]
  );

  // Changing between page-specific keys should restore that page's preferences.
  useEffect(() => {
    setExpanded(readPreference(storageKey) || {});
    previousWarning.current = null;
  }, [storageKey]);

  // On a newly arriving significant warning, open the weather section. Users may
  // close it afterwards; a routine refresh must not force it open again.
  const warningSignature = useMemo(() => {
    if (!advisory?.hasSignificantWarning) return null;
    const warning = advisory?.sections?.weather?.notes?.find((note) => note.id === "official-major-warning");
    return warning ? `${warning.id}:${warning.text}` : "significant-warning";
  }, [advisory]);

  useEffect(() => {
    if (warningSignature && previousWarning.current !== warningSignature) {
      setExpanded((previous) => ({ ...previous, weather: true }));
    }
    previousWarning.current = warningSignature;
  }, [warningSignature]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(expanded));
    } catch {
      // Browsers with restricted storage should still be able to use the panel.
    }
  }, [expanded, storageKey]);

  const toggle = (id) => setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));
  const setAll = (open) => setExpanded(Object.fromEntries(SECTION_IDS.map((id) => [id, open])));

  const light = theme === "light";
  return (
    <section className={`rounded shadow border p-4 ${light ? "border-gray-200 bg-white text-gray-900" : "border-zinc-800 bg-zinc-900 text-zinc-100"} ${className}`} aria-label="Seasonal Beekeeper Notes">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold">Seasonal Beekeeper Notes</h3>
          {advisory?.month && <p className={`text-xs ${light ? "text-gray-600" : "text-zinc-400"}`}>{advisory.month} · General seasonal guidance</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAll(true)} className={`rounded border px-2 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${light ? "border-gray-300 hover:bg-gray-100" : "border-zinc-600 hover:bg-zinc-800"}`}>
            Expand all
          </button>
          <button type="button" onClick={() => setAll(false)} className={`rounded border px-2 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${light ? "border-gray-300 hover:bg-gray-100" : "border-zinc-600 hover:bg-zinc-800"}`}>
            Collapse all
          </button>
        </div>
      </div>

      <p className={`text-xs mb-3 ${light ? "text-gray-600" : "text-zinc-400"}`}>
        General guidance only. Check your actual apiary conditions and follow relevant product instructions and official guidance. Forecasts can change; these notes do not assess individual colonies.
      </p>

      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = expanded[section.id] === true;
          const hasMajorWarning = section.id === "weather" && advisory?.hasSignificantWarning;
          const detailsId = `seasonal-${storageKey.replace(/[^a-zA-Z0-9_-]/g, "-")}-${section.id}`;
          const preview = section.notes[0]?.text;
          return (
            <div key={section.id} className={`rounded-lg border ${hasMajorWarning ? "border-amber-500" : light ? "border-gray-200" : "border-zinc-700"} ${light ? "bg-gray-50" : "bg-zinc-800"}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={detailsId}
                onClick={() => toggle(section.id)}
                className={`flex w-full items-start gap-2 rounded-lg p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${light ? "hover:bg-gray-100" : "hover:bg-zinc-700/50"}`}
              >
                <span aria-hidden="true">{SECTION_ICONS[section.id]}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold">{section.title}{hasMajorWarning ? " · Warning" : ""}</span>
                  <span className={`block text-xs mt-1 break-words ${light ? "text-gray-700" : "text-zinc-300"}`}>
                    {preview || (section.id === "weather" ? "No weather-specific recommendations at present." : "No guidance available at present.")}
                  </span>
                </span>
                <span aria-hidden="true" className={light ? "text-gray-600" : "text-zinc-300"}>{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div id={detailsId} className={`border-t p-3 ${light ? "border-gray-200" : "border-zinc-700"}`}>
                  {section.notes.length ? (
                    <ul className="space-y-2 text-sm">
                      {section.notes.map((note, index) => (
                        <li key={note.id || index} className="flex items-start gap-2">
                          <span aria-hidden="true">{note.icon || "•"}</span>
                          <span className="break-words">{note.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className={`text-sm ${light ? "text-gray-600" : "text-zinc-300"}`}>No additional recommendations at present.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
