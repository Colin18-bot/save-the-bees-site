import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import AsianHornetDrafts from "./AsianHornetDrafts.jsx";

const learnCards = [
  [
    "Compare Lookalikes",
    "Compare Asian Hornet with common UK lookalikes.",
    "/asian-hornet/compare",
  ],
  [
    "Behaviour at Hives",
    "What Asian Hornet activity can look like around an apiary.",
    "/asian-hornet/behaviour",
  ],
  [
    "Identify a Nest",
    "Recognise embryo, primary and secondary nests.",
    "/asian-hornet/nests",
  ],
  [
    "Lifecycle",
    "Understand how activity changes through the year.",
    "/asian-hornet/lifecycle",
  ],
  [
    "Monitoring",
    "Practical monitoring guidance for beekeepers.",
    "/asian-hornet/monitoring",
  ],
  [
    "Reporting & Resources",
    "Official reporting links and trusted UK guidance.",
    "/asian-hornet/resources",
  ],
  [
    "What Happens Next?",
    "What happens after a suspected sighting is reported.",
    "/asian-hornet/after-reporting",
  ],
];

function StatusBadge({ status }) {
  const label =
    status === "reported"
      ? "Reported"
      : status === "suspected"
      ? "Suspected"
      : status === "possible"
      ? "Possible"
      : "Unsure";

  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}

export default function AsianHornetCentre() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState([]);
  const [needsReportingCount, setNeedsReportingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadObservations() {
      setLoading(true);
      setLoadError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setObservations([]);
          setNeedsReportingCount(0);
          setLoading(false);
        }
        return;
      }

      const [
        observationsResult,
        reminderResult,
      ] = await Promise.all([
        supabase
          .from("asian_hornet_observations")
          .select(`
            id,
            apiary_id,
            observed_at,
            location_text,
            identification_status,
            report_status,
            apiaries (
              name
            )
          `)
          .eq("record_status", "complete")
          .order("observed_at", {
            ascending: false,
          })
          .limit(3),

        supabase
          .from("asian_hornet_observations")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("record_status", "complete")
          .eq("report_status", "not_reported")
          .in("identification_status", [
            "possible",
            "suspected",
          ]),
      ]);

      const data =
        observationsResult.data;

      const error =
        observationsResult.error;

      if (!mounted) return;

      if (reminderResult.error) {
        console.error(
          "Asian Hornet reporting reminders:",
          reminderResult.error
        );

        setNeedsReportingCount(0);
      } else {
        setNeedsReportingCount(
          reminderResult.count || 0
        );
      }

      if (error) {
        console.error("Asian Hornet observations:", error);
        setLoadError("Unable to load your observations.");
        setObservations([]);
      } else {
        setObservations(data || []);
      }

      setLoading(false);
    }

    loadObservations();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main
      aria-labelledby="asian-hornet-centre-heading"
      className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"
    >
      {/* Hero */}
      <section
        aria-labelledby="asian-hornet-centre-heading"
        className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm"
      >
        <div className="bg-[#1a3329] px-5 py-6 text-white sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            Yellow-legged Asian Hornet
          </p>

          <h1
            id="asian-hornet-centre-heading"
            className="mt-1 text-3xl font-bold"
          >
            Asian Hornet
          </h1>

          <p className="mt-1 text-sm italic text-white/75">
            Vespa velutina
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900">
            See it. Snap it. Report it.
          </h2>

          <p className="mt-2 max-w-3xl text-gray-600">
            Think you've seen a Yellow-legged Asian Hornet?
            Photograph it from a safe distance, record the sighting and
            report it through the official reporting service.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/asian-hornet/photo")}
              aria-label="Take a photograph and record a suspected Asian Hornet sighting"
              className="min-h-[44px] rounded-xl bg-amber-500 px-5 py-4 font-bold text-gray-950 shadow-sm transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              📷 Take Photo & Report
            </button>

            <button
              type="button"
              onClick={() => navigate("/asian-hornet/identify")}
              className="min-h-[44px] rounded-xl border border-gray-300 bg-white px-5 py-4 font-semibold text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Identify It
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://risc.brc.ac.uk/alert.php?species=asian_hornet",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              aria-label="Open the official Biological Records Centre Asian Hornet reporting service"
              className="min-h-[44px] rounded-xl border border-red-300 bg-red-50 px-5 py-4 font-semibold text-red-800 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
            >
              Report Sighting
            </button>
          </div>

          <p
            role="note"
            className="mt-4 text-sm text-gray-500"
          >
            If you suspect a nest, do not approach, disturb or attempt to
            remove it.
          </p>
        </div>
      </section>

      {/* Quick identification */}
      <section
        aria-labelledby="asian-hornet-quick-identification-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="asian-hornet-quick-identification-heading"
              className="text-xl font-bold text-gray-900"
            >
              Quick Identification
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Look for these four key features.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/asian-hornet/identify")}
            className="min-h-[44px] rounded-lg px-2 text-sm font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          >
            Check identification →
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["●", "Dark body", "Predominantly dark brown to black."],
            ["●", "Yellow-ended legs", "Lower legs are distinctly yellow."],
            ["●", "Orange face", "Orange/yellow when viewed from the front."],
            ["●", "Broad orange band", "One prominent orange/yellow abdominal band."],
          ].map(([icon, title, text]) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="text-xl text-amber-500">{icon}</div>
              <h3 className="mt-2 font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Reporting reminder */}
      {needsReportingCount > 0 && (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-red-300 bg-red-50 p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-red-700">
                Action Required
              </p>

              <h2 className="mt-1 text-xl font-bold text-red-900">
                {needsReportingCount === 1
                  ? "1 Asian Hornet sighting still needs reporting"
                  : `${needsReportingCount} Asian Hornet sightings still need reporting`}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-red-800">
                {needsReportingCount === 1
                  ? "This observation is saved privately in HiveTag but has not yet been marked as submitted through the official reporting service."
                  : "These observations are saved privately in HiveTag but have not yet been marked as submitted through the official reporting service."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/asian-hornet/observations?status=needs_reporting"
                )
              }
              className="min-h-[44px] rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
            >
              View Sightings
            </button>
          </div>
        </section>
      )}
      <AsianHornetDrafts />
      
      {/* My observations */}
      <section
        aria-labelledby="asian-hornet-my-observations-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="asian-hornet-my-observations-heading"
              className="text-xl font-bold text-gray-900"
            >
              My Observations
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Your private Asian Hornet sighting records.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                navigate("/asian-hornet/observations")
              }
              className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
            >
              View All
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/asian-hornet/photo")
              }
              className="min-h-[44px] rounded-lg bg-[#1a3329] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24483a] focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
            >
              + Record Observation
            </button>
          </div>
        </div>

        <div className="mt-5">
          {loading && (
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-gray-500"
            >
              Loading observations…
            </p>
          )}

          {!loading && loadError && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-sm text-red-700"
            >
              {loadError}
            </p>
          )}

          {!loading && !loadError && observations.length === 0 && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-dashed border-gray-300 p-6 text-center"
            >
              <p className="font-medium text-gray-800">
                No Asian Hornet observations recorded.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                If you see something suspicious, photograph it and create a
                record here.
              </p>
            </div>
          )}

          {!loading && observations.length > 0 && (
            <div className="divide-y">
              {observations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    navigate(`/asian-hornet/observations/${item.id}`)
                  }
                  aria-label={`View observation at ${
                    item.apiaries?.name ||
                    item.location_text ||
                    "GPS location"
                  }`}
                  className="flex min-h-[44px] w-full flex-wrap items-center justify-between gap-3 rounded-lg py-4 text-left focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-inset sm:flex-nowrap sm:gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.apiaries?.name ||
                      item.location_text ||
                      "GPS location"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(item.observed_at).toLocaleString("en-GB")}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                    <StatusBadge
                      status={item.identification_status}
                    />

                    {item.report_status === "reported" ? (
                      <StatusBadge status="reported" />
                    ) : ["possible", "suspected"].includes(
                        item.identification_status
                      ) ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                        Needs Reporting
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Learn */}
      <section aria-labelledby="asian-hornet-learn-heading">
        <h2
          id="asian-hornet-learn-heading"
          className="text-xl font-bold text-gray-900"
        >
          Identify & Learn
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {learnCards.map(
          ([title, description, route]) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate(route)}
              aria-label={`Open ${title} guide`}
              className="min-h-[44px] rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
            >
              <h3 className="font-bold text-gray-900">
                {title}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {description}
              </p>

              <p className="mt-4 text-sm font-semibold text-[#1a3329]">
                Open guide →
              </p>
            </button>
          )
        )}
        </div>
      </section>
    </main>
  );
}