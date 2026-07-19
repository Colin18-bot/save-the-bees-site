import React from "react";
import PrintFooter from "./PrintFooter";

export default function DetailedRecords({
  inspections,
  getInspectionAnalysis,
  fmtUK,
  displayHive,
  apiaryName,
  inspectionTypeLabel,
  formatWeatherForDisplay,
  valueWithOther,
  valueOrDash,
  boolYesNo,
  insightClasses,
  galleryItemsForInspection,
  openInspectionGallery,
  shareInspection,
  generatedAt,
}) {
  const Field = ({ label, value }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 print-field">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-900">{valueOrDash(value)}</p>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
          Inspection Records
        </p>

        <h2 className="mt-1 text-xl font-bold text-gray-900">
          Detailed Inspection Records
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Complete inspection records for the selected reporting period, including colony condition, queen assessment, brood, stores, health observations, recommendations and supporting photographs.
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
          No inspection records found for this report period.
        </div>
      ) : (
        inspections.map((x) => {
          const analysis = getInspectionAnalysis(x);
          const insights = analysis.insights || [];
          const recommendations = analysis.recommendations || [];
          const changes = analysis.changesSincePrevious || [];
          const galleryItems = galleryItemsForInspection(x);

          return (
            <article
              key={x.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card"
            >
              <div className="border-b border-gray-100 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                      Inspection Record
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      {apiaryName.get(x.apiary_id) || "Apiary not set"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {displayHive(x.hive_id, x.apiary_id)}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {fmtUK(x.date)}
                      {" • "}
                      {inspectionTypeLabel(x.inspection_type)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatWeatherForDisplay(x.weather) || "Weather not recorded"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">

                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center min-w-[110px]">
                    <p className="text-2xl font-bold text-green-800">
                      {analysis.healthScore}/100
                    </p>
                    <p className="text-xs font-semibold text-green-700">
                      {analysis.healthBand?.label || "Unrated"}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-1">
                    {insights.slice(0, 4).map((i) => (
                      <span
                        key={i.title}
                        className={`rounded-full border px-2 py-1 text-xs ${insightClasses(
                          i.level
                        )}`}
                      >
                        {i.title}
                      </span>
                    ))}
                  </div>

                </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">Colony Assessment</h4>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <Field label="Colony behaviour" value={valueWithOther(x.colony_behavior, x.colony_behavior_other)} />
                    <Field label="Hive population" value={x.hive_population} />
                    <Field label="Frames of bees" value={x.frames_of_bees} />
                    <Field label="Environmental signs" value={valueWithOther(x.environmental_signs, x.environmental_signs_other)} />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">Queen & Brood Assessment</h4>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <Field label="Queen status" value={valueWithOther(x.queen_status, x.queen_status_other)} />
                    <Field label="Queen cells" value={x.queen_cells} />
                    <Field label="Brood pattern" value={x.brood_pattern} />
                    <Field label="Brood box congestion" value={x.brood_box_congestion} />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">Colony Health</h4>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <Field label="Food stores" value={x.food_stores} />
                    <Field label="Varroa seen" value={boolYesNo(x.varroa_seen)} />
                    <Field label="Disease" value={x.signs_disease ? valueWithOther(x.disease_types, x.disease_other) : "No"} />
                    <Field label="Pests" value={x.signs_pests ? valueWithOther(x.pest_types, x.pest_other) : "No"} />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">Weather</h4>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Derived weather" value={formatWeatherForDisplay(x.weather)} />
                    <Field label="Observed weather" value={x.weather_observed} />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">Inspection Summary</h4>
                  <p className="mt-2 text-sm text-gray-700">
                    Health score: <strong>{analysis.healthScore}/100</strong>
                    {" "}— {analysis.healthBand?.label || "Not rated"}
                  </p>

                  {recommendations.length > 0 ? (
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                      {recommendations.slice(0, 4).map((item) => (
                        <li key={`${x.id}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      No specific recommendations generated for this inspection.
                    </p>
                  )}
                </div>
              </div>

              {changes.length > 0 && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">
                    Changes since previous inspection
                  </h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                    {changes.map((change) => (
                      <li key={`${x.id}-${change.title}`}>
                        <strong>{change.title}:</strong> {change.summary}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {x.notes && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Inspector's Notes</p>
                  <p className="mt-1 whitespace-pre-wrap">{x.notes}</p>
                </div>
              )}

              {galleryItems.length > 0 && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h4 className="font-bold text-gray-900">Inspection Photographs</h4>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {galleryItems.slice(0, 3).map((item) => (
                      <img
                        key={item.url}
                        src={item.url}
                        alt={`Inspection ${fmtUK(x.date)} photo ${item.index + 1}`}
                        className="print-photo h-32 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>

                  {galleryItems.length > 3 && (
                    <p className="mt-2 text-xs text-gray-500">
                      {galleryItems.length - 3} additional photo
                      {galleryItems.length - 3 === 1 ? "" : "s"} available in the full gallery.
                    </p>
                  )}
                </div>
              )}

              <div className="no-print mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => shareInspection(x)}
                  className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Share Inspection
                </button>

                {galleryItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openInspectionGallery(x)}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                  >
                    View Full Gallery ({galleryItems.length})
                  </button>
                )}
              </div>
            </article>
          );
        })
            )}

      <PrintFooter generatedAt={generatedAt} />
    </section>
  );
}