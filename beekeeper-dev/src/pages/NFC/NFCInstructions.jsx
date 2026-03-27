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
        <header className="mb-4 border-b pb-3">
          <h1 className="text-2xl font-bold">HiveTag NFC — Quick Start</h1>
          <p className="text-gray-600 mt-1">
            Use this page as a simple quick-start guide for setting up and using
            HiveTag NFC labels with both Android and iPhone.
          </p>
          <p className="text-xs text-gray-500 mt-1 no-print">
            Tip: Use your browser’s <strong>Print → Save as PDF</strong> to
            create a version you can share with your members or customers.
          </p>

          <button
            type="button"
            onClick={handlePrint}
            className="no-print mt-3 inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <span aria-hidden="true">🖨️</span>
            <span>Print this NFC setup card</span>
          </button>
        </header>

        <section className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-1">Before you start</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                HiveTag NFC is a <strong>Premium</strong> feature.
              </li>
              <li>
                Attach the NFC tag to a clean, dry part of the hive where your phone can easily reach it. You can also secure it with a small screw through the centre to prevent it coming loose.
              </li>
              <li>
                Open <strong>Scan NFC Tag</strong> in HiveTag to choose the
                correct setup method for your device.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">
              Android setup (blank tag scan)
            </h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Open <strong>Scan NFC Tag</strong> in HiveTag.
              </li>
              <li>
                In the <strong>Android setup</strong> section, tap{" "}
                <strong>Scan Blank NFC Tag</strong>.
              </li>
              <li>
                Hold the back of your Android phone against the blank NFC tag.
              </li>
              <li>
                If the tag is not linked yet, HiveTag will let you choose a hive
                and assign the tag.
              </li>
              <li>
                On future visits, scan the same tag again to jump straight into
                that hive’s inspection flow.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">
              iPhone / iPad setup (write a HiveTag link)
            </h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Open <strong>Scan NFC Tag</strong> in HiveTag.
              </li>
              <li>
                In the <strong>iPhone / iPad setup</strong> section, choose the{" "}
                <strong>Apiary</strong> and <strong>Hive</strong>.
              </li>
              <li>
                Tap <strong>Copy NFC Link</strong>.
              </li>
              <li>
                Open an NFC writing app on your iPhone or iPad, such as{" "}
                <a
                  href="https://apps.apple.com/gb/app/nfc-tools/id1252962749"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  NFC Tools
                </a>
                , and paste the copied HiveTag link into the app.
              </li>
              <li>
                Write the link to the NFC tag.
              </li>
              <li>
                Once written, you do not need the writing app again just to scan the tag —
                tapping the tag should open HiveTag directly.
              </li>
              <li>
                Next time you tap that tag with your iPhone, it will open the
                linked hive in HiveTag.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">
              Reusing or reassigning a tag
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Android:</strong> you can clear or relink a tag inside
                HiveTag by updating the hive linked to that tag ID.
              </li>
              <li>
                <strong>iPhone / iPad:</strong> you can clear the saved iPhone / iPad NFC
                status in HiveTag, then reuse the same physical tag by writing a new
                HiveTag link onto it.
              </li>
              <li>
                In most NFC writing apps, you can simply overwrite the existing
                link. If needed, erase the tag first and then write the new
                link.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Beekeeping tips</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Avoid opening hives in strong winds or when it’s below about{" "}
                10&nbsp;°C / 50&nbsp;°F.
              </li>
              <li>
                Use the <strong>Weather</strong> page in HiveTag to plan
                inspection days around calmer, warmer conditions.
              </li>
              <li>
                If a tag gets damaged, replace it and set up the new tag for the
                same hive.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Troubleshooting</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Make sure NFC is enabled on your phone if your device supports it.</li>
              <li>
                Hold the phone close to different parts of the tag, as antenna
                position varies by device.
              </li>
              <li>
                <strong>Android Web NFC</strong> works best in Chrome on Android.
              </li>
              <li>
                <strong>iPhone and iPad</strong> do not support browser-based Web
                NFC in the same way, so use the HiveTag link method instead.
              </li>
              <li>
                If an Android tag is already linked to another hive, open{" "}
                <strong>Manage NFC tags</strong> in HiveTag and clear or update
                the link before reassigning it.
              </li>
              <li>
                If your Android phone shows a system message such as{" "}
                <strong>“New tag collected”</strong> or{" "}
                <strong>“Empty tag”</strong>, reopen{" "}
                <strong>Scan NFC Tag</strong>, tap{" "}
                <strong>Scan Blank NFC Tag</strong>, and then tap the tag again.
              </li>
              <li>
                If an iPhone tag opens the wrong hive, clear the iPhone / iPad NFC
                status in HiveTag if needed, then rewrite the tag with the correct
                copied HiveTag link.
              </li>
            </ul>
          </div>
        </section>

        <footer className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 no-print">
          <span>© {new Date().getFullYear()} BeezKnees — HiveTag NFC</span>
          <div className="flex gap-3">
            <Link to="/help#nfc" className="text-blue-600 hover:underline">
              More about NFC in Help →
            </Link>
            <Link to="/nfc/manage" className="text-blue-600 hover:underline">
              Manage Android NFC Tags →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}