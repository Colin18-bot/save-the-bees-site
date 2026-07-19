// src/components/intelligence/OverallAssessmentPanel.jsx

import SectionCard from "./SectionCard";

function getRiskIcon(level) {
  if (level === "Critical" || level === "High") return "🔴";
  if (level === "Important" || level === "Medium") return "🟠";
  if (level === "Monitor" || level === "Low") return "🟡";
  if (level === "Very Low" || level === "None") return "🟢";
  return "ℹ️";
}

export default function OverallAssessmentPanel({ assessment }) {
  const overall = assessment?.overall || {};
  const priorityItems = assessment?.priorityItems || [];
  const actions = assessment?.recommendedActions || [];

  return (
    <SectionCard
      title="Overall Hive Assessment"
      className="border-green-200 bg-green-50"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Health Score
          </p>
          <p className="mt-1 text-3xl font-bold">
            {overall.healthScore ?? "—"}/100
          </p>
          <p className="font-semibold">{overall.healthBand || "Unknown"}</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Overall Risk
          </p>
          <p className="mt-1 text-2xl font-bold">
            {getRiskIcon(overall.riskLevel)} {overall.riskLevel || "Unknown"}
          </p>
          <p className="text-sm text-gray-700">
            Source: {overall.riskSource || "Not available"}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Confidence
          </p>
          <p className="mt-1 text-2xl font-bold">
            {overall.confidence || "Unknown"}
          </p>
          <p className="text-sm text-gray-700">
            Based on available inspection history.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-white p-4">
        <p className="font-semibold">Coordinator summary</p>
        <p className="mt-1 text-gray-800">{overall.status}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Top priorities</h3>

          {priorityItems.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No priority items identified.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {priorityItems.map((item, index) => (
                <li key={`${item.source}-${index}`} className="rounded border p-2">
                  <p className="font-semibold">
                    {getRiskIcon(item.level)} {item.source} — {item.level}
                  </p>
                  <p className="text-sm text-gray-700">{item.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Recommended next actions</h3>

          {actions.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No specific actions generated.
            </p>
          ) : (
            <ul className="mt-2 list-disc pl-6">
              {actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
