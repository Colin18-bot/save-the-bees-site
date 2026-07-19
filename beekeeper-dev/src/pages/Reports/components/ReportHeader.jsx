import React from "react";
import logo from "../../../assets/logo.svg";

export default function ReportHeader({ reportScope, fromDate, toDate, generatedAt, fmtUK }) {
  return (
    <div className="rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 to-yellow-50 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <img src={logo} alt="HiveTag logo" className="h-16 w-16 object-contain" />

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
              HiveTag Professional Report
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Hive Health Report
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-700">
              A printable beekeeping report covering inspections, colony health,
              inspection findings, tasks, logbook records and supporting evidence.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/85 p-4 text-sm text-gray-700 shadow-sm">
          <p><strong>Scope:</strong> {reportScope}</p>
          <p><strong>Date range:</strong> {fmtUK(fromDate)} – {fmtUK(toDate)}</p>
        </div>
      </div>
    </div>
  );
}
