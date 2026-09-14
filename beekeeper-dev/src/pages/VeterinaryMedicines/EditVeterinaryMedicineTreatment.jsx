import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";

const METHOD_OPTIONS = [
  "Strips",
  "Drizzle / trickle",
  "Sublimation / vaporisation",
  "Tray / gel",
  "Spray",
  "Other",
];

export default function EditVeterinaryMedicineTreatment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [historicalHiveRows, setHistoricalHiveRows] = useState([]);
  const [orphanedHiveNames, setOrphanedHiveNames] = useState([]);
  const [recordHolderSnapshot, setRecordHolderSnapshot] = useState(null);

  const [medicineId, setMedicineId] = useState("");
  const [apiaryId, setApiaryId] = useState("");
  const [selectedHiveIds, setSelectedHiveIds] = useState([]);
  const [treatmentFor, setTreatmentFor] = useState("");
  const [method, setMethod] = useState("");
  const [otherMethod, setOtherMethod] = useState("");
  const [startedOn, setStartedOn] = useState("");
  const [treatmentMode, setTreatmentMode] = useState("remains_in_hive");
  const [plannedCompletionDate, setPlannedCompletionDate] = useState("");
  const [completionAction, setCompletionAction] = useState("remove");
  const [personAdministering, setPersonAdministering] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [withdrawalPeriod, setWithdrawalPeriod] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

        const [treatmentResult, medicinesResult, apiariesResult, hiveRowsResult] = await Promise.all([
          supabase
            .from("veterinary_medicine_treatments")
            .select(
              "id,medicine_id,apiary_id,treatment_for,method,started_on,treatment_mode,planned_completion_date,completion_action,person_administering,quantity_used,withdrawal_period,notes,record_holder_name,record_holder_address,record_holder_postcode"
            )
            .eq("id", id)
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("veterinary_medicines")
            .select("id,product_name,batch_number,purchase_date")
            .eq("user_id", user.id)
            .order("purchase_date", { ascending: false }),
          supabase
            .from("apiaries")
            .select("id,name,archived_at")
            .eq("user_id", user.id)
            .order("name", { ascending: true }),
          supabase
            .from("veterinary_medicine_treatment_hives")
            .select("hive_id,hive_name_snapshot,status,completed_on,inspection_id,quantity_used")
            .eq("treatment_id", id)
            .eq("user_id", user.id),
        ]);

        if (treatmentResult.error) throw treatmentResult.error;
        if (medicinesResult.error) throw medicinesResult.error;
        if (apiariesResult.error) throw apiariesResult.error;
        if (hiveRowsResult.error) throw hiveRowsResult.error;
        if (!treatmentResult.data) throw new Error("Treatment record not found.");
        if (!active) return;

        const treatment = treatmentResult.data;
        const hiveRows = hiveRowsResult.data || [];
        const knownMethods = METHOD_OPTIONS.filter((x) => x !== "Other");

        setMedicines(medicinesResult.data || []);
        setApiaries(apiariesResult.data || []);
        setHistoricalHiveRows(hiveRows);
        setOrphanedHiveNames(
          hiveRows.filter((row) => !row.hive_id).map((row) => row.hive_name_snapshot).filter(Boolean)
        );
        setRecordHolderSnapshot({
          name: treatment.record_holder_name,
          address: treatment.record_holder_address,
          postcode: treatment.record_holder_postcode,
        });
        setMedicineId(treatment.medicine_id || "");
        setApiaryId(treatment.apiary_id || "");
        setSelectedHiveIds(hiveRows.map((row) => row.hive_id).filter(Boolean));
        setTreatmentFor(treatment.treatment_for || "");
        if (knownMethods.includes(treatment.method)) {
          setMethod(treatment.method);
          setOtherMethod("");
        } else {
          setMethod("Other");
          setOtherMethod(treatment.method || "");
        }
        setStartedOn(treatment.started_on || "");
        setTreatmentMode(treatment.treatment_mode || "remains_in_hive");
        setPlannedCompletionDate(treatment.planned_completion_date || "");
        setCompletionAction(treatment.completion_action || "remove");
        setPersonAdministering(treatment.person_administering || "");
        setQuantityUsed(hiveRows[0]?.quantity_used || treatment.quantity_used || "");
        setWithdrawalPeriod(treatment.withdrawal_period || "");
        setNotes(treatment.notes || "");
      } catch (err) {
        if (active) setErrorMsg(err.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (!apiaryId) {
      setHives([]);
      return undefined;
    }

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("hives")
        .select("id,name,archived_at")
        .eq("user_id", user.id)
        .eq("apiary_id", apiaryId)
        .order("name", { ascending: true });

      if (!active) return;
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setHives(data || []);
    })();

    return () => {
      active = false;
    };
  }, [apiaryId]);

  const effectiveMethod = useMemo(
    () => (method === "Other" ? otherMethod.trim() : method.trim()),
    [method, otherMethod]
  );

  const toggleHive = (hiveId) => {
    setSelectedHiveIds((prev) =>
      prev.includes(hiveId) ? prev.filter((value) => value !== hiveId) : [...prev, hiveId]
    );
  };

  const handleApiaryChange = (nextId) => {
    if (nextId !== apiaryId) setSelectedHiveIds([]);
    setApiaryId(nextId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!medicineId) return setErrorMsg("Please select a veterinary medicine.");
    if (!apiaryId) return setErrorMsg("Please select an apiary.");
    if (selectedHiveIds.length === 0 && orphanedHiveNames.length === 0) {
      return setErrorMsg("Please select at least one hive.");
    }
    if (!treatmentFor.trim()) return setErrorMsg("Please state what the medicine was used for.");
    if (!effectiveMethod) return setErrorMsg("Please select or enter the treatment method.");
    if (!startedOn) return setErrorMsg("Please enter the treatment start date.");
    if (!personAdministering.trim()) return setErrorMsg("Please enter who administered the medicine.");
    if (!quantityUsed.trim()) return setErrorMsg("Please enter the quantity used per hive.");
    if (!withdrawalPeriod.trim()) return setErrorMsg("Please enter the withdrawal period shown for the medicine.");
    if (treatmentMode === "remains_in_hive" && !plannedCompletionDate) {
      return setErrorMsg("Please enter the planned removal and/or completion date.");
    }
    if (
      treatmentMode === "remains_in_hive" &&
      plannedCompletionDate &&
      plannedCompletionDate < startedOn
    ) {
      return setErrorMsg("Removal and/or completion date cannot be before the treatment start date.");
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc("amend_veterinary_medicine_treatment", {
        p_treatment_id: id,
        p_medicine_id: medicineId,
        p_apiary_id: apiaryId,
        p_treatment_for: treatmentFor.trim(),
        p_method: effectiveMethod,
        p_started_on: startedOn,
        p_treatment_mode: treatmentMode,
        p_planned_completion_date:
          treatmentMode === "remains_in_hive" ? plannedCompletionDate : null,
        p_completion_action: treatmentMode === "remains_in_hive" ? completionAction : "complete",
        p_person_administering: personAdministering.trim(),
        p_quantity_used: quantityUsed.trim(),
        p_withdrawal_period: withdrawalPeriod.trim(),
        p_notes: notes.trim() || null,
        p_hive_ids: selectedHiveIds,
      });

      if (error) throw error;

      window.dispatchEvent(new CustomEvent("veterinary-treatment:updated"));
      navigate("/veterinary-medicines", {
        state: {
          veterinaryMedicineMessage:
            "Treatment record corrected. Calendar and linked inspection information have been updated.",
        },
      });
    } catch (err) {
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading treatment record…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 text-sm text-gray-500">
            <Link to="/veterinary-medicines" className="hover:underline">Veterinary Medicines</Link>{" "}/ Correct Treatment Record
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">Correct Treatment Record</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Correct a mistake in an existing administration record. Saving updates the existing record; it does not create a duplicate treatment.
          </p>
          <p className="mt-2 text-xs font-medium text-gray-500">* Required field</p>
        </div>
        <Link to="/veterinary-medicines" className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</Link>
      </div>

      {errorMsg && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>}

      <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>You are amending a recorded treatment.</strong> Changes to the treatment date or hive selection can change which inspection card the treatment is linked to. Completed/active status is preserved where possible.
      </div>

      {orphanedHiveNames.length > 0 && (
        <div className="mb-5 rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
          Historical hive record retained: {orphanedHiveNames.join(", ")}. The live hive has since been removed, so this historical link will be preserved automatically.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">Medicine and administration</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Veterinary medicine *" className="md:col-span-2">
              <select className="input" value={medicineId} onChange={(e) => setMedicineId(e.target.value)} required>
                <option value="">Select medicine…</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>{medicine.product_name} — batch {medicine.batch_number}</option>
                ))}
              </select>
            </Field>

            <Field label="Used for *">
              <input className="input" value={treatmentFor} onChange={(e) => setTreatmentFor(e.target.value)} required />
            </Field>

            <div className="flex flex-col gap-1">
              <Field label="Method *">
                <select
                  className="input"
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    if (e.target.value !== "Other") setOtherMethod("");
                  }}
                  required
                >
                  <option value="">Select method…</option>
                  {METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
              {method === "Other" && (
                <Field label="Other method *" className="mt-2">
                  <input className="input" value={otherMethod} onChange={(e) => setOtherMethod(e.target.value)} required />
                </Field>
              )}
            </div>

            <Field label="Treatment start date *">
              <input type="date" className="input" value={startedOn} onChange={(e) => setStartedOn(e.target.value)} required />
            </Field>
            <Field label="Person administering *">
              <input className="input" value={personAdministering} onChange={(e) => setPersonAdministering(e.target.value)} required />
            </Field>
            <Field label="Quantity used per hive *" hint="Saving applies this amount to each hive in this treatment.">
              <input className="input" value={quantityUsed} onChange={(e) => setQuantityUsed(e.target.value)} required />
            </Field>
            <Field label="Withdrawal period for honey *" hint="Copy the wording from the current product label or leaflet. 'Honey: zero days' means there is no additional withdrawal waiting period for honey; separate product restrictions still apply.">
              <input className="input" value={withdrawalPeriod} onChange={(e) => setWithdrawalPeriod(e.target.value)} required />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">Apiary and hives</h2>
          <div className="mt-4">
            <Field label="Apiary *">
              <select className="input" value={apiaryId} onChange={(e) => handleApiaryChange(e.target.value)} required>
                <option value="">Select apiary…</option>
                {apiaries.map((apiary) => (
                  <option key={apiary.id} value={apiary.id}>{apiary.name}{apiary.archived_at ? " (archived)" : ""}</option>
                ))}
              </select>
            </Field>
          </div>

          {apiaryId && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[#1a3329]">Which hives were actually treated? *</div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedHiveIds(hives.map((h) => h.id))} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium">Select all</button>
                  <button type="button" onClick={() => setSelectedHiveIds([])} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {hives.map((hive) => (
                  <label key={hive.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                    <input type="checkbox" checked={selectedHiveIds.includes(hive.id)} onChange={() => toggleHive(hive.id)} />
                    <span>{hive.name}{hive.archived_at ? " (archived)" : ""}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {historicalHiveRows.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Current saved status: {historicalHiveRows.map((row) => `${row.hive_name_snapshot} — ${row.status}${row.completed_on ? ` (${row.completed_on})` : ""} — ${row.quantity_used || "quantity not recorded"}`).join("; ")}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">Treatment status and completion</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setTreatmentMode("one_off")} className={`rounded-2xl border p-4 text-left ${treatmentMode === "one_off" ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300" : "border-gray-200 bg-white"}`}>
              <div className="font-semibold text-[#1a3329]">One-off administration</div>
              <div className="mt-1 text-sm text-gray-600">Completed when administered.</div>
            </button>
            <button type="button" onClick={() => setTreatmentMode("remains_in_hive")} className={`rounded-2xl border p-4 text-left ${treatmentMode === "remains_in_hive" ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300" : "border-gray-200 bg-white"}`}>
              <div className="font-semibold text-[#1a3329]">Treatment remains in hive</div>
              <div className="mt-1 text-sm text-gray-600">Remains active until removal and/or completion.</div>
            </button>
          </div>

          {treatmentMode === "remains_in_hive" && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Planned removal and/or completion date *" hint="You set this date; HiveTag does not calculate it.">
                <input type="date" className="input" min={startedOn || undefined} value={plannedCompletionDate} onChange={(e) => setPlannedCompletionDate(e.target.value)} required />
              </Field>
              <Field label="Action on that date *">
                <select className="input" value={completionAction} onChange={(e) => setCompletionAction(e.target.value)}>
                  <option value="remove">Remove treatment</option>
                  <option value="complete">Complete treatment</option>
                </select>
              </Field>
            </div>
          )}
        </section>

        {recordHolderSnapshot && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm">
            <div className="font-semibold text-[#1a3329]">Historical record-holder snapshot</div>
            <div className="mt-1 text-gray-700">{recordHolderSnapshot.name}</div>
            <div className="whitespace-pre-line text-gray-700">{recordHolderSnapshot.address}</div>
            <div className="text-gray-700">{recordHolderSnapshot.postcode}</div>
            <div className="mt-2 text-xs text-gray-500">Correcting a treatment does not replace these historical record-holder details.</div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <Field label="Notes">
            <textarea className="input min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </Field>
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <Link to="/veterinary-medicines" className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-[#1a3329] hover:bg-yellow-300 disabled:opacity-60">
            {saving ? "Saving…" : "Save Treatment Correction"}
          </button>
        </div>
      </form>

      <style>{`
        .input { width: 100%; border: 1px solid rgb(209 213 219); border-radius: 0.75rem; background: white; padding: 0.625rem 0.75rem; color: rgb(17 24 39); }
        .input:focus { outline: none; border-color: #1a3329; box-shadow: 0 0 0 2px rgba(26, 51, 41, 0.12); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
