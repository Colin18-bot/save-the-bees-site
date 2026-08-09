import React from "react";

export default function ReportStatus({
  inspections,
  todos,
  logbook,
  nfcHives,
  queenCount,
  isPremium,
  includeQueens,
  includeNfc,
  photoCount,
  generatedAt,
}) {
  const statClass = "rounded-2xl border border-green-100 bg-white p-4 shadow-sm";

  const stats = [
    ...(isPremium
      ? [
          ["Inspections", inspections.length],
          ["Tasks", todos.length],
          ["Logbook", logbook.length],
        ]
      : []),
    ...(includeQueens ? [["Queens", queenCount]] : []),
    ...(isPremium ? [["Photos", photoCount]] : []),
    ...(isPremium && includeNfc ? [["NFC", nfcHives.length]] : []),
  ];

  return (
    <div className="no-print mt-6 rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
            Report generated successfully
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Your report is ready</h2>
          <p className="mt-1 text-sm text-gray-600">
            Generated {generatedAt}. The exports below use this same loaded report data.
          </p>
        </div>

        <div
          className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${
            isPremium ? "lg:min-w-[620px]" : "lg:min-w-[210px]"
          }`}
        >
          {stats.map(([label, value]) => (
            <div key={label} className={statClass}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
