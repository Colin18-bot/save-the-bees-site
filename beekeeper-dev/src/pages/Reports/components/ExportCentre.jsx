import React from "react";

export default function ExportCentre({
  apiaries,
  hives,
  loading,
  totalRecords,
  inspections,
  todos,
  logbook,
  nfcHives,
  isPremium,
  includeNfc,
  downloadApiariesCSV,
  downloadHivesCSV,
  downloadInspectionsCSV,
  downloadTodosCSV,
  downloadLogbookCSV,
  downloadNfcCSV,
  downloadCombinedCSV,
  handlePrint,
}) {
  const buttonBase =
    "rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="no-print mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Step 3</p>

        <h2 className="mt-1 text-xl font-bold text-gray-900">Export & Print</h2>

        <p className="mt-1 text-sm text-gray-600">
          Exports use the data currently loaded into this report. If you change the filters or
          selected sections, press <strong>Generate / Refresh Report</strong> before exporting.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Export Loaded Data</h3>

          <p className="mt-1 text-sm text-gray-600">
            Download individual sections as CSV files, or export the complete report as one Excel
            workbook. The Excel report contains each loaded section on a separate worksheet.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={downloadApiariesCSV}
              className={`${buttonBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
              disabled={loading || !apiaries.length}
            >
              Export Apiaries CSV
            </button>

            <button
              onClick={downloadHivesCSV}
              className={`${buttonBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
              disabled={loading || !hives.length}
            >
              Export Hives CSV
            </button>

            <button
              onClick={downloadInspectionsCSV}
              className={`${buttonBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
              disabled={loading || !inspections.length}
            >
              Export Inspections CSV
            </button>

            <button
              onClick={downloadTodosCSV}
              className={`${buttonBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
              disabled={loading || !todos.length}
            >
              Export Tasks CSV
            </button>

            <button
              onClick={downloadLogbookCSV}
              className={`${buttonBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
              disabled={loading || !logbook.length}
            >
              Export Logbook CSV
            </button>

            {isPremium && (
              <button
                onClick={downloadNfcCSV}
                className={`${buttonBase} bg-gray-100 text-gray-800 hover:bg-gray-200`}
                disabled={loading || !nfcHives.length || !includeNfc}
              >
                Export NFC Tags CSV
              </button>
            )}

            <button
              onClick={downloadCombinedCSV}
              className={`${buttonBase} bg-gray-800 text-white hover:bg-black`}
              disabled={loading || totalRecords === 0}
            >
              Export Complete Report (Excel)
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Print Report</h3>

          <p className="mt-1 text-sm text-gray-600">
            Print the report directly or choose <strong>Save as PDF</strong> from your browser's
            print dialog.
          </p>

          <div className="mt-4">
            <button
              onClick={handlePrint}
              className={`${buttonBase} bg-green-700 text-white hover:bg-green-800`}
              disabled={loading || totalRecords === 0}
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
