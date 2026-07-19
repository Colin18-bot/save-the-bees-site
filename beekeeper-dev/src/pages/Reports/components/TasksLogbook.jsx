import React from "react";
import PrintFooter from "./PrintFooter";

export default function TasksLogbook({
  todos,
  logbook,
  nfcHives,
  isPremium,
  includeNfc,
  apiaryName,
  effectiveIds,
  displayHive,
  relatedInspectionLabel,
  fmtUK,
  generatedAt,
  }) {
    return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
        <h2 className="text-xl font-bold text-gray-900">
          Tasks
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Follow-up actions and outstanding jobs linked to the selected apiary,
          hive or inspection period.
        </p>

        {todos.length === 0 ? (
          <p className="mt-3 text-gray-500">
            No matching tasks.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-3">Due</th>
                  <th className="py-2 pr-3">Apiary / Hive</th>
                  <th className="py-2 pr-3">Task</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Related inspection</th>
                </tr>
              </thead>

              <tbody>
                {todos.map((t) => {
                  const ids = effectiveIds(t);

                  return (
                    <tr key={t.id} className="border-b align-top">
                      <td className="whitespace-nowrap py-2 pr-3">
                        {fmtUK(t.due_date || t.created_at)}
                      </td>

                      <td className="py-2 pr-3">
                        <p className="font-semibold text-gray-900">
                          {apiaryName.get(ids.resolvedApiaryId) || "Apiary not set"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {displayHive(ids.resolvedHiveId, ids.resolvedApiaryId)}
                        </p>
                      </td>

                      <td className="py-2 pr-3">
                        <strong>{t.title}</strong>
                        {t.notes && (
                          <>
                            <br />
                            <span className="text-gray-600">{t.notes}</span>
                          </>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        {t.status || "—"}
                      </td>

                      <td className="py-2 pr-3">
                        {relatedInspectionLabel(t) || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
        <h2 className="text-xl font-bold text-gray-900">
          Logbook
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          General notes, observations and management records included within
          this report period.
        </p>

        {logbook.length === 0 ? (
          <p className="mt-3 text-gray-500">
            No matching log entries.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {logbook.map((l) => {
              const ids = effectiveIds(l);
              const related = relatedInspectionLabel(l);

              return (
                <div
                  key={l.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="font-semibold text-gray-900">
                    {apiaryName.get(ids.resolvedApiaryId) || "Apiary not set"}
                  </p>

                  <p className="text-sm text-gray-600">
                    {displayHive(ids.resolvedHiveId, ids.resolvedApiaryId)} • {fmtUK(l.date || l.created_at)}
                  </p>

                  <p className="text-sm text-gray-600">
                    {l.log_type || l.title || "Log entry"}
                  </p>

                  {(l.entry || l.notes) && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                      {l.entry || l.notes}
                    </p>
                  )}

                  {related && (
                    <p className="mt-2 text-xs text-gray-500">
                      Related: {related}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isPremium && includeNfc && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
          <h2 className="text-xl font-bold text-gray-900">
            NFC Tags
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Hives with NFC tags included in the selected report scope.
          </p>

          {nfcHives.length === 0 ? (
            <p className="mt-3 text-gray-500">
              No matching NFC tags.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {nfcHives.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="font-semibold">
                    {h.name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {apiaryName.get(h.apiary_id) || "Apiary not set"}
                  </p>

                  <code className="mt-2 block rounded bg-white p-2 text-xs break-all">
                    {h.nfc_uid}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
            )}

      <PrintFooter generatedAt={generatedAt} />
    </section>
  );
}