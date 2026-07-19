// src/components/intelligence/DashboardHiveTimelinePanel.jsx

import { Link } from "react-router-dom";

function buildHiveHealthHref(item = {}) {
  const hiveId = item?.hive?.id;
  return hiveId ? `/hives/${hiveId}` : "/hives";
}

function buildInspectionHref(item = {}) {
  const params = new URLSearchParams();
  const hiveId = item?.hive?.id;
  const apiaryId = item?.hive?.apiary_id || item?.latestInspection?.apiary_id;

  if (hiveId) params.set("hive_id", hiveId);
  if (apiaryId) params.set("apiary_id", apiaryId);
  if (item?.latestInspection?.id) {
    params.set("highlight", item.latestInspection.id);
    params.set("type", "INSPECTION");
  }

  const qs = params.toString();
  return qs ? `/inspections?${qs}` : "/inspections";
}

function timelineEventsFromItem(item = {}) {
  const events = [];
  const intelligence = item.intelligence || {};
  const latestInspection = item.latestInspection;

  if (latestInspection?.date) {
    events.push({
      id: `${item.hive?.id || "hive"}-latest`,
      date: latestInspection.date,
      icon: "📋",
      title: "Latest inspection",
      summary: intelligence?.overall?.status || "Latest inspection recorded.",
      tone: "info",
    });
  }

  intelligence.priorityItems?.slice(0, 2).forEach((priority, index) => {
    events.push({
      id: `${item.hive?.id || "hive"}-priority-${index}`,
      date: latestInspection?.date || "—",
      icon: priority.level === "High" || priority.level === "Critical" ? "🔴" : "🟠",
      title: priority.source || "Priority",
      summary: priority.message,
      tone: "attention",
    });
  });

  if (intelligence.trends?.trends?.length) {
    const trend =
      intelligence.trends.trends.find((entry) => entry.direction === "declined") ||
      intelligence.trends.trends.find((entry) => entry.direction === "improved") ||
      intelligence.trends.trends[0];

    if (trend) {
      events.push({
        id: `${item.hive?.id || "hive"}-trend`,
        date: latestInspection?.date || "—",
        icon: trend.direction === "improved" ? "🟢" : trend.direction === "declined" ? "🔴" : "⚪",
        title: "Health trend",
        summary: trend.message,
        tone: trend.direction === "declined" ? "attention" : "positive",
      });
    }
  }

  return events.slice(0, 3);
}

export default function DashboardHiveTimelinePanel({ data, apiaryNameById = {} }) {
  if (!data || data.loading || data.error) return null;

  const items = (data.items || []).filter((item) => item.historyCount > 0).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
            Hive Health Timeline
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Recent colony history</h2>
          <p className="mt-1 text-sm text-gray-600">
            A compact timeline based on recent inspections and colony health findings.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {items.map((item) => {
          const hive = item.hive || {};
          const apiaryName = apiaryNameById[hive.apiary_id] || "Apiary not set";
          const events = timelineEventsFromItem(item);

          return (
            <article key={hive.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{hive.name || "Unnamed hive"}</h3>
                  <p className="text-xs text-gray-500">{apiaryName}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={buildHiveHealthHref(item)}
                    className="text-sm font-semibold text-green-700 hover:underline"
                  >
                    Open Hive Health →
                  </Link>
                  <Link
                    to={buildInspectionHref(item)}
                    className="text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Review inspections →
                  </Link>
                </div>
              </div>

              <ol className="mt-4 space-y-3 border-l-2 border-green-100 pl-4">
                {events.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[1.55rem] flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm">
                      {event.icon}
                    </span>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-500">{event.date}</p>
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-700">{event.summary}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
