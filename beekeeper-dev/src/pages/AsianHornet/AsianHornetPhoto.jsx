import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  MAX_ASIAN_HORNET_PHOTOS,
  compressHornetImage,
  createPreviewUrl,
  createReportingCopy,
} from "./asianHornetImages";
import {
  deleteAsianHornetOfflineDraft,
  getAsianHornetOfflineDraft,
  saveAsianHornetOfflineDraft,
  supportsAsianHornetOfflineDrafts,
} from "./asianHornetOffline";

function describeGeolocationError(error) {
  switch (error?.code) {
    case 1:
      return "Location permission was denied by the browser.";
    case 2:
      return "Your phone could not determine a location. Try moving outdoors or closer to a window, then retry.";
    case 3:
      return "The location request timed out before your phone returned a position.";
    default:
      return "Your phone could not provide a location.";
  }
}

export default function AsianHornetPhoto() {
  const navigate = useNavigate();

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const photosRef = useRef([]);

  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationState, setLocationState] = useState("waiting");
  const [locationError, setLocationError] = useState("");
  const [locationRequestKey, setLocationRequestKey] = useState(0);

  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const [offlineDraftLoaded, setOfflineDraftLoaded] = useState(false);

  const [restoredOfflineDraft, setRestoredOfflineDraft] = useState(false);

  const [offlineMessage, setOfflineMessage] = useState("");

  const observedAtRef = useRef(new Date().toISOString());

  // ----------------------------------------------------------
  // Track connection state.
  // ----------------------------------------------------------

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);

    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);

      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ----------------------------------------------------------
  // Restore any photographs previously saved on this device.
  // getSession() uses the locally cached Supabase session and
  // does not require us to validate the user over the network.
  // ----------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function restoreOfflineDraft() {
      try {
        if (!supportsAsianHornetOfflineDrafts()) {
          if (mounted) {
            setOfflineDraftLoaded(true);
          }

          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const userId = session?.user?.id || null;

        if (!userId) {
          if (mounted) {
            setOfflineDraftLoaded(true);
          }

          return;
        }

        const draft = await getAsianHornetOfflineDraft(userId);

        if (!mounted) return;

        if (!draft) {
          setOfflineDraftLoaded(true);
          return;
        }

        const restoredPhotos = (draft.photos || [])
          .filter((photo) => photo?.file instanceof Blob)
          .slice(0, MAX_ASIAN_HORNET_PHOTOS)
          .map((photo) => ({
            id: photo.id || crypto.randomUUID(),
            file: photo.file,
            previewUrl: createPreviewUrl(photo.file),
          }));

        if (restoredPhotos.length > 0) {
          setPhotos(restoredPhotos);
        }

        if (draft.location) {
          setLocation(draft.location);
          setLocationState("available");
        }

        if (draft.observed_at) {
          observedAtRef.current = draft.observed_at;
        }

        setRestoredOfflineDraft(true);

        setOfflineMessage("Your unfinished sighting stored on this device has been restored.");

        setOfflineDraftLoaded(true);
      } catch (error) {
        console.error("Restore Asian Hornet offline draft:", error);

        if (mounted) {
          setOfflineDraftLoaded(true);
        }
      }
    }

    restoreOfflineDraft();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------------
  // Keep the current sighting safe on this device.
  //
  // This runs whether online or offline so that photographs
  // already selected are recoverable if the browser closes,
  // the connection disappears or the user is interrupted.
  // ----------------------------------------------------------

  useEffect(() => {
    if (!offlineDraftLoaded) {
      return;
    }

    let cancelled = false;

    async function preserveCurrentSighting() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const userId = session?.user?.id || null;

        if (!userId || cancelled) {
          return;
        }

        if (photos.length === 0) {
          if (restoredOfflineDraft) {
            await deleteAsianHornetOfflineDraft(userId);

            if (!cancelled) {
              setRestoredOfflineDraft(false);
              setOfflineMessage("");
            }
          }

          return;
        }

        await saveAsianHornetOfflineDraft({
          userId,
          photos,
          location,
          observedAt: observedAtRef.current,
        });

        if (!cancelled && !isOnline) {
          setOfflineMessage(
            "This unfinished sighting is saved safely on this device and can be resumed when you are back online."
          );
        }
      } catch (error) {
        console.error("Preserve Asian Hornet sighting:", error);
      }
    }

    preserveCurrentSighting();

    return () => {
      cancelled = true;
    };
  }, [photos, location, isOnline, offlineDraftLoaded, restoredOfflineDraft]);

  // ----------------------------------------------------------
  // Get location on entry.
  // Failure must never block reporting.
  // ----------------------------------------------------------

  useEffect(() => {
    if (!offlineDraftLoaded) {
      return;
    }

    // A restored sighting may contain the GPS position from
    // where the insect was originally seen. Do not replace it
    // with the user's current location.
    if (restoredOfflineDraft && location) {
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("This browser does not support automatic location capture.");
      setLocationState("unavailable");
      return;
    }

    setLocationError("");
    setLocationState("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationError("");
        setLocationState("available");
      },
      (error) => {
        console.warn("Asian Hornet geolocation:", {
          code: error?.code,
          message: error?.message,
        });

        setLocationError(describeGeolocationError(error));
        setLocationState("unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 30000,
      }
    );
  }, [offlineDraftLoaded, restoredOfflineDraft, locationRequestKey]);

  // ----------------------------------------------------------
  // Keep a current reference to photos so preview URLs are only
  // revoked when this page closes, not whenever photos change.
  // ----------------------------------------------------------

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, []);

  // ----------------------------------------------------------
  // Add photographs
  // ----------------------------------------------------------

  async function handleFiles(fileList) {
    setErrorMessage("");

    const incoming = Array.from(fileList || []);

    if (!incoming.length) return;

    const remaining = MAX_ASIAN_HORNET_PHOTOS - photos.length;

    if (remaining <= 0) {
      setErrorMessage(`A maximum of ${MAX_ASIAN_HORNET_PHOTOS} photographs can be added.`);
      return;
    }

    const accepted = incoming.filter((file) => file.type.startsWith("image/")).slice(0, remaining);

    const nextPhotos = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: createPreviewUrl(file),
    }));

    setPhotos((current) => [...current, ...nextPhotos]);

    // Reset inputs so the same photograph can be selected again
    // after removal if required.
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }

  function removePhoto(photoId) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === photoId);

      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      return current.filter((item) => item.id !== photoId);
    });
  }

  // ----------------------------------------------------------
  // Create observation + upload private photographs.
  // ----------------------------------------------------------

  async function continueToObservation() {
    if (!photos.length) {
      setErrorMessage("Take or choose at least one photograph before continuing.");
      return;
    }

    if (!isOnline) {
      setErrorMessage("");

      setOfflineMessage(
        "This unfinished sighting is saved safely on this device. Reconnect to the internet to continue with the sighting details."
      );

      return;
    }
    setSaving(true);
    setProcessing(true);
    setErrorMessage("");

    let createdObservationId = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your HiveTag session could not be confirmed. Please sign in again.");
      }

      // ------------------------------------------------------
      // Create draft observation first.
      // ------------------------------------------------------

      const observationPayload = {
        user_id: user.id,
        observed_at: observedAtRef.current,
        record_status: "draft",
        location_source: location ? "gps" : "manual",
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        gps_accuracy_m: location?.accuracy ?? null,
      };

      const { data: observation, error: observationError } = await supabase
        .from("asian_hornet_observations")
        .insert(observationPayload)
        .select("id")
        .single();

      if (observationError) {
        throw observationError;
      }

      createdObservationId = observation.id;

      // ------------------------------------------------------
      // Process and upload each photograph sequentially.
      //
      // Sequential upload is intentional:
      // - easier recovery
      // - less mobile memory pressure
      // ------------------------------------------------------

      for (let index = 0; index < photos.length; index += 1) {
        const photo = photos[index];

        const photoId = crypto.randomUUID();

        const basePath = `${user.id}/${observation.id}/${photoId}`;

        const originalPath = `${basePath}/original.jpg`;
        const reportPath = `${basePath}/report.jpg`;

        // HiveTag original
        const originalBlob = await compressHornetImage(photo.file, {
          maxWidth: 2400,
          maxHeight: 2400,
          quality: 0.9,
        });

        // Smaller copy suitable for reporting
        const reportingBlob = await createReportingCopy(photo.file);

        const { error: originalUploadError } = await supabase.storage
          .from("asian-hornet")
          .upload(originalPath, originalBlob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (originalUploadError) {
          throw originalUploadError;
        }

        const { error: reportUploadError } = await supabase.storage
          .from("asian-hornet")
          .upload(reportPath, reportingBlob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (reportUploadError) {
          throw reportUploadError;
        }

        const { error: photoRecordError } = await supabase
          .from("asian_hornet_observation_photos")
          .insert({
            observation_id: observation.id,
            user_id: user.id,
            original_path: originalPath,
            report_path: reportPath,
            sort_order: index,
          });

        if (photoRecordError) {
          throw photoRecordError;
        }
      }

      // ------------------------------------------------------
      // The sighting is now safely stored in HiveTag.
      // Remove the temporary copy held on this device.
      // ------------------------------------------------------

      await deleteAsianHornetOfflineDraft(user.id);

      // ------------------------------------------------------
      // Continue to observation details.
      // ------------------------------------------------------

      navigate(`/asian-hornet/observation/${observation.id}/details`);
    } catch (error) {
      console.error("Asian Hornet photo workflow:", error);

      setErrorMessage(error?.message || "The observation could not be saved. Please try again.");

      /*
       * Do not delete the draft automatically here.
       *
       * If some photographs successfully uploaded before an error,
       * keeping the draft gives us a recovery path.
       */
    } finally {
      setProcessing(false);
      setSaving(false);
    }
  }

  const remaining = MAX_ASIAN_HORNET_PHOTOS - photos.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/asian-hornet")}
          className="mb-3 text-sm font-semibold text-[#1a3329] hover:underline"
        >
          ← Asian Hornet Centre
        </button>

        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Suspected sighting
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">Photograph the insect</h1>

        <p className="mt-2 max-w-3xl text-gray-600">
          Keep a safe distance. If possible, try to photograph the body, abdomen, face and legs.
        </p>
      </div>

      {/* Connection status */}
      {!isOnline && (
        <section
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-5"
        >
          <p className="font-bold text-amber-900">You are offline</p>

          <p className="mt-2 text-sm leading-6 text-amber-900">
            You can still take or choose photographs. HiveTag will keep the unfinished sighting on
            this device until an internet connection is available.
          </p>
        </section>
      )}

      {offlineMessage && (
        <section
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-green-200 bg-green-50 p-4"
        >
          <p className="text-sm font-medium text-green-800">{offlineMessage}</p>
        </section>
      )}

      {/* Safety */}
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
        <h2 className="font-bold text-gray-900">Your safety comes first</h2>

        <p className="mt-2 text-sm leading-6 text-gray-700">
          Do not attempt to catch the insect or approach a suspected nest simply to obtain a better
          photograph.
        </p>
      </section>

      {/* Camera controls */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            aria-label="Take a photograph of the suspected Asian Hornet"
            disabled={remaining === 0 || processing}
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl bg-amber-500 px-5 py-5 font-bold text-gray-950 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📷 Take Photo
          </button>

          <button
            type="button"
            aria-label="Choose an existing photograph of the suspected Asian Hornet"
            disabled={remaining === 0 || processing}
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-xl border border-gray-300 bg-white px-5 py-5 font-semibold text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Choose Existing Photo
          </button>
        </div>

        {/* Mobile camera */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        {/* Existing photos */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-3 text-center text-sm text-gray-500"
        >
          {photos.length} of {MAX_ASIAN_HORNET_PHOTOS} photographs added
        </p>
      </section>

      {/* GPS */}
      <section
        aria-labelledby="asian-hornet-location-heading"
        className="rounded-2xl border bg-white p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="text-xl">📍</div>

          <div>
            <p id="asian-hornet-location-heading" className="font-semibold text-gray-900">
              Sighting location
            </p>

            {locationState === "requesting" && (
              <p role="status" aria-live="polite" className="text-sm text-gray-500">
                Getting your location…
              </p>
            )}

            {locationState === "available" && (
              <p role="status" aria-live="polite" className="text-sm text-green-700">
                Location captured
                {location?.accuracy
                  ? ` · accuracy approximately ${Math.round(location.accuracy)} m`
                  : ""}
              </p>
            )}

            {locationState === "unavailable" && (
              <div role="status" aria-live="polite" className="text-sm text-gray-600">
                <p>
                  {locationError ||
                    "Location could not be captured. You can choose an apiary or enter the location on the next screen."}
                </p>

                {navigator.geolocation && (
                  <button
                    type="button"
                    onClick={() => setLocationRequestKey((current) => current + 1)}
                    className="mt-2 min-h-[44px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
                  >
                    Retry location
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Photo review */}
      {photos.length > 0 && (
        <section aria-labelledby="asian-hornet-photos-heading">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="asian-hornet-photos-heading" className="text-xl font-bold text-gray-900">
                Your photographs
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Clear photographs from different angles can help with identification.
              </p>
            </div>

            {remaining > 0 && <span className="text-sm text-gray-500">{remaining} remaining</span>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                role="group"
                aria-label={`Photograph ${index + 1} of ${photos.length}`}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.previewUrl}
                    alt={`Suspected Asian Hornet photograph ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Remove photograph ${index + 1}`}
                  disabled={processing}
                  onClick={() => removePhoto(photo.id)}
                  className="w-full border-t px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {errorMessage && (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
        </section>
      )}

      {/* Continue */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <button
          type="button"
          aria-label="Use these photographs and continue to sighting details"
          disabled={!photos.length || saving}
          onClick={continueToObservation}
          className="w-full rounded-xl bg-[#1a3329] px-6 py-4 font-bold text-white transition hover:bg-[#24483a] focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? "Preparing photographs…" : "Use These Photos & Continue"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Your photographs will be stored privately in HiveTag.
        </p>
      </section>
    </div>
  );
}