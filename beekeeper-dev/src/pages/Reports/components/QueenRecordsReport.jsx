import React from "react";

const titleCase = (value, fallback = "Not recorded") => {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const yesNo = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not recorded";
};

const expectedColour = (year) => {
  const digit = Number(String(year ?? "").slice(-1));
  if ([1, 6].includes(digit)) return "White";
  if ([2, 7].includes(digit)) return "Yellow";
  if ([3, 8].includes(digit)) return "Red";
  if ([4, 9].includes(digit)) return "Green";
  if ([5, 0].includes(digit)) return "Blue";
  return "Not recorded";
};

const Field = ({ label, value }) => (
  <div className="print-field">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || "Not recorded"}</dd>
  </div>
);

const Section = ({ title, subtitle, children }) => (
  <section className="print-card rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
    {children}
  </div>
);

export default function QueenRecordsReport({
  queenReport,
  apiaryName,
  displayHive,
  fmtUK,
  fromDate,
  toDate,
}) {
  const currentRows = queenReport?.currentByHive || [];
  const queens = queenReport?.queens || [];
  const assignments = queenReport?.assignments || [];
  const events = queenReport?.events || [];
  const processes = queenReport?.processes || [];
  const snapshots = queenReport?.snapshots || [];

  const currentQueens = currentRows.filter((row) => row.currentQueen).length;
  const activeProcesses = currentRows.filter((row) => row.activeProcess).length;

  return (
    <div className="space-y-6">
      <Section
        title="Queen Records"
        subtitle={`Current Queen position plus Queen history recorded from ${fmtUK(fromDate)} to ${fmtUK(toDate)}.`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Queen records", queens.length],
            ["Current Queens", currentQueens],
            ["Active processes", activeProcesses],
            ["Events in period", events.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Current Queen Position"
        subtitle="The current position is shown even where the Queen assignment began before the selected report dates."
      >
        {!currentRows.length ? (
          <Empty>No hives are available within the selected report scope.</Empty>
        ) : (
          <div className="space-y-4">
            {currentRows.map(({ hive, currentQueen, currentAssignment, activeProcess, lastSeen }) => {
              const actual = currentQueen
                ? currentQueen.actual_colour ||
                  (currentQueen.marked ? expectedColour(currentQueen.queen_year) : "Unmarked")
                : "";

              return (
                <article key={hive.id} className="break-inside-avoid rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                        {apiaryName.get(hive.apiary_id) || "Unknown apiary"}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">{hive.name || "Unnamed Hive"}</h3>
                    </div>
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                      currentQueen
                        ? "border-green-200 bg-green-50 text-green-800"
                        : activeProcess
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}>
                      {currentQueen
                        ? titleCase(currentQueen.status, "Current Queen")
                        : activeProcess
                        ? titleCase(activeProcess.status, "Queen process active")
                        : "No current Queen record"}
                    </span>
                  </div>

                  {currentQueen ? (
                    <>
                      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Queen reference" value={currentQueen.reference || "Queen record"} />
                        <Field label="Year / colour" value={`${currentQueen.queen_year || "Unknown year"} ${String(actual || "Not recorded").toLowerCase()}${String(actual).toLowerCase() === "unmarked" ? " queen" : "-marked queen"}`} />
                        <Field label="Marked" value={yesNo(currentQueen.marked)} />
                        <Field label="Clipped" value={yesNo(currentQueen.clipped)} />
                        <Field label="Origin" value={currentQueen.origin} />
                        <Field label="Supplier" value={currentQueen.supplier} />
                        <Field label="Current since" value={fmtUK(currentAssignment?.started_on)} />
                        <Field label="Last recorded sighting" value={fmtUK(lastSeen)} />
                        <Field label="Emerged" value={fmtUK(currentQueen.emerged_on)} />
                        <Field label="Introduced" value={fmtUK(currentQueen.introduced_on)} />
                      </dl>
                      {currentQueen.notes && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                          <strong>Queen notes:</strong> {currentQueen.notes}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-gray-600">No Queen is currently assigned to this hive.</p>
                  )}

                  {activeProcess && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                      <p className="font-semibold">Active Queen process</p>
                      <p className="mt-1">
                        {activeProcess.method || titleCase(activeProcess.process_type, "Queen process")} — {titleCase(activeProcess.status, "Active")}
                      </p>
                      <p className="mt-1">Started: {fmtUK(activeProcess.started_on)} · Next check: {fmtUK(activeProcess.expected_check_on)}</p>
                      {activeProcess.notes && <p className="mt-1">{activeProcess.notes}</p>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Queen Assignment History" subtitle="Assignments that overlap the selected report dates.">
        {!assignments.length ? (
          <Empty>No Queen assignments overlap this report period.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b text-xs uppercase tracking-wide text-gray-500"><th>Queen</th><th>Hive</th><th>Started</th><th>Ended</th><th>Outcome</th></tr></thead>
              <tbody>
                {assignments.map((assignment) => {
                  const queen = queens.find((row) => row.id === assignment.queen_id);
                  const current = currentRows.find((row) => row.hive.id === assignment.hive_id);
                  return (
                    <tr key={assignment.id} className="border-b last:border-b-0">
                      <td>{queen?.reference || "Queen record"}</td>
                      <td>{displayHive(assignment.hive_id, current?.hive?.apiary_id)}</td>
                      <td>{fmtUK(assignment.started_on)}</td>
                      <td>{assignment.ended_on ? fmtUK(assignment.ended_on) : "Current"}</td>
                      <td>{titleCase(assignment.end_reason || assignment.start_reason, assignment.ended_on ? "Ended" : "Current")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Queen Events & Changes" subtitle="Dated Queen events within the selected report period.">
        {!events.length ? (
          <Empty>No Queen events were recorded during this report period.</Empty>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const queen = queens.find((row) => row.id === event.queen_id);
              const hiveId = event.hive_id || event.destination_hive_id || event.source_hive_id;
              const current = currentRows.find((row) => row.hive.id === hiveId);
              return (
                <article key={event.id} className="break-inside-avoid rounded-lg border border-gray-200 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{event.title || titleCase(event.event_type, "Queen event")}</p>
                      <p className="text-xs text-gray-500">{queen?.reference || ""}{hiveId ? ` · ${displayHive(hiveId, current?.hive?.apiary_id)}` : ""}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-500">{fmtUK(event.event_date || event.created_at)}</p>
                  </div>
                  {event.detail && <p className="mt-2 text-sm text-gray-700">{event.detail}</p>}
                </article>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Queen Processes" subtitle="Introduction, Queenless and rearing processes that overlap the report period.">
        {!processes.length ? (
          <Empty>No Queen processes overlap this report period.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b text-xs uppercase tracking-wide text-gray-500"><th>Hive</th><th>Method</th><th>Status</th><th>Started</th><th>Next check</th><th>Ended</th></tr></thead>
              <tbody>
                {processes.map((process) => {
                  const current = currentRows.find((row) => row.hive.id === process.hive_id);
                  return (
                    <tr key={process.id} className="border-b last:border-b-0">
                      <td>{displayHive(process.hive_id, current?.hive?.apiary_id)}</td>
                      <td>{process.method || titleCase(process.process_type, "Queen process")}</td>
                      <td>{titleCase(process.status, "Active")}</td>
                      <td>{fmtUK(process.started_on)}</td>
                      <td>{fmtUK(process.expected_check_on)}</td>
                      <td>{process.ended_on ? fmtUK(process.ended_on) : "Active"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Inspection Queen Snapshots" subtitle="Historical Queen information stored with inspections. Later edits to the live Queen record do not alter these snapshots.">
        {!snapshots.length ? (
          <Empty>No inspections in this report period contain a saved Queen snapshot.</Empty>
        ) : (
          <div className="space-y-3">
            {snapshots.map((inspection) => {
              const snapshot = inspection.queen_snapshot || {};
              const expected = snapshot.expected_colour || expectedColour(snapshot.queen_year);
              const actual = snapshot.actual_colour || (snapshot.marked ? expected : "Unmarked");
              return (
                <article key={inspection.id} className="break-inside-avoid rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{snapshot.reference || "Queen record"}</p>
                      <p className="text-sm text-gray-700">{displayHive(inspection.hive_id, inspection.apiary_id)} · {snapshot.queen_year || "Unknown year"} {String(actual).toLowerCase()}{String(actual).toLowerCase() === "unmarked" ? " queen" : "-marked queen"}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-500">Inspection {fmtUK(inspection.date)}</p>
                  </div>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Status" value={titleCase(snapshot.status, "Not recorded")} />
                    <Field label="Origin" value={snapshot.origin} />
                    <Field label="Clipped" value={yesNo(snapshot.clipped)} />
                    <Field label="Assigned from" value={fmtUK(snapshot.assignment_started_on)} />
                  </dl>
                  {snapshot.notes && <p className="mt-3 text-sm text-blue-950">{snapshot.notes}</p>}
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
