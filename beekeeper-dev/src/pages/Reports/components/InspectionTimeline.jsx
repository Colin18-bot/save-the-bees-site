import React from "react";
import PrintFooter from "./PrintFooter";

export default function InspectionTimeline({
  inspections,
  getInspectionAnalysis,
  fmtUK,
  displayHive,
  apiaryName,
  inspectionTypeLabel,
  valueWithOther,
  valueOrDash,
  insightClasses,
  generatedAt,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
          Inspection History
        </p>

        <h2 className="mt-1 text-xl font-bold text-gray-900">
          Inspection Timeline
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          A chronological record of inspections in this report period, showing
          colony condition, queen evidence, stores and inspection findings.
        </p>
      </div>

      {inspections.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          No inspections were recorded for the selected report period.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Apiary / Hive</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Health</th>
                <th className="px-3 py-3">Queen</th>
                <th className="px-3 py-3">Brood</th>
                <th className="px-3 py-3">Stores</th>
                <th className="px-3 py-3">Inspection Findings</th>
              </tr>
            </thead>

            <tbody>
              {inspections.map((inspection) => {
                const analysis = getInspectionAnalysis(inspection);
                const insights = analysis.insights || [];

                return (
                  <tr key={inspection.id} className="border-b align-top last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-4 font-semibold text-gray-900">
                      {fmtUK(inspection.date)}
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-semibold text-gray-900">
                        {apiaryName.get(inspection.apiary_id) || "Apiary not set"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {displayHive(inspection.hive_id, inspection.apiary_id)}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      {inspectionTypeLabel(inspection.inspection_type)}
                    </td>

                    <td className="px-3 py-4">
                      <span className="font-bold text-green-800">
                        {analysis.healthScore}/100
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {analysis.healthBand?.label || "Unrated"}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      {valueWithOther(
                        inspection.queen_status,
                        inspection.queen_status_other
                      )}
                    </td>

                    <td className="px-3 py-4">
                      {valueOrDash(inspection.brood_pattern)}
                    </td>

                    <td className="px-3 py-4">
                      {valueOrDash(inspection.food_stores)}
                    </td>

                    <td className="px-3 py-4">
                      {insights.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {insights.map((item) => (
                            <span
                              key={`${inspection.id}-${item.title}`}
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${insightClasses(
                                item.level
                              )}`}
                            >
                              {item.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No inspection findings recorded.
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PrintFooter generatedAt={generatedAt} />
    </section>
  );
}