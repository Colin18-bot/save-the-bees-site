import React from "react";

const tabs = [
  ["summary", "Overview"],
  ["insights", "Hive Health"],
  ["timeline", "Timeline"],
  ["details", "Inspections"],
  ["photos", "Photos"],
  ["tasks", "Activity"],
];

export default function ReportTabs({ activeTab, setActiveTab }) {
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
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              activeTab === id
                ? "bg-green-800 text-white border-green-800"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
