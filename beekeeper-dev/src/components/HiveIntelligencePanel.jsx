// src/components/HiveIntelligencePanel.jsx

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { buildApiaryIntelligence, INSIGHT_LEVELS } from "../utils/hiveIntelligence";

const levelStyles = {
  [INSIGHT_LEVELS.GOOD]: "border-green-200 bg-green-50 text-green-900",
  [INSIGHT_LEVELS.INFO]: "border-blue-200 bg-blue-50 text-blue-900",
  [INSIGHT_LEVELS.WATCH]: "border-amber-200 bg-amber-50 text-amber-900",
  [INSIGHT_LEVELS.WARNING]: "border-orange-200 bg-orange-50 text-orange-900",
  [INSIGHT_LEVELS.CRITICAL]: "border-red-200 bg-red-50 text-red-900",
};

const levelDot = {
  [INSIGHT_LEVELS.GOOD]: "🟢",
  [INSIGHT_LEVELS.INFO]: "🔵",
  [INSIGHT_LEVELS.WATCH]: "🟡",
  [INSIGHT_LEVELS.WARNING]: "🟠",
  [INSIGHT_LEVELS.CRITICAL]: "🔴",
};

export default function HiveIntelligencePanel({ hives = [], inspections = [], todos = [] }) {
  const intelligence = useMemo(
    () => buildApiaryIntelligence({ hives, inspections, todos }),
    [hives, inspections, todos]
  );

  const topAttention = intelligence.attentionItems.slice(0, 5);
  const topHives = intelligence.hiveReports
    .filter((report) => report.latestInspection)
    .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0))
    .slice(0, 4);

  return (
    <section className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-yellow-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
            Hive Intelligence
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            Things that need your attention
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-700">
            Automatic, evidence-based prompts from your latest hive inspections, tasks and colony records.
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Overall apiary health
          </p>
          <p className="mt-1 text-4xl font-bold text-gray-900">
            {intelligence.averageHealth || "—"}
          </p>
          <p className="text-sm font-semibold text-green-800">
            {intelligence.healthBand.label}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Hives" value={intelligence.counts.hives} />
        <MiniStat label="Healthy" value={intelligence.counts.healthy} />
        <MiniStat label="Monitor" value={intelligence.counts.monitor} />
        <MiniStat label="Needs attention" value={intelligence.counts.needsAttention} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-gray-900">Priority prompts</h3>
            <Link to="/reports" className="text-sm font-semibold text-green-800 hover:underline">
              Open reports
            </Link>
          </div>

          {topAttention.length === 0 ? (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">
              🟢 No urgent attention items found from the current data.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {topAttention.map((item, index) => (
                <article
                  key={`${item.hiveId}-${item.title}-${index}`}
                  className={`rounded-2xl border p-4 ${levelStyles[item.level] || levelStyles[INSIGHT_LEVELS.INFO]}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{levelDot[item.level] || "🔵"}</span>
                    <div>
                      <p className="font-bold">
                        {item.hiveName} — {item.title}
                      </p>
                      <p className="mt-1 text-sm">{item.summary}</p>
                      {item.action && (
                        <p className="mt-2 text-sm">
                          <strong>Suggested action:</strong> {item.action}
                        </p>
                      )}
                      {item.confidence && (
                        <p className="mt-2 text-xs uppercase tracking-wide opacity-75">
                          Confidence: {item.confidence}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-bold text-gray-900">Hive health snapshot</h3>

          {topHives.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No inspected hives available yet. Add an inspection to activate Hive Intelligence.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {topHives.map((report) => (
                <div key={report.hive.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{report.hive.name || "Unnamed hive"}</p>
                      <p className="text-sm text-gray-600">
                        {report.daysSinceInspection === null
                          ? "No recent inspection date"
                          : `Last inspected ${report.daysSinceInspection} day${report.daysSinceInspection === 1 ? "" : "s"} ago`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{report.healthScore || "—"}</p>
                      <p className="text-xs font-semibold text-gray-600">{report.healthBand.label}</p>
                    </div>
                  </div>

                  {report.changes?.length > 0 && (
                    <p className="mt-3 text-sm text-gray-700">
                      <strong>Changed:</strong> {report.changes[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  );
}
