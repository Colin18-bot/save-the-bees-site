import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";

const todayIso = () => new Date().toISOString().slice(0, 10);

const FEED_OPTIONS = [
  { value: "sugar_syrup", label: "Sugar syrup" },
  { value: "fondant", label: "Fondant" },
  { value: "invert_syrup", label: "Invert / prepared syrup" },
  { value: "pollen_substitute", label: "Pollen substitute / patty" },
  { value: "dry_sugar", label: "Dry sugar" },
  { value: "other", label: "Other" },
];

const REASON_OPTIONS = [
  { value: "build_stores", label: "Build stores" },
  { value: "low_stores", label: "Low stores / emergency" },
  { value: "nuc_split_support", label: "Nuc / split support" },
  { value: "spring_support", label: "Spring support" },
  { value: "not_recorded", label: "Not recorded" },
  { value: "other", label: "Other" },
];

const UNIT_OPTIONS = [
  { value: "litres", label: "Litres (L)" },
  { value: "millilitres", label: "Millilitres (ml)" },
  { value: "kilograms", label: "Kilograms (kg)" },
  { value: "grams", label: "Grams (g)" },
  { value: "patties", label: "Patties" },
  { value: "blocks", label: "Blocks" },
  { value: "other", label: "Other" },
];

export default function NewFeeding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);

  const [fedOn, setFedOn] = useState(todayIso());
  const [feedType, setFeedType] = useState("sugar_syrup");
  const [feedTypeOther, setFeedTypeOther] = useState("");
  const [productName, setProductName] = useState("");
  const [syrupRatio, setSyrupRatio] = useState("2:1");
  const [syrupRatioOther, setSyrupRatioOther] = useState("");
  const [reason, setReason] = useState("build_stores");
  const [reasonOther, setReasonOther] = useState("");
  const [amount, setAmount] = useState("");
  const [amountUnit, setAmountUnit] = useState("litres");
  const [amountUnitOther, setAmountUnitOther] = useState("");
  const [notes, setNotes] = useState("");

  const [apiaryId, setApiaryId] = useState("");
  const [hiveSelectionMode, setHiveSelectionMode] = useState("selected");
  const [selectedHiveIds, setSelectedHiveIds] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("apiaries")
        .select("id,name")
        .is("archived_at", null)
        .order("name");

      if (!active) return;
      if (error) setErrorMsg(error.message);
      setApiaries(data || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setHives([]);
      setSelectedHiveIds([]);
      if (!apiaryId) return;

      const { data, error } = await supabase
        .from("hives")
        .select("id,name,apiary_id")
        .eq("apiary_id", apiaryId)
        .is("archived_at", null)
        .order("name");

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

  useEffect(() => {
    if (feedType !== "sugar_syrup") {
      setSyrupRatio("");
      setSyrupRatioOther("");
    } else if (!syrupRatio) {
      setSyrupRatio("2:1");
    }

    if (feedType === "fondant" || feedType === "pollen_substitute" || feedType === "dry_sugar") {
      if (amountUnit === "litres" || amountUnit === "millilitres") {
        setAmountUnit(feedType === "pollen_substitute" ? "patties" : "kilograms");
      }
    }

    if (feedType === "sugar_syrup" || feedType === "invert_syrup") {
      if (["kilograms", "grams", "patties", "blocks"].includes(amountUnit)) {
        setAmountUnit("litres");
      }
    }
  }, [feedType, amountUnit, syrupRatio]);

  const effectiveHiveIds = useMemo(
    () => (hiveSelectionMode === "all" ? hives.map((hive) => hive.id) : selectedHiveIds),
    [hiveSelectionMode, hives, selectedHiveIds]
  );

  const toggleHive = (id) => {
    setSelectedHiveIds((prev) =>
      prev.includes(id) ? prev.filter((hiveId) => hiveId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedHiveIds(hives.map((hive) => hive.id));
  const clearSelection = () => setSelectedHiveIds([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    if (!fedOn) return setErrorMsg("Please enter the feeding date.");
    if (!feedType) return setErrorMsg("Please select a feed type.");
    if (feedType === "other" && !feedTypeOther.trim()) {
      return setErrorMsg("Please enter the feed type.");
    }
    if (feedType === "sugar_syrup" && !syrupRatio) {
      return setErrorMsg("Please select the syrup ratio or choose Not recorded.");
    }
    if (syrupRatio === "other" && !syrupRatioOther.trim()) {
      return setErrorMsg("Please enter the syrup ratio used.");
    }
    if (reason === "other" && !reasonOther.trim()) {
      return setErrorMsg("Please enter the reason for feeding.");
    }
    if (!apiaryId) return setErrorMsg("Please select an apiary.");
    if (effectiveHiveIds.length === 0) {
      return setErrorMsg("Please select at least one hive.");
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return setErrorMsg("Please enter an amount greater than zero.");
    }
    if (amountUnit === "other" && !amountUnitOther.trim()) {
      return setErrorMsg("Please enter the unit used.");
    }

    setSaving(true);
    let feedingRecordId = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error(userError?.message || "Not authenticated.");

      const selectedApiary = apiaries.find((apiary) => apiary.id === apiaryId);
      if (!selectedApiary) throw new Error("Selected apiary could not be found.");

      const { data: feedingRecord, error: feedingError } = await supabase
        .from("feeding_records")
        .insert([
          {
            user_id: user.id,
            apiary_id: apiaryId,
            apiary_name_snapshot: selectedApiary.name,
            fed_on: fedOn,
            feed_type: feedType,
            feed_type_other: feedType === "other" ? feedTypeOther.trim() : null,
            product_name: productName.trim() || null,
            syrup_ratio: feedType === "sugar_syrup" ? syrupRatio : null,
            syrup_ratio_other:
              feedType === "sugar_syrup" && syrupRatio === "other"
                ? syrupRatioOther.trim()
                : null,
            reason,
            reason_other: reason === "other" ? reasonOther.trim() : null,
            notes: notes.trim() || null,
          },
        ])
        .select("id")
        .single();

      if (feedingError) throw feedingError;
      feedingRecordId = feedingRecord.id;

      const hiveRows = effectiveHiveIds.map((hiveId) => {
        const hive = hives.find((row) => row.id === hiveId);
        if (!hive) throw new Error("One of the selected hives could not be found.");

        return {
          user_id: user.id,
          feeding_record_id: feedingRecord.id,
          hive_id: hiveId,
          hive_name_snapshot: hive.name,
          amount: numericAmount,
          amount_unit: amountUnit,
          amount_unit_other: amountUnit === "other" ? amountUnitOther.trim() : null,
        };
      });

      const { error: hiveError } = await supabase
        .from("feeding_record_hives")
        .insert(hiveRows);

      if (hiveError) throw hiveError;

      navigate("/feeding");
    } catch (err) {
      if (feedingRecordId) {
        await supabase.from("feeding_records").delete().eq("id", feedingRecordId);
      }
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading feeding form…</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">Record Feeding</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">
          Record feed actually given to one, several or all active hives in an apiary.
        </p>
        <p className="mt-2 text-xs font-medium text-gray-500">* Required field</p>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">Feeding details</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Date fed *</span>
              <input
                type="date"
                className="rounded-xl border border-gray-300 p-2.5"
                value={fedOn}
                onChange={(e) => setFedOn(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Feed type *</span>
              <select
                className="rounded-xl border border-gray-300 bg-white p-2.5"
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
              >
                {FEED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            {feedType === "other" && (
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium">Other feed type *</span>
                <input
                  className="rounded-xl border border-gray-300 p-2.5"
                  value={feedTypeOther}
                  onChange={(e) => setFeedTypeOther(e.target.value)}
                  placeholder="Enter feed type"
                />
              </label>
            )}

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Product / description <span className="font-normal text-gray-500">(optional)</span></span>
              <input
                className="rounded-xl border border-gray-300 p-2.5"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. prepared invert syrup, fondant brand or pollen patty"
              />
            </label>

            {feedType === "sugar_syrup" && (
              <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-amber-950">Sugar syrup ratio *</span>
                  <select
                    className="rounded-xl border border-amber-300 bg-white p-2.5"
                    value={syrupRatio}
                    onChange={(e) => setSyrupRatio(e.target.value)}
                  >
                    <option value="1:1">1:1</option>
                    <option value="2:1">2:1</option>
                    <option value="not_recorded">Not recorded</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                {syrupRatio === "other" && (
                  <label className="mt-3 flex flex-col gap-1">
                    <span className="text-sm font-medium text-amber-950">Other ratio *</span>
                    <input
                      className="rounded-xl border border-amber-300 bg-white p-2.5"
                      value={syrupRatioOther}
                      onChange={(e) => setSyrupRatioOther(e.target.value)}
                      placeholder="Enter ratio"
                    />
                  </label>
                )}

                <p className="mt-3 text-xs text-amber-900">
                  Reference: 1:1 = 1 kg sugar to 1 litre water. 2:1 = 2 kg sugar to 1 litre water.
                </p>
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Amount per hive *</span>
              <input
                type="number"
                min="0"
                step="0.001"
                className="rounded-xl border border-gray-300 p-2.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2"
              />
              <span className="text-xs text-gray-500">
                The same amount will be recorded against each selected hive.
              </span>
            </label>

            <div className="flex flex-col gap-1">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Unit *</span>
                <select
                  className="rounded-xl border border-gray-300 bg-white p-2.5"
                  value={amountUnit}
                  onChange={(e) => setAmountUnit(e.target.value)}
                >
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              {amountUnit === "other" && (
                <label className="mt-2 flex flex-col gap-1">
                  <span className="text-sm font-medium">Other unit *</span>
                  <input
                    className="rounded-xl border border-gray-300 p-2.5"
                    value={amountUnitOther}
                    onChange={(e) => setAmountUnitOther(e.target.value)}
                    placeholder="Enter unit"
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Reason for feeding</span>
                <select
                  className="rounded-xl border border-gray-300 bg-white p-2.5"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              {reason === "other" && (
                <label className="mt-2 flex flex-col gap-1">
                  <span className="text-sm font-medium">Other reason *</span>
                  <input
                    className="rounded-xl border border-gray-300 p-2.5"
                    value={reasonOther}
                    onChange={(e) => setReasonOther(e.target.value)}
                    placeholder="Enter reason"
                  />
                </label>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3329]">Apiary and hives</h2>

          <label className="mt-4 flex flex-col gap-1">
            <span className="text-sm font-medium">Apiary *</span>
            <select
              className="rounded-xl border border-gray-300 bg-white p-2.5"
              value={apiaryId}
              onChange={(e) => {
                setApiaryId(e.target.value);
                setHiveSelectionMode("selected");
              }}
            >
              <option value="">Select apiary…</option>
              {apiaries.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
              ))}
            </select>
          </label>

          {apiaryId && (
            <div className="mt-4">
              <div className="text-sm font-medium">Which hives were fed? *</div>

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
                  The feeding will be recorded against all {hives.length} active hive{hives.length === 1 ? "" : "s"} in this apiary.
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

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {hives.map((hive) => (
                      <label
                        key={hive.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHiveIds.includes(hive.id)}
                          onChange={() => toggleHive(hive.id)}
                        />
                        <span className="text-sm font-medium">{hive.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Notes <span className="font-normal text-gray-500">(optional)</span></span>
            <textarea
              rows={4}
              className="rounded-xl border border-gray-300 p-2.5"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this feeding"
            />
          </label>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/feeding"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || effectiveHiveIds.length === 0}
            className="rounded-xl bg-[#1a3329] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#24483a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Record Feeding"}
          </button>
        </div>
      </form>
    </div>
  );
}
