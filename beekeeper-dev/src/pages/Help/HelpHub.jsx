import React, { useEffect } from "react";
import Help from "../Help.jsx";
import VeterinaryMedicinesHelp from "./VeterinaryMedicinesHelp.jsx";

export default function HelpHub() {
  useEffect(() => {
    const nav = document.querySelector("main#top aside nav");
    let veterinaryLink = nav?.querySelector('a[href="#veterinary-medicines"]');

    if (nav && !veterinaryLink) {
      veterinaryLink = document.createElement("a");
      veterinaryLink.href = "#veterinary-medicines";
      veterinaryLink.textContent = "Veterinary Medicines";
      veterinaryLink.className = "block text-sm text-blue-700 hover:underline";
      nav.appendChild(veterinaryLink);
    }

    const hash = window.location.hash;
    let timer;
    if (hash) {
      timer = window.setTimeout(() => {
        const target = document.querySelector(hash);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      veterinaryLink?.remove();
    };
  }, []);

  return (
    <>
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
