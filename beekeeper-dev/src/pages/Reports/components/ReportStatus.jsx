import React from "react";

export default function ReportStatus({ inspections, todos, logbook, nfcHives, photoCount, generatedAt }) {
  const statClass = "rounded-2xl border border-green-100 bg-white p-4 shadow-sm";

  return (
    <div className="no-print mt-6 rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Report generated successfully</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Your report is ready</h2>
          <p className="mt-1 text-sm text-gray-600">Generated {generatedAt}. The exports below use this same report data.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:min-w-[620px]">
          <div className={statClass}>
            <p className="text-xs text-gray-500">Inspections</p>
            <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
          </div>
          <div className={statClass}>
            <p className="text-xs text-gray-500">Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{todos.length}</p>
          </div>
          <div className={statClass}>
            <p className="text-xs text-gray-500">Logbook</p>
            <p className="text-2xl font-bold text-gray-900">{logbook.length}</p>
          </div>
          <div className={statClass}>
            <p className="text-xs text-gray-500">Photos</p>
            <p className="text-2xl font-bold text-gray-900">{photoCount}</p>
          </div>
          <div className={statClass}>
            <p className="text-xs text-gray-500">NFC</p>
            <p className="text-2xl font-bold text-gray-900">{nfcHives.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
