import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { asianHornetFeatures } from "./asianHornetContent";

const IMAGE_PATH =
  "/images/asian-hornet/asian-hornet-identification.jpg";

export default function AsianHornetIdentify() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [imageMissing, setImageMissing] = useState(false);

  const toggleFeature = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const severalMatch = selected.length >= 3;
  const someMatch = selected.length > 0 && selected.length < 3;

  return (
    <main
      aria-labelledby="asian-hornet-identify-heading"
      className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/asian-hornet")}
          className="mb-3 min-h-[44px] rounded-lg px-2 text-sm font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          ← Asian Hornet Centre
        </button>

        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Quick Identification
        </p>

        <h1
          id="asian-hornet-identify-heading"
          className="mt-1 text-3xl font-bold text-gray-900"
        >
          Is it a Yellow-legged Asian Hornet?
        </h1>

        <p className="mt-2 max-w-3xl text-gray-600">
          Look for the combination of features below. You do not need
          to be certain before reporting a suspected sighting.
        </p>
      </div>

      {/* Main image */}
      <section
        aria-labelledby="asian-hornet-identification-image-heading"
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <h2
          id="asian-hornet-identification-image-heading"
          className="sr-only"
        >
          Yellow-legged Asian Hornet identification image
        </h2>

        {!imageMissing ? (
          <img
            src={IMAGE_PATH}
            alt="Yellow-legged Asian Hornet identification showing its dark body, yellow-ended legs, orange face and broad orange abdominal band"
            className="max-h-[520px] w-full bg-gray-50 object-contain"
            onError={() => setImageMissing(true)}
          />
        ) : (
          <div
            role="status"
            className="flex min-h-[320px] items-center justify-center bg-gray-100 p-8 text-center"
          >
            <div>
              <div className="text-5xl" aria-hidden="true">
                🐝
              </div>

              <p className="mt-4 font-semibold text-gray-800">
                Authoritative identification image
              </p>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                This image position is ready for the approved
                National Bee Unit / APHA identification photograph.
              </p>
            </div>
          </div>
        )}

        <div className="border-t bg-gray-50 px-4 py-3 text-xs text-gray-500">
          Image credit will appear here when the final authorised
          image is installed.
        </div>
      </section>

      {/* Four features */}
      <section aria-labelledby="asian-hornet-four-features-heading">
        <h2
          id="asian-hornet-four-features-heading"
          className="text-xl font-bold text-gray-900"
        >
          Look for all four features
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {asianHornetFeatures.map((feature) => (
            <div
              key={feature.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-gray-950"
                >
                  {feature.marker}
                </div>

                <div className="min-w-0">
                  <h3 className="break-words font-bold text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="mt-1 font-medium text-gray-700">
                    {feature.short}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section
        aria-labelledby="asian-hornet-feature-checklist-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
      >
        <h2
          id="asian-hornet-feature-checklist-heading"
          className="text-xl font-bold text-gray-900"
        >
          What can you see?
        </h2>

        <p
          id="asian-hornet-feature-checklist-help"
          className="mt-1 text-sm text-gray-600"
        >
          Select the features that appear to match the insect you saw.
        </p>

        <div
          role="group"
          aria-labelledby="asian-hornet-feature-checklist-heading"
          aria-describedby="asian-hornet-feature-checklist-help"
          className="mt-5 space-y-3"
        >
          {asianHornetFeatures.map((feature) => {
            const checked = selected.includes(feature.id);

            return (
              <label
                key={feature.id}
                className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border p-4 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                  checked
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFeature(feature.id)}
                  className="h-5 w-5 shrink-0"
                />

                <span className="font-medium text-gray-900">
                  {feature.title}
                </span>
              </label>
            );
          })}
        </div>

        {/* Guidance – deliberately NOT a probability */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {severalMatch && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <h3 className="font-bold text-gray-900">
                It could be a Yellow-legged Asian Hornet
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-700">
                Don't worry about being certain. Try to take a clear
                photograph from a safe distance and report the suspected
                sighting for expert identification.
              </p>
            </div>
          )}

          {someMatch && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-700">
                Some features match, but other insects can look similar.
                Compare the common lookalikes or report the sighting if
                you remain suspicious.
              </p>
            </div>
          )}

          {selected.length === 0 && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-700">
                Select any features you recognise. If you are unsure,
                compare the common lookalikes below.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/asian-hornet/photo")}
            aria-label="Take a photograph and report a suspected Asian Hornet sighting"
            className="min-h-[44px] rounded-xl bg-amber-500 px-5 py-4 font-bold text-gray-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            📷 Take Photo & Report
          </button>

          <button
            type="button"
            onClick={() => navigate("/asian-hornet/compare")}
            className="min-h-[44px] rounded-xl border border-gray-300 px-5 py-4 font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Compare Lookalikes
          </button>
        </div>
      </section>

      {/* Size */}
      <section
        aria-labelledby="asian-hornet-size-heading"
        className="rounded-2xl border bg-white p-5 shadow-sm"
      >
        <h2
          id="asian-hornet-size-heading"
          className="font-bold text-gray-900"
        >
          Approximate size
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Workers can reach approximately 25 mm and queens approximately
          30 mm. Size alone should never be used to identify a suspected
          Asian Hornet.
        </p>
      </section>

      {/* Safety */}
      <section
        aria-labelledby="asian-hornet-nest-safety-heading"
        className="rounded-2xl border border-red-200 bg-red-50 p-5"
      >
        <h2
          id="asian-hornet-nest-safety-heading"
          className="font-bold text-red-900"
        >
          Suspected nest?
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-800">
          Do not approach, disturb or attempt to remove a suspected
          Yellow-legged Asian Hornet nest. Photograph only from a safe
          distance and report it immediately.
        </p>
      </section>
    </main>
  );
}
