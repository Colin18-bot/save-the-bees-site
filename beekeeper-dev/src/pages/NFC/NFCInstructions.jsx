// src/pages/NFC/NFCInstructions.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function NFCInstructions() {
  useEffect(() => {
    document.title = "NFC Tag Setup • BeezKnees";
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 print:shadow-none print:p-0">
        {/* Header */}
        <header className="mb-4 border-b pb-3">
          <h1 className="text-2xl font-bold">
            BeezKnees HiveTag NFC — Quick Start
          </h1>
          <p className="text-gray-600 mt-1">
            Use this page as a printable insert to ship with NFC tags, or save
            as PDF to share with your beekeepers.
          </p>
          <p className="text-xs text-gray-500 mt-1 no-print">
            Tip: Use your browser’s <strong>Print → Save as PDF</strong> to
            create a downloadable version.
          </p>

          {/* Print button – visible on screen only */}
          <button
            type="button"
            onClick={handlePrint}
            className="no-print mt-3 inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <span aria-hidden="true">🖨️</span>
            <span>Print this NFC setup card</span>
          </button>
        </header>

        {/* Card content */}
        <section className="space-y-4 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-1">
              How to set up your NFC HiveTag
            </h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>Stick the tag on your hive.</strong> Choose a clean, dry
                spot on the front or roof edge where your phone can easily reach
                it.
              </li>
              <li>
                <strong>Open BeezKnees on your phone.</strong> Sign in and go to{" "}
                <em>Scan NFC Tag (Premium)</em>.
              </li>
              <li>
                <strong>Tap your phone on the tag.</strong> Hold the back of
                your phone close until it beeps or vibrates. If the tag is new,
                the app will tell you it isn’t linked yet.
              </li>
              <li>
                <strong>Assign the tag to a hive.</strong> Choose the Apiary and
                Hive in the app, then save. The tag is now linked to that hive.
              </li>
              <li>
                <strong>Next visits:</strong> open <em>Scan NFC Tag</em> again
                and tap the tag. BeezKnees jumps straight into that hive’s
                inspection flow – either a new inspection or the hive’s
                inspection history.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Beekeeping tips</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Avoid opening hives in strong winds or when it’s below about{" "}
                10&nbsp;°C / 50&nbsp;°F.
              </li>
              <li>
                Use the <strong>Weather</strong> page in BeezKnees to plan
                inspection days around calmer, warmer conditions.
              </li>
              <li>
                If a tag gets damaged, simply stick a new one on the hive and
                assign it in the app – hive records stay intact.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Troubleshooting</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Make sure NFC is enabled in your phone’s settings.</li>
              <li>
                Hold the phone close to different parts of the tag – NFC
                antennas are small and their position varies by phone.
              </li>
              <li>
                Web NFC is supported in Chrome for Android. On iOS, use
                QR-coded tags or the standard inspection flow if NFC is not
                available.
              </li>
              <li>
                If you see “Tag already linked”, open that hive in BeezKnees and
                update or clear the tag from the hive’s settings before
                re-assigning it.
              </li>
            </ul>
          </div>
        </section>

            {/* Footer actions (not printed as part of the card if you don't want) */}
        <footer className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 no-print">
          <span>© {new Date().getFullYear()} BeezKnees — HiveTag NFC</span>
          <div className="flex gap-3">
            <Link to="/help#nfc" className="text-blue-600 hover:underline">
              More about NFC in Help →
            </Link>
            <Link to="/nfc/manage" className="text-blue-600 hover:underline">
              Open NFC Tag Manager →
            </Link>
          </div>
        </footer>

      </div>
    </main>
  );
}
