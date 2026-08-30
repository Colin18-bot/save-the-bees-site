import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";

const OFFICIAL_REPORT_URL =
  "https://risc.brc.ac.uk/alert.php?species=asian_hornet";

const NUMBER_LABELS = {
  one: "1",
  two_to_five: "2–5",
  six_to_ten: "6–10",
  more_than_ten: "More than 10",
  unsure: "Unsure",
};

const BEHAVIOUR_LABELS = {
  flying_through_apiary: "Flying through apiary",
  hawking_near_hive: "Hawking near hive entrance",
  catching_bees: "Catching bees",
  feeding: "Feeding",
  at_monitoring_point: "At bait / monitoring point",
  entering_leaving_nest: "Entering / leaving suspected nest",
  resting: "Resting",
  other: "Other",
  unsure: "Unsure",
};

const DIRECTION_LABELS = {
  n: "N",
  ne: "NE",
  e: "E",
  se: "SE",
  s: "S",
  sw: "SW",
  w: "W",
  nw: "NW",
  unknown: "Unknown",
};

const IDENTIFICATION_LABELS = {
  unsure: "Unsure",
  possible: "Possible Asian Hornet",
  suspected: "Suspected Asian Hornet",
};

const NEST_LABELS = {
  no: "No",
  yes: "Yes",
  unsure: "Unsure",
};

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand("copy");
  document.body.removeChild(textArea);
}

export default function AsianHornetReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [observation, setObservation] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [copyMessage, setCopyMessage] = useState("");
  const [markingReported, setMarkingReported] = useState(false);

  const [reportReference, setReportReference] = useState("");
  const [savingReference, setSavingReference] = useState(false);

  // ----------------------------------------------------------
  // Load completed observation and private photographs.
  // ----------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      setLoading(true);
      setLoadError("");

      try {
        const { data: observationData, error: observationError } =
          await supabase
            .from("asian_hornet_observations")
            .select(`
              id,
              apiary_id,
              observed_at,
              latitude,
              longitude,
              gps_accuracy_m,
              location_source,
              location_text,
              number_seen,
              behaviours,
              flight_direction,
              nest_suspected,
              identification_status,
              notes,
              report_status,
              reported_at,
              report_reference,
              record_status,
              apiaries (
                name,
                address
              )
            `)
            .eq("id", id)
            .maybeSingle();

        if (observationError) {
          throw observationError;
        }

        if (!observationData) {
          throw new Error("This observation could not be found.");
        }

        if (observationData.record_status !== "complete") {
          throw new Error(
            "This observation has not yet been completed."
          );
        }

        const { data: photoData, error: photoError } =
          await supabase
            .from("asian_hornet_observation_photos")
            .select(`
              id,
              original_path,
              report_path,
              sort_order
            `)
            .eq("observation_id", id)
            .order("sort_order");

        if (photoError) {
          throw photoError;
        }

        // ------------------------------------------------------
        // Generate temporary URLs for the private images.
        //
        // previewUrl:
        //   normal private image viewing.
        //
        // reportDownloadUrl:
        //   prepared sub-1MB reporting copy.
        // ------------------------------------------------------

        const preparedPhotos = await Promise.all(
          (photoData || []).map(async (photo) => {
            const previewResult = await supabase.storage
              .from("asian-hornet")
              .createSignedUrl(
                photo.original_path,
                60 * 60
              );

            const reportPath =
              photo.report_path || photo.original_path;

            const reportResult = await supabase.storage
              .from("asian-hornet")
              .createSignedUrl(
                reportPath,
                60 * 60,
                {
                  download: true,
                }
              );

            return {
              ...photo,
              previewUrl:
                previewResult.data?.signedUrl || null,
              reportDownloadUrl:
                reportResult.data?.signedUrl || null,
            };
          })
        );

        if (!mounted) return;

        setObservation(observationData);
        setPhotos(preparedPhotos);

        setReportReference(
          observationData.report_reference || ""
        );
      } catch (error) {
        console.error(
          "Load Asian Hornet reporting page:",
          error
        );

        if (!mounted) return;

        setLoadError(
          error?.message ||
            "The reporting information could not be loaded."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ----------------------------------------------------------
  // User-friendly location.
  // ----------------------------------------------------------

  const locationLabel = useMemo(() => {
    if (!observation) return "";

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

    return "";
  }, [observation]);

  // ----------------------------------------------------------
  // GPS string.
  // ----------------------------------------------------------

  const gpsText = useMemo(() => {
    if (
      observation?.latitude == null ||
      observation?.longitude == null
    ) {
      return "";
    }

    return `${Number(observation.latitude).toFixed(
      6
    )}, ${Number(observation.longitude).toFixed(6)}`;
  }, [observation]);

  // ----------------------------------------------------------
  // Build text suitable for pasting into the official report.
  // Only include information we actually have.
  // ----------------------------------------------------------

  const sightingDetails = useMemo(() => {
    if (!observation) return "";

    const lines = [
      "Suspected Yellow-legged Asian Hornet sighting",
      `Date: ${formatDate(observation.observed_at)}`,
      `Time: ${formatTime(observation.observed_at)}`,
    ];

    if (locationLabel) {
      lines.push(`Location: ${locationLabel}`);
    }

    if (gpsText) {
      lines.push(`GPS: ${gpsText}`);
    }

    if (observation.number_seen) {
      lines.push(
        `Number observed: ${
          NUMBER_LABELS[observation.number_seen] ||
          observation.number_seen
        }`
      );
    }

    if (observation.behaviours?.length) {
      const behaviourText = observation.behaviours
        .map(
          (behaviour) =>
            BEHAVIOUR_LABELS[behaviour] || behaviour
        )
        .join(", ");

      lines.push(`Behaviour: ${behaviourText}`);
    }

    if (observation.flight_direction) {
      lines.push(
        `Flight direction: ${
          DIRECTION_LABELS[
            observation.flight_direction
          ] || observation.flight_direction
        }`
      );
    }

    if (observation.nest_suspected) {
      lines.push(
        `Nest suspected: ${
          NEST_LABELS[observation.nest_suspected] ||
          observation.nest_suspected
        }`
      );
    }

    if (observation.identification_status) {
      lines.push(
        `Identification: ${
          IDENTIFICATION_LABELS[
            observation.identification_status
          ] || observation.identification_status
        }`
      );
    }

    if (observation.notes) {
      lines.push(`Notes: ${observation.notes}`);
    }

    return lines.join("\n");
  }, [observation, locationLabel, gpsText]);

  async function handleCopyGps() {
    if (!gpsText) return;

    try {
      await copyText(gpsText);
      setCopyMessage("GPS copied");
    } catch {
      setCopyMessage("Unable to copy GPS");
    }
  }

  async function handleCopyDetails() {
    try {
      await copyText(sightingDetails);
      setCopyMessage("Sighting details copied");
    } catch {
      setCopyMessage(
        "Unable to copy sighting details"
      );
    }
  }

  function openOfficialReport() {
    window.open(
      OFFICIAL_REPORT_URL,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ----------------------------------------------------------
  // The user confirms the external report has actually been
  // submitted.
  //
  // Opening BRC alone MUST NOT mark it as reported.
  // ----------------------------------------------------------

  async function markAsReported() {
    const confirmed = window.confirm(
      "Only mark this as reported if you have submitted the sighting through the official reporting service."
    );

    if (!confirmed) return;

    setMarkingReported(true);

    try {
      const reportedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from("asian_hornet_observations")
        .update({
          report_status: "reported",
          reported_at: reportedAt,
          report_reference:
            reportReference.trim() || null,
        })
        .eq("id", id)
        .eq("record_status", "complete")
        .select(`
          report_status,
          reported_at,
          report_reference
        `)
        .single();

      if (error) {
        throw error;
      }

      setObservation((current) => ({
        ...current,
        report_status: data.report_status,
        reported_at: data.reported_at,
        report_reference: data.report_reference,
      }));

      setReportReference(
        data.report_reference || ""
      );
    } catch (error) {
      console.error(
        "Mark Asian Hornet report submitted:",
        error
      );

      window.alert(
        "HiveTag could not update the reporting status. Please try again."
      );
    } finally {
      setMarkingReported(false);
    }
  }

  async function saveReportReference() {
  setSavingReference(true);

  try {
    const { error } = await supabase
      .from("asian_hornet_observations")
      .update({
        report_reference:
          reportReference.trim() || null,
      })
      .eq("id", id)
      .eq("record_status", "complete");

    if (error) {
      throw error;
    }

    setObservation((current) => ({
      ...current,
      report_reference:
        reportReference.trim() || null,
    }));

    // Reporting workflow is complete.
    navigate("/asian-hornet");
  } catch (error) {
    console.error(
      "Save Asian Hornet report reference:",
      error
    );

    window.alert(
      "The official report reference could not be saved."
    );
  } finally {
    setSavingReference(false);
  }
}

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p
          role="status"
          aria-live="polite"
          className="text-gray-600"
        >
          Preparing reporting information…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <p className="font-semibold text-red-800">
            {loadError}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/asian-hornet")
            }
            className="mt-4 min-h-[44px] rounded-lg px-2 font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          >
            Return to Asian Hornet Centre
          </button>
        </div>
      </div>
    );
  }

  const reported =
    observation.report_status === "reported";

  return (
    <main
      aria-labelledby="asian-hornet-report-heading"
      className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"
    >

      {/* Heading */}
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

        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Official reporting
        </p>

        <h1
          id="asian-hornet-report-heading"
          className="mt-1 text-3xl font-bold text-gray-900"
        >
          Report Your Sighting
        </h1>
      </div>

      {/* Status */}
      {!reported ? (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-red-300 bg-red-50 p-5 sm:p-6"
        >
          <p className="font-bold text-green-800">
            ✓ Your observation has been saved
            in HiveTag.
          </p>

          <h2 className="mt-4 text-xl font-bold text-red-900">
            This sighting has NOT yet been
            officially reported.
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-800">
            HiveTag keeps your private observation
            record, but the official reporting
            service must still be used so the
            sighting can be assessed by the
            appropriate experts.
          </p>
        </section>
      ) : (
        <section
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-green-300 bg-green-50 p-5 sm:p-6"
        >
          <h2 className="text-xl font-bold text-green-900">
            ✓ Official report marked as submitted
          </h2>

          {observation.reported_at && (
            <p className="mt-2 text-sm text-green-800">
              Marked as reported in HiveTag on{" "}
              {formatDate(
                observation.reported_at
              )}{" "}
              at{" "}
              {formatTime(
                observation.reported_at
              )}
              .
            </p>
          )}

          <p className="mt-2 text-sm text-green-800">
            This means you have told HiveTag that
            the sighting was submitted. It does
            not mean that the insect has been
            confirmed as a Yellow-legged Asian
            Hornet.
          </p>
        </section>
      )}

      {/* Observation summary */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Sighting Details
        </h2>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">

          <div>
            <p className="text-gray-500">
              Date
            </p>
            <p className="font-semibold text-gray-900">
              {formatDate(
                observation.observed_at
              )}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Time
            </p>
            <p className="font-semibold text-gray-900">
              {formatTime(
                observation.observed_at
              )}
            </p>
          </div>

          {locationLabel && (
            <div>
              <p className="text-gray-500">
                Location
              </p>
              <p className="font-semibold text-gray-900">
                {locationLabel}
              </p>
            </div>
          )}

          {gpsText && (
            <div>
              <p className="text-gray-500">
                GPS
              </p>
              <p className="break-all font-mono font-semibold text-gray-900">
                {gpsText}
              </p>
            </div>
          )}

          {observation.number_seen && (
            <div>
              <p className="text-gray-500">
                Number seen
              </p>
              <p className="font-semibold text-gray-900">
                {
                  NUMBER_LABELS[
                    observation.number_seen
                  ]
                }
              </p>
            </div>
          )}

          <div>
            <p className="text-gray-500">
              Identification
            </p>
            <p className="font-semibold text-gray-900">
              {
                IDENTIFICATION_LABELS[
                  observation
                    .identification_status
                ]
              }
            </p>
          </div>

          {observation.behaviours?.length >
            0 && (
            <div className="sm:col-span-2">
              <p className="text-gray-500">
                Behaviour
              </p>
              <p className="font-semibold text-gray-900">
                {observation.behaviours
                  .map(
                    (value) =>
                      BEHAVIOUR_LABELS[
                        value
                      ] || value
                  )
                  .join(", ")}
              </p>
            </div>
          )}

          {observation.flight_direction && (
            <div>
              <p className="text-gray-500">
                Flight direction
              </p>
              <p className="font-semibold text-gray-900">
                {
                  DIRECTION_LABELS[
                    observation.flight_direction
                  ]
                }
              </p>
            </div>
          )}

          <div>
            <p className="text-gray-500">
              Nest suspected
            </p>
            <p className="font-semibold text-gray-900">
              {
                NEST_LABELS[
                  observation.nest_suspected
                ]
              }
            </p>
          </div>

          {observation.notes && (
            <div className="sm:col-span-2">
              <p className="text-gray-500">
                Notes
              </p>
              <p className="whitespace-pre-wrap text-gray-900">
                {observation.notes}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Copy information */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Information for the Official Report
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Use these buttons to copy your
          information before opening the official
          reporting service.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!gpsText}
            onClick={handleCopyGps}
            className="min-h-[44px] rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy GPS
          </button>

          <button
            type="button"
            onClick={handleCopyDetails}
            className="min-h-[44px] rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Copy Sighting Details
          </button>
        </div>

        {copyMessage && (
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="mt-3 text-center text-sm font-medium text-green-700"
          >
            ✓ {copyMessage}
          </p>
        )}

        <pre className="mt-5 max-w-full whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          {sightingDetails}
        </pre>
      </section>

      {/* Photos */}
      {photos.length > 0 && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Reporting Photographs
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Save the clearest photograph to your
            device before opening the official
            reporting form. HiveTag has prepared
            smaller reporting copies suitable for
            upload.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                role="group"
                aria-label={`Reporting photograph ${index + 1} of ${photos.length}`}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <div className="aspect-square bg-gray-100">
                  {photo.previewUrl ? (
                    <img
                      src={photo.previewUrl}
                      alt={`Asian Hornet observation photograph ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Photo unavailable
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Photo {index + 1}
                  </p>

                  {photo.reportDownloadUrl && (
                    <a
                      href={
                        photo.reportDownloadUrl
                      }
                      aria-label={`Save reporting photograph ${index + 1}`}
                      className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-semibold text-[#1a3329] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
                    >
                      Save Reporting Photo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Official reporting */}
      {!reported && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Ready to report?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-700">
            The official service will open in a
            new tab. When entering the location,
            choose the GPS latitude/longitude
            option if you want to use the
            coordinates recorded by HiveTag.
          </p>

          <button
            type="button"
            onClick={openOfficialReport}
            aria-label="Open the official Biological Records Centre Asian Hornet reporting service"
            className="mt-5 min-h-[44px] w-full rounded-xl bg-red-700 px-6 py-4 text-lg font-bold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          >
            REPORT SIGHTING NOW
          </button>

          <p className="mt-3 text-center text-xs text-gray-600">
            Opens the official Biological Records
            Centre reporting service.
          </p>
        </section>
      )}

      {/* Mark as reported */}
      {!reported && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Already submitted the official report?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Return here after submitting the
            official report and mark the sighting
            as reported.
          </p>

          <label
            htmlFor="report-reference"
            className="mt-5 block text-sm font-semibold text-gray-700"
          >
            Official reference
            <span className="font-normal text-gray-500">
              {" "}
              (optional)
            </span>
          </label>

          <input
            id="report-reference"
            type="text"
            value={reportReference}
            onChange={(event) =>
              setReportReference(
                event.target.value
              )
            }
            placeholder="Enter reference if provided"
            className="mt-2 min-h-[44px] w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          />

          <button
            type="button"
            disabled={markingReported}
            onClick={markAsReported}
            className="mt-5 min-h-[44px] w-full rounded-xl bg-[#1a3329] px-6 py-4 font-bold text-white hover:bg-[#24483a] focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingReported
              ? "Updating…"
              : "I HAVE REPORTED THIS"}
          </button>
        </section>
      )}

      {/* Report reference after completion */}
      {reported && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="saved-report-reference"
            className="text-sm font-semibold text-gray-700"
          >
            Official report reference
            <span className="font-normal text-gray-500">
              {" "}
              (optional)
            </span>
          </label>

          <input
            id="saved-report-reference"
            type="text"
            value={reportReference}
            onChange={(event) =>
              setReportReference(
                event.target.value
              )
            }
            placeholder="Enter reference if provided"
            className="mt-2 min-h-[44px] w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          />

          <button
            type="button"
            disabled={savingReference}
            onClick={saveReportReference}
            className="mt-3 min-h-[44px] w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {savingReference
            ? "Saving…"
            : "Save Reference & Finish"}
          </button>
        </section>
      )}

      {/* Footer navigation */}
      <div className="flex justify-center pb-4">
        <button
          type="button"
          onClick={() =>
            navigate("/asian-hornet")
          }
          className="min-h-[44px] rounded-lg px-3 font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          Return to Asian Hornet Centre
        </button>
      </div>
    </main>
  );
}