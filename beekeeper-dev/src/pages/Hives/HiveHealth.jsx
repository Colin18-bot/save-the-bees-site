// src/pages/Hives/HiveHealth.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { coordinateHiveIntelligence } from "../../intelligence";

function buildInspectionHref(hiveId, apiaryId, mode = "review") {
  const params = new URLSearchParams();
  if (hiveId) params.set("hive_id", hiveId);
  if (apiaryId) params.set("apiary_id", apiaryId);
  const qs = params.toString();

  if (mode === "new") {
    return qs ? `/inspections/new?${qs}` : "/inspections/new";
  }

  return qs ? `/inspections?${qs}` : "/inspections";
}

function riskClass(level) {
  if (["Critical", "High"].includes(level)) return "border-red-200 bg-red-50 text-red-900";
  if (["Important", "Medium"].includes(level))
    return "border-orange-200 bg-orange-50 text-orange-900";
  if (["Monitor", "Low"].includes(level)) return "border-amber-200 bg-amber-50 text-amber-900";
  if (["Very Low", "None"].includes(level)) return "border-green-200 bg-green-50 text-green-900";
  return "border-gray-200 bg-gray-50 text-gray-800";
}

function formatUkDate(value) {
  if (!value) return "None";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function daysSince(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
}

function inspectionAgeLabel(value) {
  const days = daysSince(value);
  if (days === null) return "No inspection yet";
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function ageClass(value) {
  const days = daysSince(value);
  if (days === null) return "text-gray-600";
  if (days > 28) return "text-red-700";
  if (days >= 14) return "text-orange-700";
  return "text-green-700";
}

function scoreChangeFromHistory(history = []) {
  if (history.length < 2) return null;
  const latest = coordinateHiveIntelligence({ history, inspection: history[history.length - 1] });
  const previousHistory = history.slice(0, -1);
  const previous = coordinateHiveIntelligence({
    history: previousHistory,
    inspection: previousHistory[previousHistory.length - 1],
  });
  const latestScore = latest?.overall?.healthScore;
  const previousScore = previous?.overall?.healthScore;
  if (typeof latestScore !== "number" || typeof previousScore !== "number") return null;
  return latestScore - previousScore;
}

function ScoreBreakdownPanel({ breakdown, assessment }) {
  const items = breakdown?.items || [];
  const positives = items.filter((item) => item.type === "positive");
  const concerns = items.filter((item) => item.type === "negative");
  const neutral = items.filter((item) => item.type === "neutral");

  const formatPoints = (points) => {
    if (points > 0) return `+${points}`;
    return String(points);
  };

  const FindingRow = ({ item }) => {
    const isPositive = item.type === "positive";
    const isNegative = item.type === "negative";

    return (
      <div
        className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
          isPositive
            ? "border-green-200 bg-green-50 text-green-900"
            : isNegative
              ? "border-orange-200 bg-orange-50 text-orange-900"
              : "border-gray-200 bg-gray-50 text-gray-800"
        }`}
      >
        <div>
          <p className="font-semibold">
            {isPositive ? "✅ " : isNegative ? "⚠️ " : "ℹ️ "}
            {item.title}
          </p>
          {item.summary && <p className="mt-1 text-sm opacity-90">{item.summary}</p>}
        </div>

        <span className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-sm font-bold">
          {formatPoints(item.points)}
        </span>
      </div>
    );
  };

  if (!items.length) {
    return (
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
          Explainable Intelligence
        </p>
        <h2 className="mt-1 text-xl font-bold text-gray-900">Health Score Breakdown</h2>
        <p className="mt-3 rounded-xl border bg-gray-50 p-3 text-sm text-gray-600">
          Add more inspection evidence to explain how the health score was calculated.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
        Explainable Intelligence
      </p>

      <h2 className="mt-1 text-xl font-bold text-gray-900">Health Score Breakdown</h2>

      <p className="mt-1 text-sm text-gray-600">
        HiveTag starts from a base score of {breakdown.baseScore}/100, then adjusts it using the
        latest inspection findings.
      </p>

      {positives.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-gray-900">Positive findings</h3>
          <div className="mt-2 space-y-2">
            {positives.map((item, index) => (
              <FindingRow key={`positive-${item.title}-${index}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {concerns.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-gray-900">Score reductions</h3>
          <div className="mt-2 space-y-2">
            {concerns.map((item, index) => (
              <FindingRow key={`concern-${item.title}-${index}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {neutral.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-gray-900">Information only</h3>
          <div className="mt-2 space-y-2">
            {neutral.map((item, index) => (
              <FindingRow key={`neutral-${item.title}-${index}`} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">Overall assessment</p>
        <p className="mt-1">
          {assessment?.overall?.status || "No overall assessment is available yet."}
        </p>
      </div>
    </section>
  );
}

function TimelineItem({ event }) {
  return (
    <li className="relative pb-5 pl-8">
      <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-sm">
        {event.icon}
      </span>
      <span className="absolute left-3 top-7 h-full border-l border-green-100" />
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {formatUkDate(event.date) || "Date not recorded"}
        </p>
        <h3 className="mt-1 font-bold text-gray-900">{event.title}</h3>
        <p className="mt-1 text-sm text-gray-700">{event.summary}</p>
      </div>
    </li>
  );
}

function buildTimelineEvents(history = [], assessment = {}) {
  const events = [];

  history.forEach((inspection) => {
    const perInspection = coordinateHiveIntelligence({
      history: history.filter((item) => new Date(item.date) <= new Date(inspection.date)),
      inspection,
    });

    events.push({
      id: `${inspection.id}-inspection`,
      date: inspection.date,
      icon: "📋",
      title: "Inspection recorded",
      summary: perInspection?.overall?.status || "Inspection completed.",
    });

    perInspection.priorityItems?.slice(0, 2).forEach((priority, index) => {
      events.push({
        id: `${inspection.id}-priority-${index}`,
        date: inspection.date,
        icon: ["Critical", "High"].includes(priority.level) ? "🔴" : "🟠",
        title: priority.source || "Hive intelligence",
        summary: priority.message,
      });
    });

    if (perInspection.baseAnalysis?.summary?.positiveFindings?.length) {
      const positive = perInspection.baseAnalysis.summary.positiveFindings[0];
      events.push({
        id: `${inspection.id}-positive`,
        date: inspection.date,
        icon: "🟢",
        title: positive.title || "Positive finding",
        summary: positive.summary || "Positive inspection evidence recorded.",
      });
    }
  });

  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);
}

export default function HiveHealth() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hive, setHive] = useState(null);
  const [apiary, setApiary] = useState(null);
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHiveHealth() {
      setLoading(true);
      setError("");

      try {
        const { data: hiveData, error: hiveError } = await supabase
          .from("hives")
          .select("id, name, apiary_id, hive_type, date_established, status, notes, archived_at")
          .eq("id", id)
          .single();

        if (hiveError) throw hiveError;

        let apiaryData = null;
        if (hiveData?.apiary_id) {
          const { data, error: apiaryError } = await supabase
            .from("apiaries")
            .select("id, name")
            .eq("id", hiveData.apiary_id)
            .single();

          if (!apiaryError) apiaryData = data;
        }

        const { data: inspectionData, error: inspectionError } = await supabase
          .from("inspections")
          .select(
            "id, date, apiary_id, hive_id, queen_status, queen_cells, brood_pattern, food_stores, hive_population, varroa_seen, disease_types, signs_disease, notes, archived_at"
          )
          .eq("hive_id", id)
          .is("archived_at", null)
          .order("date", { ascending: true });

        if (inspectionError) throw inspectionError;

        if (!cancelled) {
          setHive(hiveData);
          setApiary(apiaryData);
          setInspections(inspectionData || []);
        }
      } catch (err) {
        console.error("Failed to load hive health:", err);
        if (!cancelled) setError("Hive health could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHiveHealth();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const assessment = useMemo(
    () => coordinateHiveIntelligence({ history: inspections }),
    [inspections]
  );

  const timelineEvents = useMemo(
    () => buildTimelineEvents(inspections, assessment),
    [inspections, assessment]
  );

  const latestInspection = inspections[inspections.length - 1] || null;
  const healthTrend = scoreChangeFromHistory(inspections);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading hive health…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">{error}</div>
      </div>
    );
  }

  if (!hive) {
    return <div className="p-6 text-gray-600">Hive not found.</div>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
        <Link to="/dashboard" className="font-semibold text-green-800 hover:underline">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to="/hives" className="font-semibold text-green-800 hover:underline">
          Hives
        </Link>
        <span className="mx-2">/</span>
        <span>{hive.name || "Unnamed hive"}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
            Hive Health
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{hive.name || "Unnamed hive"}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {apiary?.name || "Apiary not set"} · {inspections.length} inspection
            {inspections.length === 1 ? "" : "s"} recorded
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={buildInspectionHref(hive.id, hive.apiary_id, "review")}
            className="inline-flex items-center rounded-lg border border-blue-700 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-100"
          >
            Review inspections →
          </Link>
          <Link
            to={buildInspectionHref(hive.id, hive.apiary_id, "new")}
            className="inline-flex items-center rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
          >
            New inspection →
          </Link>
          <Link
            to={`/hives/${hive.id}/edit`}
            className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Edit hive
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
        <p className="font-semibold text-amber-900">Educational Notice</p>

        <p className="mt-1">
          Hive Health provides educational decision-support based on the inspection information you
          record. It does not diagnose disease, confirm colony health or replace a physical hive
          inspection, beekeeper judgement, laboratory testing, official reporting requirements or
          advice from a bee inspector or other qualified professional.
        </p>

        <p className="mt-2">
          You remain responsible for all hive-management, feeding, treatment, biosecurity and
          disease-reporting decisions made using information provided by HiveTag.
        </p>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Latest Health Score
            </p>
            <p className="mt-1 text-4xl font-bold text-gray-900">
              {assessment.overall?.healthScore ?? "—"}/100
            </p>
            <p className="font-semibold text-green-900">
              {assessment.overall?.healthBand || "Unknown"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Calculated from the most recent inspection.
            </p>
            {healthTrend !== null && (
              <p
                className={`mt-2 text-sm font-semibold ${healthTrend >= 0 ? "text-green-800" : "text-red-800"}`}
              >
                {healthTrend > 0
                  ? `▲ Improved by ${healthTrend} point${healthTrend === 1 ? "" : "s"} since the previous inspection`
                  : healthTrend < 0
                    ? `▼ Reduced by ${Math.abs(healthTrend)} point${Math.abs(healthTrend) === 1 ? "" : "s"} since the previous inspection`
                    : "No change since the previous inspection"}
              </p>
            )}
          </div>

          <div className={`rounded-xl border p-4 ${riskClass(assessment.overall?.riskLevel)}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">Overall Risk</p>
            <p className="mt-1 text-3xl font-bold">{assessment.overall?.riskLevel || "Unknown"}</p>
            <p className="text-sm">Source: {assessment.overall?.riskSource || "Unknown"}</p>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Latest Inspection
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatUkDate(latestInspection?.date)}
            </p>
            <p className={`text-sm font-semibold ${ageClass(latestInspection?.date)}`}>
              {latestInspection
                ? inspectionAgeLabel(latestInspection.date)
                : "Add an inspection to activate hive intelligence."}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">How this assessment works</p>

          <p className="mt-2">
            Your <strong>Latest Health Score</strong> is calculated from the information recorded
            during your most recent inspection.
          </p>

          <p className="mt-2">
            Previous inspections are <strong>not averaged into this score.</strong> They are used to
            compare changes over time, identify longer-term trends, increase confidence in the
            assessment and build your Hive Health Timeline.
          </p>
          <p className="mt-2">
            <strong>
              You can see exactly how the latest score was calculated in the Explainable
              Intelligence section below.
            </strong>
          </p>
        </div>

        <p className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
          {assessment.overall?.status || "No assessment available yet."}
        </p>
      </section>

      <ScoreBreakdownPanel
        breakdown={assessment.baseAnalysis?.summary?.scoreBreakdown}
        assessment={assessment}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Priority items</h2>
          {assessment.priorityItems?.length ? (
            <div className="mt-3 space-y-3">
              {assessment.priorityItems.map((item, index) => (
                <div
                  key={`${item.source}-${index}`}
                  className={`rounded-xl border p-3 ${riskClass(item.level)}`}
                >
                  <p className="font-semibold">
                    {item.source} · {item.level}
                  </p>
                  <p className="mt-1 text-sm">{item.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border bg-green-50 p-3 text-sm text-green-900">
              No significant colony health concerns have been identified from recent inspection
              history.
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Recommended actions</h2>
          {assessment.recommendedActions?.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-gray-700">
              {assessment.recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border bg-gray-50 p-3 text-sm text-gray-600">
              Add more inspection evidence to generate recommendations.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
              Hive Health Timeline
            </p>
            <h2 className="text-xl font-bold text-gray-900">Colony Health History</h2>
            <p className="mt-1 text-sm text-gray-600">
              Shows how this colony has changed over time using previous inspection records.
            </p>
          </div>
          <Link
            to={buildInspectionHref(hive.id, hive.apiary_id, "review")}
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Full inspection history →
          </Link>
        </div>

        {timelineEvents.length ? (
          <ol className="mt-5">
            {timelineEvents.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
            No timeline events yet. Add inspections to build this hive's story.
          </p>
        )}
      </section>
    </main>
  );
}
