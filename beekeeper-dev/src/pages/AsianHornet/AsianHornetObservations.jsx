import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "../../services/supabase";

const PAGE_SIZE = 9;

const IDENTIFICATION_LABELS = {
  unsure: "Unsure",
  possible: "Possible Asian Hornet",
  suspected: "Suspected Asian Hornet",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AsianHornetObservations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
  useSearchParams();

  const [observations, setObservations] = useState([]);
  const [apiaries, setApiaries] = useState([]);

  const [statusFilter, setStatusFilter] =
  useState(() => {
    const requested =
      searchParams.get("status");

    if (
      requested === "needs_reporting" ||
      requested === "reported"
    ) {
      return requested;
    }

    return "all";
  });
  const [apiaryFilter, setApiaryFilter] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadApiaries() {
      const { data } = await supabase
        .from("apiaries")
        .select("id, name")
        .is("archived_at", null)
        .order("name");

      setApiaries(data || []);
    }

    loadApiaries();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadObservations() {
      setLoading(true);
      setErrorMessage("");

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("asian_hornet_observations")
        .select(
          `
            id,
            observed_at,
            latitude,
            longitude,
            location_text,
            identification_status,
            report_status,
            reported_at,
            nest_suspected,
            apiary_id,
            apiaries (
              name
            )
          `,
          { count: "exact" }
        )
        .eq("record_status", "complete")
        .order("observed_at", { ascending: false })
        .range(from, to);

      if (statusFilter === "needs_reporting") {
        query = query
          .eq("report_status", "not_reported")
          .in("identification_status", [
            "possible",
            "suspected",
          ]);
      }

      if (statusFilter === "reported") {
        query = query.eq("report_status", "reported");
      }

      if (apiaryFilter) {
        query = query.eq("apiary_id", apiaryFilter);
      }

      const {
        data,
        error,
        count,
      } = await query;

      if (!mounted) return;

      if (error) {
        console.error(
          "Load Asian Hornet observations:",
          error
        );

        setErrorMessage(
          "Your Asian Hornet observations could not be loaded."
        );

        setLoading(false);
        return;
      }

      const rows = data || [];

      // ------------------------------------------------------
      // Get first photograph for each observation.
      // ------------------------------------------------------

      const ids = rows.map((row) => row.id);
      const firstPhotoMap = {};

      if (ids.length > 0) {
        const { data: photoRows } = await supabase
          .from("asian_hornet_observation_photos")
          .select(`
            observation_id,
            original_path,
            sort_order
          `)
          .in("observation_id", ids)
          .order("sort_order");

        for (const photo of photoRows || []) {
          if (!firstPhotoMap[photo.observation_id]) {
            firstPhotoMap[photo.observation_id] = photo;
          }
        }
      }

      const preparedRows = await Promise.all(
        rows.map(async (row) => {
          const firstPhoto = firstPhotoMap[row.id];

          if (!firstPhoto?.original_path) {
            return {
              ...row,
              thumbnailUrl: null,
            };
          }

          const { data: signed } =
            await supabase.storage
              .from("asian-hornet")
              .createSignedUrl(
                firstPhoto.original_path,
                60 * 60
              );

          return {
            ...row,
            thumbnailUrl:
              signed?.signedUrl || null,
          };
        })
      );

      if (!mounted) return;

      setObservations(preparedRows);
      setTotal(count || 0);
      setLoading(false);
    }

    loadObservations();

    return () => {
      mounted = false;
    };
  }, [
    statusFilter,
    apiaryFilter,
    page,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  function changeStatus(value) {
    setStatusFilter(value);
    setPage(1);

    if (value === "all") {
      setSearchParams(
        {},
        { replace: true }
      );
    } else {
      setSearchParams(
        { status: value },
        { replace: true }
      );
    }
  }

  function changeApiary(value) {
    setApiaryFilter(value);
    setPage(1);
  }

  function locationLabel(observation) {
    if (observation.apiaries?.name) {
      return observation.apiaries.name;
    }

    if (observation.location_text) {
      return observation.location_text;
    }

    if (
      observation.latitude != null &&
      observation.longitude != null
    ) {
      return "GPS location";
    }

    return "Location not recorded";
  }

  return (
    <main
      aria-labelledby="asian-hornet-observations-heading"
      className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"
    >
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/asian-hornet")
            }
            className="mb-3 min-h-[44px] rounded-lg px-2 text-sm font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          >
            ← Asian Hornet Centre
          </button>

          <h1
            id="asian-hornet-observations-heading"
            className="text-3xl font-bold text-gray-900"
          >
            My Observations
          </h1>

          <p className="mt-2 text-gray-600">
            Your private Yellow-legged Asian Hornet
            observation records.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/asian-hornet/photo")
          }
          className="min-h-[44px] rounded-xl bg-[#1a3329] px-5 py-3 font-semibold text-white hover:bg-[#24483a] focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          + Record Observation
        </button>
      </div>

      {/* Filters */}
      <section
        aria-labelledby="asian-hornet-observation-filters-heading"
        className="rounded-2xl border bg-white p-4 shadow-sm"
      >
        <h2
          id="asian-hornet-observation-filters-heading"
          className="sr-only"
        >
          Observation filters
        </h2>

        <div
          role="group"
          aria-label="Reporting status filter"
          className="flex flex-wrap gap-2"
        >
          {[
            ["all", "All"],
            [
              "needs_reporting",
              "Needs Reporting",
            ],
            ["reported", "Reported"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                changeStatus(value)
              }
              aria-pressed={statusFilter === value}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 ${
                statusFilter === value
                  ? "bg-[#1a3329] text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label
            htmlFor="apiary-filter"
            className="block text-sm font-semibold text-gray-700"
          >
            Apiary
          </label>

          <select
            id="apiary-filter"
            value={apiaryFilter}
            onChange={(event) =>
              changeApiary(
                event.target.value
              )
            }
            className="mt-1 min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 sm:max-w-sm"
          >
            <option value="">
              All apiaries
            </option>

            {apiaries.map((apiary) => (
              <option
                key={apiary.id}
                value={apiary.id}
              >
                {apiary.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-medium text-red-800">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border bg-white p-8 text-center text-gray-600"
        >
          Loading observations…
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !errorMessage &&
        observations.length === 0 && (
          <section
            role="status"
            aria-live="polite"
            className="rounded-2xl border bg-white p-8 text-center shadow-sm"
          >
            <div className="text-4xl">
              🔎
            </div>

            <h2 className="mt-3 text-xl font-bold text-gray-900">
              No matching observations
            </h2>

            <p className="mt-2 text-gray-600">
              There are no completed observations
              matching these filters.
            </p>
          </section>
        )}

      {/* Cards */}
      {!loading &&
        observations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {observations.map(
              (observation) => {
                const needsReporting =
                  observation.report_status ===
                    "not_reported" &&
                  ["possible", "suspected"].includes(
                    observation.identification_status
                  );

                return (
                  <button
                    key={observation.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/asian-hornet/observations/${observation.id}`
                      )
                    }
                    aria-label={`View observation at ${locationLabel(observation)}, ${formatDate(observation.observed_at)} at ${formatTime(observation.observed_at)}`}
                    className="min-h-[44px] overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
                  >
                    <div className="aspect-[16/10] bg-gray-100">
                      {observation.thumbnailUrl ? (
                        <img
                          src={
                            observation.thumbnailUrl
                          }
                          alt={`Asian Hornet observation at ${locationLabel(observation)}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          No photograph
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                          {
                            IDENTIFICATION_LABELS[
                              observation
                                .identification_status
                            ]
                          }
                        </span>

                        {observation.report_status ===
                        "reported" ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                            Reported
                          </span>
                        ) : needsReporting ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                            Needs Reporting
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                            Not Reported
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-lg font-bold text-gray-900">
                        {locationLabel(
                          observation
                        )}
                      </h2>

                      <p className="mt-1 text-sm text-gray-600">
                        {formatDate(
                          observation.observed_at
                        )}{" "}
                        ·{" "}
                        {formatTime(
                          observation.observed_at
                        )}
                      </p>

                      {observation.nest_suspected ===
                        "yes" && (
                        <p className="mt-3 text-sm font-bold text-red-700">
                          Suspected nest recorded
                        </p>
                      )}

                      <p className="mt-4 text-sm font-semibold text-[#1a3329]">
                        View observation →
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav
          aria-label="Observation pages"
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1)
              )
            }
            className="min-h-[44px] rounded-lg border px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="text-sm text-gray-600"
          >
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
            className="min-h-[44px] rounded-lg border px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}