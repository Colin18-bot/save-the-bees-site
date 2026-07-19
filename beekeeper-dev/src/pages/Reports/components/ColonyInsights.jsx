import React from "react";
import { INSIGHT_LEVELS } from "../../../utils/hiveIntelligence";
import PrintFooter from "./PrintFooter";

export default function ColonyInsights({
  groupedInspectionInsights,
  insightClasses,
  insightDot,
  fmtUK,
  displayHive,
  apiaryName,
  inspectionTypeLabel,
  valueOrDash,
  valueWithOther,
  generatedAt,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
      <h2 className="text-xl font-bold text-gray-900">Colony Health Report</h2>

      <p className="mt-1 text-sm text-gray-600">
        HiveTag has analysed each inspection and highlighted notable observations, trends and
        recommended follow-up actions. These insights are intended to support the beekeeper's
        decision making and should always be considered alongside a physical hive inspection.
      </p>

      {groupedInspectionInsights.length === 0 ? (
        <p className="mt-4 text-gray-500">No insights found for this report period.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {groupedInspectionInsights.map(
            ({ inspection, analysis, insights, recommendations, changesSincePrevious }) => {
              const highestLevel = insights.some((i) => i.level === INSIGHT_LEVELS.CRITICAL)
                ? INSIGHT_LEVELS.CRITICAL
                : insights.some((i) => i.level === INSIGHT_LEVELS.WARNING)
                  ? INSIGHT_LEVELS.WARNING
                  : insights.some((i) => i.level === INSIGHT_LEVELS.WATCH)
                    ? INSIGHT_LEVELS.WATCH
                    : insights.some((i) => i.level === INSIGHT_LEVELS.INFO)
                      ? INSIGHT_LEVELS.INFO
                      : INSIGHT_LEVELS.GOOD;

              return (
                <article
                  key={inspection.id}
                  className={`rounded-2xl border p-4 ${insightClasses(highestLevel)}`}
                >
                  <div className="flex flex-col gap-2 border-b border-current/10 pb-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        {apiaryName.get(inspection.apiary_id) || "Apiary not set"}
                      </h3>

                      <p className="text-sm opacity-90">
                        {displayHive(inspection.hive_id, inspection.apiary_id)} •{" "}
                        {fmtUK(inspection.date)}
                      </p>

                      <p className="mt-1 text-sm">
                        {inspectionTypeLabel(inspection.inspection_type || "full_inspection")} ·
                        Health score {analysis.healthScore}/100 ({analysis.healthBand?.label}) ·{" "}
                        {valueOrDash(inspection.hive_population)} colony · Queen:{" "}
                        {valueWithOther(inspection.queen_status, inspection.queen_status_other)}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-green-800 px-3 py-1 text-xs font-semibold uppercase text-white">
                      {analysis.healthBand?.label} • {analysis.healthScore}/100
                    </span>
                  </div>

                  <h4 className="mt-4 mb-2 font-semibold text-gray-800">Key findings</h4>

                  <div className="flex flex-wrap gap-2">
                    {insights.map((item) => (
                      <span
                        key={item.title}
                        className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold"
                      >
                        {insightDot(item.level)} {item.title}
                      </span>
                    ))}
                  </div>

                  <h4 className="mt-5 mb-2 font-semibold text-gray-800">Analysis</h4>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {insights.map((item) => (
                      <div
                        key={`${inspection.id}-${item.title}`}
                        className="rounded-xl bg-white/60 p-3 text-sm"
                      >
                        <p className="font-bold">{item.title}</p>

                        <p className="mt-1">{item.summary || "Based on the inspection record."}</p>

                        {item.reasons?.length > 0 && (
                          <ul className="mt-2 list-disc pl-5">
                            {item.reasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  {changesSincePrevious.length > 0 && (
                    <div className="mt-4 rounded-xl bg-white/60 p-3 text-sm">
                      <p className="font-bold">What changed since the previous inspection</p>

                      <ul className="mt-2 list-disc pl-5">
                        {changesSincePrevious.map((change) => (
                          <li key={`${inspection.id}-${change.title}`}>
                            <strong>{change.title}:</strong> {change.summary}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div className="mt-4 rounded-xl bg-white/70 p-3 text-sm">
                      <p className="font-bold text-green-800">Recommended next actions</p>

                      <ul className="mt-2 list-disc pl-5">
                        {recommendations.map((item) => (
                          <li key={`${inspection.id}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      )}

      <PrintFooter generatedAt={generatedAt} />
    </section>
  );
}
