import React from "react";
import PrintFooter from "./PrintFooter";

export default function PhotoTimeline({
  inspections,
  galleryItemsForInspection,
  openInspectionGallery,
  shareInspection,
    fmtUK,
    displayHive,
    apiaryName,
    generatedAt,
  }) {
  const inspectionsWithPhotos = inspections.filter(
    (x) => galleryItemsForInspection(x).length > 0
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
      <h2 className="text-xl font-bold text-gray-900">
        Photo Timeline
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Inspection photos are grouped by visit, giving a visual record of colony
        condition, equipment, stores and any concerns recorded during the report
        period.
      </p>

      {inspectionsWithPhotos.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No photos found in this report period.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {inspectionsWithPhotos.map((x) => {
            const items = galleryItemsForInspection(x);

            return (
              <article
                key={x.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {apiaryName.get(x.apiary_id) || "Apiary not set"}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {displayHive(x.hive_id, x.apiary_id)} • {fmtUK(x.date)}
                    </p>

                    <p className="text-sm text-gray-600">
                      {items.length} photo{items.length === 1 ? "" : "s"} attached
                      to this inspection
                    </p>
                  </div>

                  <div className="no-print flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openInspectionGallery(x)}
                      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-green-800 ring-1 ring-green-200 hover:bg-green-50"
                    >
                      View full gallery
                    </button>

                    <button
                      type="button"
                      onClick={() => shareInspection(x)}
                      className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      Share inspection summary
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.slice(0, 4).map((item) => (
                    <figure
                      key={item.url}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      <img
                        src={item.url}
                        alt={`Inspection ${fmtUK(x.date)} photo ${item.index + 1}`}
                        className="print-photo h-40 w-full object-cover"
                      />

                      <figcaption className="px-3 py-2 text-xs text-gray-600">
                        Photo {item.index + 1}
                      </figcaption>
                    </figure>
                  ))}
                </div>

                {items.length > 4 && (
                  <p className="no-print mt-3 text-xs text-gray-500">
                    {items.length - 4} more photo
                    {items.length - 4 === 1 ? "" : "s"} available in the full gallery.
                  </p>
                )}
              </article>
            );
          })}
        </div>
            )}

      <PrintFooter generatedAt={generatedAt} />
    </section>
  );
}