import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  FEED_GUIDANCE,
  FEED_OPTIONS,
  NBU_POLLEN_GUIDANCE_URL,
  NBU_SUGAR_GUIDANCE_URL,
  POLLEN_FEED_OPTIONS,
  REASON_OPTIONS,
  SYRUP_STRENGTHS,
  UNIT_OPTIONS,
  suggestedUnitForFeed,
} from "./feedingGuidance";
import { fetchFeedingWeather } from "./feedingWeather";

const todayIso = () => new Date().toISOString().slice(0, 10);

const roundWater = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return Math.round(numeric * 100) / 100;
};

export default function NewFeeding() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search || ""),
    [location.search]
  );
  const prefillApiaryId = queryParams.get("apiary_id") || "";
  const prefillHiveId = queryParams.get("hive_id") || "";
  const prefillInspectionId = queryParams.get("inspection_id") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [inspections, setInspections] = useState([]);

  const [fedOn, setFedOn] = useState(todayIso());
  const [feedType, setFeedType] = useState("sugar_syrup");
  const [feedTypeOther, setFeedTypeOther] = useState("");
  const [feedSubtype, setFeedSubtype] = useState("");
  const [feedSubtypeOther, setFeedSubtypeOther] = useState("");
  const [productName, setProductName] = useState("");

  const [syrupStrength, setSyrupStrength] = useState("");
  const [customWaterPerKg, setCustomWaterPerKg] = useState("1");
  const [useRecipeHelper, setUseRecipeHelper] = useState(false);
  const [recipeSugarKg, setRecipeSugarKg] = useState(4);

  const [reason, setReason] = useState("not_recorded");
  const [reasonOther, setReasonOther] = useState("");
  const [notes, setNotes] = useState("");
  const [weather, setWeather] = useState("");
  const [weatherCode, setWeatherCode] = useState("");
  const [weatherDisplay, setWeatherDisplay] = useState("");

  const [apiaryId, setApiaryId] = useState(prefillApiaryId);
  const [hiveSelectionMode, setHiveSelectionMode] = useState("selected");
  const [selectedHiveIds, setSelectedHiveIds] = useState(
    prefillHiveId ? [prefillHiveId] : []
  );

  const [sameAmountForAll, setSameAmountForAll] = useState(true);
  const [commonAmount, setCommonAmount] = useState("");
  const [commonUnit, setCommonUnit] = useState("litres");
  const [commonUnitOther, setCommonUnitOther] = useState("");
  const [hiveDetails, setHiveDetails] = useState({});

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("apiaries")
        .select("id,name,latitude,longitude")
        .is("archived_at", null)
        .order("name");

      if (!active) return;

      if (error) {
        setErrorMsg(error.message);
      } else {
        setApiaries(data || []);
      }
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
      setInspections([]);

      if (!apiaryId) return;

      const [hiveResult, inspectionResult] = await Promise.all([
        supabase
          .from("hives")
          .select("id,name,apiary_id")
          .eq("apiary_id", apiaryId)
          .is("archived_at", null)
          .order("name"),
        supabase
          .from("inspections")
          .select("id,date,created_at,apiary_id,hive_id,inspection_type")
          .eq("apiary_id", apiaryId)
          .is("archived_at", null)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (hiveResult.error) {
        setErrorMsg(hiveResult.error.message);
        return;
      }
      if (inspectionResult.error) {
        setErrorMsg(inspectionResult.error.message);
        return;
      }

      const loadedHives = hiveResult.data || [];
      setHives(loadedHives);
      setInspections(inspectionResult.data || []);

      if (
        prefillHiveId &&
        loadedHives.some((hive) => String(hive.id) === String(prefillHiveId))
      ) {
        setHiveSelectionMode("selected");
        setSelectedHiveIds([prefillHiveId]);
      } else {
        setSelectedHiveIds([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [apiaryId, prefillHiveId]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!apiaryId || !fedOn) {
        setWeather("");
        setWeatherCode("");
        setWeatherDisplay("");
        return;
      }

      const apiary = apiaries.find(
        (row) => String(row.id) === String(apiaryId)
      );
      if (!apiary) return;

      const result = await fetchFeedingWeather(apiary, fedOn);
      if (!active) return;

      setWeather(result.weather || "");
      setWeatherCode(result.weatherCode || "");
      setWeatherDisplay(result.display || "");
    })();

    return () => {
      active = false;
    };
  }, [apiaryId, fedOn, apiaries]);

  useEffect(() => {
    const suggested = suggestedUnitForFeed(feedType);
    setCommonUnit(suggested);
    setCommonUnitOther("");

    setHiveDetails((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((hiveId) => {
        next[hiveId] = {
          ...next[hiveId],
          amountUnit: suggested,
          amountUnitOther: "",
        };
      });
      return next;
    });

    if (feedType !== "sugar_syrup") {
      setSyrupStrength("");
      setUseRecipeHelper(false);
    }

    if (feedType !== "pollen_protein") {
      setFeedSubtype("");
      setFeedSubtypeOther("");
    }
  }, [feedType]);

  const effectiveHiveIds = useMemo(
    () =>
      hiveSelectionMode === "all"
        ? hives.map((hive) => hive.id)
        : selectedHiveIds,
    [hiveSelectionMode, hives, selectedHiveIds]
  );

  useEffect(() => {
    const suggested = suggestedUnitForFeed(feedType);

    setHiveDetails((prev) => {
      const next = {};

      effectiveHiveIds.forEach((hiveId) => {
        next[hiveId] = prev[hiveId] || {
          amount: commonAmount,
          amountUnit: commonUnit || suggested,
          amountUnitOther: commonUnitOther,
          inspectionId:
            prefillHiveId &&
            prefillInspectionId &&
            String(prefillHiveId) === String(hiveId)
              ? prefillInspectionId
              : "",
        };
      });

      return next;
    });
  }, [
    effectiveHiveIds,
    feedType,
    commonAmount,
    commonUnit,
    commonUnitOther,
    prefillHiveId,
    prefillInspectionId,
  ]);

  const guidance = FEED_GUIDANCE[feedType] || FEED_GUIDANCE.other;

  const syrupWaterPerKg = useMemo(() => {
    if (syrupStrength === "custom") {
      const value = Number(customWaterPerKg);
      return Number.isFinite(value) && value > 0 ? value : null;
    }

    return SYRUP_STRENGTHS[syrupStrength]?.waterPerKg ?? null;
  }, [syrupStrength, customWaterPerKg]);

  const recipeWaterLitres = useMemo(() => {
    if (!useRecipeHelper || !syrupWaterPerKg) return null;
    return roundWater(Number(recipeSugarKg) * syrupWaterPerKg);
  }, [useRecipeHelper, recipeSugarKg, syrupWaterPerKg]);

  const inspectionsForHive = (hiveId) =>
    inspections.filter((inspection) => String(inspection.hive_id) === String(hiveId));

  const formatInspectionLabel = (inspection) => {
    const date = inspection.date
      ? new Date(`${inspection.date}T12:00:00`).toLocaleDateString("en-GB")
      : "Unknown date";

    const type =
      inspection.inspection_type === "external_check"
        ? "External check"
        : inspection.inspection_type === "observation_only"
          ? "Observation only"
          : "Full inspection";

    return `${date} — ${type}`;
  };

  const toggleHive = (hiveId) => {
    setSelectedHiveIds((prev) =>
      prev.includes(hiveId)
        ? prev.filter((id) => id !== hiveId)
        : [...prev, hiveId]
    );
  };

  const selectAll = () => setSelectedHiveIds(hives.map((hive) => hive.id));
  const clearSelection = () => setSelectedHiveIds([]);

  const updateHiveDetail = (hiveId, field, value) => {
    setHiveDetails((prev) => ({
      ...prev,
      [hiveId]: {
        ...(prev[hiveId] || {}),
        [field]: value,
      },
    }));
  };

  const useDifferentAmounts = () => {
    setSameAmountForAll(false);
    setHiveDetails((prev) => {
      const next = { ...prev };
      effectiveHiveIds.forEach((hiveId) => {
        next[hiveId] = {
          ...(next[hiveId] || {}),
          amount: commonAmount,
          amountUnit: commonUnit,
          amountUnitOther: commonUnitOther,
          inspectionId: next[hiveId]?.inspectionId || "",
        };
      });
      return next;
    });
  };

  const validateAmount = (amount, unit, unitOther, hiveName = "") => {
    const numericAmount = Number(amount);
    const prefix = hiveName ? `${hiveName}: ` : "";

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return `${prefix}enter an amount greater than zero.`;
    }

    if (!unit) return `${prefix}select a unit.`;

    if (unit === "other" && !String(unitOther || "").trim()) {
      return `${prefix}enter the unit used.`;
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    if (!fedOn) return setErrorMsg("Please enter the feeding date.");
    if (!feedType) return setErrorMsg("Please select a feed type.");

    if (feedType === "other" && !feedTypeOther.trim()) {
      return setErrorMsg("Please enter the feed type.");
    }

    if (feedType === "pollen_protein" && !feedSubtype) {
      return setErrorMsg("Please select the pollen / protein feed type.");
    }

    if (feedSubtype === "other" && !feedSubtypeOther.trim()) {
      return setErrorMsg("Please enter the pollen / protein feed type.");
    }

    if (feedType === "sugar_syrup" && !syrupStrength) {
      return setErrorMsg("Please select the syrup strength.");
    }

    if (
      feedType === "sugar_syrup" &&
      syrupStrength === "custom" &&
      (!Number.isFinite(Number(customWaterPerKg)) || Number(customWaterPerKg) <= 0)
    ) {
      return setErrorMsg("Please enter the litres of water used per 1 kg of sugar.");
    }

    if (reason === "other" && !reasonOther.trim()) {
      return setErrorMsg("Please enter the reason for feeding.");
    }

    if (!apiaryId) return setErrorMsg("Please select an apiary.");

    if (effectiveHiveIds.length === 0) {
      return setErrorMsg("Please select at least one hive.");
    }

    const useCommonAmount = sameAmountForAll || effectiveHiveIds.length === 1;

    if (useCommonAmount) {
      const commonError = validateAmount(commonAmount, commonUnit, commonUnitOther);
      if (commonError) return setErrorMsg(commonError);
    } else {
      for (const hiveId of effectiveHiveIds) {
        const hive = hives.find((row) => String(row.id) === String(hiveId));
        const details = hiveDetails[hiveId] || {};
        const rowError = validateAmount(
          details.amount,
          details.amountUnit,
          details.amountUnitOther,
          hive?.name || "Hive"
        );
        if (rowError) return setErrorMsg(rowError);
      }
    }

    setSaving(true);
    let feedingRecordId = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "Not authenticated.");
      }

      const selectedApiary = apiaries.find(
        (apiary) => String(apiary.id) === String(apiaryId)
      );
      if (!selectedApiary) throw new Error("Selected apiary could not be found.");

      const recipeSugar =
        feedType === "sugar_syrup" &&
        syrupStrength !== "not_recorded" &&
        useRecipeHelper
          ? Number(recipeSugarKg)
          : null;

      const recipeWater =
        recipeSugar && syrupWaterPerKg
          ? roundWater(recipeSugar * syrupWaterPerKg)
          : null;

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
            feed_subtype: feedType === "pollen_protein" ? feedSubtype : null,
            feed_subtype_other:
              feedType === "pollen_protein" && feedSubtype === "other"
                ? feedSubtypeOther.trim()
                : null,
            product_name: productName.trim() || null,
            syrup_strength: feedType === "sugar_syrup" ? syrupStrength : null,
            syrup_custom_water_per_kg:
              feedType === "sugar_syrup" && syrupStrength === "custom"
                ? Number(customWaterPerKg)
                : null,
            recipe_sugar_kg: recipeSugar,
            recipe_water_litres: recipeWater,
            reason,
            reason_other: reason === "other" ? reasonOther.trim() : null,
            weather: weather || null,
            weather_code: weatherCode || null,
            notes: notes.trim() || null,
          },
        ])
        .select("id")
        .single();

      if (feedingError) throw feedingError;
      feedingRecordId = feedingRecord.id;

      const hiveRows = effectiveHiveIds.map((hiveId) => {
        const hive = hives.find((row) => String(row.id) === String(hiveId));
        if (!hive) throw new Error("One of the selected hives could not be found.");

        const details = hiveDetails[hiveId] || {};
        const rowAmount = useCommonAmount ? commonAmount : details.amount;
        const rowUnit = useCommonAmount ? commonUnit : details.amountUnit;
        const rowUnitOther = useCommonAmount
          ? commonUnitOther
          : details.amountUnitOther;

        return {
          user_id: user.id,
          feeding_record_id: feedingRecord.id,
          hive_id: hiveId,
          hive_name_snapshot: hive.name,
          amount: Number(rowAmount),
          amount_unit: rowUnit,
          amount_unit_other:
            rowUnit === "other" ? String(rowUnitOther || "").trim() : null,
          inspection_id: details.inspectionId || null,
        };
      });

      const { error: hiveError } = await supabase
        .from("feeding_record_hives")
        .insert(hiveRows);

      if (hiveError) throw hiveError;

      navigate("/feeding", {
        state: {
          feedingMessage: `Feeding recorded for ${effectiveHiveIds.length} hive${
            effectiveHiveIds.length === 1 ? "" : "s"
          }.`,
        },
      });
    } catch (err) {
      if (feedingRecordId) {
        await supabase
          .from("feeding_records")
          .delete()
          .eq("id", feedingRecordId);
      }
      setErrorMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading feeding form…</div>;

  const useCommonAmount = sameAmountForAll || effectiveHiveIds.length === 1;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">
          Record Feeding
        </h1>
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
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
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
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-semibold text-emerald-950">{guidance.title}</h3>
            <p className="mt-1 text-sm text-emerald-900">{guidance.summary}</p>
            <p className="mt-2 text-xs text-emerald-800">{guidance.detail}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {feedType === "pollen_protein" && (
              <div className="flex flex-col gap-1">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Pollen / protein feed type *</span>
                  <select
                    className="rounded-xl border border-gray-300 bg-white p-2.5"
                    value={feedSubtype}
                    onChange={(e) => setFeedSubtype(e.target.value)}
                  >
                    <option value="">Select type…</option>
                    {POLLEN_FEED_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {feedSubtype === "other" && (
                  <label className="mt-2 flex flex-col gap-1">
                    <span className="text-sm font-medium">Other type *</span>
                    <input
                      className="rounded-xl border border-gray-300 p-2.5"
                      value={feedSubtypeOther}
                      onChange={(e) => setFeedSubtypeOther(e.target.value)}
                      placeholder="Enter type"
                    />
                  </label>
                )}
              </div>
            )}

            <label
              className={`flex flex-col gap-1 ${
                feedType === "pollen_protein" ? "" : "md:col-span-2"
              }`}
            >
              <span className="text-sm font-medium">
                Product / description{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </span>
              <input
                className="rounded-xl border border-gray-300 p-2.5"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. prepared syrup brand, fondant or pollen patty"
              />
            </label>
          </div>
        </section>

        {feedType === "sugar_syrup" && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-950">Sugar syrup strength</h2>
            <p className="mt-1 text-sm text-amber-900">
              Choose the strength you used. HiveTag avoids ambiguous “2:1” wording and shows the
              water quantity per 1 kg of white granulated sugar instead.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["thin", "medium", "thick", "custom"].map((value) => {
                const item = SYRUP_STRENGTHS[value];
                const selected = syrupStrength === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSyrupStrength(value)}
                    className={`rounded-xl border p-3 text-left ${
                      selected
                        ? "border-amber-600 bg-white ring-1 ring-amber-500"
                        : "border-amber-200 bg-amber-50 hover:bg-white"
                    }`}
                  >
                    <div className="font-semibold text-amber-950">{item.label}</div>
                    <div className="mt-1 text-xs text-amber-800">
                      {item.waterPerKg
                        ? `1 kg sugar : ${item.waterPerKg} L water`
                        : "Enter your own water amount"}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setSyrupStrength("not_recorded");
                setUseRecipeHelper(false);
              }}
              className={`mt-3 rounded-lg border px-3 py-2 text-xs font-medium ${
                syrupStrength === "not_recorded"
                  ? "border-amber-600 bg-white text-amber-950"
                  : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-white"
              }`}
            >
              Strength not recorded
            </button>

            {syrupStrength && syrupStrength !== "not_recorded" && (
              <>
                <p className="mt-4 text-sm text-amber-900">
                  {SYRUP_STRENGTHS[syrupStrength]?.description}
                </p>

                {syrupStrength === "custom" && (
                  <label className="mt-4 flex max-w-sm flex-col gap-1">
                    <span className="text-sm font-medium text-amber-950">
                      Litres of water per 1 kg sugar *
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="rounded-xl border border-amber-300 bg-white p-2.5"
                      value={customWaterPerKg}
                      onChange={(e) => setCustomWaterPerKg(e.target.value)}
                    />
                  </label>
                )}

                <label className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-white p-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={useRecipeHelper}
                    onChange={(e) => setUseRecipeHelper(e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-amber-950">
                      Use recipe helper
                    </span>
                    <span className="block text-xs text-amber-800">
                      Move the slider to the number of 1 kg sugar bags you are using and HiveTag
                      will calculate the water for the selected strength.
                    </span>
                  </span>
                </label>

                {useRecipeHelper && syrupWaterPerKg && (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-white p-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          Sugar: {recipeSugarKg} kg
                        </div>
                        <div className="text-xs text-gray-500">
                          {recipeSugarKg} × 1 kg bag{Number(recipeSugarKg) === 1 ? "" : "s"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-wide text-gray-500">
                          Add approximately
                        </div>
                        <div className="text-2xl font-bold text-[#1a3329]">
                          {recipeWaterLitres} L water
                        </div>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="1"
                      value={recipeSugarKg}
                      onChange={(e) => setRecipeSugarKg(Number(e.target.value))}
                      className="mt-4 w-full accent-green-700"
                      aria-label="Sugar quantity in 1 kilogram bags"
                    />

                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>1 kg</span>
                      <span>25 kg</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <p className="mt-4 text-xs text-amber-900">
              HiveTag does not apply a fixed temperature cut-off for liquid feed. Consider colony
              stores, season, weather and whether the bees are able to take down and process syrup.
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <a
                href={NBU_SUGAR_GUIDANCE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline"
              >
                National Bee Unit sugar-feeding guidance
              </a>
            </div>
          </section>
        )}

        {feedType === "pollen_protein" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
            <strong>Protein feed is not a substitute for carbohydrate stores.</strong>{" "}
            If the colony is short of food, make sure its energy needs are also addressed.{" "}
            <a
              href={NBU_POLLEN_GUIDANCE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline"
            >
              National Bee Unit pollen-feeding guidance
            </a>
          </div>
        )}

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
                setSelectedHiveIds([]);
              }}
            >
              <option value="">Select apiary…</option>
              {apiaries.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>
                  {apiary.name}
                </option>
              ))}
            </select>
          </label>

          {apiaryId && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <strong>Weather:</strong>{" "}
              {weatherDisplay || "Weather unavailable for this apiary/date."}
            </div>
          )}

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
                  The feeding will be recorded against all {hives.length} active hive
                  {hives.length === 1 ? "" : "s"} in this apiary.
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-[#1a3329]">
                      {selectedHiveIds.length} hive
                      {selectedHiveIds.length === 1 ? "" : "s"} selected
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

        {effectiveHiveIds.length > 0 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a3329]">
              Amounts and related inspections
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Record what each colony actually received. A related inspection is optional.
            </p>

            {effectiveHiveIds.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSameAmountForAll(true)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    sameAmountForAll
                      ? "border-[#1a3329] bg-[#1a3329] text-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  Same amount for each hive
                </button>
                <button
                  type="button"
                  onClick={useDifferentAmounts}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    !sameAmountForAll
                      ? "border-[#1a3329] bg-[#1a3329] text-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  Different amounts by hive
                </button>
              </div>
            )}

            {useCommonAmount && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Amount per hive *</span>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    className="rounded-xl border border-gray-300 p-2.5"
                    value={commonAmount}
                    onChange={(e) => setCommonAmount(e.target.value)}
                    placeholder="e.g. 2"
                  />
                </label>

                <div className="flex flex-col gap-1">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Unit *</span>
                    <select
                      className="rounded-xl border border-gray-300 bg-white p-2.5"
                      value={commonUnit}
                      onChange={(e) => setCommonUnit(e.target.value)}
                    >
                      {UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {commonUnit === "other" && (
                    <label className="mt-2 flex flex-col gap-1">
                      <span className="text-sm font-medium">Other unit *</span>
                      <input
                        className="rounded-xl border border-gray-300 p-2.5"
                        value={commonUnitOther}
                        onChange={(e) => setCommonUnitOther(e.target.value)}
                        placeholder="Enter unit"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {effectiveHiveIds.map((hiveId) => {
                const hive = hives.find((row) => String(row.id) === String(hiveId));
                const details = hiveDetails[hiveId] || {};
                const hiveInspections = inspectionsForHive(hiveId);

                return (
                  <div
                    key={hiveId}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="font-semibold text-[#1a3329]">
                      {hive?.name || "Hive"}
                    </div>

                    <div
                      className={`mt-3 grid grid-cols-1 gap-4 ${
                        useCommonAmount ? "md:grid-cols-1" : "md:grid-cols-3"
                      }`}
                    >
                      {!useCommonAmount && (
                        <>
                          <label className="flex flex-col gap-1">
                            <span className="text-sm font-medium">Amount *</span>
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              className="rounded-xl border border-gray-300 bg-white p-2.5"
                              value={details.amount || ""}
                              onChange={(e) =>
                                updateHiveDetail(hiveId, "amount", e.target.value)
                              }
                            />
                          </label>

                          <div className="flex flex-col gap-1">
                            <label className="flex flex-col gap-1">
                              <span className="text-sm font-medium">Unit *</span>
                              <select
                                className="rounded-xl border border-gray-300 bg-white p-2.5"
                                value={details.amountUnit || suggestedUnitForFeed(feedType)}
                                onChange={(e) =>
                                  updateHiveDetail(hiveId, "amountUnit", e.target.value)
                                }
                              >
                                {UNIT_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            {details.amountUnit === "other" && (
                              <input
                                className="mt-2 rounded-xl border border-gray-300 bg-white p-2.5"
                                value={details.amountUnitOther || ""}
                                onChange={(e) =>
                                  updateHiveDetail(
                                    hiveId,
                                    "amountUnitOther",
                                    e.target.value
                                  )
                                }
                                placeholder="Other unit"
                              />
                            )}
                          </div>
                        </>
                      )}

                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          Related inspection{" "}
                          <span className="font-normal text-gray-500">(optional)</span>
                        </span>
                        <select
                          className="rounded-xl border border-gray-300 bg-white p-2.5"
                          value={details.inspectionId || ""}
                          onChange={(e) =>
                            updateHiveDetail(hiveId, "inspectionId", e.target.value)
                          }
                        >
                          <option value="">None</option>
                          {hiveInspections.map((inspection) => (
                            <option key={inspection.id} value={inspection.id}>
                              {formatInspectionLabel(inspection)}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-gray-500">
                          Links this feeding to a saved inspection for this hive.
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Reason for feeding</span>
                <select
                  className="rounded-xl border border-gray-300 bg-white p-2.5"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
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

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Notes <span className="font-normal text-gray-500">(optional)</span>
              </span>
              <textarea
                rows={4}
                className="rounded-xl border border-gray-300 p-2.5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this feeding"
              />
            </label>
          </div>
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
