import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { buildInspectionInsights, buildKitSuggestions } from "./inspectionInsights";
import { supabase } from "../../services/supabase";
import {
  formatDerivedWeather,
  getTempUnit,
} from "../../utils/formatDerivedWeather";

const safeParseDerivedWeather = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s.startsWith("{")) return null;

  try {
    const obj = JSON.parse(s);
    const desc = typeof obj.desc === "string" ? obj.desc : "";
    const temp_c = Number.isFinite(Number(obj.temp_c)) ? Number(obj.temp_c) : null;
    if (!desc && temp_c === null) return null;
    return { desc, temp_c };
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-GB");
};

const insightClass = (level) => {
  if (level === "high") return "bg-red-50 border-red-200 text-red-800";
  if (level === "medium") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-green-50 border-green-200 text-green-800";
};

const DetailRow = ({ label, value }) => {
  if (value == null || value === "" || value === false) return null;

  const display = Array.isArray(value) ? value.join(", ") : value;

  if (!display) return null;

  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900 text-right">{display}</span>
    </div>
  );
};

const buildInsightActions = (insight, inspection, returnTo) => {
  const base = `inspection_id=${encodeURIComponent(inspection.id)}&hive_id=${encodeURIComponent(
    inspection.hive_id
  )}&apiary_id=${encodeURIComponent(inspection.apiary_id)}&return_to=${encodeURIComponent(
    returnTo
  )}`;

  if (insight.title === "Low stores") {
    return [
      {
        label: "Add feeding log",
        to: `/logbook/new?${base}&preset=feeding`,
      },
      {
        label: "Create feeding task",
        to: `/todos/new?${base}&title=${encodeURIComponent("Check food stores / feeding")}`,
      },
    ];
  }

  if (insight.title === "Varroa seen") {
    return [
      {
        label: "Add treatment log",
        to: `/logbook/new?${base}&preset=treatment`,
      },
      {
        label: "Create monitoring task",
        to: `/todos/new?${base}&title=${encodeURIComponent("Monitor varroa levels")}`,
      },
    ];
  }

  if (insight.title === "High swarm risk" || insight.title === "Possible swarm preparation") {
    return [
      {
        label: "Create swarm task",
        to: `/todos/new?${base}&title=${encodeURIComponent("Check for swarm control action")}`,
      },
      {
        label: "Add swarm note",
        to: `/logbook/new?${base}&preset=swarm`,
      },
    ];
  }

  if (insight.title === "Possible queen issue") {
    return [
      {
        label: "Create queen check task",
        to: `/todos/new?${base}&title=${encodeURIComponent("Check queen status")}`,
      },
      {
        label: "Add queen note",
        to: `/logbook/new?${base}&preset=queen`,
      },
    ];
  }

  if (insight.title === "Weak colony") {
    return [
      {
        label: "Create review task",
        to: `/todos/new?${base}&title=${encodeURIComponent("Review weak colony")}`,
      },
      {
        label: "Add colony note",
        to: `/logbook/new?${base}&preset=colony`,
      },
    ];
  }

  if (insight.title === "Disease concern") {
    return [
      {
        label: "Add disease note",
        to: `/logbook/new?${base}&preset=disease`,
      },
      {
        label: "Create follow-up task",
        to: `/todos/new?${base}&title=${encodeURIComponent("Review disease signs")}`,
      },
    ];
  }

  return [];
};

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const createdType = searchParams.get("created");
  const returnTo = `${location.pathname}`;

  const [inspection, setInspection] = useState(null);
  const [apiary, setApiary] = useState(null);
  const [hive, setHive] = useState(null);
  const [linkedLogs, setLinkedLogs] = useState([]);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const loadInspection = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("inspections")
        .select(
          "id, apiary_id, hive_id, date, created_at, weather, weather_observed, weather_code, colony_behavior, colony_behavior_other, environmental_signs, environmental_signs_other, hive_population, brood_pattern, food_stores, frames_of_bees, queen_cells, varroa_seen, brood_box_congestion, queen_status, queen_status_other, signs_disease, disease_types, disease_other, signs_pests, pest_types, pest_other, notes, photos"
        )
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setErrorMessage(error?.message || "Inspection not found.");
        setLoading(false);
        return;
      }

      setInspection(data);

      const [
  { data: apiaryData },
  { data: hiveData },
  { data: logData },
  { data: taskData },
] = await Promise.all([
  supabase.from("apiaries").select("id, name").eq("id", data.apiary_id).maybeSingle(),
  supabase.from("hives").select("id, name").eq("id", data.hive_id).maybeSingle(),

  supabase
    .from("logbook")
    .select("id, log_type, date, entry, archived_at")
    .eq("inspection_id", data.id)
    .order("date", { ascending: false }),

  supabase
    .from("todos")
    .select("id, title, due_date, status, archived_at")
    .eq("inspection_id", data.id)
    .order("due_date", { ascending: true }),
    ]);

    setApiary(apiaryData || null);
    setHive(hiveData || null);
    setLinkedLogs(logData || []);
    setLinkedTasks(taskData || []);
    setLoading(false);
    };

    loadInspection();
  }, [id]);

  const insights = useMemo(
    () => (inspection ? buildInspectionInsights(inspection) : []),
    [inspection]
  );

  const kitSuggestions = useMemo(
    () => (inspection ? buildKitSuggestions(inspection) : []),
    [inspection]
  );

  const derivedWeather = safeParseDerivedWeather(inspection?.weather);
  const weatherDisplay = derivedWeather
    ? formatDerivedWeather(derivedWeather, getTempUnit())
    : inspection?.weather || "";

  if (loading) {
    return <div className="p-6">Loading inspection…</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3">
          {errorMessage}
        </div>
        <button
          type="button"
          onClick={() => navigate("/inspections")}
          className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Back to inspections
        </button>
      </div>
    );
  }

      const photos = Array.isArray(inspection.photos) ? inspection.photos : [];

      return (
        <div className="p-4 max-w-4xl mx-auto">
          {createdType === "task" && (
      <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        ✅ Task created from this inspection insight.
      </div>
    )}

    {createdType === "log" && (
      <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        ✅ Logbook entry added from this inspection insight.
      </div>
    )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            {hive?.name || "Inspection Detail"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {apiary?.name || "Unknown Apiary"} • Inspection date: {formatDate(inspection.date)}
          </p>
          {weatherDisplay && (
            <p className="text-sm text-gray-600 mt-1">Weather: {weatherDisplay}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to={`/inspections/${inspection.id}/edit`}
            className="inline-flex justify-center bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
          >
            Edit inspection
          </Link>
          <button
            type="button"
            onClick={() => navigate("/inspections")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>

      {insights.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-semibold mb-3">Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={`${insight.title}-${idx}`}
                className={`border rounded-lg p-3 ${insightClass(insight.level)}`}
              >
                <div className="font-semibold">
                  {insight.level === "high" || insight.level === "medium" ? "⚠️ " : "✔ "}
                  {insight.title}
                </div>

                {insight.reasons?.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Based on:</div>
                    <ul className="list-disc ml-5">
                      {insight.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {buildInsightActions(insight, inspection, returnTo).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {buildInsightActions(insight, inspection, returnTo).map((action) => (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="inline-flex text-xs px-2 py-1 rounded-full border bg-white/80 hover:bg-white font-medium"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              )}

              </div>
            ))}
          </div>
        </section>
      )}

      {(linkedTasks.length > 0 || linkedLogs.length > 0) && (
  <section className="mb-5 border rounded-lg p-4 bg-white">
    <h2 className="text-lg font-semibold mb-3">Linked records</h2>

    {linkedTasks.length > 0 && (
      <div className="mb-4">
        <h3 className="font-semibold mb-2">
          Tasks ({linkedTasks.length})
        </h3>

        <ul className="space-y-2">
          {linkedTasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-gray-600">
                  {task.due_date ? `Due ${formatDate(task.due_date)}` : "No due date"}
                  {task.status ? ` • ${task.status}` : ""}
                  {task.archived_at ? " • Archived" : ""}
                </div>
              </div>

              <Link
                to={`/todos?highlight=${task.id}&type=TODO`}
                className="text-blue-600 hover:underline"
              >
                Edit task
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}

    {linkedLogs.length > 0 && (
      <div>
        <h3 className="font-semibold mb-2">
          Logbook entries ({linkedLogs.length})
        </h3>

        <ul className="space-y-2">
          {linkedLogs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{log.log_type}</div>
                <div className="text-gray-600">
                  {log.date ? formatDate(log.date) : "No date"}
                  {log.archived_at ? " • Archived" : ""}
                </div>
                {log.entry && (
                  <div className="text-gray-700 mt-1">
                    {log.entry.slice(0, 120)}
                    {log.entry.length > 120 ? "…" : ""}
                  </div>
                )}
              </div>

              <Link
                to={`/logbook?highlight=${log.id}&type=LOGBOOK`}
                className="text-blue-600 hover:underline"
              >
                Edit log
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
)}

      {kitSuggestions.length > 0 && (
        <section className="mb-5 border rounded-lg p-4 bg-blue-50 border-blue-200 text-blue-900">
          <h2 className="text-lg font-semibold mb-2">Suggested for next visit</h2>
          <ul className="list-disc ml-5 text-sm">
            {kitSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-5 border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-3">Inspection snapshot</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h3 className="font-semibold mb-2">Queen & brood</h3>
            <DetailRow label="Queen status" value={inspection.queen_status} />
            <DetailRow label="Queen other" value={inspection.queen_status_other} />
            <DetailRow label="Queen cells" value={inspection.queen_cells} />
            <DetailRow label="Brood pattern" value={inspection.brood_pattern} />
            <DetailRow
              label="Brood box congestion"
              value={inspection.brood_box_congestion}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Colony strength</h3>
            <DetailRow label="Population" value={inspection.hive_population} />
            <DetailRow label="Frames of bees" value={inspection.frames_of_bees} />
            <DetailRow label="Food stores" value={inspection.food_stores} />
            <DetailRow
              label="Behaviour"
              value={
                inspection.colony_behavior === "Other"
                  ? inspection.colony_behavior_other || "Other"
                  : inspection.colony_behavior
              }
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Health</h3>
            <DetailRow label="Varroa seen" value={inspection.varroa_seen ? "Yes" : "No"} />
            <DetailRow label="Disease signs" value={inspection.signs_disease ? "Yes" : "No"} />
            <DetailRow label="Disease types" value={inspection.disease_types} />
            <DetailRow label="Disease other" value={inspection.disease_other} />
            <DetailRow label="Pest signs" value={inspection.signs_pests ? "Yes" : "No"} />
            <DetailRow label="Pest types" value={inspection.pest_types} />
            <DetailRow label="Pest other" value={inspection.pest_other} />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Environment</h3>
            <DetailRow label="Weather derived" value={weatherDisplay} />
            <DetailRow label="Weather observed" value={inspection.weather_observed} />
            <DetailRow label="Environmental signs" value={inspection.environmental_signs} />
            <DetailRow
              label="Environmental other"
              value={inspection.environmental_signs_other}
            />
          </div>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="mb-5 border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((url, idx) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt={`Inspection photo ${idx + 1}`}
                  className="w-full h-40 object-cover rounded border hover:opacity-90"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {inspection.notes && (
        <section className="mb-5 border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-sm whitespace-pre-wrap text-gray-800">{inspection.notes}</p>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to={`/inspections/${inspection.id}/edit`}
          className="inline-flex justify-center bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded"
        >
          Edit inspection
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex justify-center bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded"
        >
          Print / Save PDF
        </button>

        <button
          type="button"
          onClick={() => navigate("/inspections")}
          className="inline-flex justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
        >
          Back to inspections
        </button>
      </div>
    </div>
  );
}