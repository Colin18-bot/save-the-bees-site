import React, { useEffect } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ASIAN_HORNET_LEARN_CONTENT,
} from "./asianHornetLearnContent";

export default function AsianHornetLearnPage({
  pageKey,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const page =
    ASIAN_HORNET_LEARN_CONTENT[pageKey];

  useEffect(() => {
    if (!location.hash) return;

    const id =
      location.hash.replace("#", "");

    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }, [location.hash, pageKey]);

  if (!page) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <p className="font-semibold text-red-800">
            This Asian Hornet information page
            could not be found.
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
      </main>
    );
  }

  return (
    <main
      aria-labelledby="asian-hornet-learn-heading"
      className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"
    >
      {/* Back */}
      <button
        type="button"
        onClick={() =>
          navigate("/asian-hornet")
        }
        className="min-h-[44px] rounded-lg px-2 text-sm font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
      >
        ← Asian Hornet Centre
      </button>

      {/* Heading */}
      <section
        aria-labelledby="asian-hornet-learn-heading"
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      >
        <div className="bg-[#1a3329] px-5 py-6 text-white sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            {page.eyebrow}
          </p>

          <h1
            id="asian-hornet-learn-heading"
            className="mt-1 break-words text-3xl font-bold"
          >
            {page.title}
          </h1>
        </div>

        <div className="p-5 sm:p-8">
          <p className="max-w-3xl text-lg leading-8 text-gray-700">
            {page.intro}
          </p>
        </div>
      </section>

      {/* Safety warning */}
      {page.warning && (
        <section
          role="alert"
          aria-labelledby="asian-hornet-safety-warning-heading"
          className="rounded-2xl border border-red-300 bg-red-50 p-5 sm:p-6"
        >
          <p className="text-sm font-bold uppercase tracking-wide text-red-700">
            Safety Warning
          </p>

          <h2
            id="asian-hornet-safety-warning-heading"
            className="mt-1 text-xl font-bold text-red-900"
          >
            {page.warning.title}
          </h2>

          <p className="mt-2 leading-7 text-red-800">
            {page.warning.text}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/asian-hornet/photo")
            }
            className="mt-4 min-h-[44px] rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          >
            Report Suspected Nest
          </button>
        </section>
      )}

      {/* Content sections */}
      {page.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="scroll-mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
        >
          <h2
            id={`${section.id}-heading`}
            className="break-words text-xl font-bold text-gray-900"
          >
            {section.title}
          </h2>

          {section.paragraphs?.map(
            (paragraph, index) => (
              <p
                key={index}
                className="mt-3 break-words leading-7 text-gray-700"
              >
                {paragraph}
              </p>
            )
          )}

          {section.bullets?.length > 0 && (
            <ul className="mt-4 space-y-2 text-gray-700">
              {section.bullets.map(
                (bullet, index) => (
                  <li
                    key={index}
                    className="flex gap-3"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 font-bold text-amber-600"
                    >
                      •
                    </span>

                    <span className="min-w-0 break-words">
                      {bullet}
                    </span>
                  </li>
                )
              )}
            </ul>
          )}

          {section.note && (
            <div
              role="note"
              className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm leading-6 text-amber-900">
                {section.note}
              </p>
            </div>
          )}

          {section.links?.length > 0 && (
            <div
              aria-label={`${section.title} resources`}
              className="mt-5 space-y-3"
            >
              {section.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block min-h-[44px] rounded-xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    link.urgent
                      ? "border-red-300 bg-red-50 hover:bg-red-100 focus:ring-red-700"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100 focus:ring-[#1a3329]"
                  }`}
                >
                  <p
                    className={`break-words font-bold ${
                      link.urgent
                        ? "text-red-800"
                        : "text-[#1a3329]"
                    }`}
                  >
                    {link.label}{" "}
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">
                      {" "}opens in a new tab
                    </span>
                  </p>

                  {link.description && (
                    <p className="mt-1 break-words text-sm leading-6 text-gray-600">
                      {link.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Field action */}
      <section
        aria-labelledby="asian-hornet-field-action-heading"
        className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center shadow-sm sm:p-6"
      >
        <h2
          id="asian-hornet-field-action-heading"
          className="text-xl font-bold text-gray-900"
        >
          Think you've seen one?
        </h2>

        <p className="mt-2 text-gray-700">
          Don't worry about being certain.
          Photograph it from a safe distance
          and report the suspected sighting.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/asian-hornet/photo")
          }
          aria-label="Take a photograph and report a suspected Asian Hornet sighting"
          className="mt-5 min-h-[44px] w-full rounded-xl bg-amber-500 px-6 py-4 font-bold text-gray-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:w-auto"
        >
          📷 Take Photo & Report
        </button>
      </section>

      <div className="pb-4 text-center">
        <button
          type="button"
          onClick={() =>
            navigate("/asian-hornet")
          }
          className="min-h-[44px] rounded-lg px-3 font-semibold text-[#1a3329] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1a3329] focus:ring-offset-2"
        >
          Return to Asian Hornet Centre
        </button>
      </div>
    </main>
  );
}
