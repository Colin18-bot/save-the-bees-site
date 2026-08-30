import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  asianHornetComparison,
  lookalikes,
} from "./asianHornetContent";

function SpeciesImage({ src, name }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <div
        role="status"
        className="flex h-52 items-center justify-center bg-gray-100 p-5 text-center"
      >
        <div>
          <div className="text-4xl" aria-hidden="true">
            🐝
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            {name} image
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Authorised image to be added
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setMissing(true)}
      className="h-52 w-full bg-gray-50 object-contain"
    />
  );
}

function ComparisonRow({ label, asian, comparison }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-t py-4 text-sm sm:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3">
      <div className="break-words font-semibold text-gray-700">
        {label}
      </div>

      <div className="min-w-0 break-words text-gray-700">
        {asian}
      </div>

      <div className="min-w-0 break-words text-gray-700">
        {comparison}
      </div>
    </div>
  );
}

export default function AsianHornetCompare() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("european-hornet");

  const comparison =
    lookalikes.find((item) => item.id === selectedId) ||
    lookalikes[0];

  return (
    <main
      aria-labelledby="asian-hornet-compare-heading"
      className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6"
    >
      <div>
        <button
          type="button"
          onClick={() => navigate("/asian-hornet/identify")}
          className="mb-3 min-h-[44px] rounded-lg px-2 text-sm font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          ← Identification
        </button>

        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Identification
        </p>

        <h1
          id="asian-hornet-compare-heading"
          className="mt-1 text-3xl font-bold text-gray-900"
        >
          Compare Lookalikes
        </h1>

        <p className="mt-2 text-gray-600">
          Keep the Yellow-legged Asian Hornet on the left and compare
          it with insects commonly mistaken for it.
        </p>
      </div>

      {/* Selector */}
      <section
        aria-labelledby="asian-hornet-lookalike-selector-heading"
        className="min-w-0"
      >
        <h2
          id="asian-hornet-lookalike-selector-heading"
          className="sr-only"
        >
          Choose a species to compare
        </h2>

        <div
          role="group"
          aria-label="Choose a lookalike species"
          className="flex max-w-full gap-2 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {lookalikes.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
              className="group flex min-h-[44px] shrink-0 items-center whitespace-nowrap focus:outline-none"
            >
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold leading-5 transition group-focus-visible:ring-2 group-focus-visible:ring-amber-400 group-focus-visible:ring-inset ${
                  selectedId === item.id
                    ? "bg-[#1a3329] text-white"
                    : "border bg-white text-gray-700 group-hover:bg-gray-50"
                }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Species cards */}
      <section
        aria-label={`Asian Hornet compared with ${comparison.name}`}
        className="grid min-w-0 grid-cols-2 gap-3 sm:gap-5"
      >
        <article className="min-w-0 overflow-hidden rounded-2xl border border-amber-300 bg-white shadow-sm">
          <SpeciesImage
            src={asianHornetComparison.image}
            name={asianHornetComparison.name}
          />

          <div className="min-w-0 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">
              Report suspected sightings
            </p>

            <h2 className="mt-1 break-words font-bold text-gray-900 sm:text-xl">
              Asian Hornet
            </h2>

            <p className="break-words text-xs italic text-gray-500 sm:text-sm">
              {asianHornetComparison.scientificName}
            </p>
          </div>
        </article>

        <article className="min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <SpeciesImage
            src={comparison.image}
            name={comparison.name}
          />

          <div className="min-w-0 p-4">
            {comparison.native && (
              <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                Native species
              </p>
            )}

            <h2 className="mt-1 break-words font-bold text-gray-900 sm:text-xl">
              {comparison.name}
            </h2>

            <p className="break-words text-xs italic text-gray-500 sm:text-sm">
              {comparison.scientificName}
            </p>
          </div>
        </article>
      </section>

      {/* Comparison */}
      <section
        aria-labelledby="asian-hornet-comparison-details-heading"
        className="min-w-0 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:p-6"
      >
        <h2
          id="asian-hornet-comparison-details-heading"
          className="sr-only"
        >
          Identification feature comparison
        </h2>

        <div className="grid grid-cols-[72px_minmax(0,1fr)_minmax(0,1fr)] gap-2 pb-3 text-xs font-bold uppercase tracking-wide text-gray-500 sm:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-3">
          <div>Feature</div>
          <div className="min-w-0 break-words">Asian Hornet</div>
          <div className="min-w-0 break-words">
            {comparison.name}
          </div>
        </div>

        <ComparisonRow
          label="Body"
          asian={asianHornetComparison.body}
          comparison={comparison.body}
        />

        <ComparisonRow
          label="Face"
          asian={asianHornetComparison.face}
          comparison={comparison.face}
        />

        <ComparisonRow
          label="Legs"
          asian={asianHornetComparison.legs}
          comparison={comparison.legs}
        />

        <ComparisonRow
          label="Abdomen"
          asian={asianHornetComparison.abdomen}
          comparison={comparison.abdomen}
        />

        <ComparisonRow
          label="Size"
          asian={asianHornetComparison.size}
          comparison={comparison.size}
        />
      </section>

      {/* Giveaway */}
      <section
        aria-label="Key distinguishing features"
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h3 className="font-bold text-gray-900">
            Asian Hornet giveaway
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-700">
            {asianHornetComparison.giveaway}
          </p>
        </div>

        <div className="rounded-2xl border bg-gray-50 p-5">
          <h3 className="break-words font-bold text-gray-900">
            {comparison.name} giveaway
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-700">
            {comparison.giveaway}
          </p>
        </div>
      </section>

      {comparison.id === "european-hornet" && (
        <section
          aria-labelledby="european-hornet-native-heading"
          className="rounded-2xl border border-green-200 bg-green-50 p-5"
        >
          <h2
            id="european-hornet-native-heading"
            className="font-bold text-green-900"
          >
            European Hornets are native
          </h2>

          <p className="mt-2 text-sm leading-6 text-green-800">
            Do not harm or report a European Hornet simply because it
            is a hornet. Use the distinguishing features above to help
            separate it from the invasive Yellow-legged Asian Hornet.
          </p>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
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
          onClick={() =>
            window.open(
              "https://risc.brc.ac.uk/alert.php?species=asian_hornet",
              "_blank",
              "noopener,noreferrer"
            )
          }
          aria-label="Open the official Biological Records Centre Asian Hornet reporting service"
          className="min-h-[44px] rounded-xl border border-red-300 bg-red-50 px-5 py-4 font-semibold text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        >
          Report Anyway
        </button>
      </div>
    </main>
  );
}
