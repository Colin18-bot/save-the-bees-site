import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

const todayIso = () => new Date().toISOString().slice(0, 10);

const METHOD_OPTIONS = [
  "Strips",
  "Drizzle / trickle",
  "Sublimation / vaporisation",
  "Tray / gel",
  "Spray",
  "Other",
];

export default function NewVeterinaryMedicineTreatment() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedMedicineId = useMemo(
    () => new URLSearchParams(location.search).get("medicine") || "",
    [location.search]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [medicines, setMedicines] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [recordHolderName, setRecordHolderName] = useState("");

  const [medicineId, setMedicineId] = useState(requestedMedicineId);
  const [apiaryId, setApiaryId] = useState("");
  const [hiveSelectionMode, setHiveSelectionMode] = useState("selected");
  const [selectedHiveIds, setSelectedHiveIds] = useState([]);

  const [treatmentFor, setTreatmentFor] = useState("Varroa");
  const [method, setMethod] = useState("");
  const [otherMethod, setOtherMethod] = useState("");
  const [startedOn, setStartedOn] = useState(todayIso());
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

        if (userError || !user) {
          throw new Error(userError?.message || "Not authenticated.");
        }

        const [medicinesResult, apiariesResult, holderResult] = await Promise.all([
          supabase
            .from("veterinary_medicines")
            .select("id,product_name,batch_number,purchase_date,expiry_date")
            .eq("user_id", user.id)
            .order("purchase_date", { ascending: false }),
          supabase
            .from("apiaries")
            .select("id,name,archived_at")
            .eq("user_id", user.id)
            .is("archived_at", null)
            .order("name", { ascending: true }),
          supabase
            .from("veterinary_medicine_settings")
            .select("record_holder_name")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (medicinesResult.error) throw medicinesResult.error;
        if (apiariesResult.error) throw apiariesResult.error;
        if (holderResult.error) throw holderResult.error;
        if (!active) return;

        const medicineRows = medicinesResult.data || [];
        setMedicines(medicineRows);
        setApiaries(apiariesResult.data || []);
        setRecordHolderName(holderResult.data?.record_holder_name || "");
        setPersonAdministering(holderResult.data?.record_holder_name || "");

        if (
          requestedMedicineId &&
          medicineRows.some((row) => row.id === requestedMedicineId)
        ) {
          setMedicineId(requestedMedicineId);
        } else if (!medicineId && medicineRows.length === 1) {
          setMedicineId(medicineRows[0].id);
        }
      } catch (err) {
        setErrorMsg(err.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // requestedMedicineId is intentionally the only dependency used from routing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedMedicineId]);

  useEffect(() => {
    let active = true;

    (async () => {
      setHives([]);
      setSelectedHiveIds([]);
      if (!apiaryId) return;

      const { data, error } = await supabase
        .from("hives")
        .select("id,name,archived_at")
        .eq("apiary_id", apiaryId)
        .is("archived_at", null)
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

  const effectiveHiveIds = useMemo(() => {
    if (hiveSelectionMode === "all") return hives.map((hive) => hive.id);
    return selectedHiveIds;
  }, [hiveSelectionMode, hives, selectedHiveIds]);

  const effectiveMethod = useMemo(() => {
    if (method === "Other") return otherMethod.trim();
    return method.trim();
  }, [method, otherMethod]);

  const toggleHive = (hiveId) => {
    setSelectedHiveIds((prev) =>
      prev.includes(hiveId)
        ? prev.filter((id) => id !== hiveId)
        : [...prev, hiveId]
    );
  };

  const selectAll = () => setSelectedHiveIds(hives.map((hive) => hive.id));
  const clearSelection = () => setSelectedHiveIds([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!medicineId) return setErrorMsg("Please select a veterinary medicine.");
    if (!apiaryId) return setErrorMsg("Please select an apiary.");
    if (effectiveHiveIds.length === 0) {
      return setErrorMsg("Please select at least one hive.");
    }
    if (!treatmentFor.trim()) {
      return setErrorMsg("Please state what the medicine was used for.");
    }
    if (!method) return setErrorMsg("Please select the treatment method.");
    if (method === "Other" && !otherMethod.trim()) {
      return setErrorMsg("Please enter the treatment method used.");
    }
    if (!startedOn) return setErrorMsg("Please enter the treatment start date.");
    if (!personAdministering.trim()) {
      return setErrorMsg("Please enter who administered the medicine.");
    }
    if (!quantityUsed.trim()) {
      return setErrorMsg("Please enter the total quantity used.");
    }
    if (!withdrawalPeriod.trim()) {
      return setErrorMsg("Please enter the withdrawal period shown for the medicine.");
    }
    if (treatmentMode === "remains_in_hive" && !plannedCompletionDate) {
      return setErrorMsg(
        "Please enter the planned removal and/or completion date you are using for this treatment."
      );
    }
    if (
      treatmentMode === "remains_in_hive" &&
      plannedCompletionDate &&
      plannedCompletionDate < startedOn
    ) {
      return setErrorMsg(
        "Removal and/or completion date cannot be before the treatment start date."
      );
    }

    setSaving(true);
    let treatmentId = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "Not authenticated.");
      }

      const treatmentPayload = {
        user_id: user.id,
        medicine_id: medicineId,
        apiary_id: apiaryId,
        treatment_for: treatmentFor.trim(),
        method: effectiveMethod,
        started_on: startedOn,
        treatment_mode: treatmentMode,
        planned_completion_date:
          treatmentMode === "remains_in_hive" ? plannedCompletionDate : null,
        completion_action:
          treatmentMode === "remains_in_hive" ? completionAction : "complete",
        person_administering: personAdministering.trim(),
        quantity_used: quantityUsed.trim(),
        withdrawal_period: withdrawalPeriod.trim(),
        notes: notes.trim() || null,
      };

      const { data: treatment, error: treatmentError } = await supabase
        .from("veterinary_medicine_treatments")
        .insert([treatmentPayload])
        .select("id")
        .single();

      if (treatmentError) throw treatmentError;
      treatmentId = treatment.id;

      const hiveRows = effectiveHiveIds.map((hiveId) => ({
        user_id: user.id,
        treatment_id: treatment.id,
        hive_id: hiveId,
      }));

      const { error: hiveError } = await supabase
        .from("veterinary_medicine_treatment_hives")
        .insert(hiveRows);

      if (hiveError) throw hiveError;

      navigate("/veterinary-medicines", {
        state: {
          veterinaryMedicineMessage:
            treatmentMode === "one_off"
              ? `Treatment recorded as completed for ${effectiveHiveIds.length} hive${
                  effectiveHiveIds.length === 1 ? "" : "s"
                }.`
              : `Treatment started for ${effectiveHiveIds.length} hive${
                  effectiveHiveIds.length === 1 ? "" : "s"
                }.` ,
        },
      });
    } catch (err) {
      if (treatmentId) {
        await supabase
          .from("veterinary_medicine_treatments")
          .delete()
          .eq("id", treatmentId);
      }
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading treatment form…</div>;

  if (medicines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">
          Record Treatment
        </h1>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-gray-800">
          Add the veterinary medicine to your register before recording its administration.
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            to="/veterinary-medicines/new"
            className="rounded-xl bg-[#1a3329] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#24483a]"
          >
            Add Medicine
          </Link>
          <Link
            to="/veterinary-medicines"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">
          Record Treatment
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Record what you actually administered. HiveTag does not calculate treatment durations;
          enter the removal or completion date from the instructions you are following.
        </p>
        <p className="mt-2 text-xs font-medium text-gray-500">
          * Required field
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">
            Medicine and administration
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Veterinary medicine *</span>
              <select
                className="rounded-xl border border-gray-300 bg-white p-2.5"
                value={medicineId}
                onChange={(e) => setMedicineId(e.target.value)}
                required
              >
                <option value="">Select medicine…</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.product_name} — batch {medicine.batch_number}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Used for *</span>
              <input
                className="rounded-xl border border-gray-300 p-2.5"
                value={treatmentFor}
                onChange={(e) => setTreatmentFor(e.target.value)}
                placeholder="e.g. Varroa"
                required
              />
            </label>

            <div className="flex flex-col gap-1">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Method *</span>
                <select
                  className="rounded-xl border border-gray-300 bg-white p-2.5"
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value);
                    if (e.target.value !== "Other") setOtherMethod("");
                  }}
                  required
                >
                  <option value="">Select method…</option>
                  {METHOD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {method === "Other" && (
                <label className="mt-2 flex flex-col gap-1">
                  <span className="text-sm font-medium">Other method *</span>
                  <input
                    className="rounded-xl border border-gray-300 p-2.5"
                    value={otherMethod}
                    onChange={(e) => setOtherMethod(e.target.value)}
                    placeholder="Enter the method used"
                    required
                  />
                </label>
              )}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Treatment start date *</span>
              <input
                type="date"
                className="rounded-xl border border-gray-300 p-2.5"
                value={startedOn}
                onChange={(e) => setStartedOn(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Person administering *</span>
              <input
                className="rounded-xl border border-gray-300 p-2.5"
                value={personAdministering}
                onChange={(e) => setPersonAdministering(e.target.value)}
                placeholder={recordHolderName || "Name"}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Total quantity used *</span>
              <input
                className="rounded-xl border border-gray-300 p-2.5"
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(e.target.value)}
                placeholder="e.g. 6 strips, 15 ml, 3 trays"
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Withdrawal period for honey *</span>
              <input
                className="rounded-xl border border-gray-300 p-2.5"
                value={withdrawalPeriod}
                onChange={(e) => setWithdrawalPeriod(e.target.value)}
                placeholder="Copy from label, e.g. Honey: zero days"
                required
              />
              <span className="text-xs text-gray-500">
                Copy the withdrawal period from the current product label or package leaflet.
                “Honey: zero days” means there is no additional waiting period for honey from the
                withdrawal-period point of view. It does not override separate product instructions
                such as not using the medicine during honey flow, removing supers, or not harvesting
                honey while treatment is in place.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">Apiary and hives</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Apiary *</span>
              <select
                className="rounded-xl border border-gray-300 bg-white p-2.5"
                value={apiaryId}
                onChange={(e) => setApiaryId(e.target.value)}
                required
              >
                <option value="">Select apiary…</option>
                {apiaries.map((apiary) => (
                  <option key={apiary.id} value={apiary.id}>
                    {apiary.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {apiaryId && (
            <div className="mt-4">
              <div className="text-sm font-medium">
                Which hives were actually treated? *
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setHiveSelectionMode("all")}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    hiveSelectionMode === "all"
                      ? "border-[#1a3329] bg-[#1a3329] text-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  All active hives
                </button>

                <button
                  type="button"
                  onClick={() => setHiveSelectionMode("selected")}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    hiveSelectionMode === "selected"
                      ? "border-[#1a3329] bg-[#1a3329] text-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  Select hives
                </button>
              </div>

              {hives.length === 0 ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-gray-700">
                  This apiary has no active hives.
                </div>
              ) : hiveSelectionMode === "all" ? (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                  All {hives.length} active hive{hives.length === 1 ? "" : "s"} in this apiary will
                  be recorded as treated.
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-[#1a3329]">
                      {selectedHiveIds.length} hive{selectedHiveIds.length === 1 ? "" : "s"} selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {hives.map((hive) => (
                      <label
                        key={hive.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:border-amber-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHiveIds.includes(hive.id)}
                          onChange={() => toggleHive(hive.id)}
                        />
                        <span>{hive.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">
            Treatment status and completion
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose whether the treatment is completed at administration or remains in the hive.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setTreatmentMode("one_off")}
              className={`rounded-2xl border p-4 text-left ${
                treatmentMode === "one_off"
                  ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold text-[#1a3329]">One-off administration</div>
              <div className="mt-1 text-sm text-gray-600">
                For treatments such as a drizzle/trickle application that are finished as soon as
                they are administered.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTreatmentMode("remains_in_hive")}
              className={`rounded-2xl border p-4 text-left ${
                treatmentMode === "remains_in_hive"
                  ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold text-[#1a3329]">Treatment remains in hive</div>
              <div className="mt-1 text-sm text-gray-600">
                For strips, trays or other treatments that remain active until you remove or
                complete them.
              </div>
            </button>
          </div>

          {treatmentMode === "remains_in_hive" && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Planned removal and/or completion date *
                </span>
                <input
                  type="date"
                  className="rounded-xl border border-gray-300 p-2.5"
                  min={startedOn || undefined}
                  value={plannedCompletionDate}
                  onChange={(e) => setPlannedCompletionDate(e.target.value)}
                  required
                />
                <span className="text-xs text-gray-500">
                  Enter the date you intend to remove the treatment and/or consider it complete,
                  using the current product instructions. HiveTag does not calculate this date.
                </span>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Action on that date *</span>
                <select
                  className="rounded-xl border border-gray-300 bg-white p-2.5"
                  value={completionAction}
                  onChange={(e) => setCompletionAction(e.target.value)}
                >
                  <option value="remove">Remove treatment</option>
                  <option value="complete">Complete treatment</option>
                </select>
              </label>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Notes</span>
            <textarea
              className="min-h-28 rounded-xl border border-gray-300 p-2.5"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </label>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || effectiveHiveIds.length === 0}
            className="rounded-xl bg-[#1a3329] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#24483a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : treatmentMode === "one_off"
                ? "Record Completed Treatment"
                : "Start Treatment"}
          </button>

          <Link
            to="/veterinary-medicines"
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
