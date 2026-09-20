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
  const inspectionId = queryParams.get("inspection_id") || "";
  const returnTo = queryParams.get("return_to") || "";
  const prefillApiaryId = queryParams.get("apiary_id") || "";
  const prefillHiveId = queryParams.get("hive_id") || "";
  const prefillTitle = queryParams.get("title") || "";
  const [selectedTask, setSelectedTask] = useState("");
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPremium, setIsPremium] = useState(false);

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
    inspection_id: inspectionId || "",
  });

  // --- Lookups ---
  useEffect(() => {
  (async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsPremium(profile?.subscription_level === "premium");
    }

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
useEffect(() => {
  if (!inspectionId) return;

  setSelectedTask("Other");

  setForm((p) => ({
    ...p,
    apiary_id: prefillApiaryId || p.apiary_id,
    hive_id: prefillHiveId || p.hive_id,
    other_title: prefillTitle || p.other_title,
    inspection_id: inspectionId || p.inspection_id,
    notes: inspectionId
  ? "Follow-up task created from Hive Health."
  : p.notes,
  }));
}, [prefillTitle, prefillApiaryId, prefillHiveId, inspectionId]);

  const hivesForApiary = useMemo(() => {
    if (!form.apiary_id) return [];
    // be robust to string/uuid comparisons
    return hives.filter((h) => String(h.apiary_id) === String(form.apiary_id));
  }, [hives, form.apiary_id]);
  useEffect(() => {
  if (!prefillHiveId || !hives.length) return;

  const hive = hives.find((h) => String(h.id) === String(prefillHiveId));
  if (!hive) return;

  setForm((p) => ({
    ...p,
    hive_id: prefillHiveId,
    hive_name: hive.name || p.hive_name,
    all_hives: false,
  }));
}, [prefillHiveId, hives]);

  const noHives = form.apiary_id && hivesForApiary.length === 0;
    useEffect(() => {
    const loadInspections = async () => {
    if (!form.apiary_id || form.all_hives || !form.hive_id) {
  setInspections([]);
  return;
}

      let q = supabase
        .from("inspections")
        .select("id, date, created_at, apiary_id, hive_id")
        .eq("apiary_id", form.apiary_id)
        .is("archived_at", null)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

     q = q.eq("hive_id", form.hive_id);

      const { data, error } = await q;

      if (error) {
        console.error("Failed to load related inspections:", error);
        setInspections([]);
        return;
      }

      setInspections(data || []);
    };

    loadInspections();
  }, [form.apiary_id, form.hive_id, form.all_hives]);

  const formatInspectionLabel = (inspection) => {
    const date = inspection.date
      ? new Date(inspection.date).toLocaleDateString("en-GB")
      : "Unknown date";

    const hive = hives.find((h) => String(h.id) === String(inspection.hive_id));
    const hiveName = hive?.name || "Hive";

    return `${date} — ${hiveName}`;
  };

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
      inspection_id: "",
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
        inspection_id: "",
      }));
      setError("");
    } else if (id === "hive_id") {
      if (value === "ALL_SPECIAL") {
          setForm((p) => ({ ...p, hive_id: "", hive_name: "ALL", all_hives: true, inspection_id: "" }));
      } else {
        const hiveName = value ? (hives.find((h) => String(h.id) === String(value))?.name || "") : "";
          setForm((p) => ({ ...p, hive_id: value, hive_name: hiveName, all_hives: false, inspection_id: "" }));
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
      inspection_id: form.all_hives ? null : form.inspection_id || null,
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
    if (returnTo) {
    navigate(`${returnTo}?created=task`);
  } else {
    navigate(`/todos?${qs.toString()}`);
  }
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
    "bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const taskChoiceClass = (selected) =>
    "min-h-[56px] w-full rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500 " +
    (selected
      ? "border-green-700 bg-green-50 text-green-900 ring-1 ring-green-700"
      : "border-gray-200 bg-white text-gray-800 hover:border-green-300 hover:bg-green-50/40");

  // Compute a suggested date string for the helper tip
  const suggestedDays = TASK_META[selectedTask]?.days;
  const suggestedISO =
    suggestedDays != null ? addDaysISO(todayISO(), suggestedDays) : null;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">New Task</h2>

        {isPremium && returnTo && (
          <div className="mt-3">
            <Link
              to={returnTo}
              className="inline-flex items-center justify-center text-sm px-3 py-2 border rounded-lg hover:bg-gray-100"
            >
              ← Back to Hive Health
            </Link>
          </div>
        )}

        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Create a reminder for something you need to do at the apiary. Choose a task, hive and due date.
        </p>
      </div>

      {/* Step 1: task choice */}
      <section className="mt-8">
        <div className="flex items-start gap-3 mb-4">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 font-semibold text-gray-800">
            1
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Choose a Task</h3>
            <p className="text-sm text-gray-500">Pick the activity you want to schedule.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRESET_TASKS.map((t) => {
            const meta = TASK_META[t] || {};
            const selected = selectedTask === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => selectTask(t)}
                className={taskChoiceClass(selected)}
                aria-pressed={selected}
                title={
                  meta?.days != null
                    ? `Auto due: ${meta.days} day${meta.days === 1 ? "" : "s"} from today`
                    : undefined
                }
              >
                <span className="mr-2" aria-hidden="true">{meta.emoji}</span>
                {t}
              </button>
            );
          })}
        </div>

        {/* Queen marking colours are only relevant when Requeen is selected */}
        {selectedTask === "Requeen" && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <div className="font-semibold text-sm mb-3">Queen marking colours by year</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full border border-gray-400 bg-white" />
                White · years ending 1 or 6
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
                Yellow · years ending 2 or 7
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                Red · years ending 3 or 8
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                Green · years ending 4 or 9
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                Blue · years ending 5 or 0
              </span>
            </div>
          </div>
        )}
      </section>

      {selectedTask && (
        <section className="mt-8 border-t border-gray-200 pt-7">
          <div className="flex items-start gap-3 mb-5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 font-semibold text-gray-800">
              2
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {(TASK_META[selectedTask]?.emoji ? TASK_META[selectedTask].emoji + " " : "")}
                {selectedTask}
              </h3>
              <p className="text-sm text-gray-500">Set when and where this task needs completing.</p>
            </div>
          </div>

          <form id="task-form" onSubmit={saveTask} className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4 sm:p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Task Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={form.due_date}
                    onChange={onChange}
                    required
                  />
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
                    className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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

                <div>
                  <label htmlFor="hive_id" className="block text-sm font-medium mb-1">Hive</label>
                  {noHives ? (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                      This apiary has no hives yet.{" "}
                      <Link to="/hives/new" className="underline">
                        Add a hive
                      </Link>{" "}
                      before creating this task.
                    </div>
                  ) : (
                    <select
                      id="hive_id"
                      className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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

                <div>
                  <label htmlFor="inspection_id" className="block text-sm font-medium mb-1">
                    Related Inspection <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <select
                    id="inspection_id"
                    className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                    value={form.inspection_id}
                    onChange={onChange}
                    disabled={form.all_hives || !form.hive_id || inspections.length === 0}
                  >
                    <option value="">None</option>
                    {inspections.map((inspection) => (
                      <option key={inspection.id} value={inspection.id}>
                        {formatInspectionLabel(inspection)}
                      </option>
                    ))}
                  </select>
                  {form.all_hives ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Related inspections are only available for individual hives.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Optional. Link this task to a saved inspection for the selected hive.
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter task title..."
                  value={form.other_title}
                  onChange={onChange}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
              <button
                type="button"
                className="w-full sm:w-auto border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium px-4 py-2.5 rounded-lg"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSave || saving}
                className={"w-full sm:w-auto " + greenBtn}
              >
                {saving ? "Saving…" : "Save Task"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
  );
}

export default NewTodo;
