import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  MAX_ASIAN_HORNET_PHOTOS,
  compressHornetImage,
  createReportingCopy,
} from "./asianHornetImages";

const NUMBER_LABELS = {
  one: "1",
  two_to_five: "2–5",
  six_to_ten: "6–10",
  more_than_ten: "More than 10",
  unsure: "Unsure",
};

const IDENTIFICATION_LABELS = {
  unsure: "Unsure",
  possible: "Possible Asian Hornet",
  suspected: "Suspected Asian Hornet",
};

const BEHAVIOUR_LABELS = {
  flying_through_apiary:
    "Flying through apiary",
  hawking_near_hive:
    "Hovering / hawking near hive entrance",
  catching_bees: "Catching bees",
  feeding: "Feeding",
  at_monitoring_point:
    "At bait / monitoring point",
  entering_leaving_nest:
    "Entering / leaving suspected nest",
  resting: "Resting",
  other: "Other",
  unsure: "Unsure",
};

const DIRECTION_LABELS = {
  n: "North",
  ne: "North-east",
  e: "East",
  se: "South-east",
  s: "South",
  sw: "South-west",
  w: "West",
  nw: "North-west",
  unknown: "Unknown",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function AsianHornetObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [observation, setObservation] =
    useState(null);

  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [photoError, setPhotoError] =
    useState("");

  const loadObservation = useCallback(
    async () => {
      setLoading(true);
      setLoadError("");

      try {
        const {
          data: observationData,
          error: observationError,
        } = await supabase
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
          throw new Error(
            "This observation could not be found."
          );
        }

        if (
          observationData.record_status !==
          "complete"
        ) {
          throw new Error(
            "This observation has not yet been completed."
          );
        }

        const {
          data: photoRows,
          error: photoRowsError,
        } = await supabase
          .from(
            "asian_hornet_observation_photos"
          )
          .select(`
            id,
            original_path,
            report_path,
            sort_order
          `)
          .eq("observation_id", id)
          .order("sort_order");

        if (photoRowsError) {
          throw photoRowsError;
        }

        const preparedPhotos =
          await Promise.all(
            (photoRows || []).map(
              async (photo) => {
                const preview =
                  await supabase.storage
                    .from("asian-hornet")
                    .createSignedUrl(
                      photo.original_path,
                      60 * 60
                    );

                const reportPath =
                  photo.report_path ||
                  photo.original_path;

                const download =
                  await supabase.storage
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
                    preview.data?.signedUrl ||
                    null,
                  reportDownloadUrl:
                    download.data?.signedUrl ||
                    null,
                };
              }
            )
          );

        setObservation(observationData);
        setPhotos(preparedPhotos);
      } catch (error) {
        console.error(
          "Load Asian Hornet observation:",
          error
        );

        setLoadError(
          error?.message ||
            "The observation could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadObservation();
  }, [loadObservation]);

  function getLocationLabel() {
    if (observation?.apiaries?.name) {
      return observation.apiaries.name;
    }

    if (observation?.location_text) {
      return observation.location_text;
    }

    if (
      observation?.latitude != null &&
      observation?.longitude != null
    ) {
      return "GPS location";
    }

    return "Location not recorded";
  }

  function openMap() {
    if (
      observation.latitude == null ||
      observation.longitude == null
    ) {
      return;
    }

    const coordinates =
      `${observation.latitude},${observation.longitude}`;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        coordinates
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ----------------------------------------------------------
  // Add additional photograph to existing observation.
  // Maximum remains six.
  // ----------------------------------------------------------

  async function addPhotos(fileList) {
    setPhotoError("");

    const incoming = Array.from(
      fileList || []
    ).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!incoming.length) return;

    const remaining =
      MAX_ASIAN_HORNET_PHOTOS -
      photos.length;

    if (remaining <= 0) {
      setPhotoError(
        "This observation already has the maximum of 6 photographs."
      );
      return;
    }

    const accepted =
      incoming.slice(0, remaining);

    setUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your HiveTag session could not be confirmed."
        );
      }

      for (
        let index = 0;
        index < accepted.length;
        index += 1
      ) {
        const file = accepted[index];
        const photoId =
          crypto.randomUUID();

        const basePath =
          `${user.id}/${id}/${photoId}`;

        const originalPath =
          `${basePath}/original.jpg`;

        const reportPath =
          `${basePath}/report.jpg`;

        const originalBlob =
          await compressHornetImage(
            file,
            {
              maxWidth: 2400,
              maxHeight: 2400,
              quality: 0.9,
            }
          );

        const reportingBlob =
          await createReportingCopy(file);

        let originalUploaded = false;
        let reportUploaded = false;

        try {
          const originalUpload =
            await supabase.storage
              .from("asian-hornet")
              .upload(
                originalPath,
                originalBlob,
                {
                  contentType:
                    "image/jpeg",
                  upsert: false,
                }
              );

          if (originalUpload.error) {
            throw originalUpload.error;
          }

          originalUploaded = true;

          const reportUpload =
            await supabase.storage
              .from("asian-hornet")
              .upload(
                reportPath,
                reportingBlob,
                {
                  contentType:
                    "image/jpeg",
                  upsert: false,
                }
              );

          if (reportUpload.error) {
            throw reportUpload.error;
          }

          reportUploaded = true;

          const {
            error: photoRecordError,
          } = await supabase
            .from(
              "asian_hornet_observation_photos"
            )
            .insert({
              observation_id: id,
              user_id: user.id,
              original_path: originalPath,
              report_path: reportPath,
              sort_order:
                photos.length + index,
            });

          if (photoRecordError) {
            throw photoRecordError;
          }
        } catch (error) {
          const cleanup = [];

          if (originalUploaded) {
            cleanup.push(originalPath);
          }

          if (reportUploaded) {
            cleanup.push(reportPath);
          }

          if (cleanup.length) {
            await supabase.storage
              .from("asian-hornet")
              .remove(cleanup);
          }

          throw error;
        }
      }

      await loadObservation();
    } catch (error) {
      console.error(
        "Add Asian Hornet photographs:",
        error
      );

      setPhotoError(
        error?.message ||
          "The photograph could not be added."
      );
    } finally {
      setUploading(false);

      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }

      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  }

  // ----------------------------------------------------------
  // Delete private HiveTag record.
  // Storage files MUST be removed separately.
  // ----------------------------------------------------------

  async function deleteObservation() {
    const reported =
      observation.report_status ===
      "reported";

    const message = reported
      ? "This will permanently delete the private HiveTag observation and its photographs. It will NOT withdraw the official report you have already submitted. Continue?"
      : "This will permanently delete this HiveTag observation and all of its photographs. Continue?";

    if (!window.confirm(message)) {
      return;
    }

    setDeleting(true);

    try {
      const paths = [];

      for (const photo of photos) {
        if (photo.original_path) {
          paths.push(
            photo.original_path
          );
        }

        if (
          photo.report_path &&
          photo.report_path !==
            photo.original_path
        ) {
          paths.push(photo.report_path);
        }
      }

      if (paths.length) {
        const { error: storageError } =
          await supabase.storage
            .from("asian-hornet")
            .remove(paths);

        if (storageError) {
          throw storageError;
        }
      }

      const { error: deleteError } =
        await supabase
          .from(
            "asian_hornet_observations"
          )
          .delete()
          .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      navigate(
        "/asian-hornet/observations"
      );
    } catch (error) {
      console.error(
        "Delete Asian Hornet observation:",
        error
      );

      window.alert(
        "The observation could not be deleted. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto max-w-5xl p-6"
      >
        Loading observation…
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
        </div>
      </div>
    );
  }

  const reported =
    observation.report_status ===
    "reported";

  const needsReporting =
    !reported &&
    ["possible", "suspected"].includes(
      observation.identification_status
    );

  return (
    <main
      aria-labelledby="asian-hornet-observation-heading"
      className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(
              "/asian-hornet/observations"
            )
          }
          className="mb-3 min-h-[44px] rounded-lg px-2 text-sm font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          ← My Observations
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              Asian Hornet Observation
            </p>

            <h1
              id="asian-hornet-observation-heading"
              className="mt-1 break-words text-3xl font-bold text-gray-900"
            >
              {getLocationLabel()}
            </h1>

            <p className="mt-2 text-gray-600">
              {formatDate(
                observation.observed_at
              )}{" "}
              at{" "}
              {formatTime(
                observation.observed_at
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900">
              {
                IDENTIFICATION_LABELS[
                  observation
                    .identification_status
                ]
              }
            </span>

            {reported ? (
              <span className="rounded-full bg-green-100 px-3 py-2 text-sm font-bold text-green-800">
                Reported
              </span>
            ) : needsReporting ? (
              <span className="rounded-full bg-red-100 px-3 py-2 text-sm font-bold text-red-800">
                Needs Reporting
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700">
                Not Reported
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reporting reminder */}
      {needsReporting && (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-red-300 bg-red-50 p-5"
        >
          <h2 className="font-bold text-red-900">
            This sighting still needs
            official reporting
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-800">
            This observation is stored privately
            in HiveTag but has not yet been marked
            as submitted through the official
            reporting service.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/asian-hornet/report/${id}`
              )
            }
            className="mt-4 min-h-[44px] rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          >
            Report Now
          </button>
        </section>
      )}

      {/* Photos */}
      <section
        aria-labelledby="asian-hornet-observation-photos-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="asian-hornet-observation-photos-heading"
              className="text-xl font-bold text-gray-900"
            >
              Photographs
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {photos.length} of{" "}
              {MAX_ASIAN_HORNET_PHOTOS} photographs
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={
          photos.length >=
            MAX_ASIAN_HORNET_PHOTOS ||
          uploading
        }
        onClick={() =>
          cameraInputRef.current?.click()
        }
        aria-label="Take another photograph for this Asian Hornet observation"
        className="min-h-[44px] rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-gray-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading
          ? "Adding…"
          : "📷 Take Photo"}
      </button>

      <button
        type="button"
        disabled={
          photos.length >=
            MAX_ASIAN_HORNET_PHOTOS ||
          uploading
        }
        onClick={() =>
          galleryInputRef.current?.click()
        }
        aria-label="Choose existing photographs for this Asian Hornet observation"
        className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Choose Existing Photo
      </button>
    </div>

    <input
      ref={cameraInputRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={(event) =>
        addPhotos(
          event.target.files
        )
      }
    />

    <input
      ref={galleryInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={(event) =>
        addPhotos(
          event.target.files
        )
      }
    />
        </div>

        {photoError && (
          <p
            role="alert"
            aria-live="assertive"
            className="mt-3 text-sm font-semibold text-red-700"
          >
            {photoError}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map(
            (photo, index) => (
              <div
                key={photo.id}
                role="group"
                aria-label={`Photograph ${index + 1} of ${photos.length}`}
                className="overflow-hidden rounded-xl border"
              >
                <div className="aspect-square bg-gray-100">
                  {photo.previewUrl ? (
                    <img
                      src={
                        photo.previewUrl
                      }
                      alt={`Observation photograph ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      Photo unavailable
                    </div>
                  )}
                </div>

                {photo.reportDownloadUrl && (
                  <a
                    href={
                      photo.reportDownloadUrl
                    }
                    aria-label={`Save reporting photograph ${index + 1}`}
                    className="flex min-h-[44px] items-center justify-center border-t px-3 py-2 text-center text-xs font-semibold text-[#1a3329] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-inset"
                  >
                    Save Reporting Photo
                  </a>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* Details */}
      <section
        aria-labelledby="asian-hornet-observation-details-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="asian-hornet-observation-details-heading"
            className="text-xl font-bold text-gray-900"
          >
            Observation Details
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/asian-hornet/observation/${id}/details`
              )
            }
            aria-label="Edit observation details"
            className="min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          >
            Edit
          </button>
        </div>

        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">
              Number seen
            </dt>
            <dd className="font-semibold">
              {
                NUMBER_LABELS[
                  observation.number_seen
                ]
              }
            </dd>
          </div>

          <div>
            <dt className="text-sm text-gray-500">
              Nest suspected
            </dt>
            <dd className="font-semibold">
              {observation.nest_suspected ===
              "yes"
                ? "Yes"
                : observation.nest_suspected ===
                  "no"
                ? "No"
                : "Unsure"}
            </dd>
          </div>

          {observation.behaviours
            ?.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">
                Behaviour
              </dt>

              <dd className="font-semibold">
                {observation.behaviours
                  .map(
                    (value) =>
                      BEHAVIOUR_LABELS[
                        value
                      ] || value
                  )
                  .join(", ")}
              </dd>
            </div>
          )}

          {observation.flight_direction && (
            <div>
              <dt className="text-sm text-gray-500">
                Flight direction
              </dt>

              <dd className="font-semibold">
                {
                  DIRECTION_LABELS[
                    observation
                      .flight_direction
                  ]
                }
              </dd>
            </div>
          )}

          {observation.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">
                Notes
              </dt>

              <dd className="whitespace-pre-wrap">
                {observation.notes}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Location */}
      <section
        aria-labelledby="asian-hornet-observation-location-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <h2
          id="asian-hornet-observation-location-heading"
          className="text-xl font-bold text-gray-900"
        >
          Location
        </h2>

        <p className="mt-3 font-semibold">
          {getLocationLabel()}
        </p>

        {observation.latitude != null &&
          observation.longitude != null && (
            <>
              <p className="mt-2 break-all font-mono text-sm text-gray-600">
                {Number(
                  observation.latitude
                ).toFixed(6)}
                ,{" "}
                {Number(
                  observation.longitude
                ).toFixed(6)}
              </p>

              {observation.gps_accuracy_m !=
                null && (
                <p className="mt-1 text-sm text-gray-500">
                  Recorded accuracy approximately{" "}
                  {Math.round(
                    observation.gps_accuracy_m
                  )}{" "}
                  m
                </p>
              )}

              <button
                type="button"
                onClick={openMap}
                aria-label="View sighting location in Google Maps"
                className="mt-4 min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
              >
                View Location
              </button>
            </>
          )}
      </section>

      {/* Report information */}
      <section
        aria-labelledby="asian-hornet-observation-reporting-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <h2
          id="asian-hornet-observation-reporting-heading"
          className="text-xl font-bold text-gray-900"
        >
          Official Reporting
        </h2>

        <p
          role="status"
          aria-live="polite"
          className="mt-3"
        >
          Status:{" "}
          <strong>
            {reported
              ? "Reported"
              : "Not reported"}
          </strong>
        </p>

        {observation.reported_at && (
          <p className="mt-1 text-sm text-gray-600">
            Marked reported on{" "}
            {formatDate(
              observation.reported_at
            )}{" "}
            at{" "}
            {formatTime(
              observation.reported_at
            )}
          </p>
        )}

        {observation.report_reference && (
          <p className="mt-2 text-sm">
            Official reference:{" "}
            <strong>
              {
                observation.report_reference
              }
            </strong>
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/asian-hornet/report/${id}`
            )
          }
          className="mt-4 min-h-[44px] rounded-xl bg-[#1a3329] px-5 py-3 font-semibold text-white hover:bg-[#24483a] focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          {reported
            ? "View Reporting Status"
            : "Report Sighting"}
        </button>
      </section>

      {/* Delete */}
      <section
        aria-labelledby="asian-hornet-observation-delete-heading"
        className="rounded-2xl border border-red-200 bg-red-50 p-5"
      >
        <h2
          id="asian-hornet-observation-delete-heading"
          className="font-bold text-red-900"
        >
          Delete Observation
        </h2>

        {reported && (
          <p className="mt-2 text-sm leading-6 text-red-800">
            Deleting this HiveTag record will not
            withdraw an official report that has
            already been submitted.
          </p>
        )}

        <button
          type="button"
          disabled={deleting}
          onClick={deleteObservation}
          className="mt-4 min-h-[44px] rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting
            ? "Deleting…"
            : "Delete Observation"}
        </button>
      </section>
    </main>
  );
}