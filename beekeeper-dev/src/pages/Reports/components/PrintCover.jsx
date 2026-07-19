import React from "react";
import logo from "../../../assets/logo.svg";

export default function PrintCover({
  reportScope,
  fromDate,
  toDate,
  generatedAt,
  fmtUK,
  apiaries,
  hives,
  inspections,
  todos,
  logbook,
  photoCount,
}) {
  return (
    <div className="hidden print:block print-card bg-white">
      <div className="mx-auto flex min-h-[255mm] max-w-4xl flex-col justify-between px-12 py-14">

        {/* Header */}
        <div className="text-center">
          <img
            src={logo}
            alt="HiveTag logo"
            className="mx-auto h-28 w-28 object-contain"
          />

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.45em] text-green-800">
            HIVETAG
          </p>

          <h1 className="mt-3 text-5xl font-bold text-gray-900">
            Beekeeping Report
            <br />
          </h1>

          <div className="mx-auto mt-10 h-px w-40 bg-green-700" />

          <h2 className="mt-10 text-3xl font-semibold text-gray-900">
            {reportScope}
          </h2>

          <p className="mt-3 text-lg text-gray-600">
            {fmtUK(fromDate)} – {fmtUK(toDate)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Generated {generatedAt}
          </p>
        </div>

        {/* Contents */}
        <div className="mt-14 rounded-3xl border border-gray-200 bg-gray-50 p-8">
          <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
            Report Contents
          </h3>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-base">

            <div className="flex justify-between border-b pb-2">
              <span>Apiaries</span>
              <strong>{apiaries.length}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Hives</span>
              <strong>{hives.length}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Inspections</span>
              <strong>{inspections.length}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Tasks</span>
              <strong>{todos.length}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Logbook Entries</span>
              <strong>{logbook.length}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Photographs</span>
              <strong>{photoCount}</strong>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t pt-6 text-center text-xs leading-relaxed text-gray-500">
          <p>
            This report has been generated automatically by <strong>HiveTag</strong>
            {" "}using the information recorded within your apiaries, hives,
            inspections, tasks and logbook.
          </p>

          <p className="mt-3">
            Inspection summaries and colony insights are intended to support
            beekeeper decision making and should not replace practical hive
            inspections or official advice from the National Bee Unit or your
            local Bee Inspector.
          </p>
        </div>

      </div>
    </div>
  );
}