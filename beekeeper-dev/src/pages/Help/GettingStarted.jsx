// src/pages/Help/GettingStarted.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function GettingStarted() {
  useEffect(() => {
    document.title = "Getting Started • BeezKnees";
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back link (same pattern as Updates) */}
      <Link
        to="/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <span className="mr-2" aria-hidden="true">
          ←
        </span>
        Back to Dashboard
      </Link>

      <h2 className="text-2xl font-bold mb-2">Getting Started</h2>
      <p className="text-sm text-gray-600 mb-6">
        A quick overview of how BeezKnees is structured, and how most beekeepers
        use it day-to-day.
      </p>

      <div className="space-y-6">
        {/* Overview card */}
        <section className="border rounded-lg bg-white">
          <header className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">
              Welcome to BeezKnees
            </h2>
          </header>
          <div className="p-4 space-y-3 text-sm text-gray-800">
            <p>
              This app is designed to help you keep clear, consistent records of
              your apiaries and colonies without replacing your own judgement or
              routine. It mirrors the way most beekeepers already work — just in
              a structured, digital format.
            </p>
            <p className="text-gray-700">
              You don’t need to set everything up at once. Many users start small
              and add detail over time.
            </p>
          </div>
        </section>

        {/* Structure card */}
        <section className="border rounded-lg bg-white">
          <header className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">
              How the app fits together
            </h2>
          </header>

          <div className="p-4 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Typical order
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                <li>
                  Create an <strong>apiary</strong> (a location where you keep
                  bees).
                </li>
                <li>
                  Add one or more <strong>hives</strong> within that apiary.
                </li>
                <li>
                  Record <strong>inspections</strong> over time to build a clear
                  colony history.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Supporting records
              </h3>
              <p className="text-sm text-gray-800">
                Notes, to-dos, and other records sit alongside inspections to
                help you keep track of actions, observations, and reminders
                between visits.
              </p>
              <p className="text-sm text-gray-700 mt-3">
                There is no “right” level of detail — record only what you find
                useful.
              </p>
            </div>
          </div>
        </section>

        {/* Inspections card */}
        <section className="border rounded-lg bg-white">
          <header className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">
              Inspections and records
            </h2>
          </header>
          <div className="p-4 space-y-3 text-sm text-gray-800">
            <p>
              Inspections form the core of the app. Each inspection adds to the
              long-term picture of a colony’s health and progress. Over time,
              this makes it easier to spot patterns, remember past decisions,
              and review what worked and what didn’t.
            </p>
            <p className="text-gray-800">
              You can also use the logbook and notes areas for anything that
              doesn’t fit neatly into an inspection, such as quick observations,
              plans, or follow-ups.
            </p>
          </div>
        </section>

        {/* Optional features card */}
        <section className="border rounded-lg bg-white">
          <header className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">
              Optional features
            </h2>
          </header>
          <div className="p-4 space-y-3 text-sm text-gray-800">
            <p>
              Some features are entirely optional and can be ignored if they’re
              not relevant to you. These include weather-linked information, NFC
              hive tags, inventory tracking, and health guidance tools.
            </p>
            <p className="text-gray-700">Use what helps you. Leave the rest.</p>
          </div>
        </section>

        {/* Key takeaway card */}
        <section className="border rounded-lg bg-white">
          <header className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">
              A simple approach works best
            </h2>
          </header>
          <div className="p-4 grid md:grid-cols-2 gap-6">
            <div className="text-sm text-gray-800 space-y-3">
              <p>
                BeezKnees is intended to support your beekeeping, not interrupt
                it. Many experienced users record only brief notes at the apiary
                and add more detail later if needed.
              </p>
              <p className="text-gray-700">
                Once you’re set up, the dashboard simply reflects the information
                you’ve already recorded.
              </p>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
                If you ever feel unsure where to start
              </p>
              <p className="text-lg font-bold text-gray-900">
                Apiary → Hive → Inspection
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Everything else builds naturally from there.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
