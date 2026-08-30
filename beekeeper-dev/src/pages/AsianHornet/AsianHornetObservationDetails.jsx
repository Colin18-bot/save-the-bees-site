import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../services/supabase";
import {
  findNearestApiary,
  formatApiaryDistance,
} from "./asianHornetLocation";

const NUMBER_OPTIONS = [
  { value: "one", label: "1" },
  { value: "two_to_five", label: "2–5" },
  { value: "six_to_ten", label: "6–10" },
  { value: "more_than_ten", label: "More than 10" },
  { value: "unsure", label: "Unsure" },
];

const BEHAVIOUR_OPTIONS = [
  {
    value: "flying_through_apiary",
    label: "Flying through apiary",
  },
  {
    value: "hawking_near_hive",
    label: "Hovering / hawking near hive entrances",
  },
  {
    value: "catching_bees",
    label: "Catching bees",
  },
  {
    value: "feeding",
    label: "Feeding",
  },
  {
    value: "at_monitoring_point",
    label: "At bait or monitoring point",
  },
  {
    value: "entering_leaving_nest",
    label: "Entering / leaving suspected nest",
  },
  {
    value: "resting",
    label: "Resting",
  },
  {
    value: "other",
    label: "Other",
  },
  {
    value: "unsure",
    label: "Unsure",
  },
];

const DIRECTION_OPTIONS = [
  ["", "Not recorded"],
  ["n", "North"],
  ["ne", "North-east"],
  ["e", "East"],
  ["se", "South-east"],
  ["s", "South"],
  ["sw", "South-west"],
  ["w", "West"],
  ["nw", "North-west"],
  ["unknown", "Direction unknown"],
];

const IDENTIFICATION_OPTIONS = [
  {
    value: "unsure",
    label: "Unsure",
    description:
      "I'm not sure whether it was a Yellow-legged Asian Hornet.",
  },
  {
    value: "possible",
    label: "Possible Asian Hornet",
    description:
      "Some of the identification features appeared to match.",
  },
  {
    value: "suspected",
    label: "Suspected Asian Hornet",
    description:
      "Several of the main identification features appeared to match.",
  },
];

export default function AsianHornetObservationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [observation, setObservation] = useState(null);
  const [apiaries, setApiaries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  const [locationChoice, setLocationChoice] =
    useState("not_apiary");

  const [selectedApiaryId, setSelectedApiaryId] =
    useState("");

  const [manualLocation, setManualLocation] =
    useState("");

  const [numberSeen, setNumberSeen] = useState("");
  const [behaviours, setBehaviours] = useState([]);
  const [flightDirection, setFlightDirection] =
    useState("");

  const [nestSuspected, setNestSuspected] =
    useState("unsure");

  const [identificationStatus, setIdentificationStatus] =
    useState("unsure");

  const [notes, setNotes] = useState("");

  // ----------------------------------------------------------
  // Load the draft observation and active apiaries.
  // RLS guarantees the user can only retrieve their own record.
  // ----------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadError("");

      const [observationResult, apiaryResult] =
        await Promise.all([
          supabase
            .from("asian_hornet_observations")
            .select(`
              id,
              observed_at,
              latitude,
              longitude,
              gps_accuracy_m,
              apiary_id,
              location_source,
              location_text,
              number_seen,
              identification_status,
              behaviours,
              flight_direction,
              nest_suspected,
              notes,
              record_status,
              completed_at
            `)
            .eq("id", id)
            .maybeSingle(),

          supabase
            .from("apiaries")
            .select(`
              id,
              name,
              address,
              latitude,
              longitude,
              is_default
            `)
            .is("archived_at", null)
            .order("name"),
        ]);

      if (!mounted) return;

      if (observationResult.error) {
        console.error(
          "Asian Hornet observation:",
          observationResult.error
        );

        setLoadError(
          "The Asian Hornet observation could not be loaded."
        );

        setLoading(false);
        return;
      }

      if (!observationResult.data) {
        setLoadError(
          "This observation could not be found."
        );

        setLoading(false);
        return;
      }

      const draft = observationResult.data;
      const availableApiaries =
        apiaryResult.data || [];

      setObservation(draft);
      setApiaries(availableApiaries);

      setManualLocation(draft.location_text || "");
      setNumberSeen(draft.number_seen || "");
      setBehaviours(draft.behaviours || []);
      setFlightDirection(
        draft.flight_direction || ""
      );
      setNestSuspected(
        draft.nest_suspected || "unsure"
      );
      setIdentificationStatus(
        draft.identification_status || "unsure"
      );
      setNotes(draft.notes || "");

      if (draft.apiary_id) {
        setLocationChoice("apiary");
        setSelectedApiaryId(draft.apiary_id);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ----------------------------------------------------------
  // Find nearest saved apiary from the GPS captured in Build 4.
  // ----------------------------------------------------------

  const nearestApiary = useMemo(() => {
    if (!observation) return null;

    return findNearestApiary(
      observation.latitude,
      observation.longitude,
      apiaries
    );
  }, [observation, apiaries]);

  // Once the nearest apiary is known, suggest it.
  useEffect(() => {
    if (
      observation &&
      observation.record_status === "draft" &&
      !observation.apiary_id &&
      nearestApiary
    ) {
      setLocationChoice("apiary");
      setSelectedApiaryId(nearestApiary.id);
    }
  }, [observation, nearestApiary]);

  function toggleBehaviour(value) {
    setBehaviours((current) => {
      // "Unsure" should not be combined with other behaviour.
      if (value === "unsure") {
        return current.includes("unsure")
          ? []
          : ["unsure"];
      }

      const withoutUnsure = current.filter(
        (item) => item !== "unsure"
      );

      if (withoutUnsure.includes(value)) {
        return withoutUnsure.filter(
          (item) => item !== value
        );
      }

      return [...withoutUnsure, value];
    });
  }

  // ----------------------------------------------------------
  // Complete the observation.
  // ----------------------------------------------------------

  async function saveObservation(event) {
    event.preventDefault();

    setFormError("");

    if (!numberSeen) {
      setFormError(
        "Please select how many were seen."
      );
      return;
    }

    if (behaviours.length === 0) {
      setFormError(
        "Please select a behaviour, or choose Unsure."
      );
      return;
    }

    let chosenApiary = null;

    if (locationChoice === "apiary") {
      if (!selectedApiaryId) {
        setFormError(
          "Please choose an apiary."
        );
        return;
      }

      chosenApiary = apiaries.find(
        (apiary) => apiary.id === selectedApiaryId
      );

      if (!chosenApiary) {
        setFormError(
          "The selected apiary could not be found."
        );
        return;
      }
    }

    const hasCapturedGps =
      observation.latitude != null &&
      observation.longitude != null;

    if (
      locationChoice === "not_apiary" &&
      !hasCapturedGps &&
      !manualLocation.trim()
    ) {
      setFormError(
        "Please enter the location of the sighting."
      );
      return;
    }

    setSaving(true);

    try {
      let latitude = observation.latitude;
      let longitude = observation.longitude;
      let gpsAccuracy = observation.gps_accuracy_m;

      let apiaryId = null;
      let locationSource = hasCapturedGps
        ? "gps"
        : "manual";

      let locationText =
        manualLocation.trim() || null;

      // ------------------------------------------------------
      // Apiary selected.
      //
      // If actual GPS was captured at the sighting, retain it.
      // The apiary is an association, not a replacement for the
      // more precise sighting coordinates.
      // ------------------------------------------------------

      if (locationChoice === "apiary") {
        apiaryId = chosenApiary.id;
        locationText = chosenApiary.name;

        if (!hasCapturedGps) {
          if (
            chosenApiary.latitude != null &&
            chosenApiary.longitude != null
          ) {
            latitude = Number(
              chosenApiary.latitude
            );

            longitude = Number(
              chosenApiary.longitude
            );
          } else {
            latitude = null;
            longitude = null;
          }

          gpsAccuracy = null;
          locationSource = "apiary";
        }
      }

      // ------------------------------------------------------
      // Not at an apiary.
      // ------------------------------------------------------

      if (locationChoice === "not_apiary") {
        apiaryId = null;

        if (!hasCapturedGps) {
          latitude = null;
          longitude = null;
          gpsAccuracy = null;
          locationSource = "manual";
        }
      }

      const wasAlreadyComplete =
        observation.record_status === "complete";

      const completedAt =
        observation.completed_at ||
        new Date().toISOString();

      const { data, error } = await supabase
        .from("asian_hornet_observations")
        .update({
          apiary_id: apiaryId,

          latitude,
          longitude,
          gps_accuracy_m: gpsAccuracy,

          location_source: locationSource,
          location_text: locationText,

          number_seen: numberSeen,
          behaviours,
          flight_direction:
            flightDirection || null,

          nest_suspected: nestSuspected,
          identification_status:
            identificationStatus,

          notes: notes.trim() || null,

          record_status: "complete",
          completed_at: completedAt,
        })
        .eq("id", id)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "The observation could not be completed."
        );
      }

      // Build 6 will create this page.
      if (wasAlreadyComplete) {
        navigate(
          `/asian-hornet/observations/${id}`
        );
      } else {
        navigate(
          `/asian-hornet/report/${id}`
        );
      }
    } catch (error) {
      console.error(
        "Complete Asian Hornet observation:",
        error
      );

      setFormError(
        error?.message ||
          "The observation could not be saved."
      );
    } finally {
      setSaving(false);
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
          Loading observation…
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
  
  return (
    <form
      onSubmit={saveObservation}
      aria-labelledby="asian-hornet-observation-heading"
      className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"
    >
      {/* Heading */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Suspected sighting
        </p>

        <h1
          id="asian-hornet-observation-heading"
          className="mt-1 text-3xl font-bold text-gray-900"
        >
          {observation?.record_status === "complete"
            ? "Edit Observation"
            : "Observation Details"}
        </h1>

        <p className="mt-2 text-gray-600">
          Add a few details about what you saw.
          This should only take a moment.
        </p>
      </div>

      {/* Captured information */}
      <section
        aria-labelledby="asian-hornet-captured-heading"
        className="rounded-2xl border bg-gray-50 p-5"
      >
        <h2
          id="asian-hornet-captured-heading"
          className="font-bold text-gray-900"
        >
          Captured automatically
        </h2>

        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="font-semibold">
              Date & time:
            </span>{" "}
            {new Date(
              observation.observed_at
            ).toLocaleString("en-GB")}
          </div>

          <div>
            <span className="font-semibold">
              GPS:
            </span>{" "}
            {observation.latitude != null &&
            observation.longitude != null
              ? "Location captured"
              : "Not available"}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <fieldset>
          <legend className="text-xl font-bold text-gray-900">
            Where did you see it?
          </legend>

          {nearestApiary && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-green-800">
                Nearest saved apiary
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {nearestApiary.name}
              </p>

              <p className="text-sm text-gray-600">
                {formatApiaryDistance(
                  nearestApiary.distanceKm
                )}
              </p>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {apiaries.length > 0 && (
              <label className="flex min-h-[44px] cursor-pointer gap-3 rounded-xl border p-4 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1a3329] focus-within:ring-offset-2">
                <input
                  type="radio"
                  name="locationChoice"
                  value="apiary"
                  checked={
                    locationChoice === "apiary"
                  }
                  onChange={() =>
                    setLocationChoice("apiary")
                  }
                  className="mt-1"
                />

                <div className="w-full">
                  <p className="font-semibold text-gray-900">
                    At or near one of my apiaries
                  </p>

                  {locationChoice === "apiary" && (
                    <select
                      id="hornet-apiary"
                      aria-label="Select apiary"
                      value={selectedApiaryId}
                      onChange={(event) =>
                        setSelectedApiaryId(
                          event.target.value
                        )
                      }
                      className="mt-3 min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
                    >
                      <option value="">
                        Select apiary
                      </option>

                      {apiaries.map((apiary) => (
                        <option
                          key={apiary.id}
                          value={apiary.id}
                        >
                          {apiary.name}
                          {nearestApiary?.id ===
                          apiary.id
                            ? " — nearest"
                            : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            )}

            <label className="flex min-h-[44px] cursor-pointer gap-3 rounded-xl border p-4 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1a3329] focus-within:ring-offset-2">
              <input
                type="radio"
                name="locationChoice"
                value="not_apiary"
                checked={
                  locationChoice === "not_apiary"
                }
                onChange={() =>
                  setLocationChoice(
                    "not_apiary"
                  )
                }
                className="mt-1"
              />

              <div className="w-full">
                <p className="font-semibold text-gray-900">
                  Not at an apiary
                </p>

                {locationChoice ===
                  "not_apiary" && (
                  <div className="mt-3">
                    <label
                      htmlFor="hornet-manual-location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Location or place
                      {observation.latitude !=
                        null &&
                      observation.longitude !=
                        null
                        ? " (optional)"
                        : ""}
                    </label>

                    <input
                      id="hornet-manual-location"
                      type="text"
                      value={manualLocation}
                      onChange={(event) =>
                        setManualLocation(
                          event.target.value
                        )
                      }
                      placeholder="e.g. garden, park or nearby road"
                      className="mt-1 min-h-[44px] w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </fieldset>
      </section>

      {/* Number seen */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <fieldset>
          <legend className="text-xl font-bold text-gray-900">
            How many did you see?
          </legend>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {NUMBER_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl border p-3 text-center font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                  numberSeen === option.value
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="numberSeen"
                  value={option.value}
                  checked={
                    numberSeen === option.value
                  }
                  onChange={() =>
                    setNumberSeen(option.value)
                  }
                  className="sr-only"
                />

                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* Behaviour */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <fieldset>
          <legend className="text-xl font-bold text-gray-900">
            What was it doing?
          </legend>

          <p className="mt-1 text-sm text-gray-600">
            Select all that apply.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {BEHAVIOUR_OPTIONS.map(
              (option) => {
                const checked =
                  behaviours.includes(
                    option.value
                  );

                return (
                  <label
                    key={option.value}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border p-4 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                      checked
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleBehaviour(
                          option.value
                        )
                      }
                      className="h-5 w-5"
                    />

                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        </fieldset>
      </section>

      {/* Direction */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <label
          htmlFor="flight-direction"
          className="text-xl font-bold text-gray-900"
        >
          Flight direction
        </label>

        <p
          id="flight-direction-help"
          className="mt-1 text-sm text-gray-600"
        >
          Optional. This may be useful where a
          hornet repeatedly leaves in the same
          direction.
        </p>

        <select
          id="flight-direction"
          aria-describedby="flight-direction-help"
          value={flightDirection}
          onChange={(event) =>
            setFlightDirection(
              event.target.value
            )
          }
          className="mt-4 min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          {DIRECTION_OPTIONS.map(
            ([value, label]) => (
              <option
                key={value || "blank"}
                value={value}
              >
                {label}
              </option>
            )
          )}
        </select>
      </section>

      {/* Nest */}
      <section
        className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
          nestSuspected === "yes"
            ? "border-red-300 bg-red-50"
            : "bg-white"
        }`}
      >
        <fieldset>
          <legend className="text-xl font-bold text-gray-900">
            Do you suspect a nest?
          </legend>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              ["no", "No"],
              ["yes", "Yes"],
              ["unsure", "Unsure"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`min-h-[44px] cursor-pointer rounded-xl border px-5 py-3 font-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                  nestSuspected === value
                    ? value === "yes"
                      ? "border-red-400 bg-red-100"
                      : "border-amber-400 bg-amber-50"
                    : "bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="nestSuspected"
                  value={value}
                  checked={
                    nestSuspected === value
                  }
                  onChange={() =>
                    setNestSuspected(value)
                  }
                  className="sr-only"
                />

                {label}
              </label>
            ))}
          </div>

          {nestSuspected === "yes" && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-5 rounded-xl border border-red-300 bg-white p-4"
            >
              <p className="font-bold text-red-900">
                Do not approach the nest
              </p>

              <p className="mt-2 text-sm leading-6 text-red-800">
                Do not disturb or attempt to
                remove a suspected Yellow-legged
                Asian Hornet nest. Photograph it
                only from a safe distance and
                report it immediately.
              </p>
            </div>
          )}
        </fieldset>
      </section>

      {/* Identification */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <fieldset>
          <legend className="text-xl font-bold text-gray-900">
            How would you describe the sighting?
          </legend>

          <p className="mt-1 text-sm text-gray-600">
            You do not need to be certain.
          </p>

          <div className="mt-4 space-y-3">
            {IDENTIFICATION_OPTIONS.map(
              (option) => (
                <label
                  key={option.value}
                  className={`flex min-h-[44px] cursor-pointer gap-3 rounded-xl border p-4 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                    identificationStatus ===
                    option.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="identificationStatus"
                    value={option.value}
                    checked={
                      identificationStatus ===
                      option.value
                    }
                    onChange={() =>
                      setIdentificationStatus(
                        option.value
                      )
                    }
                    className="mt-1"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      {option.label}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </label>
              )
            )}
          </div>
        </fieldset>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <label
          htmlFor="hornet-notes"
          className="text-xl font-bold text-gray-900"
        >
          Notes
        </label>

        <p
          id="hornet-notes-help"
          className="mt-1 text-sm text-gray-600"
        >
          Optional. Add anything else that may
          help describe the sighting.
        </p>

        <textarea
          id="hornet-notes"
          aria-describedby="hornet-notes-help"
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={5}
          maxLength={2000}
          className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
          placeholder="Additional details..."
        />

        <p className="mt-1 text-right text-xs text-gray-500">
          {notes.length}/2000
        </p>
      </section>

      {/* Error */}
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-medium text-red-800">
            {formError}
          </p>
        </div>
      )}

      {/* Save */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[#1a3329] px-6 py-4 font-bold text-white transition hover:bg-[#24483a] focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving observation…"
            : observation?.record_status === "complete"
            ? "Save Changes"
            : "Save Observation & Continue"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Saving this observation does not submit
          an official Asian Hornet report.
        </p>
      </section>
    </form>
  );
}