// src/pages/Todos/EditTodo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { archiveItem, humaniseSupabaseError } from "../../services/actions";

const EditTodo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    due_date: "",
    status: "pending",
    apiary_id: "",
    hive_id: "",
    hive_name: "",
    notes: "",
  });

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [allHivesForApiary, setAllHivesForApiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAllHives = form.hive_name === "ALL" && !form.hive_id;

  const noHives = useMemo(() => {
    if (!form.apiary_id) return false;
    return allHivesForApiary.length === 0;
  }, [form.apiary_id, allHivesForApiary]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const [{ data: todo, error: todoErr }, { data: apiaryData }] = await Promise.all([
        supabase
          .from("todos")
          .select("id, title, due_date, status, apiary_id, hive_id, hive_name, notes, archived_at")
          .eq("id", id)
          .single(),
        supabase
          .from("apiaries")
          .select("id, name")
          .is("archived_at", null)
          .order("name"),
      ]);

      if (todoErr) {
        setError(todoErr.message || "Failed to load task");
        setLoading(false);
        return;
      }

      let dueDateStr = todo?.due_date || "";
      if (dueDateStr) {
        try {
          dueDateStr = new Date(dueDateStr).toISOString().slice(0, 10);
        } catch {}
      }

      setForm({
        title: todo?.title || "",
        due_date: dueDateStr || "",
        status: (todo?.status || "pending") === "completed" ? "completed" : "pending",
        apiary_id: todo?.apiary_id || "",
        hive_id: todo?.hive_id || "",
        hive_name: todo?.hive_name || "",
        notes: todo?.notes || "",
      });

      setApiaries(apiaryData || []);
      setLoading(false);
    };

    load();
  }, [id]);

  useEffect(() => {
    const fetchHives = async () => {
      setAllHivesForApiary([]);
      setHives([]);

      if (!form.apiary_id) return;

      const { data: hiveRows } = await supabase
        .from("hives")
        .select("id, name, apiary_id, archived_at")
        .eq("apiary_id", form.apiary_id)
        .is("archived_at", null)
        .order("name");

      setAllHivesForApiary(hiveRows || []);
      setHives(hiveRows || []);
    };

    fetchHives();
  }, [form.apiary_id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "apiary_id") {
      setForm((p) => ({
        ...p,
        apiary_id: value,
        hive_id: "",
        hive_name: "",
      }));
    } else if (name === "hive_id") {
      if (value === "ALL_SPECIAL") {
        setForm((p) => ({ ...p, hive_id: "", hive_name: "ALL" }));
      } else {
        const hiveName = value ? (allHivesForApiary.find((h) => h.id === value)?.name || "") : "";
        setForm((p) => ({ ...p, hive_id: value, hive_name: hiveName }));
      }
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.title) {
        setError("Title is required.");
        setSaving(false);
        return;
      }
      if (!form.due_date) {
        setError("Due date is required.");
        setSaving(false);
        return;
      }
      if (!form.apiary_id) {
        setError("Apiary is required.");
        setSaving(false);
        return;
      }

      if (noHives && form.hive_id) {
        setError("Selected apiary has no active hives.");
        setSaving(false);
        return;
      }

      if (form.apiary_id) {
        const { data: parentApiary } = await supabase
          .from("apiaries")
          .select("archived_at")
          .eq("id", form.apiary_id)
          .single();
        if (parentApiary?.archived_at) {
          setError("Selected apiary is archived. Choose an active apiary.");
          setSaving(false);
          return;
        }
      }
      if (form.hive_id) {
        const { data: parentHive } = await supabase
          .from("hives")
          .select("archived_at")
          .eq("id", form.hive_id)
          .single();
        if (parentHive?.archived_at) {
          setError("Selected hive is archived. Choose an active hive or select All Hives.");
          setSaving(false);
          return;
        }
      }

      const statusSafe = form.status === "completed" ? "completed" : "pending";

      const payload = {
        title: form.title,
        due_date: form.due_date || null,
        status: statusSafe,
        apiary_id: form.apiary_id || null,
        hive_id: isAllHives ? null : (form.hive_id || null),
        hive_name: isAllHives ? "ALL" : (form.hive_name || null),
        notes: form.notes || null,
      };

      const { error: upErr } = await supabase.from("todos").update(payload).eq("id", id);
      if (upErr) throw upErr;

      // Return to list with highlight on this task
      const qs = new URLSearchParams();
      qs.set("highlight", id);
      qs.set("type", "TODO");
      if (form.apiary_id) qs.set("apiary_id", form.apiary_id);
      navigate(`/todos?${qs.toString()}`);
    } catch (err) {
      setError(humaniseSupabaseError(err) || err.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const archiveTask = async () => {
    if (!window.confirm("Are you sure you want to archive this task?")) return;
    setSaving(true);
    setError("");
    const { error: upErr } = await archiveItem("todos", id);
    setSaving(false);
    if (upErr) {
      setError(humaniseSupabaseError(upErr) || "Failed to archive task");
      return;
    }
    alert("Task archived.");
    navigate("/todos");
  };

  const deleteTask = async () => {
    if (!window.confirm("Delete this task permanently? This cannot be undone.")) return;
    setSaving(true);
    setError("");

    try {
      const { data: row, error: getErr } = await supabase
        .from("todos")
        .select("id, user_id")
        .eq("id", id)
        .single();

      if (getErr && !row) throw getErr;
      if (!row) {
        navigate("/todos");
        return;
      }

      const { error: delErr } = await supabase.from("todos").delete().eq("id", id);
      if (delErr) throw delErr;

      alert("Task deleted.");
      navigate("/todos");
    } catch (err) {
      setError(
        humaniseSupabaseError(err) ||
          err.message ||
          "Failed to delete task. If this persists, check your RLS DELETE policy for todos."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 max-w-xl mx-auto">Loading…</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Task</h1>

      {error && <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium mb-1">Due Date</label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="apiary_id" className="block text-sm font-medium mb-1">Apiary</label>
          <select
            id="apiary_id"
            name="apiary_id"
            value={form.apiary_id}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          >
            <option value="">Select Apiary</option>
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
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              This apiary has no hives yet.
            </div>
          ) : (
            <select
              id="hive_id"
              name="hive_id"
              value={isAllHives ? "ALL_SPECIAL" : (form.hive_id || "")}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded focus:outline-none"
              disabled={!form.apiary_id}
            >
              <option value="">Select Hive (optional)</option>
              {allHivesForApiary.length > 0 && <option value="ALL_SPECIAL">All Hives</option>}
              {allHivesForApiary.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          )}
          {isAllHives && (
            <p className="text-xs text-gray-600 mt-1">
              Currently set to <strong>All Hives</strong> for this apiary.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes || ""}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded min-h-[100px] focus:outline-none"
          />
        </div>

        {/* Actions */}
              {/* Actions */}
        <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white text-sm px-3 py-2 rounded disabled:opacity-50
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={archiveTask}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded"
          >
            Archive
          </button>

          <button
            type="button"
            onClick={deleteTask}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => navigate("/todos")}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-2 rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditTodo;
