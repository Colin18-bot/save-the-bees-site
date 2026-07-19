import React from "react";
import PrintFooter from "./PrintFooter";

export default function ExecutiveSummary({
  reportScope,
  fromDate,
  toDate,
  generatedAt,
  fmtUK,
  inspections,
  summary,
  latestInspection,
  getInspectionAnalysis,
  displayHive,
  inspectionTypeLabel,
  valueOrDash,
}) {
  const latestAnalysis = latestInspection ? getInspectionAnalysis(latestInspection) : null;

  return (
    <section className="space-y-6 print:block">
      <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm print-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
          Executive Summary
        </p>

        <h2 className="mt-1 text-3xl font-bold text-gray-900">
          {reportScope}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Reporting period: <strong>{fmtUK(fromDate)} – {fmtUK(toDate)}</strong>
          {" "}• Generated: <strong>{generatedAt}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryBox label="Inspections" value={inspections.length} note={`${summary.fullInspections} full inspections`} />
        <SummaryBox label="Average Health" value={summary.averageHealthScore || "—"} note={summary.averageHealthBand} />
        <SummaryBox label="Open Tasks" value={summary.openTasks} note={`${summary.completedTasks} completed`} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
        <h3 className="text-lg font-bold text-gray-900">Report Contents</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ContentItem label="Inspection records" value={inspections.length} />
          <ContentItem label="Strong colony signals" value={summary.strongColony} />
          <ContentItem label="Queen likely / OK" value={summary.queenLikely} />
          <ContentItem label="Inspection photos" value={summary.photoCount} />
          <ContentItem label="Disease concerns" value={summary.diseaseCount} tone={summary.diseaseCount > 0 ? "red" : "green"} />
          <ContentItem label="Pest concerns" value={summary.pestCount} tone={summary.pestCount > 0 ? "orange" : "green"} />
          <ContentItem label="Varroa sightings" value={summary.varroaCount} tone={summary.varroaCount > 0 ? "orange" : "green"} />
          <ContentItem label="Completed tasks" value={summary.completedTasks} />
        </div>
      </div>

      {latestInspection && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-card">
          <h3 className="text-lg font-bold text-gray-900">Latest Inspection Snapshot</h3>

          <p className="mt-1 text-sm text-gray-600">
            The most recent inspection in this report period.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Date" value={fmtUK(latestInspection.date)} />
            <Field label="Hive" value={displayHive(latestInspection.hive_id, latestInspection.apiary_id)} />
            <Field label="Type" value={inspectionTypeLabel(latestInspection.inspection_type)} />
            <Field label="Health score" value={`${latestAnalysis?.healthScore || "—"}/100`} />
            <Field label="Health band" value={latestAnalysis?.healthBand?.label || "—"} />
            <Field label="Population" value={valueOrDash(latestInspection.hive_population)} />
            <Field label="Brood" value={valueOrDash(latestInspection.brood_pattern)} />
            <Field label="Stores" value={valueOrDash(latestInspection.food_stores)} />
            <Field label="Queen" value={valueOrDash(latestInspection.queen_status)} />
          </div>
        </div>
      )}

      <PrintFooter generatedAt={generatedAt} />
    </section>
  );
}

function SummaryBox({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print-summary-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold text-green-800">
        {value}
      </p>
      {note && <p className="mt-1 text-sm text-gray-500">{note}</p>}
    </div>
  );
}

function ContentItem({ label, value, tone = "green" }) {
  const tones = {
    green: "bg-green-50 text-green-900 border-green-100",
    orange: "bg-orange-50 text-orange-900 border-orange-100",
    red: "bg-red-50 text-red-900 border-red-100",
  };

  return (
    <div className={`rounded-xl border p-3 ${tones[tone] || tones.green}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}