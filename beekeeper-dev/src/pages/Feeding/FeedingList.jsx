import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabase";

const FEED_LABELS = {
  sugar_syrup: "Sugar syrup",
  fondant: "Fondant",
  invert_syrup: "Invert / prepared syrup",
  pollen_substitute: "Pollen substitute / patty",
  dry_sugar: "Dry sugar",
  other: "Other",
};

const REASON_LABELS = {
  build_stores: "Build stores",
  low_stores: "Low stores / emergency",
  nuc_split_support: "Nuc / split support",
  spring_support: "Spring support",
  other: "Other",
  not_recorded: "Not recorded",
};

const UNIT_LABELS = {
  litres: "L",
  millilitres: "ml",
  kilograms: "kg",
  grams: "g",
  patties: "patties",
  blocks: "blocks",
  other: "",
};

const fmtDate = (value) => {
  if (!value) return "";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
};

const fmtAmount = (row) => {
  const amount = Number(row.amount);
  const amountText = Number.isFinite(amount)
    ? amount.toLocaleString("en-GB", { maximumFractionDigits: 3 })
    : row.amount;
  const unit = row.amount_unit === "other"
    ? row.amount_unit_other || ""
    : UNIT_LABELS[row.amount_unit] || row.amount_unit || "";
  return `${amountText} ${unit}`.trim();
};

export default function FeedingList() {
  const [records, setRecords] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [apiaryId, setApiaryId] = useState("");
  const [hiveId, setHiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const [
          { data: feedingData, error: feedingError },
          { data: apiaryData, error: apiaryError },
          { data: hiveData, error: hiveError },
        ] = await Promise.all([
          supabase
            .from("feeding_records")
            .select(
              "id,apiary_id,apiary_name_snapshot,fed_on,feed_type,feed_type_other,product_name,syrup_ratio,syrup_ratio_other,reason,reason_other,notes,created_at,feeding_record_hives(id,hive_id,hive_name_snapshot,amount,amount_unit,amount_unit_other)"
            )
            .order("fed_on", { ascending: false })
            .order("created_at", { ascending: false }),
          supabase
            .from("apiaries")
            .select("id,name")
            .is("archived_at", null)
            .order("name"),
          supabase
            .from("hives")
            .select("id,name,apiary_id")
            .is("archived_at", null)
            .order("name"),
        ]);

        if (feedingError) throw feedingError;
        if (apiaryError) throw apiaryError;
        if (hiveError) throw hiveError;
        if (!active) return;

        setRecords(feedingData || []);
        setApiaries(apiaryData || []);
        setHives(hiveData || []);
      } catch (err) {
        if (active) setErrorMsg(err.message || String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const availableHives = useMemo(
    () => (apiaryId ? hives.filter((hive) => hive.apiary_id === apiaryId) : hives),
    [apiaryId, hives]
  );

  const filtered = useMemo(
    () =>
      records.filter((record) => {
        if (apiaryId && record.apiary_id !== apiaryId) return false;
        if (
          hiveId &&
          !(record.feeding_record_hives || []).some((row) => row.hive_id === hiveId)
        ) {
          return false;
        }
        return true;
      }),
    [records, apiaryId, hiveId]
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a3329]">Feeding</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Record feed actually given to your colonies and review feeding history by apiary or hive.
          </p>
        </div>

        <Link
          to="/feeding/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#1a3329] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#24483a]"
        >
          + Record Feeding
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Apiary</span>
            <select
              value={apiaryId}
              onChange={(e) => {
                setApiaryId(e.target.value);
                setHiveId("");
              }}
              className="rounded-xl border border-gray-300 bg-white p-2.5"
            >
              <option value="">All apiaries</option>
              {apiaries.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Hive</span>
            <select
              value={hiveId}
              onChange={(e) => setHiveId(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white p-2.5"
            >
              <option value="">All hives</option>
              {availableHives.map((hive) => (
                <option key={hive.id} value={hive.id}>{hive.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-sm text-gray-600">Loading feeding records…</div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">No feeding records yet</h2>
          <p className="mt-1 text-sm text-gray-600">
            Record the next feed you give to one or more hives.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((record) => {
            const feedLabel =
              record.feed_type === "other"
                ? record.feed_type_other || "Other"
                : FEED_LABELS[record.feed_type] || record.feed_type;
            const reasonLabel =
              record.reason === "other"
                ? record.reason_other || "Other"
                : REASON_LABELS[record.reason] || record.reason;
            const hivesForRecord = record.feeding_record_hives || [];

            return (
              <article
                key={record.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      {fmtDate(record.fed_on)} · {record.apiary_name_snapshot}
                    </div>
                    <h2 className="mt-1 text-lg font-semibold text-[#1a3329]">{feedLabel}</h2>
                    {record.product_name && (
                      <p className="text-sm text-gray-600">{record.product_name}</p>
                    )}
                  </div>

                  {record.feed_type === "sugar_syrup" && record.syrup_ratio && (
                    <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      Ratio: {record.syrup_ratio === "other"
                        ? record.syrup_ratio_other || "Other"
                        : record.syrup_ratio === "not_recorded"
                          ? "Not recorded"
                          : record.syrup_ratio}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {hivesForRecord.map((row) => (
                    <div key={row.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="font-semibold text-gray-900">{row.hive_name_snapshot}</div>
                      <div className="mt-1 text-sm text-gray-600">{fmtAmount(row)}</div>
                    </div>
                  ))}
                </div>

                {reasonLabel && reasonLabel !== "Not recorded" && (
                  <p className="mt-4 text-sm text-gray-700">
                    <strong>Reason:</strong> {reasonLabel}
                  </p>
                )}

                {record.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    <strong>Notes:</strong> {record.notes}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
