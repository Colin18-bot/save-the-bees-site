import React, { useEffect } from "react";
import Help from "../Help.jsx";
import VeterinaryMedicinesHelp from "./VeterinaryMedicinesHelp.jsx";

export default function HelpHub() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const timer = window.setTimeout(() => {
      const target = document.querySelector(hash);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="px-6 pt-6">
        <div className="mx-auto max-w-7xl rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-green-800">
                New in HiveTag 1.5.6
              </div>
              <div className="mt-1 font-semibold text-green-950">Veterinary Medicines</div>
              <p className="mt-1 text-sm text-green-900">
                Guidance is now available for medicine purchases, treatment records, inspection
                linkage, completion, overdue treatments, disposal of unused medicine and printing.
              </p>
            </div>
            <a
              href="#veterinary-medicines"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-900 hover:bg-green-100"
            >
              Open Veterinary Medicines guide
            </a>
          </div>
        </div>
      </div>

      <Help />

      <div className="px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="hidden lg:block" aria-hidden="true" />
            <article className="lg:col-span-3">
              <VeterinaryMedicinesHelp />
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
