// src/pages/Todos/NewTodo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabase";

function NewTodo() {
  const navigate = useNavigate();
const location = useLocation();

  // Preset metadata: emoji + suggested offset in days
  const TASK_META = {
    "Feed Bees": { emoji: "🍯", days: 3 },
    "Varroa Assessment": { emoji: "🧪", days: 14 },
    "Weekly Inspection": { emoji: "🔍", days: 7 },
    "Requeen": { emoji: "👑", days: 7 },
    "Treatment": { emoji: "💊", days: 1 },
    "Harvest Honey": { emoji: "🍯🐝", days: 1 },
    "Buy Equipment": { emoji: "🛒", days: 0 },
    "Winter Preparation": { emoji: "❄️", days: 30 },
    "Other": { emoji: "📝", days: null },
  };
  const PRESET_TASKS = Object.keys(TASK_META);
  const queryParams = new URLSearchParams(location.search);
  const seasonalTitle = queryParams.get("title") || "";
  const seasonalCategory = queryParams.get("category") || "";
  const seasonalPriority = queryParams.get("priority") || "";
  const seasonalMonth = queryParams.get("month") || "";
  const isSeasonalTask = queryParams.get("source") === "seasonal-guide";

  const [selectedTask, setSelectedTask] = useState("");
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // track if user manually edited the due date (so we don't overwrite with autosuggest later)
  const [userEditedDueDate, setUserEditedDueDate] = useState(false);

  const todayISO = () => new Date().toISOString().split("T")[0];
  const addDaysISO = (iso, days) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString().split("T")[0];
  };
  const toUK = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const [form, setForm] = useState({
    due_date: todayISO(),
    apiary_id: "",
    hive_id: "",
    hive_name: "",
    all_hives: false,
    notes: "",
    other_title: "",
  });

  // --- Lookups ---
  useEffect(() => {
    (async () => {
      const [{ data: aData }, { data: hData }] = await Promise.all([
        supabase.from("apiaries").select("id, name").order("name"),
        supabase.from("hives").select("id, name, apiary_id").order("name"),
      ]);
      setApiaries(aData || []);
      setHives(hData || []);
    })();
  }, []);

  useEffect(() => {
  if (!isSeasonalTask || !seasonalTitle) return;

  setSelectedTask("Other");
  setForm((p) => ({
    ...p,
    other_title: seasonalTitle,
    notes: seasonalMonth ? `Created from Seasonal Guide: ${seasonalMonth}` : "Created from Seasonal Guide",
  }));
}, [isSeasonalTask, seasonalTitle, seasonalMonth]);

  const hivesForApiary = useMemo(() => {
    if (!form.apiary_id) return [];
    // be robust to string/uuid comparisons
    return hives.filter((h) => String(h.apiary_id) === String(form.apiary_id));
  }, [hives, form.apiary_id]);

  const noHives = form.apiary_id && hivesForApiary.length === 0;

  // --- Handlers ---
  const selectTask = (label) => {
    setSelectedTask(label);
    setError("");
    setSuccess("");

    // Auto-suggest due date if we have a rule and user hasn't touched due date
    const rule = TASK_META[label];
    if (rule?.days != null && !userEditedDueDate) {
      setForm((p) => ({ ...p, due_date: addDaysISO(todayISO(), rule.days) }));
    }
  };

  const resetForm = () => {
    setSelectedTask("");
    setForm({
      due_date: todayISO(),
      apiary_id: "",
      hive_id: "",
      hive_name: "",
      all_hives: false,
      notes: "",
      other_title: "",
    });
    setUserEditedDueDate(false);
    setError("");
    setSuccess("");
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    if (id === "apiary_id") {
      setForm((p) => ({
        ...p,
        apiary_id: value,
        hive_id: "",
        hive_name: "",
        all_hives: false,
      }));
      setError("");
    } else if (id === "hive_id") {
      if (value === "ALL_SPECIAL") {
        setForm((p) => ({ ...p, hive_id: "", hive_name: "ALL", all_hives: true }));
      } else {
        const hiveName = value ? (hives.find((h) => String(h.id) === String(value))?.name || "") : "";
        setForm((p) => ({ ...p, hive_id: value, hive_name: hiveName, all_hives: false }));
      }
    } else if (id === "due_date") {
      setUserEditedDueDate(true);
      setForm((p) => ({ ...p, due_date: value }));
    } else {
      setForm((p) => ({ ...p, [id]: value }));
    }
  };

  const saveTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      setSaving(false);
      setError("You must be logged in.");
      navigate("/login?redirect=/todos/new");
      return;
    }

    if (noHives) {
      setSaving(false);
      setError("This apiary has no hives yet. Add a hive before creating a hive-specific task.");
      return;
    }

    if (!form.all_hives && !form.hive_id) {
      setSaving(false);
      setError("Please select a hive or choose All Hives.");
      return;
    }

    const title = selectedTask === "Other" ? form.other_title || "Other" : selectedTask;

    const payload = {
      title,
      due_date: form.due_date || null,
      apiary_id: form.apiary_id || null,
      hive_id: form.all_hives ? null : form.hive_id,
      hive_name: form.all_hives ? "ALL" : form.hive_name || null,
      notes: form.notes || null,
      category: isSeasonalTask ? seasonalCategory || "Seasonal guide" : null,
      priority: isSeasonalTask ? seasonalPriority || "Medium" : null,
      source: isSeasonalTask ? "seasonal-guide" : null,
      seasonal_month: isSeasonalTask ? seasonalMonth || null : null,
    };

    // Insert and get id so we can highlight on the list
    const { data: inserted, error: insertErr } = await supabase
      .from("todos")
      .insert(payload)
      .select("id, apiary_id")
      .single();

    setSaving(false);

    if (insertErr) {
      setError(insertErr.message || "Failed to save task.");
      return;
    }

    // Redirect to list with highlight + preserve apiary filter if known
    const qs = new URLSearchParams();
    qs.set("highlight", inserted.id);
    qs.set("type", "TODO");
    if (inserted.apiary_id) qs.set("apiary_id", inserted.apiary_id);
    navigate(`/todos?${qs.toString()}`);
  };

  // --- UI ---
  const canSave =
    !saving &&
    !!selectedTask &&
    !!form.due_date &&
    !!form.apiary_id &&
    !noHives &&
    (form.all_hives || !!form.hive_id);

  const greenBtn =
    "bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  // Compute a suggested date string for the helper tip
  const suggestedDays = TASK_META[selectedTask]?.days;
  const suggestedISO =
    suggestedDays != null ? addDaysISO(todayISO(), suggestedDays) : null;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-center text-black">New Task</h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Create a reminder for your <strong>next visit</strong> to the apiary — e.g. feed colonies, treat for varroa,
        requeen, or prep for winter. Pick a hive (or <em>All Hives</em>), set a due date, and it’ll appear in your Tasks
        list and reports.
      </p>

      {/* Queen marking colours helper (above "Choose a Task") */}
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 text-center">
        <div className="font-semibold mb-1">Queen marking colours by year</div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-gray-200">
            <span className="inline-block w-3 h-3 rounded-full border border-gray-400 bg-white" />
            White: years ending 1 or 6
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 border border-yellow-200">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
            Yellow: years ending 2 or 7
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 border border-red-200">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            Red: years ending 3 or 8
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 border border-green-200">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            Green: years ending 4 or 9
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
            Blue: years ending 5 or 0
          </span>
        </div>
      </div>

      {/* Section heading to make the page clearer */}
      <h2 className="text-lg font-semibold text-center text-gray-800 mb-2">Choose a Task</h2>

      {/* Preset task buttons with emoji */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {PRESET_TASKS.map((t) => {
          const meta = TASK_META[t] || {};
          const selected = selectedTask === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => selectTask(t)}
              className={greenBtn + (selected ? " ring-2 ring-green-500" : "")}
              title={
                meta?.days != null
                  ? `Auto due: ${meta.days} day${meta.days === 1 ? "" : "s"} from today`
                  : undefined
              }
            >
              <span className="mr-1">{meta.emoji}</span>
              {t}
            </button>
          );
        })}
      </div>

      {selectedTask && (
        <form id="task-form" onSubmit={saveTask} className="space-y-5">
          {/* Selected task heading (with emoji) */}
          <div className="text-center text-lg font-semibold text-gray-700">
            Selected Task:{" "}
            <span className="text-black">
              {(TASK_META[selectedTask]?.emoji ? TASK_META[selectedTask].emoji + " " : "")}
              {selectedTask}
            </span>
          </div>

          {/* Schedule & Location */}
          <h3 className="text-md font-semibold text-gray-800">Schedule &amp; Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium mb-1">
                Due Date
              </label>
              <input
                id="due_date"
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                value={form.due_date}
                onChange={onChange}
                required
              />
              {/* Show helper until the user edits the date */}
              {suggestedISO && !userEditedDueDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Suggested: {suggestedDays} day{suggestedDays === 1 ? "" : "s"} from today — {toUK(suggestedISO)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="apiary_id" className="block text-sm font-medium mb-1">
                Apiary
              </label>
              <select
                id="apiary_id"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                value={form.apiary_id}
                onChange={onChange}
                required
              >
                <option value="">Select</option>
                {apiaries.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hive selector */}
            <div>
              <label className="block text-sm font-medium mb-1">Hive</label>
              {noHives ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                  This apiary has no hives yet.{" "}
                  <Link to="/hives/new" className="underline">
                    Add a hive
                  </Link>{" "}
                  before creating this task.
                </div>
              ) : (
                <select
                  id="hive_id"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                  value={form.all_hives ? "ALL_SPECIAL" : form.hive_id}
                  onChange={onChange}
                  required
                >
                  <option value="">Select a hive…</option>
                  {hivesForApiary.length > 0 && <option value="ALL_SPECIAL">All Hives</option>}
                  {hivesForApiary.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Info banner when "All Hives" is selected */}
          {form.all_hives && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              This task will be shown for <strong>all hives</strong> in the selected apiary.
            </div>
          )}
          {selectedTask === "Other" && (
  <div>
    <label htmlFor="other_title" className="block text-sm font-medium mb-1">
      Task Title
    </label>
    <input
      id="other_title"
      type="text"
      className="w-full border rounded-lg px-3 py-2 focus:outline-none"
      placeholder="Enter task title..."
      value={form.other_title}
      onChange={onChange}
      required
    />
  </div>
)}
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Add any additional notes..."
              value={form.notes}
              onChange={onChange}
            />
          </div>

          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              {success}
            </div>
          )}

          <div className="flex justify-center gap-3">
            {/* STANDARD GREEN PRIMARY */}
            <button type="submit" disabled={!canSave || saving} className={greenBtn}>
              {saving ? "Saving…" : "Save Task"}
            </button>

            {/* Neutral cancel (resets the form) */}
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NewTodo;
