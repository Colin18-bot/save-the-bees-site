import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../services/supabase";

const localTodayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

export default function ActiveVeterinaryTreatments({ hiveId: hiveIdProp = "", compact = false }) {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [savingId, setSavingId] = useState("");
  const [completionDates, setCompletionDates] = useState({});

  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return {
      apiaryId: params.get("apiary_id") || "",
      hiveId: hiveIdProp || params.get("hive_id") || "",
    };
  }, [location.search, hiveIdProp]);

  const loadTreatments = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      let query = supabase
        .from("veterinary_medicine_hive_status")
        .select(
          "treatment_hive_id,treatment_id,medicine_id,product_name,batch_number,apiary_id,apiary_name_snapshot,hive_id,hive_name_snapshot,method,started_on,planned_completion_date,completion_action,status,is_overdue"
        )
        .eq("status", "active")
        .order("planned_completion_date", { ascending: true, nullsFirst: false });

      if (filters.hiveId) {
        query = query.eq("hive_id", filters.hiveId);
      } else if (filters.apiaryId) {
        query = query.eq("apiary_id", filters.apiaryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const sorted = [...(data || [])].sort((a, b) => {
        if (!!a.is_overdue !== !!b.is_overdue) return a.is_overdue ? -1 : 1;
        return String(a.planned_completion_date || "9999-12-31").localeCompare(
          String(b.planned_completion_date || "9999-12-31")
        );
      });

      setRows(sorted);
      setCompletionDates((prev) => {
        const next = { ...prev };
        sorted.forEach((row) => {
          if (!next[row.treatment_hive_id]) next[row.treatment_hive_id] = localTodayIso();
        });
        return next;
      });
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [filters.apiaryId, filters.hiveId]);

  useEffect(() => {
    loadTreatments();
  }, [loadTreatments]);

  useEffect(() => {
    const refresh = () => loadTreatments();
    window.addEventListener("veterinary-treatment:updated", refresh);
    return () => window.removeEventListener("veterinary-treatment:updated", refresh);
  }, [loadTreatments]);

  const markCompleted = async (row) => {
    const completedOn = completionDates[row.treatment_hive_id] || localTodayIso();
    setSavingId(row.treatment_hive_id);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase
        .from("veterinary_medicine_treatment_hives")
        .update({ status: "completed", completed_on: completedOn })
        .eq("id", row.treatment_hive_id);

      if (error) throw error;
      setSuccessMsg(
        `${row.product_name} marked completed for ${row.hive_name_snapshot} on ${formatDate(completedOn)}.`
      );
      window.dispatchEvent(new CustomEvent("veterinary-treatment:updated"));
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSavingId("");
    }
  };

  if (compact) {
    if (loading || (!errorMsg && rows.length === 0)) return null;

    return (
      <div className="mb-2 space-y-2">
        {errorMsg && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {rows.map((row) => {
          const actionWord = row.completion_action === "remove" ? "Remove" : "Complete";
          const overdueLabel =
            row.completion_action === "remove"
              ? "TREATMENT REMOVAL OVERDUE"
              : "TREATMENT COMPLETION OVERDUE";

          return (
            <div
              key={row.treatment_hive_id}
              className={`rounded-lg border p-3 ${
                row.is_overdue
                  ? "border-red-300 bg-red-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      row.is_overdue ? "text-red-700" : "text-amber-800"
                    }`}
                  >
                    Current veterinary treatment
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1a3329]">
                    {row.product_name}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    row.is_overdue
                      ? "border-red-300 bg-red-100 text-red-800"
                      : "border-amber-300 bg-amber-100 text-amber-900"
                  }`}
                >
                  ACTIVE
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-700">
                {row.method || "Method not recorded"} • Started {formatDate(row.started_on)}
              </p>
              {row.planned_completion_date && (
                <p className="mt-1 text-xs text-gray-700">
                  <span className="font-semibold">{actionWord}:</span>{" "}
                  {formatDate(row.planned_completion_date)}
                </p>
              )}

              {row.is_overdue && (
                <p className="mt-2 text-xs font-bold text-red-700">
                  {overdueLabel} — due {formatDate(row.planned_completion_date)}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-2">
                <label className="flex flex-col gap-1 text-[11px] font-semibold text-gray-600">
                  Actual completion date
                  <input
                    type="date"
                    value={completionDates[row.treatment_hive_id] || localTodayIso()}
                    min={row.started_on || undefined}
                    onChange={(e) =>
                      setCompletionDates((prev) => ({
                        ...prev,
                        [row.treatment_hive_id]: e.target.value,
                      }))
                    }
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-900"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={savingId === row.treatment_hive_id}
                    onClick={() => markCompleted(row)}
                    className="rounded-lg bg-[#1a3329] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#24483a] disabled:opacity-60"
                  >
                    {savingId === row.treatment_hive_id ? "Saving…" : "Mark completed"}
                  </button>
                  <Link
                    to="/veterinary-medicines"
                    className="rounded-lg border border-[#1a3329]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#1a3329] hover:bg-amber-50"
                  >
                    Medicine record
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {successMsg && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-2 text-xs text-green-800">
            {successMsg}
          </div>
        )}
      </div>
    );
  }

  if (!loading && rows.length === 0 && !filters.apiaryId && !filters.hiveId && !errorMsg) {
    return null;
  }

  return (
    <section className="mb-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1a3329]">Veterinary treatment status</h2>
          <p className="mt-1 text-sm text-gray-600">
            Active treatments for the current inspection filter. Start and removal/completion dates are the dates you entered.
          </p>
        </div>
        <Link
          to="/veterinary-medicines"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#1a3329]/30 bg-white px-3 py-2 text-sm font-semibold text-[#1a3329] hover:bg-amber-50"
        >
          Veterinary Medicines
        </Link>
      </div>

      {errorMsg && (
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="mt-3 text-sm text-gray-600">Loading treatment status…</div>
      ) : rows.length === 0 ? (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          No active veterinary treatments for the current filter.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map((row) => {
            const actionWord = row.completion_action === "remove" ? "Remove" : "Complete";
            const overdueLabel =
              row.completion_action === "remove"
                ? "TREATMENT REMOVAL OVERDUE"
                : "TREATMENT COMPLETION OVERDUE";

            return (
              <div
                key={row.treatment_hive_id}
                className={`rounded-xl border p-3 ${
                  row.is_overdue
                    ? "border-red-300 bg-red-50"
                    : "border-amber-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#1a3329]">
                      {row.hive_name_snapshot} — {row.product_name}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600">
                      {row.apiary_name_snapshot}
                      {row.method ? ` • ${row.method}` : ""}
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-bold ${
                      row.is_overdue
                        ? "border-red-300 bg-red-100 text-red-800"
                        : "border-amber-300 bg-amber-100 text-amber-900"
                    }`}
                  >
                    ACTIVE
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-800">
                  <span className="font-medium">Started:</span> {formatDate(row.started_on)}
                  {row.planned_completion_date && (
                    <>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="font-medium">{actionWord}:</span>{" "}
                      {formatDate(row.planned_completion_date)}
                    </>
                  )}
                </div>

                {row.is_overdue && (
                  <div className="mt-2 font-bold text-red-700">
                    {overdueLabel} — due {formatDate(row.planned_completion_date)}
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                    Actual completion date
                    <input
                      type="date"
                      value={completionDates[row.treatment_hive_id] || localTodayIso()}
                      min={row.started_on || undefined}
                      onChange={(e) =>
                        setCompletionDates((prev) => ({
                          ...prev,
                          [row.treatment_hive_id]: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal text-gray-900"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={savingId === row.treatment_hive_id}
                    onClick={() => markCompleted(row)}
                    className="rounded-lg bg-[#1a3329] px-3 py-2 text-sm font-semibold text-white hover:bg-[#24483a] disabled:opacity-60"
                  >
                    {savingId === row.treatment_hive_id ? "Saving…" : "Mark treatment completed"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}