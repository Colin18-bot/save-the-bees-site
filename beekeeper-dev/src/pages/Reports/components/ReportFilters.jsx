import React from "react";

export default function ReportFilters({
  apiaries,
  hivesForApiary,
  apiaryId,
  setApiaryId,
  hiveId,
  setHiveId,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  includeArchived,
  setIncludeArchived,
  includeInspections,
  setIncludeInspections,
  includeTodos,
  setIncludeTodos,
  includeLogbook,
  setIncludeLogbook,
  includeNfc,
  setIncludeNfc,
  isPremium,
  runQuery,
  loading,
  error,
}) {
  return (
    <div className="no-print mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Step 1</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Build Your Report</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose the apiary, hive, date range and sections to include. Then press Generate / Refresh Report to load the selected data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Apiary</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={apiaryId}
            onChange={(e) => {
              setApiaryId(e.target.value);
              setHiveId("");
            }}
          >
            <option value="">All apiaries</option>
            {apiaries.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Hive</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={hiveId}
            onChange={(e) => setHiveId(e.target.value)}
          >
            <option value="">All hives</option>
            {hivesForApiary.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-900">Include in generated report</p>
        <p className="text-xs text-gray-500">
          These tick boxes control what data is loaded, displayed and made available for CSV export.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-700">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
          Include archived
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeInspections} onChange={(e) => setIncludeInspections(e.target.checked)} />
          Inspections
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeTodos} onChange={(e) => setIncludeTodos(e.target.checked)} />
          Tasks
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={includeLogbook} onChange={(e) => setIncludeLogbook(e.target.checked)} />
          Logbook
        </label>
        {isPremium && (
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={includeNfc} onChange={(e) => setIncludeNfc(e.target.checked)} />
            NFC tags
          </label>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={runQuery}
          className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Loading…" : "Generate / Refresh Report"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
