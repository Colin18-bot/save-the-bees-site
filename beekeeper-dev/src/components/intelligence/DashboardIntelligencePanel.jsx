// src/components/intelligence/DashboardIntelligencePanel.jsx

import { Link } from "react-router-dom";

const riskStyles = {
  Critical: "border-red-200 bg-red-50 text-red-900",
  High: "border-red-200 bg-red-50 text-red-900",
  Important: "border-orange-200 bg-orange-50 text-orange-900",
  Medium: "border-orange-200 bg-orange-50 text-orange-900",
  Monitor: "border-amber-200 bg-amber-50 text-amber-900",
  Low: "border-green-200 bg-green-50 text-green-900",
  "Very Low": "border-green-200 bg-green-50 text-green-900",
  None: "border-green-200 bg-green-50 text-green-900",
  Unknown: "border-gray-200 bg-gray-50 text-gray-800",
};

function buildHiveHealthHref(item = {}) {
  const hiveId = item?.hive?.id;
  return hiveId ? `/hives/${hiveId}` : "/hives";
}

function buildInspectionHref(item = {}, mode = "review") {
  const hiveId = item?.hive?.id;
  const apiaryId = item?.hive?.apiary_id || item?.latestInspection?.apiary_id;
  const params = new URLSearchParams();

  if (hiveId) params.set("hive_id", hiveId);
  if (apiaryId) params.set("apiary_id", apiaryId);
  if (item?.latestInspection?.id) {
    params.set("highlight", item.latestInspection.id);
    params.set("type", "INSPECTION");
  }

  const qs = params.toString();

  if (mode === "new") {
    return qs ? `/inspections/new?${qs}` : "/inspections/new";
  }

  return qs ? `/inspections?${qs}` : "/inspections";
}

function RiskBadge({ level }) {
  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-semibold ${riskStyles[level] || riskStyles.Unknown}`}
    >
      {level || "Unknown"}
    </span>
  );
}

export default function DashboardIntelligencePanel({ data, apiaryNameById = {} }) {
  if (!data) return null;

  if (data.loading) {
    return (
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Hive Health Overview</h2>
        <p className="mt-2 text-sm text-gray-500">Loading hive health overview…</p>
      </section>
    );
  }

  if (data.error) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
        <h2 className="text-lg font-semibold">Hive Health Overview</h2>
        <p className="mt-2 text-sm">{data.error}</p>
      </section>
    );
  }

  const items = data.items || [];
  const summary = data.summary || {};

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
            Hive Health Overview
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Colonies requiring attention</h2>
          <p className="mt-1 text-sm text-gray-600">
            Colonies are ranked using their latest health score, current risk level and recent
            inspection activity.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg border bg-gray-50 p-2">
            <p className="text-lg font-bold">{summary.total || 0}</p>
            <p>Hives</p>
          </div>
          <div className="rounded-lg border bg-green-50 p-2 text-green-900">
            <p className="text-lg font-bold">{summary.healthy || 0}</p>
            <p>Healthy</p>
          </div>
          <div className="rounded-lg border bg-amber-50 p-2 text-amber-900">
            <p className="text-lg font-bold">{summary.monitor || 0}</p>
            <p>Monitor</p>
          </div>
          <div className="rounded-lg border bg-red-50 p-2 text-red-900">
            <p className="text-lg font-bold">{summary.attention || 0}</p>
            <p>Attention</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
          No hive health overview is available yet. Add inspection records to activate this panel.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {items.map((item) => {
            const hive = item.hive || {};
            const intelligence = item.intelligence || {};
            const firstPriority = intelligence.priorityItems?.[0];
            const apiaryName = apiaryNameById[hive.apiary_id] || "Apiary not set";

            return (
              <article key={hive.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{hive.name || "Unnamed hive"}</h3>
                    <p className="text-xs text-gray-500">{apiaryName}</p>
                  </div>
                  <RiskBadge level={item.riskLevel} />
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="rounded-lg bg-green-50 px-2 py-1 font-semibold text-green-900">
                    Latest score {item.healthScore || 0}/100
                  </span>
                  <span className="text-gray-500">
                    {item.historyCount || 0} inspection{item.historyCount === 1 ? "" : "s"} on
                    record
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-700">
                  {firstPriority?.message ||
                    intelligence?.overall?.status ||
                    "No immediate priority identified."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={buildHiveHealthHref(item)}
                    className="rounded bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                    aria-label={`Open hive health for ${hive.name || hive.id}`}
                  >
                    Open Hive Health →
                  </Link>
                  <Link
                    to={buildInspectionHref(item, "review")}
                    className="rounded border border-blue-700 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100"
                    aria-label={`Review inspections for ${hive.name || hive.id}`}
                  >
                    Review inspections →
                  </Link>
                  <Link
                    to={buildInspectionHref(item, "new")}
                    className="rounded border border-green-700 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-900 hover:bg-green-100"
                    aria-label={`Create new inspection for ${hive.name || hive.id}`}
                  >
                    New inspection →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
