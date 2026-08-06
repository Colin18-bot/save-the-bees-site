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
  queenCount,
  isPremium,
  queenOnlyAccess,
  includeQueens,
  photoCount,
}) {
  const contents = [
    ...(isPremium
      ? [
          ["Apiaries", apiaries.length],
          ["Hives", hives.length],
          ["Inspections", inspections.length],
          ["Tasks", todos.length],
          ["Logbook Entries", logbook.length],
        ]
      : []),
    ...(includeQueens ? [["Queen Records", queenCount]] : []),
    ...(isPremium ? [["Photographs", photoCount]] : []),
  ];

  return (
    <div className="hidden print:block print-card bg-white">
      <div className="mx-auto flex min-h-[255mm] max-w-4xl flex-col justify-between px-12 py-14">
        <div className="text-center">
          <img src={logo} alt="HiveTag logo" className="mx-auto h-28 w-28 object-contain" />
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.45em] text-green-800">
            HIVETAG
          </p>
          <h1 className="mt-3 text-5xl font-bold text-gray-900">
            {queenOnlyAccess ? "Queen Records Report" : "Beekeeping Report"}
          </h1>
          <div className="mx-auto mt-10 h-px w-40 bg-green-700" />
          <h2 className="mt-10 text-3xl font-semibold text-gray-900">{reportScope}</h2>
          <p className="mt-3 text-lg text-gray-600">
            {fmtUK(fromDate)} – {fmtUK(toDate)}
          </p>
          <p className="mt-2 text-sm text-gray-500">Generated {generatedAt}</p>
        </div>

        <div className="mt-14 rounded-3xl border border-gray-200 bg-gray-50 p-8">
          <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
            Report Contents
          </h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-base">
            {contents.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b pb-2">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs leading-relaxed text-gray-500">
          {queenOnlyAccess ? (
            <p>
              This report has been generated automatically by <strong>HiveTag</strong> using the
              retained Queen Records available to this account in read-only mode.
            </p>
          ) : (
            <>
              <p>
                This report has been generated automatically by <strong>HiveTag</strong> using the
                information recorded within your apiaries, hives, inspections, tasks, logbook and
                selected Queen Records.
              </p>
              <p className="mt-3">
                Inspection summaries and colony insights are intended to support beekeeper decision
                making and should not replace practical hive inspections or official advice from the
                National Bee Unit or your local Bee Inspector.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
