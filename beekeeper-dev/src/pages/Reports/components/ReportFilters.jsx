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
  includeQueens,
  setIncludeQueens,
  includeNfc,
  setIncludeNfc,
  isPremium,
  hasQueenData,
  runQuery,
  loading,
  error,
}) {
  const canUseQueenReports = isPremium || hasQueenData;
  const queenOnlyAccess = !isPremium && hasQueenData;

  return (
    <div className="no-print mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Step 1</p>
        <h2 className="mt-1 text-xl font-bold text-gray-900">
          {queenOnlyAccess ? "Build Your Queen Report" : "Build Your Report"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {queenOnlyAccess
            ? "Choose the apiary, hive, date range and whether archived Queen history should be included. Then generate the report."
            : "Choose the apiary, hive, date range and sections to include. Then press Generate / Refresh Report to load the selected data."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Apiary</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={apiaryId}
            onChange={(event) => {
              setApiaryId(event.target.value);
              setHiveId("");
            }}
          >
            <option value="">All apiaries</option>
            {apiaries.map((apiary) => (
              <option key={apiary.id} value={apiary.id}>
                {apiary.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Hive</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={hiveId}
            onChange={(event) => setHiveId(event.target.value)}
          >
            <option value="">All hives</option>
            {hivesForApiary.map((hive) => (
              <option key={hive.id} value={hive.id}>
                {hive.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-900">Include in generated report</p>
        <p className="text-xs text-gray-500">
          These controls determine what data is loaded, displayed, printed and made available for export.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-700">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(event) => setIncludeArchived(event.target.checked)}
          />
          Include archived
        </label>

        {isPremium && (
          <>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeInspections}
                onChange={(event) => setIncludeInspections(event.target.checked)}
              />
              Inspections
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTodos}
                onChange={(event) => setIncludeTodos(event.target.checked)}
              />
              Tasks
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeLogbook}
                onChange={(event) => setIncludeLogbook(event.target.checked)}
              />
              Logbook
            </label>
          </>
        )}

        <label
          className={`inline-flex items-center gap-2 ${
            canUseQueenReports ? "" : "text-gray-400"
          }`}
        >
          <input
            type="checkbox"
            checked={queenOnlyAccess ? true : includeQueens}
            disabled={!canUseQueenReports || queenOnlyAccess}
            onChange={(event) => setIncludeQueens(event.target.checked)}
          />
          Queen Records
        </label>

        {isPremium && (
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeNfc}
              onChange={(event) => setIncludeNfc(event.target.checked)}
            />
            NFC tags
          </label>
        )}
      </div>

      {queenOnlyAccess && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Your retained Queen Records remain available in read-only mode. This report is limited to
          Queen history, printing and Queen exports; other Premium report sections remain locked.
        </p>
      )}

      {!isPremium && !hasQueenData && (
        <p className="mt-3 text-xs text-gray-500">
          Queen reporting becomes available after Queen Records have been created with Premium.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runQuery}
          className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading || (!isPremium && !hasQueenData)}
        >
          {loading
            ? "Loading…"
            : queenOnlyAccess
              ? "Generate / Refresh Queen Report"
              : "Generate / Refresh Report"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
