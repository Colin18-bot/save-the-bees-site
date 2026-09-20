import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  BBKA_MARCH_GUIDANCE_URL,
  MAIN_GUIDANCE_CARDS,
  NBU_POLLEN_GUIDANCE_URL,
  NBU_SUGAR_GUIDANCE_URL,
  feedTypeLabel,
  formatAmount,
  pollenFeedLabel,
  reasonLabel,
  syrupStrengthLabel,
} from "./feedingGuidance";

const fmtDate = (value) => {
  if (!value) return "";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
};

export default function FeedingList() {
  const location = useLocation();
  const navigate = useNavigate();
  const highlightRef = useRef(null);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search || ""),
    [location.search]
  );
  const prefillApiaryId = queryParams.get("apiary_id") || "";
  const prefillHiveId = queryParams.get("hive_id") || "";
  const highlightId = queryParams.get("highlight") || "";

  const [records, setRecords] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [hives, setHives] = useState([]);
  const [apiaryId, setApiaryId] = useState(prefillApiaryId);
  const [hiveId, setHiveId] = useState(prefillHiveId);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(
    location.state?.feedingMessage || ""
  );

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
              "id,apiary_id,apiary_name_snapshot,fed_on,feed_type,feed_type_other,feed_subtype,feed_subtype_other,product_name,syrup_strength,syrup_custom_water_per_kg,recipe_sugar_kg,recipe_water_litres,reason,reason_other,notes,created_at,feeding_record_hives(id,hive_id,hive_name_snapshot,amount,amount_unit,amount_unit_other,inspection_id)"
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

  useEffect(() => {
    if (!successMsg) return undefined;
    const timer = window.setTimeout(() => setSuccessMsg(""), 5000);
    return () => window.clearTimeout(timer);
  }, [successMsg]);

  useEffect(() => {
    if (!loading && highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, highlightId, records]);

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

  const clearHighlight = () => {
    const params = new URLSearchParams(location.search || "");
    params.delete("highlight");
    navigate({ search: params.toString() }, { replace: true });
  };

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

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-emerald-950">Feeding guidance</h2>
          <p className="text-sm text-emerald-900">
            Use colony condition, stores, season and local weather to decide whether feeding is
            needed. HiveTag provides general UK guidance and does not apply a single temperature
            cut-off.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {MAIN_GUIDANCE_CARDS.map((card) => (
            <details
              key={card.title}
              className="rounded-xl border border-emerald-200 bg-white p-4"
            >
              <summary className="cursor-pointer font-semibold text-[#1a3329]">
                {card.title}
              </summary>
              <p className="mt-2 text-sm text-gray-700">{card.summary}</p>
              <p className="mt-2 text-xs text-gray-600">{card.detail}</p>
            </details>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3 text-xs text-gray-700">
          <strong>Sugar-syrup reference:</strong> thin ≈ 1 kg sugar to 1.26 L water;
          medium = 1 kg sugar to 1 L water; thick / autumn strength = 1 kg sugar to
          about 0.63 L water. The Record Feeding page includes a recipe slider.
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href={NBU_SUGAR_GUIDANCE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            National Bee Unit – sugar feeding
          </a>
          <a
            href={NBU_POLLEN_GUIDANCE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            National Bee Unit – pollen and substitutes
          </a>
          <a
            href={BBKA_MARCH_GUIDANCE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            BBKA – spring feeding example
          </a>
        </div>
      </section>

      {successMsg && (
        <div className="mt-5 rounded-xl border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Apiary</span>
            <select
              value={apiaryId}
              onChange={(e) => {
                setApiaryId(e.target.value);
                setHiveId("");
                clearHighlight();
              }}
              className="rounded-xl border border-gray-300 bg-white p-2.5"
            >
              <option value="">All apiaries</option>
              {apiaries.map((apiary) => (
                <option key={apiary.id} value={apiary.id}>
                  {apiary.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Hive</span>
            <select
              value={hiveId}
              onChange={(e) => {
                setHiveId(e.target.value);
                clearHighlight();
              }}
              className="rounded-xl border border-gray-300 bg-white p-2.5"
            >
              <option value="">All hives</option>
              {availableHives.map((hive) => (
                <option key={hive.id} value={hive.id}>
                  {hive.name}
                </option>
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
            const feedLabel = feedTypeLabel(record.feed_type, record.feed_type_other);
            const pollenLabel = pollenFeedLabel(
              record.feed_subtype,
              record.feed_subtype_other
            );
            const why = reasonLabel(record.reason, record.reason_other);
            const hivesForRecord = record.feeding_record_hives || [];
            const highlighted = highlightId && String(record.id) === String(highlightId);

            return (
              <article
                key={record.id}
                ref={highlighted ? highlightRef : undefined}
                className={`rounded-2xl border bg-white p-4 md:p-5 shadow-sm transition ${
                  highlighted
                    ? "border-amber-400 ring-2 ring-amber-300"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      {fmtDate(record.fed_on)} · {record.apiary_name_snapshot}
                    </div>
                    <h2 className="mt-1 text-lg font-semibold text-[#1a3329]">
                      {feedLabel}
                    </h2>

                    {pollenLabel && (
                      <p className="text-sm text-gray-600">{pollenLabel}</p>
                    )}

                    {record.product_name && (
                      <p className="text-sm text-gray-600">{record.product_name}</p>
                    )}
                  </div>

                  {record.feed_type === "sugar_syrup" && record.syrup_strength && (
                    <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      {syrupStrengthLabel(record.syrup_strength)}
                    </span>
                  )}
                </div>

                {record.feed_type === "sugar_syrup" &&
                  record.recipe_sugar_kg &&
                  record.recipe_water_litres && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                      Recipe recorded: {record.recipe_sugar_kg} kg sugar +{" "}
                      {record.recipe_water_litres} L water.
                    </div>
                  )}

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {hivesForRecord.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="font-semibold text-gray-900">
                        {row.hive_name_snapshot}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatAmount(row.amount, row.amount_unit, row.amount_unit_other)}
                      </div>

                      {row.inspection_id && (
                        <Link
                          to={`/inspections?highlight=${encodeURIComponent(
                            row.inspection_id
                          )}&type=INSPECTION&hive_id=${encodeURIComponent(
                            row.hive_id || ""
                          )}`}
                          className="mt-2 inline-block text-xs text-blue-700 hover:underline"
                        >
                          View related inspection →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {why && why !== "Not recorded" && (
                  <p className="mt-4 text-sm text-gray-700">
                    <strong>Reason:</strong> {why}
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
