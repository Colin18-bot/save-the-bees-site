import React from "react";

export default function ReportTabs({
  activeTab,
  setActiveTab,
  isPremium,
  includeInspections,
  includeTodos,
  includeLogbook,
  includeQueens,
}) {
  const tabs = [
    ...(isPremium ? [["summary", "Overview"]] : []),
    ...(includeInspections
      ? [
          ["insights", "Hive Health"],
          ["timeline", "Timeline"],
          ["details", "Inspections"],
          ["photos", "Photos"],
        ]
      : []),
    ...(includeTodos || includeLogbook ? [["tasks", "Activity"]] : []),
    ...(includeQueens ? [["queens", "Queen Records"]] : []),
  ];

  return (
    <div className="no-print mt-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        View report
      </p>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              activeTab === id
                ? "border-green-800 bg-green-800 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
