// src/pages/Help.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const toc = [
  { id: "disclaimer", title: "Educational & Inspection-Support Disclaimer" },
  { id: "concepts", title: "Key Concepts" },
  { id: "membership", title: "Membership & Feature Availability" },
  { id: "getting-started", title: "Getting Started" },
  { id: "siting-guides", title: "Apiary & Hive Siting Guides" },
  { id: "navigation", title: "Navigation Overview" },
  { id: "queens", title: "Queen Records & Colony Lifecycle" },
  { id: "apiary-map-markers", title: "Apiary Map Markers (Map Notes)" },
  { id: "bee-health-helper", title: "Colony Health Check (Bee Health Helper)" },
  { id: "hive-health", title: "Hive Health" },
  { id: "seasonal-guide", title: "Year in the Apiary Seasonal Guide" },
  { id: "business-inventory", title: "Inventory, Sales & Expenses" },
  { id: "currency-defaults", title: "Default Currency (How It Works)" },
  { id: "reports", title: "Reports Centre" },
  { id: "workflows", title: "Typical Workflows" },
  { id: "nfc", title: "NFC (Premium): How It Works" },
  { id: "weather-maps-photos", title: "Weather, Maps & Photos" },
  { id: "filters-counts-archives", title: "Filters, Counts & Archives" },
  { id: "tips", title: "Tips for Smooth Record-Keeping" },
  { id: "faqs", title: "FAQs" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "privacy", title: "Privacy & Data" },
  { id: "power-users", title: "Power-User Notes" },
  { id: "glossary", title: "Glossary" },
];

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    green: "bg-green-100 text-green-900 border-green-200",
    blue: "bg-blue-100 text-blue-900 border-blue-200",
    amber: "bg-amber-100 text-amber-900 border-amber-200",
    rose: "bg-rose-100 text-rose-900 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function Help() {
  useEffect(() => {
    document.title = "Help • BeezKnees";
  }, []);

  return (
    <main id="top" className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h2 className="text-3xl font-bold">HiveTag Help &amp; How-To</h2>
          <p className="mt-2 text-gray-600">
            Clear, practical guidance for every part of HiveTag—from your first apiary and inspection
            to Queen lifecycle records, reports and NFC tag setup.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Features labelled <Badge tone="blue">Premium</Badge> require a Premium plan. If you
            downgrade, existing Queen Records remain available in{" "}
            <Badge tone="amber">Read only</Badge> mode and can still be reported and exported.
          </p>
        </header>

        <section className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="text-xl font-bold text-blue-950">Which HiveTag feature should I use?</h2>

          <p className="mt-2 text-sm text-blue-900">
            Start by recording an inspection. Then choose the tool that best matches what you want
            to do next.
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border border-blue-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-blue-100 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Recording and reviewing colonies</h3>

                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-900">Inspections</dt>
                    <dd className="text-gray-700">
                      Record what you observed during a hive visit, including queen evidence, brood,
                      stores, varroa, disease signs, notes and photos.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-gray-900">
                      Queen Records <Badge tone="blue">Premium</Badge>
                    </dt>
                    <dd className="text-gray-700">
                      Track current and previous Queens, splits and transfers, introductions,
                      Queenless periods and requeening history. Retained records remain{" "}
                      <Badge tone="amber">Read only</Badge> after downgrade.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-gray-900">
                      Hive Health <Badge tone="blue">Premium</Badge>
                    </dt>
                    <dd className="text-gray-700">
                      Review health scores, colony status, risks, trends and recommended actions
                      using your saved inspection history.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-gray-900">
                      Colony Health Check <Badge tone="blue">Premium</Badge>
                    </dt>
                    <dd className="text-gray-700">
                      Use guided questions when something does not look right and you want help
                      deciding what to check next.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Planning and record keeping</h3>

                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-900">
                      Year in the Apiary <Badge tone="blue">Premium</Badge>
                    </dt>
                    <dd className="text-gray-700">
                      Review seasonal priorities and create tasks for the work you want to carry
                      out.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-gray-900">
                      Reports Centre <Badge tone="blue">Premium</Badge>
                    </dt>
                    <dd className="text-gray-700">
                      Build, review, print and export filtered reports. Free members with retained
                      Queen data can continue using Queen Reports in{" "}
                      <Badge tone="amber">Read only</Badge> mode.
                    </dd>
                  </div>

                  <div>
                    <dt className="font-medium text-gray-900">Tasks</dt>
                    <dd className="text-gray-700">
                      Record follow-up jobs, due dates and actions for a specific apiary, hive or
                      inspection.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* TOC */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 border rounded-xl bg-white p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                On this page
              </h2>
              <nav className="space-y-2">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-blue-700 hover:underline"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="lg:col-span-3 space-y-12">
            <section id="disclaimer">
              <h2 className="text-2xl font-bold mb-3">
                Educational &amp; Inspection-Support Disclaimer
              </h2>

              <div className="rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <p>
                  HiveTag is designed to support beekeepers by providing educational information,
                  record-keeping tools and inspection-support guidance.
                </p>

                <p className="mt-2">
                  HiveTag does not diagnose disease, confirm colony health, guarantee treatment
                  outcomes or replace physical hive inspections, beekeeper judgement, laboratory
                  testing, official reporting requirements, bee inspectors or advice from other
                  qualified professionals.
                </p>

                <p className="mt-2">
                  You remain responsible for all hive-management, feeding, treatment, biosecurity
                  and disease-reporting decisions, including decisions made using information
                  provided by HiveTag.
                </p>

                <p className="mt-2">
                  Where a notifiable disease or pest is suspected, do not move bees, colonies,
                  frames, comb, honey or equipment. Follow current official UK bee-health guidance
                  and reporting requirements.
                </p>
              </div>
            </section>
            {/* Key Concepts */}
            <section id="concepts">
              <h2 className="text-2xl font-bold mb-3">Key Concepts (Data Model)</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Apiary</strong> — a location where hives live.
                </li>
                <li>
                  <strong>Hive</strong> — an individual hive in an apiary (photo, type, status,
                  optional NFC tag).
                </li>
                <li>
                  <strong>Inspection</strong> — a dated record about a hive (weather, behaviour,
                  brood, stores, disease/pests, notes, photos).
                </li>
                <li>
                  <strong>Queen Record</strong> — the identity and details of a Queen, including her
                  reference, year, marking colour, status and notes.
                </li>
                <li>
                  <strong>Queen Assignment</strong> — the period during which a Queen is associated
                  with a particular hive. Moving a Queen creates a new assignment without rewriting
                  the earlier history.
                </li>
                <li>
                  <strong>Queen Transition</strong> — a managed process such as introducing a Queen,
                  recording a split, waiting for mating or managing a Queenless colony.
                </li>
                <li>
                  <strong>Tasks</strong> — scheduled actions with a due date and status; can
                  reference an apiary, hive, and related inspection.
                </li>
                <li>
                  <strong>Logbook</strong> — free-form notes (can link to an inspection).
                </li>
                <li>
                  <strong>Archive</strong> — hides items from active lists without deleting them. On
                  the Dashboard’s recent lists, archived items show an{" "}
                  <Badge tone="amber">Archived</Badge> pill and no action links. Manage archived
                  content on the dedicated <em>Archive</em> page.
                </li>
              </ul>
              <p className="mt-3 text-gray-700">
                Relationship: <em>Apiary → Hives → Inspections</em>. Queen assignments and lifecycle
                history belong to hives, while Tasks and Logbook entries can also be linked back to a
                related inspection.
              </p>
            </section>

            {/* Membership & Feature Availability */}
            <section id="membership">
              <h2 className="text-2xl font-bold mb-3">Membership &amp; Feature Availability</h2>

              <div className="overflow-hidden rounded-xl border bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      Free plan <Badge tone="green">Included</Badge>
                    </h3>
                    <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                      <li>
                        <strong>1 Apiary (active)</strong>
                      </li>
                      <li>
                        <strong>2 Hives (active)</strong> total
                      </li>
                      <li>
                        <strong>Unlimited Inspections</strong>
                      </li>
                      <li>
                        <strong>Weather tools</strong> (Weather page, Dashboard snapshot, inspection
                        auto-fill, Seasonal Beekeeper Notes preview)
                      </li>
                      <li>
                        <strong>Calendar</strong>
                      </li>
                      <li>
                        <strong>Tasks</strong> &amp; <strong>Logbook</strong>
                      </li>
                      <li>
                        <strong>Export my data (CSV)</strong> via <em>Settings → Export</em>
                      </li>
                      <li>
                        <strong>Retained Queen Records after downgrade:</strong> existing Queen data
                        and Queen Reports remain available in <Badge tone="amber">Read only</Badge>{" "}
                        mode. A Free account with no retained Queen data does not receive the Queen
                        feature.
                      </li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-600">
                      If you downgrade from Premium to Free, we keep{" "}
                      <strong>1 active apiary</strong> (preferring your <em>default apiary</em>) and
                      up to <strong>2 active hives</strong> in it. The rest are auto-archived. Queen
                      lifecycle data is retained, but adding, editing and progressing Queen records is
                      disabled until Premium is restored.
                    </p>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      Premium plan <Badge tone="blue">Premium</Badge>
                    </h3>
                    <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                      <li>
                        <strong>Unlimited apiaries &amp; hives</strong>
                      </li>
                      <li>
                        <strong>Hive Health</strong>: explainable health scores, colony health
                        assessments, risk indicators, trends, recommended actions and inspection
                        history
                      </li>
                      <li>
                        <strong>Year in the Apiary Seasonal Guide</strong>: monthly infographic
                        guidance, practical checklists and one-click seasonal task creation
                      </li>
                      <li>
                        <strong>Colony Health Check</strong> (Bee Health Helper): guided
                        inspection-support tool to help you decide what to check next when something
                        doesn't look right
                      </li>
                      <li>
                        <strong>Apiary Map Markers</strong> for saving forage, water, risk, access
                        and site notes on apiary maps
                      </li>
                      <li>
                        <strong>Queen Records and colony lifecycle management</strong>: current and
                        previous Queens, assignments, introductions, splits, transfers, Queenless
                        workflows, events and inspection snapshots
                      </li>
                      <li>
                        <strong>Reports &amp; Exports</strong>, including multi-section printable
                        reports, Queen reports, filtered CSV files and Excel workbooks
                      </li>
                      <li>
                        <strong>Inventory, Sales, Expenses and Profit &amp; Loss</strong>
                      </li>
                      <li>
                        <strong>NFC tools</strong>: <strong>Set Up NFC Tags</strong>,
                        <strong> Manage Android NFC Tags</strong>, printable NFC setup card, and the
                        iPhone / iPad link method
                      </li>
                      <li>
                        <strong>NFC tap-to-log</strong>: Android can scan blank tags in-app; iPhone
                        / iPad can use a HiveTag link written to the tag
                      </li>
                      <li>
                        <strong>NFC quick-select</strong> in New Inspection when arriving from an
                        NFC action
                      </li>
                      <li>
                        <strong>Stripe Customer Portal</strong>: <em>Settings → Manage billing</em>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-gray-700">
                On Free, creating a 2nd apiary or a 3rd hive is blocked. Unarchiving beyond Free
                limits is also prevented while on Free.
              </p>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <h2 className="text-2xl font-bold mb-3">Getting Started (First 10 Minutes)</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Create an Apiary:</strong>{" "}
                  <span className="text-gray-700">Apiaries → New Apiary.</span> Name it, set a date,
                  optionally pin on the map or search by address, then save.{" "}
                  <span className="ml-2">
                    <Badge>Free</Badge> 1 active apiary
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    Tip: Use the <strong>Apiary Siting Guide</strong> button on the New Apiary page
                    if you’re unsure where to place an apiary.
                  </div>
                </li>
                <li>
                  <strong>Add a Hive:</strong>{" "}
                  <span className="text-gray-700">Hives → New Hive.</span> Choose the apiary, name
                  the hive, set type/status, add an optional photo, and save.
                  <span className="ml-2">
                    <Badge>Free</Badge> 2 active hives total
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    Tip: Use the <strong>Hive Siting Guide</strong> button on the New Hive page to
                    help with entrance direction, flight paths, and working space.
                  </div>
                </li>
                <li>
                  <strong>Log an Inspection:</strong>{" "}
                  <span className="text-gray-700">Inspections → New Inspection</span>. Weather
                  auto-fills from the apiary’s coordinates for that date. <Badge>Free</Badge>
                </li>
                <li>
                  <strong>Add the current Queen:</strong>{" "}
                  <span className="text-gray-700">Queens → Add Queen</span>. Record the Queen’s
                  reference, year, colour and current hive so future splits, transfers and changes have
                  a clear starting point. <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>Review Hive Health:</strong>{" "}
                  <span className="text-gray-700">Inspection List → Open Hive Health</span>. After
                  every inspection, Premium users can open Hive Health directly from the Inspection
                  List or from the Dashboard to review health scores, trends, recommendations and
                  changes over time.
                  <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>Try the Colony Health Check:</strong>{" "}
                  <span className="text-gray-700">Colony Health Check</span> helps you decide what
                  to check next when something looks “off”.
                  <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>NFC</strong> <Badge tone="blue">Premium</Badge>: open{" "}
                  <strong>Set Up NFC Tags</strong> to choose either the Android scan method or the
                  iPhone / iPad link method.
                </li>
              </ol>
            </section>

            {/* NEW: Siting Guides */}
            <section id="siting-guides">
              <h2 className="text-2xl font-bold mb-3">
                Apiary &amp; Hive Siting Guides <Badge tone="blue">Premium</Badge>
              </h2>

              <p className="text-gray-700">
                HiveTag includes two beginner-friendly guides designed to be used while you are
                setting up new records:
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Apiary Siting Guide</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Helps you choose a safe, practical apiary location: permission, access, working
                    area, flight paths, shelter/microclimate, water, security, and expansion space.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Best place to open it: <strong>Apiaries → New Apiary</strong> using the button
                    at the top of the page.
                  </p>
                  <div className="mt-3 text-sm">
                    Quick link:{" "}
                    <Link to="/apiaries/step-by-step" className="text-blue-700 underline">
                      Open Apiary Siting Guide
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Hive Siting Guide</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Covers exact hive placement within an apiary: stand stability/height, entrance
                    direction, nuisance reduction, wind/sun/shade, spacing, and practical safety.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Best place to open it: <strong>Hives → New Hive</strong> using the button at the
                    top of the page.
                  </p>
                  <div className="mt-3 text-sm">
                    Quick link:{" "}
                    <Link to="/hives/step-by-step" className="text-blue-700 underline">
                      Open Hive Siting Guide
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Back button note</div>
                <p className="mt-1">
                  The guides include a <strong>Back</strong> button that returns to the page you
                  came from. For this to work as expected, open the guides in the{" "}
                  <strong>same tab</strong> (not a new tab).
                </p>
              </div>
            </section>

            {/* Navigation Overview */}
            <section id="navigation">
              <h2 className="text-2xl font-bold mb-3">Navigation Overview (What Each Page Does)</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Dashboard</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Filter by Apiary and Hive</strong> to scope statistics, Queen status,
                      recent records and report links. The Hive list follows the selected Apiary, while
                      the <em>Apiaries</em> count remains global.
                    </li>
                    <li>
                      <strong>Customise Dashboard:</strong> choose which sections appear. Your choices
                      are saved on the current device and remain after refresh or sign-in. Use{" "}
                      <strong>Restore recommended layout</strong> to return to the default selection.
                    </li>
                    <li>
                      <strong>Recent sections (Inspections, Tasks, Logbook):</strong> “
                      <em>Open →</em>” takes you to the relevant <em>list</em> page with the item
                      briefly <strong>highlighted</strong>. Use <strong>✎ Edit</strong> to jump to
                      editing.
                    </li>
                    <li>
                      <strong>Archived items:</strong> on these recent lists, archived rows show an{" "}
                      <span className="ml-1 mr-1">
                        <Badge tone="amber">Archived</Badge>
                      </span>{" "}
                      pill on the far right and <strong>do not</strong> show <em>Open</em> or{" "}
                      <em>Edit</em> links. Use the <em>Archive</em> page to view/manage them.
                    </li>
                    <li>
                      <strong>See all … →</strong> under each section opens the full, filter-aware
                      list for that content type.
                    </li>
                    <li>
                      <strong>Tasks</strong> show a status pill (Pending/Completed) and an{" "}
                      <strong>Overdue</strong> label when past the due date.
                    </li>
                    <li>
                      <strong>Weather Snapshot</strong> uses your <em>default apiary</em> and
                      displays a banner naming it. If the default has no coordinates, a clear note
                      explains a temporary London placeholder is shown.
                    </li>
                    <li>
                      <strong>Seasonal Beekeeper Notes (preview):</strong> small panel under the
                      snapshot showing the first few season-aware notes with a{" "}
                      <strong>“View full notes”</strong> link that takes you to the full Weather
                      page.
                    </li>
                    <li>
                      <strong>Hive Health Overview</strong> <Badge tone="blue">Premium</Badge>:
                      displays the latest health score and overall colony status, helping you
                      quickly identify hives that may need attention.
                    </li>

                    <li>
                      <strong>Hive Health Timeline</strong> <Badge tone="blue">Premium</Badge>:
                      shows how colony health changes over time so you can spot improving or
                      declining trends at a glance.
                    </li>
                    <li>
                      <strong>Queen Status:</strong> shows current Queens, transitions and hives that
                      may need attention for the selected filters. Premium members can manage Queen
                      Records; downgraded members with retained data can open them in{" "}
                      <Badge tone="amber">Read only</Badge> mode.
                    </li>
                    <li>
                      <strong>Reports &amp; Export card:</strong> Premium members can open the full
                      Reports Centre. A Free member with retained Queen data sees{" "}
                      <strong>Open Queen Reports</strong> and can use Queen reporting only in{" "}
                      <Badge tone="amber">Read only</Badge> mode.
                    </li>
                    <li>
                      <strong>NFC summary (Premium):</strong> Premium users see an{" "}
                      <strong>NFC Tagged Hives</strong> panel showing how many hives have NFC
                      enabled in HiveTag and a short list of recent tagged hives.{" "}
                      <Badge tone="blue">Premium</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Apiaries</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Cards show a mini map (if coordinates exist), a human-readable location, hive
                      count, and actions.
                    </li>
                    <li>
                      Click the photo on a card to open a full-size <strong>lightbox</strong>.
                    </li>
                    <li>
                      <strong>Apiary Map (markers)</strong> <Badge tone="blue">Premium</Badge>: the
                      Apiaries list includes a <strong>Map</strong> action (on the apiary card) that
                      opens a full-screen map for that apiary. Use it to add simple map notes like
                      forage hotspots, water sources, access/parking, shelter/windbreaks, risks, and
                      Asian hornet sightings.
                    </li>
                    <li>New/Edit: name, date, coordinates, notes, photo, default toggle.</li>
                    <li>
                      New Apiary includes an <strong>Apiary Siting Guide</strong> button at the top
                      for Premium users. (Quick link:{" "}
                      <Link to="/apiaries/step-by-step" className="text-blue-700 underline">
                        Apiary Siting Guide
                      </Link>
                      )
                    </li>
                    <li>
                      Free plan limit: <strong>1 active apiary</strong>. <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Hives</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      List by apiary; shows inspection count; actions for Edit / New Inspection.
                    </li>
                    <li>
                      If NFC is enabled for a hive, a small <strong>NFC Tag</strong> pill appears on
                      the hive card (Premium). This can represent either an Android-linked tag ID or
                      an iPhone / iPad NFC link setup.
                    </li>
                    <li>
                      Photos open in a <strong>lightbox</strong> when clicked; location and map come
                      from the parent apiary.
                    </li>
                    <li>
                      New Hive includes a <strong>Hive Siting Guide</strong> button at the top for
                      Premium users to help choose entrance direction, working space, and nuisance
                      reduction. (Quick link:{" "}
                      <Link to="/hives/step-by-step" className="text-blue-700 underline">
                        Hive Siting Guide
                      </Link>
                      )
                    </li>
                    <li>
                      Free plan limit: <strong>2 active hives</strong> total. <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Queens <Badge tone="blue">Premium</Badge>
                  </h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Filter Queen Records by <strong>apiary</strong> and <strong>hive</strong> to
                      review the current Queen and the full colony lifecycle history.
                    </li>
                    <li>
                      Use the page tabs to review <strong>History</strong>, <strong>Add Queen</strong>,
                      <strong>Record Split</strong>, <strong>Introduce Queen</strong> and{" "}
                      <strong>Edit</strong> details where the current record allows it.
                    </li>
                    <li>
                      Recording a split or transfer moves the Queen and her history to the destination
                      hive, while the source hive becomes Queenless. Earlier records remain unchanged.
                    </li>
                    <li>
                      Downgraded members with retained Queen data see{" "}
                      <strong>Queens (Read only)</strong>. Records and history remain visible, but add,
                      edit, transition, archive and delete controls are unavailable.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Inspections</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Filter by apiary and/or hive; each inspection displays coloured status pills
                      for a quick overview of queen status, brood, food stores, varroa and disease
                      observations, together with photographs and inspection details.
                    </li>
                    <li>
                      Varroa is recorded separately using the dedicated
                      <strong>Varroa Seen</strong> field. The <strong>Signs of Disease</strong>
                      section is used to record brood diseases and other health conditions such as
                      AFB, EFB, Chalkbrood, Sacbrood and Nosema. Always follow official guidance for
                      notifiable diseases.
                    </li>
                    <li>
                      <strong>Linked Records:</strong> where tasks or logbook entries reference an
                      inspection, the card shows linked record counts. You can open the related{" "}
                      <strong>Tasks</strong> or <strong>Logbook</strong> list filtered to that
                      inspection.
                    </li>
                    <li>
                      <strong>Queen snapshot:</strong> when Queen information is available, an
                      inspection keeps a snapshot of the Queen context recorded at that time. Later
                      Queen changes do not rewrite the historical inspection.
                    </li>
                    <li>
                      <strong>Deleting inspections:</strong> permanent deletion removes the inspection
                      and its inspection photos. Linked Tasks and Logbook entries are preserved, but
                      their link to the deleted inspection is cleared.
                    </li>
                    <li>
                      <strong>Archiving inspections:</strong> archiving an inspection also archives
                      linked Tasks and Logbook entries, preserving the relationship for later review.
                    </li>
                    <li>
                      <strong>Open Hive Health</strong> <Badge tone="blue">Premium</Badge>: after
                      saving an inspection you can open a detailed Hive Health assessment directly
                      from the Inspection List. See the
                      <strong> Hive Health</strong> section below for a full explanation of health
                      scores, trends and recommendations.
                    </li>
                    <li>
                      Hive Health is designed to support beekeeper decision-making. It provides
                      explainable intelligence based on recorded inspection data but does not
                      replace a physical hive inspection or diagnose disease.
                    </li>
                    <li>
                      Unlimited on Free. <Badge>Free</Badge>
                    </li>
                    <li>
                      NFC quick-select is available when you arrive from an NFC action.{" "}
                      <Badge tone="blue">Premium</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Colony Health Check <Badge tone="blue">Premium</Badge>
                  </h3>
                  <ul className="list-disc pl-6">
                    <li>
                      A guided helper that asks one question at a time and suggests what to check
                      next when symptoms are unclear.
                    </li>
                    <li>
                      It includes a clear disclaimer and links to official UK reporting guidance for
                      high-significance pests/diseases.
                    </li>
                    <li>
                      You can switch between <strong>Guided mode</strong> and{" "}
                      <strong>Expand all</strong> at any time.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Year in the Apiary Seasonal Guide <Badge tone="blue">Premium</Badge>
                  </h3>
                  <ul className="list-disc pl-6">
                    <li>
                      A Premium monthly guide showing seasonal beekeeping priorities from January to
                      December.
                    </li>
                    <li>
                      Use the month selector to switch between months, or open the current month
                      automatically.
                    </li>
                    <li>
                      Each month includes a quick summary, key risks, practical checklist actions,
                      and a full infographic guide.
                    </li>
                    <li>
                      Use <strong>View full guide</strong> to open the monthly infographic in a
                      full-screen viewer.
                    </li>
                    <li>
                      Use the individual <strong>+ Add task</strong> buttons to turn a seasonal
                      action into a normal HiveTag task.
                    </li>
                    <li>
                      Seasonal tasks are saved with structured details such as category, priority,
                      source, and seasonal month.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Tasks &amp; Calendar</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Create tasks with due dates and statuses; filter by <strong>apiary</strong>,{" "}
                      <strong>hive</strong>, and a <strong>From/To date range</strong>.
                    </li>
                    <li>
                      Tasks can optionally be linked to a saved inspection using the{" "}
                      <strong>Related Inspection</strong> dropdown. Linked tasks appear on the
                      relevant inspection card.
                    </li>
                    <li>
                      <strong>Marking completed:</strong> update the status from the{" "}
                      <strong>Task List</strong> or from the <strong>Edit Task</strong> page.
                    </li>
                    <li>
                      The Calendar brings together dated records across your apiaries and hives,
                      including inspections, tasks, logbook entries and Queen lifecycle activity.{" "}
                      <Badge>Free</Badge>
                    </li>
                    <li>
                      <strong>Queen lifecycle events:</strong> Queen events and active Queen-process
                      follow-up dates appear under the dedicated <strong>Queen</strong> Calendar
                      category. Members with retained Queen data can continue to review their
                      existing Queen history after downgrade.
                    </li>
                    <li>
                      Open a Queen Calendar entry and choose <strong>Open in list</strong> to jump
                      directly to the relevant Apiary and Hive in Queen Records. HiveTag opens the
                      appropriate <strong>Current Queen</strong>, <strong>Progress</strong> or{" "}
                      <strong>History</strong> view and highlights the relevant record.
                    </li>
                    <li>
                      <strong>Inspection Hive Health</strong>{" "}
                      <Badge tone="blue">Premium</Badge>: opening an Inspection in the Calendar
                      shows the Hive Health assessment calculated from the inspection history that
                      existed at that point in time. This allows you to review how the colony was
                      assessed at an earlier inspection rather than only seeing its latest status.
                    </li>
                    <li>
                      From a task Calendar entry, choose <strong>View in list</strong> to jump to
                      the Task List with the task briefly highlighted.
                    </li>
                    <li>
                      Tasks created from the <strong>Year in the Apiary Seasonal Guide</strong>{" "}
                      <Badge tone="blue">Premium</Badge> behave like normal tasks, but also show
                      seasonal badges such as priority, category, and month.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">
                    C) Plan monthly seasonal tasks <Badge tone="blue">Premium</Badge>
                  </h3>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>
                      Open <strong>Seasonal Guide</strong>.
                    </li>
                    <li>Select the current month, or another month you want to prepare for.</li>
                    <li>Review the key focus, risks, and practical checklist.</li>
                    <li>
                      Use <strong>+ Add task</strong> beside any action you want to schedule.
                    </li>
                    <li>
                      Choose the apiary and hive, or select <strong>All Hives</strong>.
                    </li>
                    <li>
                      Save the task. It will appear in <strong>Tasks</strong> and the calendar like
                      any other task.
                    </li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold">Logbook</h3>
                  <p className="text-gray-700">
                    Free-form notes with optional inspection links. Includes list/grid toggle,
                    per-apiary filter, and photo <strong>lightbox</strong> on click.
                    <br />
                    <span className="text-gray-700">
                      When linking a <em>Related Inspection</em>, the dropdown is grouped by date
                      and each option shows <strong>Hive (Apiary)</strong> and the{" "}
                      <strong>time</strong>.
                    </span>{" "}
                    <Badge>Free</Badge>
                  </p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>
                      <strong>Arriving from Inspections:</strong> the Logbook list may be{" "}
                      <em>filtered to a specific inspection</em>. You’ll see a blue banner plus a
                      one-click “Clear inspection filter”.
                    </li>
                    <li>
                      <strong>Deep-links &amp; highlights:</strong> when you’re sent to a list by
                      “Open →” the target item briefly highlights so it’s easy to spot.
                    </li>
                  </ul>
                </div>

                {/* SALES & EXPENSES – concise user guidance only */}
                <div>
                  <h3 className="font-semibold">Sales</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Sales (List):</strong> shows each sale with invoice/customer/channel,
                      items and totals. Use the <strong>Edit</strong> button in the table to update
                      a sale.
                    </li>
                    <li>
                      <strong>New Sale:</strong> add line items (qty, unit price, discount, optional
                      cost per unit). Totals display in your <strong>default currency</strong>.
                      After saving, you’re returned to the <strong>Sales</strong> list.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Expenses</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Expenses (List):</strong> shows each expense with
                      category/vendor/invoice/amount. Use the <strong>Edit</strong> button in the
                      table to update an expense.
                    </li>
                    <li>
                      <strong>New Expense:</strong> the <em>Currency</em> field defaults to your{" "}
                      <strong>default currency</strong> but can be changed per expense. After
                      saving, you’re returned to the <strong>Expenses</strong> list.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Profile</strong> (name &amp; avatar), <strong>Password</strong>,{" "}
                      <strong>Default Apiary</strong>, language/timezone.
                    </li>
                    <li>
                      <strong>Default Currency:</strong> choose your preferred ISO code (e.g., GBP,
                      EUR, USD).
                    </li>
                    <li>
                      <strong>Manage billing</strong> (Premium): opens Stripe Customer Portal
                      (update card, invoices, cancel).
                    </li>
                    <li>
                      <strong>Export my data (CSV)</strong>: downloads separate CSV files for your
                      tables plus a list of public photo URLs.
                    </li>
                    <li>
                      <strong>Delete Account</strong>: cancels subscription, removes storage files
                      and data, then deletes your account.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Archive</h3>
                  <p className="text-gray-700">
                    Central place for archived items. Archiving hides content from active lists
                    without deleting history. On Free, unarchiving is limited by the 1 apiary / 2
                    hives active limits.
                  </p>
                </div>
              </div>
            </section>

            {/* Queen Records */}
            <section id="queens">
              <h2 className="text-2xl font-bold mb-3">
                Queen Records &amp; Colony Lifecycle <Badge tone="blue">Premium</Badge>
              </h2>

              <p className="text-gray-700">
                Queen Records provide a dedicated history for each colony rather than relying only on
                short Queen observations inside inspections. They show who the current Queen is, where
                she has been assigned, what changed, and which Queen process is still in progress.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">What you can record</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>Queen reference, year, marking colour, status and notes.</li>
                    <li>Current and previous Queen assignments for each hive.</li>
                    <li>Introductions, acceptance checks, mating progress and failed outcomes.</li>
                    <li>Splits and Queen transfers between hives.</li>
                    <li>Queenless periods, frames of eggs and requeening activity.</li>
                    <li>Lifecycle events and actions without altering earlier history.</li>
                  </ul>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Queen status and colour reference</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>
                      Statuses can include mated, virgin, introduced with acceptance pending,
                      Queenless, failed and requeened.
                    </li>
                    <li>
                      HiveTag shows the standard year-colour cycle: White for years ending 1 or 6,
                      Yellow for 2 or 7, Red for 3 or 8, Green for 4 or 9, and Blue for 5 or 0.
                    </li>
                    <li>
                      You can record the actual marking colour separately when it differs or is not
                      known.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">Common Queen workflows</h3>
                <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
                  <li>
                    <strong>Add a known Queen:</strong> create the Queen and assign her to the current
                    hive.
                  </li>
                  <li>
                    <strong>Record a split:</strong> choose the source and destination hives. The
                    selected Queen moves with her history and the source colony becomes Queenless.
                  </li>
                  <li>
                    <strong>Introduce a Queen:</strong> record whether she is purchased, mated or
                    virgin, then follow the acceptance and mating actions shown by HiveTag.
                  </li>
                  <li>
                    <strong>Manage a Queenless colony:</strong> record the chosen route, such as
                    introducing a Queen, adding a frame of eggs or allowing a colony-led transition.
                  </li>
                  <li>
                    <strong>Record the outcome:</strong> complete, fail or replace the process without
                    deleting the history that led to the result.
                  </li>
                </ol>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">History and inspection snapshots</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Queen history includes assignments, lifecycle events and managed processes in
                    date order.
                  </li>
                  <li>
                    Queen lifecycle events shown in the <strong>Calendar</strong> can be opened
                    directly in Queen Records. HiveTag automatically selects the relevant Apiary
                    and Hive, opens the appropriate <strong>Current Queen</strong>,{" "}
                    <strong>Progress</strong> or <strong>History</strong> view, and highlights the
                    Queen or lifecycle entry linked to that Calendar event.
                  </li>
                  <li>
                    Inspection snapshots preserve the Queen information associated with an inspection
                    at the time it was recorded.
                  </li>
                  <li>
                    In Queen Reports, the <strong>current Queen position</strong> is shown separately
                    from historical activity. Date filters apply to assignments, events, processes and
                    snapshots, but do not pretend that an earlier date range is the current position.
                  </li>
                </ul>
              </div>

              <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <div className="font-semibold">What happens after a downgrade?</div>
                <p className="mt-1">
                  Existing Queen data is retained. The Sidebar shows{" "}
                  <strong>Queens (Read only)</strong> and{" "}
                  <strong>Queen Reports (Read only)</strong>. You can review history, print it and
                  export Queen CSV/Excel data, but you cannot add, edit, progress, archive or delete
                  Queen lifecycle records. Resubscribing restores the management controls.
                </p>
              </div>

              <div className="mt-4 rounded border bg-white p-4">
                <h3 className="font-semibold">Archiving and deletion</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Archiving an Apiary or Hive coordinates the linked Queen lifecycle records with the
                    same archive action so active lists remain consistent.
                  </li>
                  <li>
                    Restoring a parent record restores linked lifecycle information where the current
                    plan allows it.
                  </li>
                  <li>
                    Permanent deletion is different from archiving and removes the linked lifecycle
                    data covered by that deletion. Use Archive when the history may still be needed.
                  </li>
                </ul>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Quick link:{" "}
                <Link to="/queens" className="text-blue-700 underline">
                  Open Queen Records
                </Link>
              </div>
            </section>

            {/* Apiary Map Markers */}
            <section id="apiary-map-markers">
              <h2 className="text-2xl font-bold mb-3">
                Apiary Map Markers (Map Notes) <Badge tone="blue">Premium</Badge>
              </h2>

              <p className="text-gray-700">
                The <strong>Apiary Map Markers</strong> page <Badge tone="blue">Premium</Badge> lets
                you add simple “map notes” for each apiary — for example: water sources, forage
                hotspots, risks, access/parking, shelter/windbreaks, or Asian hornet sightings.
                These markers are saved per apiary and are useful for remembering what’s around a
                site.
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">How to add a marker</h3>
                  <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
                    <li>Open an apiary’s map (Apiaries → open the apiary map/markers view).</li>
                    <li>
                      Press <strong>Add marker</strong>.
                    </li>
                    <li>Tap/click the map where you want the marker.</li>
                    <li>
                      Choose a <strong>Type</strong>, then optionally add a <strong>Title</strong>{" "}
                      and <strong>Notes</strong>.
                    </li>
                    <li>
                      Press <strong>Save</strong>.
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Edit, delete, and “Pick again”</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>
                      Tap an existing marker to open it, then use <strong>Edit</strong> to change
                      details or <strong>Delete</strong> to remove it.
                    </li>
                    <li>
                      <strong>Pick again</strong> is only for <em>new markers</em>: it clears the
                      chosen point so you can tap the map again to select a different location
                      before saving.
                    </li>
                    <li>
                      If you press <strong>Pick again</strong>, you should then tap the map again to
                      place the marker in the new spot.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded border bg-white p-4">
                <h3 className="font-semibold">Map layers, legend, and foraging ring</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Use the <strong>Map ↔ Satellite</strong> toggle to switch backgrounds (satellite
                    imagery may load slower depending on provider).
                  </li>
                  <li>
                    The <strong>Legend</strong> explains marker types and the{" "}
                    <strong>~3 mile foraging ring</strong> around the apiary.
                  </li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  Indicative range only — bees may forage further depending on conditions.
                </p>
              </div>

              <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Popup behaviour</div>
                <p className="mt-1">
                  The map is designed so popups sit <strong>above</strong> the header panels (so
                  forms don’t get hidden). The map will <strong>not</strong> automatically “jump”
                  the view to fit a popup — if a popup is near the edge, simply drag the map
                  slightly to bring it fully into view.
                </p>
              </div>

              <div className="mt-4 rounded border bg-white p-4">
                <h3 className="font-semibold">Pollen on the Map Markers page</h3>
                <p className="mt-2 text-gray-700">
                  Pollen data (when available) is shown in the{" "}
                  <strong>Pollen (apiary location)</strong> panel in the header area of the map
                  page. It does <strong>not</strong> appear as a marker on the map itself. The
                  pollen panel is tied to the apiary’s saved coordinates.
                </p>
              </div>
            </section>

            {/* Colony Health Check */}
            <section id="bee-health-helper">
              <h2 className="text-2xl font-bold mb-3">
                Colony Health Check (Bee Health Helper) <Badge tone="blue">Premium</Badge>
              </h2>
              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Important</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    The Bee Health Helper provides{" "}
                    <strong>educational inspection-support guidance only</strong>. It does not
                    diagnose disease, confirm colony health, or replace direct hive inspection.
                  </li>
                  <li>
                    Use <strong>Not sure</strong> whenever you haven’t opened the hive, the weather
                    is poor, or you simply can’t observe that detail.
                  </li>
                  <li>
                    If you suspect a <strong>notifiable disease or pest</strong>, do not move bees,
                    colonies, frames, comb, honey or equipment, and follow official UK reporting
                    guidance.
                  </li>
                </ul>
              </div>

              <p className="text-gray-700">
                The Bee Health Helper is designed for real-world beekeeping where you might only
                have partial information. It asks a short set of context questions first, then
                adapts the next questions based on what you’ve selected.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">How to use it (simple)</h3>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
                    <li>
                      Open <strong>Colony Health Check</strong> from the sidebar.
                    </li>
                    <li>
                      Answer the first few “context” questions: <strong>Season</strong>,{" "}
                      <strong>Colony strength</strong>, and{" "}
                      <strong>How quickly did this start?</strong>
                    </li>
                    <li>
                      Pick your <strong>main concern</strong> (brood, adults, behaviour, collapse,
                      pests, or “not sure”).
                    </li>
                    <li>
                      Continue with the guided questions (or switch to <strong>Expand all</strong>{" "}
                      if you prefer).
                    </li>
                    <li>
                      Press <strong>Get results</strong> to see possible patterns and suggested next
                      checks.
                    </li>
                  </ol>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Guided mode vs Expand all</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                    <li>
                      <strong>Guided mode</strong> shows <em>one question at a time</em>
                      and keeps you moving forward.
                    </li>
                    <li>
                      <strong>Expand all</strong> shows everything that’s currently relevant so you
                      can jump around.
                    </li>
                    <li>You can switch between them any time. Your answers stay in place.</li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Why it asks “Season” and “Strength”</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                    <li>
                      These answers help the tool show more relevant questions (for example, some
                      symptoms are more common in certain seasons).
                    </li>
                    <li>
                      They can also nudge suggestions, but they are{" "}
                      <strong>not confirmed findings or diagnoses</strong> on their own.
                    </li>
                    <li>
                      If you’re unsure, choose the closest match — or use “Not sure” where
                      available.
                    </li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Recommended next checks</h3>
                  <p className="text-gray-700 mt-2">
                    After results, you may see <strong>Recommended next checks</strong>. These are
                    the most useful observations to confirm or rule out the top suggestions.
                    Clicking one jumps you straight to that question.
                  </p>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">UK reporting &amp; urgent guidance</h3>
                  <p className="text-gray-700 mt-2">
                    If you select a high-significance sign (or the results indicate an urgent risk),
                    the tool will show a <strong>UK action</strong> panel with official links. This
                    may appear even if the condition doesn’t show as your “top” result, because
                    reporting guidance is more important than scoring.
                  </p>
                  <p className="text-gray-700 mt-2">
                    If you’re unsure, treat it as a prompt to{" "}
                    <strong>pause and check official guidance</strong> before moving equipment or
                    applying treatments.
                  </p>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Resetting</h3>
                  <p className="text-gray-700 mt-2">
                    Use <strong>Reset all</strong> to clear everything and start again. This is
                    helpful if you’re switching to a different hive, or your situation changes.
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Quick link:{" "}
                <Link to="/bee-health" className="text-blue-700 underline">
                  Open Colony Health Check
                </Link>
              </div>
            </section>

            {/* Hive Health */}
            <section id="hive-health">
              <h2 className="text-2xl font-bold mb-3">
                Hive Health <Badge tone="blue">Premium</Badge>
              </h2>

              <p className="text-gray-700">
                Hive Health is HiveTag's intelligent colony assessment system. Rather than simply
                displaying your inspection data, it analyses your recorded inspections and presents
                an easy-to-understand overview of your colony's health, highlighting important
                observations, possible risks and suggested actions for your next visit.
              </p>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">What Hive Health shows</h3>

                <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                  <li>Overall colony health score.</li>
                  <li>Current health band and overall status.</li>
                  <li>Important risks requiring attention.</li>
                  <li>Recommended actions for your next inspection.</li>
                  <li>Changes since previous inspections.</li>
                  <li>Inspection trends over time.</li>
                  <li>Confidence level based on the amount of inspection history available.</li>
                </ul>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">How to use Hive Health</h3>

                <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
                  <li>Carry out and save a hive inspection.</li>
                  <li>
                    Select <strong>Open Hive Health</strong> from the Inspection List, or open it
                    from the Dashboard.
                  </li>
                  <li>Review the overall health score and summary.</li>
                  <li>Read any priority items highlighted.</li>
                  <li>Review the recommended actions before your next visit.</li>
                  <li>Compare how the colony has changed over time using the health timeline.</li>
                  <li>
                    <strong>Calendar history:</strong> when you open a saved Inspection from the{" "}
                    <strong>Calendar</strong>, Premium members can also review the Hive Health
                    assessment as it stood at that inspection. This is based only on inspection
                    history available up to that date, so later inspections do not alter the earlier
                    assessment.
                  </li>
                </ol>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">How the health score works</h3>

                <p className="mt-2 text-gray-700">
                  The health score represents the colony information recorded in the most recent
                  inspection. HiveTag considers factors such as queen evidence, brood, food stores,
                  disease observations and varroa records to calculate the latest score.
                </p>

                <p className="mt-3 text-gray-700">
                  Earlier inspections do not form an average health score. They are used to compare
                  the latest inspection with the previous one, identify longer-term trends, build
                  the colony timeline and indicate how much inspection history is available.
                </p>

                <p className="mt-3 text-gray-700">
                  The score is intended to help you prioritise inspections. It should be viewed
                  alongside your own observations rather than replacing your experience and
                  judgement.
                </p>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">Explainable intelligence</h3>

                <p className="mt-2 text-gray-700">
                  HiveTag always explains <strong>why</strong> a recommendation has been made.
                  Wherever possible, recommendations include the observations that contributed to
                  the assessment so you can understand how the conclusion was reached.
                </p>
              </div>

              <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Important</div>

                <p className="mt-2">
                  Hive Health is designed to support beekeeper decision-making. It does not diagnose
                  disease, confirm colony health or replace a physical inspection. Always use your
                  own judgement and follow official UK bee health guidance where appropriate.
                </p>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Hive Health becomes more informative as additional inspections are recorded,
                allowing trends and long-term changes to be identified more reliably.
              </div>
            </section>

            {/* Year in the Apiary Seasonal Guide */}
            <section id="seasonal-guide">
              <h2 className="text-2xl font-bold mb-3">
                Year in the Apiary Seasonal Guide <Badge tone="blue">Premium</Badge>
              </h2>

              <p className="text-gray-700">
                The <strong>Year in the Apiary</strong> seasonal guide is a Premium monthly
                beekeeping guide built into HiveTag. It helps you see what to focus on each month,
                what risks to watch for, and which practical actions to plan next.
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">How to use it</h3>
                  <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
                    <li>
                      Open <strong>Seasonal Guide</strong> from the Premium tools area.
                    </li>
                    <li>Select a month from the month buttons, or start with the current month.</li>
                    <li>
                      Review the month’s <strong>Key focus</strong> and{" "}
                      <strong>Risks to watch</strong>.
                    </li>
                    <li>Use the practical checklist to plan what you want to do next.</li>
                    <li>
                      Open <strong>View full guide</strong> to see the full monthly infographic.
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Creating a task</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>
                      Use the individual <strong>+ Add task</strong> button next to the relevant
                      seasonal action.
                    </li>
                    <li>
                      The task then appears in your normal <strong>Tasks</strong> list and can be
                      edited, completed, filtered by date, or viewed in the calendar.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-xl border bg-white p-4">
                <h3 className="font-semibold">Creating tasks from seasonal actions</h3>
                <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
                  <li>Choose the month you want to work from.</li>
                  <li>Find the action you want to carry out.</li>
                  <li>
                    Click <strong>+ Add task</strong>.
                  </li>
                  <li>The New Task page opens with the task title pre-filled.</li>
                  <li>
                    Select the relevant <strong>Apiary</strong> and <strong>Hive</strong>, or choose{" "}
                    <strong>All Hives</strong>.
                  </li>
                  <li>Set or adjust the due date, add any extra notes, then save.</li>
                </ol>

                <p className="mt-3 text-sm text-gray-600">
                  Seasonal tasks are saved with extra structured information such as
                  <strong> category</strong>, <strong>priority</strong>, <strong>source</strong>,
                  and <strong>seasonal month</strong>. These appear as badges on the Tasks list.
                </p>
              </div>

              <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Important note</div>
                <p className="mt-1">
                  The seasonal guide is general beekeeping guidance. Always use your own judgement,
                  local weather, colony condition, and official UK bee health advice where relevant.
                </p>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Quick link:{" "}
                <Link to="/seasonal-guide" className="text-blue-700 underline">
                  Open Year in the Apiary Seasonal Guide
                </Link>
              </div>
            </section>

            {/* Inventory, Sales & Expenses (overview) */}
            <section id="business-inventory">
              <h2 className="text-2xl font-bold mb-3">
                Inventory, Sales &amp; Expenses <Badge tone="blue">Premium</Badge>
              </h2>
              <p className="text-gray-700 mb-2">
                The business tools are optional but handy if you sell honey, nucleus colonies,
                equipment, or want to track what your beekeeping is costing you.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Inventory</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      The <strong>Inventory</strong> list lets you track items such as hives,
                      frames, feeders, jars, labels and other kit.
                    </li>
                    <li>
                      <strong>New Item:</strong> record category, purchase date, quantity, unit
                      price, total cost, supplier/invoice and optional link to an apiary/hive.
                    </li>
                    <li>
                      Items can be marked as <em>consumable</em> or as tracked stock so you can see
                      how much you have left.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Sales</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Sales</strong> shows each sale with customer, channel, invoice
                      reference and totals.
                    </li>
                    <li>
                      <strong>New Sale:</strong> add line items including product name, type, unit,
                      quantity, unit price, optional discount and cost-per-unit.
                    </li>
                    <li>
                      Amounts are displayed using your <strong>default currency</strong>.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Expenses</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Expenses</strong> records your outgoings such as feed, medication,
                      equipment, fuel and <strong>Training</strong>.
                    </li>
                    <li>
                      Each expense has a category, vendor, invoice/receipt reference, date, amount
                      and a currency (defaulted from your chosen currency in Settings).
                    </li>
                    <li>
                      These feed into the <strong>Profit &amp; Loss</strong> view so you can see
                      income versus costs at a glance.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Profit &amp; Loss</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      The dedicated <strong>Profit &amp; Loss</strong> page brings together your
                      Sales and Expenses and shows a simple summary using your default currency.
                    </li>
                    <li>
                      Use this when preparing accounts, talking to your accountant, or just checking
                      how your beekeeping hobby or business is performing.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Default Currency */}
            <section id="currency-defaults">
              <h2 className="text-2xl font-bold mb-3">Default Currency (How It Works)</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  Your <strong>default currency</strong> is the ISO code you prefer to see in totals
                  and as the starting currency for new entries. You can set it in{" "}
                  <strong>Settings</strong>. Examples: <code>GBP</code>, <code>EUR</code>,{" "}
                  <code>USD</code>.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Sales &amp; Profit/Loss:</strong> totals are shown using your default
                    currency for display. (No FX conversion is performed.)
                  </li>
                  <li>
                    <strong>New Expense:</strong> the Currency field is pre-filled with your default
                    currency; you can change it per expense.
                  </li>
                  <li>
                    <strong>Expenses List:</strong> each row shows the amount formatted using the
                    stored currency for that row.
                  </li>
                  <li>
                    <strong>Inventory List:</strong> rows display using the item’s own currency; if
                    an item has none saved, your default currency is used.
                  </li>
                  <li>
                    <strong>Changing the default</strong> updates new-form defaults and how totals
                    are formatted going forward. It does <em>not</em> convert past numbers or
                    rewrite saved rows.
                  </li>
                  <li>
                    <strong>No conversions:</strong> BeezKnees formats amounts using the currency
                    code but does not apply exchange rates.
                  </li>
                </ul>
              </div>
            </section>

            {/* Reports */}
            <section id="reports">
              <h2 className="text-2xl font-bold mb-3">
                Reports Centre <Badge tone="blue">Premium</Badge>
              </h2>

              <p className="mb-4 text-gray-700">
                The Reports Centre follows a three-step workflow. You first choose what to load, then
                review the generated report, and finally export or print that same loaded dataset.
                Exports do not run a separate Supabase query, so the screen, CSV, Excel and print
                output remain aligned.
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Step 1 — Build Your Report</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>
                      Choose an <strong>Apiary</strong>, <strong>Hive</strong>,{" "}
                      <strong>From</strong> date and <strong>To</strong> date.
                    </li>
                    <li>
                      Choose whether archived records should be included.
                    </li>
                    <li>
                      Premium members can include Inspections, Tasks, Logbook, Queen Records and NFC
                      tags.
                    </li>
                    <li>
                      Press <strong>Generate / Refresh Report</strong> to load the selected data once.
                    </li>
                    <li>
                      Saved report filters are remembered when you return to the page.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Step 2 — Review Report</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>
                      The screen remains tabbed so large reports are easier to review.
                    </li>
                    <li>
                      Available content can include the Executive Summary, Hive Intelligence,
                      Inspection Timeline, detailed records, photographs, Tasks, Logbook and Queen
                      Records.
                    </li>
                    <li>
                      Queen reporting separates the current Queen position from historical
                      assignments, events, processes and inspection snapshots.
                    </li>
                    <li>
                      Inspection photographs can be opened in the full gallery and downloaded.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Step 3 — Export &amp; Print</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>Download individual CSV files for the included report sections.</li>
                    <li>
                      Download a complete Excel workbook. Queen workbooks can contain{" "}
                      <strong>Queens</strong>, <strong>Queen Assignments</strong>,{" "}
                      <strong>Queen Events</strong>, <strong>Queen Processes</strong> and{" "}
                      <strong>Queen Snapshots</strong> worksheets.
                    </li>
                    <li>
                      Print all selected sections as one report or save the browser print output as a
                      PDF.
                    </li>
                    <li>
                      The print layout avoids forcing every selected section onto a new page and does
                      not add automatic page numbering.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <div className="font-semibold">Free members with retained Queen data</div>
                <p className="mt-1">
                  A downgraded member with existing Queen data can open{" "}
                  <strong>Queen Reports (Read only)</strong>. Step 1 shows only{" "}
                  <strong>Include archived</strong> and <strong>Queen Records</strong>. The review,
                  Queen CSV, Queen-only Excel workbook and print output contain Queen information
                  only. Inspections, Tasks, Logbook, NFC and other report exports remain Premium.
                </p>
              </div>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">Tips for better reports</h3>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-blue-900">
                  <li>Complete as many inspection and Queen fields as possible.</li>
                  <li>Add photographs during inspections.</li>
                  <li>Use date filters for seasonal, annual or lifecycle reviews.</li>
                  <li>
                    Use the Apiary and Hive filters to keep a shared or printed report focused on the
                    intended colony.
                  </li>
                  <li>
                    Generate the report again after changing filters or included sections, then export
                    from the refreshed result.
                  </li>
                </ul>
              </div>
            </section>

            {/* Workflows */}
            <section id="workflows">
              <h2 className="text-2xl font-bold mb-3">Typical Workflows</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">A) Normal visit without NFC</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>
                      Go to <em>Inspections → New Inspection</em>.
                    </li>
                    <li>
                      Select the <strong>Apiary</strong> and <strong>Hive</strong>.
                    </li>
                    <li>Review the automatically populated weather information.</li>
                    <li>Record your inspection observations and add photographs if required.</li>
                    <li>Save the inspection.</li>
                    <li>
                      Review the coloured inspection summary pills for a quick overview of the
                      inspection.
                    </li>
                    <li>
                      <strong>Premium:</strong> Select <strong>Open Hive Health</strong> to review
                      health scores, trends, risks and recommended actions.
                    </li>
                    <li>Create any follow-up tasks before leaving the apiary.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">
                    B) Quick “something’s not right” check <Badge tone="blue">Premium</Badge>
                  </h3>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>
                      Open <em>Colony Health Check</em> and answer the first few context questions.
                    </li>
                    <li>
                      Use <strong>Not sure</strong> freely (especially if you haven’t opened the
                      hive yet).
                    </li>
                    <li>
                      Press <strong>Get results</strong>, then use{" "}
                      <strong>Recommended next checks</strong> to narrow it down.
                    </li>
                    <li>
                      If a <strong>UK action</strong> panel appears, follow official guidance before
                      moving equipment or treating.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">
                    C) Setting up NFC tags <Badge tone="blue">Premium</Badge>
                  </h3>

                  <p className="text-gray-700">
                    <strong>Android:</strong>
                  </p>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>
                      Open <strong>Set Up NFC Tags</strong>.
                    </li>
                    <li>
                      Use the <strong>Android setup</strong> card.
                    </li>
                    <li>
                      Tap <strong>Scan Blank NFC Tag</strong> and hold the phone to the tag.
                    </li>
                    <li>
                      If the Android tag is not linked yet, HiveTag will take you to the linking
                      flow so you can assign it to an existing hive or create a new hive.
                    </li>
                    <li>
                      Once linked, scanning that same Android tag opens{" "}
                      <strong>New Inspection</strong> for the correct hive.
                    </li>
                  </ol>

                  <p className="text-gray-700 mt-3">
                    <strong>iPhone / iPad:</strong>
                  </p>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>
                      Open <strong>Set Up NFC Tags</strong>.
                    </li>
                    <li>
                      Use the <strong>iPhone / iPad setup</strong> card.
                    </li>
                    <li>
                      Choose the <strong>Apiary</strong> and <strong>Hive</strong>.
                    </li>
                    <li>
                      Press <strong>Copy NFC Link</strong>.
                    </li>
                    <li>
                      Paste that copied link into an NFC writing app and write it to the physical
                      tag.
                    </li>
                    <li>
                      On later visits, tapping that tag opens the linked hive in HiveTag and routes
                      you into <strong>New Inspection</strong>.
                    </li>
                  </ol>

                  <p className="text-gray-700 mt-2">
                    <strong>Once-per-day rule:</strong> to prevent accidental duplicates, the NFC
                    “New Inspection” shortcut is limited to{" "}
                    <strong>one NFC-started inspection per hive per day</strong>. If you need a
                    second inspection on the same day, open <em>Inspections → New Inspection</em>{" "}
                    and select the hive manually.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">
                    D) Reviewing Hive Health <Badge tone="blue">Premium</Badge>
                  </h3>

                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>Complete and save a hive inspection.</li>
                    <li>
                      Select <strong>Open Hive Health</strong> from the Inspection List or
                      Dashboard.
                    </li>
                    <li>Review the overall health score and colony status.</li>
                    <li>Read any priority items highlighted by HiveTag.</li>
                    <li>Review recommended actions before your next inspection.</li>
                    <li>Compare changes and trends with previous inspections.</li>
                    <li>Create follow-up tasks where appropriate.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">
                    E) Recording a Queen change <Badge tone="blue">Premium</Badge>
                  </h3>

                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>Open <strong>Queens</strong> and select the relevant Apiary and Hive.</li>
                    <li>
                      Choose the matching action, such as <strong>Add Queen</strong>,{" "}
                      <strong>Record Split</strong> or <strong>Introduce Queen</strong>.
                    </li>
                    <li>Record the Queen, source/destination hive and date of the change.</li>
                    <li>
                      Follow any acceptance, mating or Queenless next action shown by the lifecycle
                      process.
                    </li>
                    <li>
                      Record the outcome rather than overwriting the earlier history. The Dashboard
                      and Queen Reports will then reflect the current position and the historical
                      sequence.
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* NFC */}
            <section id="nfc">
              <h2 className="text-2xl font-bold mb-3">
                NFC (Premium): How It Works <Badge tone="blue">Premium</Badge>
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  HiveTag now supports two clear NFC setup methods from one place:
                  <strong> Android scanning</strong> and <strong>iPhone / iPad link writing</strong>
                  .
                </p>

                <ul className="list-disc pl-6">
                  <li>
                    <strong>Main NFC page:</strong> open <strong>Set Up NFC Tags</strong> to choose
                    the correct method for your device.
                  </li>
                  <li>
                    <strong>Android support:</strong> Web NFC works best in Chrome for Android.
                    Blank tags can be scanned directly in the app.
                  </li>
                  <li>
                    <strong>iPhone / iPad support:</strong> Apple browsers do not support Web NFC in
                    the same way, so HiveTag uses a copied HiveTag link written to the tag with an
                    NFC writing app.
                  </li>
                  <li>
                    <strong>Android linking:</strong> scanning an unknown Android tag opens the
                    Android linking flow where you can assign it to an existing hive or create a new
                    hive.
                  </li>
                  <li>
                    <strong>iPhone / iPad linking:</strong> choose a hive in the iPhone / iPad setup
                    card, copy the generated HiveTag link, and write it to the tag.
                  </li>
                  <li>
                    <strong>Routing:</strong> once set up, both Android tags and iPhone / iPad URL
                    tags open the correct hive’s <strong>New Inspection</strong> flow.
                  </li>
                  <li>
                    <strong>Once-per-day rule:</strong> NFC-started inspections are limited to{" "}
                    <strong>one per hive per day</strong>.
                  </li>
                  <li>
                    <strong>Manage Android NFC Tags:</strong> view all Android-scanned tag ID links,
                    filter them, and clear them if you want to reuse them.
                  </li>
                  <li>
                    <strong>Reusing iPhone / iPad tags:</strong> you can clear the saved iPhone /
                    iPad NFC status in <strong>Set Up NFC Tags</strong>, then overwrite the physical
                    tag with a new copied HiveTag link if needed.
                  </li>
                  <li>
                    <strong>Buy tags:</strong> uses Stripe checkout and UK-only flat shipping.
                  </li>
                </ul>

                <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="font-semibold">In short</div>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      <strong>Android:</strong> scan blank tag in HiveTag
                    </li>
                    <li>
                      <strong>iPhone / iPad:</strong> copy HiveTag link → write it to the tag
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 text-sm">
                  For a printable step-by-step guide, use the{" "}
                  <Link to="/nfc/instructions" className="text-blue-700 underline">
                    NFC Tag Setup
                  </Link>{" "}
                  page.
                </p>
              </div>
            </section>

            {/* Weather, Maps & Photos */}
            <section id="weather-maps-photos">
              <h2 className="text-2xl font-bold mb-3">Weather, Maps &amp; Photos</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Weather page:</strong> shows current conditions, a “Today, hour by hour”
                  strip, and the next 5 days for the selected apiary. It can also show{" "}
                  <strong>official weather warnings</strong> and <strong>pollen levels</strong>{" "}
                  where available.
                </li>
                <li>
                  <strong>Seasonal Beekeeper Notes (full):</strong> advisory, season-aware guidance.
                </li>
                <li>
                  <strong>Dashboard snapshot:</strong> summary for your default apiary plus a
                  preview of notes.
                </li>
                <li>
                  <strong>Inspections:</strong> weather auto-fills using the apiary’s coordinates
                  and the inspection date.
                </li>
                <li>
                  <strong>Maps:</strong> set apiary coordinates by clicking the map or searching by
                  address. HiveTag also includes an <strong>Apiary Map Markers</strong> page{" "}
                  <Badge tone="blue">Premium</Badge> where you can save map notes (forage, water,
                  risks, access, etc.) per apiary.
                </li>
                <li>
                  <strong>Photos:</strong> Apiary/Hive support one optional photo; Inspections allow
                  up to <strong>3</strong>. Click photos to open a <strong>lightbox</strong>.
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                Weather, warnings, pollen and notes depend on third-party providers and are for
                guidance only. Conditions vary by region and micro-climate. Pollen (when available)
                is shown in panels (e.g. Weather page and the Map Markers header), not as markers on
                the map.
              </p>
            </section>

            {/* Filters, Counts & Archives */}
            <section id="filters-counts-archives">
              <h2 className="text-2xl font-bold mb-3">Filters, Counts &amp; Archives</h2>

              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Dashboard counts:</strong> Apiaries = global <em>active</em> apiaries;
                  Hives/Inspections/Tasks/Logbook and Queen Status respect the selected Apiary and Hive
                  filters.
                </li>
                <li>
                  <strong>Date ranges:</strong> some list and export screens let you set{" "}
                  <strong>From</strong> and <strong>To</strong> dates.
                </li>
                <li>
                  <strong>Exports from Reports:</strong> use the same generated dataset shown on
                  screen and respect the selected Apiary, Hive, date, archive and section filters.
                </li>
                <li>
                  <strong>List pages show active items</strong>; archived content lives in the{" "}
                  <em>Archive</em> page.
                </li>
              </ul>

              <div className="mt-4 p-4 rounded-lg border bg-white">
                <h3 className="font-semibold mb-2">How archiving works (cascade rules)</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    <strong>Archiving an Apiary</strong> also archives all of its Hives and their
                    Inspections. Tasks and Logbook entries linked to those archived Hives/Inspections
                    are archived too. Queen lifecycle records linked to those hives are coordinated
                    with the same archive action.
                  </li>
                  <li>
                    <strong>Archiving a Hive</strong> also archives all Inspections for that Hive.
                    Tasks/Logbook entries that reference that Hive or those Inspections are archived,
                    together with the Hive’s linked Queen lifecycle records.
                  </li>
                  <li>
                    <strong>Archiving a single Inspection</strong> archives any Tasks or Logbook
                    entries linked to that Inspection. The parent Hive/Apiary remain active, and the
                    Queen snapshot stays with the archived inspection.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Unarchiving rules</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    On <Badge>Free</Badge>, unarchiving is allowed only if it won’t exceed the
                    limits (max <strong>1 active Apiary</strong>, <strong>2 active Hives</strong>{" "}
                    total).
                  </li>
                  <li>
                    Unarchiving a parent may prompt you to unarchive its children; if limits are
                    exceeded, only allowable items are reactivated.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Permanent deletion rules</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Deleting an Inspection removes the Inspection and its photos, but preserves linked
                    Tasks and Logbook entries by clearing their Inspection link.
                  </li>
                  <li>
                    Coordinated Apiary/Hive deletion removes the linked child and Queen lifecycle data
                    covered by that deletion. Use Archive when the history may still be needed.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">
                  What archiving does <em>not</em> do
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    It does <strong>not delete</strong> data. You can still view it in{" "}
                    <em>Archive</em> and include it in CSV exports.
                  </li>
                  <li>
                    Archiving does not delete photos. Photos remain attached to the archived record
                    unless the record or photo is deleted.
                  </li>
                </ul>
              </div>
            </section>

            {/* Tips */}
            <section id="tips">
              <h2 className="text-2xl font-bold mb-3">Tips for Smooth Record-Keeping</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use consistent hive names (e.g., “Hive A2”, “Blue Queen 2024”).</li>
                <li>
                  Give each Queen a consistent reference and record splits, transfers and outcomes
                  when they happen so the assignment history remains clear.
                </li>
                <li>
                  Capture next-visit actions in <strong>Tasks</strong> and give them clear due
                  dates.
                </li>
                <li>
                  Premium users can use the <strong>Year in the Apiary Seasonal Guide</strong> to
                  turn monthly beekeeping actions into scheduled tasks.
                </li>
                <li>
                  Premium users can open Hive Health to review colony intelligence, health trends
                  and recommended actions after each inspection.
                </li>
                <li>Add apiary coordinates for accurate weather and map displays.</li>
                <li>
                  Set a <strong>default apiary</strong> to power Dashboard weather and fallback
                  logic.
                </li>
                <li>
                  Use <strong>Not sure</strong> in the Colony Health Check whenever you don’t have
                  the information yet.
                </li>
                <li>
                  Use the <strong>Apiary Siting Guide</strong> / <strong>Hive Siting Guide</strong>{" "}
                  buttons when setting up new locations—small siting choices prevent most future
                  issues.
                </li>
                <li>
                  If you use NFC, send users to <strong>Set Up NFC Tags</strong> so they can choose
                  the correct device method from one place.
                </li>
              </ul>
            </section>

            {/* FAQs */}
            <section id="faqs">
              <h2 className="text-2xl font-bold mb-3">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">
                    Is the Colony Health Check a diagnosis? <Badge tone="blue">Premium</Badge>
                  </p>
                  <p className="text-gray-700">
                    No. It provides educational inspection-support guidance only and suggests
                    possible next checks. It does not confirm disease, colony health, or treatment
                    decisions. If a UK action/reporting panel appears, follow official guidance.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    What happens to Queen Records if I downgrade from Premium?
                  </p>
                  <p className="text-gray-700">
                    Existing Queen data is retained. The Queens page and Queen Reports remain
                    available in <strong>Read only</strong> mode, including printing and Queen
                    CSV/Excel export. Adding, editing and progressing Queen records is restored when
                    Premium is reactivated.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Why does a Queen Report show the current Queen outside my selected date range?
                  </p>
                  <p className="text-gray-700">
                    The current Queen position describes the colony now, so it is shown separately.
                    The date range filters the historical assignments, events, processes and
                    inspection snapshots.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What happens when I record a split?</p>
                  <p className="text-gray-700">
                    The selected Queen and her history move to the destination hive. The source hive
                    becomes Queenless and can then follow a Queenless or requeening workflow. Earlier
                    assignments remain unchanged as history.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What is the Apiary Map and what is “Pick again”?</p>
                  <p className="text-gray-700">
                    The Apiary Map is a full-screen map for one apiary where you can add “map notes”
                    (markers) like forage, water, access, shelter, risks, and sightings. When adding
                    a new marker, <strong>Pick again</strong> clears the selected point so you can
                    tap the map again to choose a different location before saving.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    What is the Year in the Apiary Seasonal Guide?{" "}
                    <Badge tone="blue">Premium</Badge>
                  </p>
                  <p className="text-gray-700">
                    It is a monthly Premium guide showing what to focus on in the apiary, what risks
                    to watch for, and which practical actions to plan. Each month includes a full
                    infographic and task-ready checklist actions.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    What is Hive Health? <Badge tone="blue">Premium</Badge>
                  </p>
                  <p className="text-gray-700">
                    Hive Health brings together a colony’s inspection history to provide a detailed
                    health assessment, explainable health score, risk indicators, trends and
                    recommended actions. It supports beekeeper judgement and does not diagnose
                    disease or replace a physical inspection.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Where can I open Hive Health? <Badge tone="blue">Premium</Badge>
                  </p>
                  <p className="text-gray-700">
                    Premium users can open Hive Health from an inspection record or from the Hive
                    Health panels on the Dashboard. Free users can still view and edit their saved
                    inspection records from the Inspection List.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Do Seasonal Guide checklist ticks save? <Badge tone="blue">Premium</Badge>
                  </p>
                  <p className="text-gray-700">
                    No. The checkbox ticks are only for quick planning while viewing the guide. To
                    save something properly, use <strong>+ Add task</strong>. That creates a normal
                    task with category, priority and seasonal month details.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Where do I find the Apiary Siting Guide and Hive Siting Guide?{" "}
                    <Badge tone="blue">Premium</Badge>
                  </p>
                  <p className="text-gray-700">
                    On the <strong>New Apiary</strong> page and <strong>New Hive</strong> page
                    there’s a guide button at the top. You can also open them directly here:{" "}
                    <Link to="/apiaries/step-by-step" className="text-blue-700 underline">
                      Apiary Siting Guide
                    </Link>{" "}
                    and{" "}
                    <Link to="/hives/step-by-step" className="text-blue-700 underline">
                      Hive Siting Guide
                    </Link>
                    .
                  </p>
                </div>

                <div>
                  <p className="font-medium">Why does it ask Season / Strength / Onset first?</p>
                  <p className="text-gray-700">
                    Those answers help the helper show the most relevant questions next. They can
                    also influence suggestions slightly, but they don’t “diagnose” anything on their
                    own.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What should I choose if I haven’t opened the hive?</p>
                  <p className="text-gray-700">
                    Use <strong>Not sure</strong>. The helper is designed for partial information.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Can I use the app without NFC?</p>
                  <p className="text-gray-700">
                    Yes. NFC <Badge tone="blue">Premium</Badge> just speeds up hive selection.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Does NFC work on iPhone?</p>
                  <p className="text-gray-700">
                    Yes, but not with in-browser Web NFC scanning. On iPhone / iPad, use{" "}
                    <strong>Set Up NFC Tags</strong>, copy the HiveTag link for the hive, and write
                    that link to the tag using an NFC writing app.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Can I reuse NFC tags?</p>
                  <p className="text-gray-700">
                    Yes. Android tags can be cleared in <strong>Manage Android NFC Tags</strong>.
                    iPhone / iPad NFC status can be cleared in <strong>Set Up NFC Tags</strong>, and
                    the physical tag can then be reused by writing a new HiveTag link to it.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Can I filter tasks by date range?</p>
                  <p className="text-gray-700">
                    Yes. On the <strong>Tasks</strong> list you can use <strong>From</strong> and{" "}
                    <strong>To</strong> dates.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Why won’t NFC create another inspection for the same hive today?
                  </p>
                  <p className="text-gray-700">
                    The NFC shortcut is limited to{" "}
                    <strong>one NFC-started inspection per hive per day</strong> to prevent
                    accidental duplicates.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What exactly do I get on Free?</p>
                  <p className="text-gray-700">
                    1 active apiary, 2 active hives total, unlimited inspections, weather tools,
                    calendar, tasks, logbook entries, and CSV export from Settings. Queen Records are
                    not a standard Free feature, but Queen data created while Premium remains
                    available read-only after downgrade.
                  </p>
                </div>

                <div>
                  <p className="font-medium">How do I export my data?</p>
                  <p className="text-gray-700">
                    Go to <strong>Settings → Export</strong> and click <em>Export my data (CSV)</em>
                    .
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <h2 className="text-2xl font-bold mb-3">Troubleshooting</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Colony Health Check seems stuck</strong>{" "}
                  <Badge tone="blue">Premium</Badge>
                  <strong>:</strong> switch to <strong>Expand all</strong> to see everything
                  relevant, or press <strong>Reset all</strong> and start again.
                </li>
                <li>
                  <strong>Colony Health Check shows a UK action panel</strong>{" "}
                  <Badge tone="blue">Premium</Badge>
                  <strong>:</strong> pause before moving equipment, and use the official links shown
                  for guidance/reporting.
                </li>
                <li>
                  <strong>Queens says “Read only”:</strong> the account has retained Queen data from a
                  previous Premium period. You can review and report it, but Queen management controls
                  require an active Premium plan.
                </li>
                <li>
                  <strong>Queen Reports only shows Queen Records:</strong> this is the intended
                  read-only downgrade mode. Inspections, Tasks, Logbook, NFC and full Excel exports
                  remain Premium.
                </li>
                <li>
                  <strong>The current Queen ignores my report date range:</strong> the current position
                  is deliberately shown as the colony’s position now. Historical Queen activity and
                  snapshots are date-filtered.
                </li>
                <li>
                  <strong>My Dashboard layout changed:</strong> open{" "}
                  <strong>Customise Dashboard</strong> and select the sections you need, or press{" "}
                  <strong>Restore recommended layout</strong>.
                </li>
                <li>
                  <strong>Open Hive Health is locked</strong> <Badge tone="blue">Premium</Badge>
                  <strong>:</strong> Hive Health is a Premium feature. Free users can still view and
                  edit their saved inspection information from the normal Inspection List.
                </li>
                <li>
                  <strong>Seasonal Guide task will not save</strong>{" "}
                  <Badge tone="blue">Premium</Badge>
                  <strong>:</strong> make sure you have selected an <strong>Apiary</strong> and
                  either a specific
                  <strong> Hive</strong> or <strong>All Hives</strong> before saving.
                </li>
                <li>
                  <strong>Can’t add another apiary/hive:</strong> Free plan allows 1 active apiary
                  and 2 active hives total. Upgrade to add more.
                </li>
                <li>
                  <strong>Can’t unarchive an apiary/hive on Free:</strong> limits apply on Free.
                  Upgrade to reactivate more.
                </li>
                <li>
                  <strong>Weather didn’t load or is very slow:</strong> confirm the apiary has valid
                  coordinates saved; occasionally providers are slow.
                </li>
                <li>
                  <strong>Map popups cover the header or feel “tight”:</strong> popups are designed
                  to overlay the header panels without auto-panning (to avoid screen “jumping”). If
                  a popup is near the edge of the screen, drag the map slightly to bring it fully
                  into view.
                </li>
                <li>
                  <strong>Satellite layer is blank or slow:</strong> satellite imagery comes from an
                  external provider and may be rate-limited or temporarily unavailable. Switch back
                  to <strong>Map</strong> and try again later.
                </li>
                <li>
                  <strong>NFC says “not supported”:</strong> use Chrome on Android for direct tag
                  scanning. On iPhone / iPad, use the NFC link method from{" "}
                  <strong>Set Up NFC Tags</strong>.
                </li>
                <li>
                  <strong>I can’t find where to set up NFC:</strong> go to{" "}
                  <strong>Set Up NFC Tags</strong> from the sidebar. That page now contains both
                  Android and iPhone / iPad setup methods.
                </li>
                <li>
                  <strong>Android tag won’t link:</strong> if it is already linked elsewhere, clear
                  it from <strong>Manage Android NFC Tags</strong> first and then scan it again.
                </li>
                <li>
                  <strong>iPhone tag opens the wrong hive:</strong> clear the iPhone / iPad NFC
                  status in <strong>Set Up NFC Tags</strong> if needed, then copy a fresh HiveTag
                  link and rewrite the physical tag.
                </li>
                <li>
                  <strong>Back button on siting guides doesn’t return:</strong> the Back button
                  relies on browser history. If you open a guide in a new tab, there may be no
                  history to go back to—open the guide in the same tab from New Apiary / New Hive.
                </li>
                <li>
                  <strong>Why doesn’t the Share button always work?</strong> HiveTag uses your
                  device’s built-in sharing features. On supported mobile devices, you can share
                  inspection summaries using apps such as WhatsApp, Messages or Email. Some desktop
                  browsers and localhost development environments do not support native sharing, so
                  HiveTag will offer a copy-to-clipboard fallback instead.
                </li>
                <li>
                  <strong>Why did my report filters stay the same?</strong> HiveTag remembers your
                  last selected apiary, hive and date range so you can continue where you left off.
                </li>
                <li>
                  <strong>Can I download inspection photographs?</strong> Yes. Open the inspection
                  gallery using <strong>View Full Gallery</strong>, then use the{" "}
                  <strong>Download</strong> button.
                </li>
              </ul>
            </section>

            {/* Privacy */}
            <section id="privacy">
              <h2 className="text-2xl font-bold mb-3">Privacy &amp; Data</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your data is stored securely in your BeezKnees account.</li>
                <li>
                  <strong>Photos are public URLs</strong> for fast loading; your CSV export includes
                  links to these files.
                </li>
                <li>
                  <strong>Android NFC tag IDs:</strong> HiveTag stores the scanned Android tag ID
                  and its hive linkage so the correct hive can be opened later.
                </li>
                <li>
                  <strong>iPhone / iPad NFC tags:</strong> these use a HiveTag link written onto the
                  physical tag. HiveTag does not track tag location.
                </li>
                <li>
                  <strong>Export</strong>: use <em>Settings → Export</em> to download CSVs of your
                  data anytime.
                </li>
                <li>
                  <strong>Deletion</strong>: <em>Settings → Delete Account</em> cancels any
                  subscription, removes storage files, deletes your tables, and deletes the auth
                  user.
                </li>
              </ul>
            </section>

            {/* Power Users */}
            <section id="power-users">
              <h2 className="text-2xl font-bold mb-3">Power-User Notes</h2>
              <p className="text-gray-700 mb-2">
                A <strong>power user</strong> is simply someone who prefers advanced controls:
                jumping around, seeing everything at once, and moving quickly without a guided
                wizard.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Colony Health Check</strong> <Badge tone="blue">Premium</Badge>
                  <strong>:</strong> use <strong>Expand all</strong> to answer in any order. Use{" "}
                  <strong>Recommended next checks</strong> to narrow down the results efficiently.
                </li>
                <li>
                  <strong>Plan enforcement:</strong> inserts and unarchives are constrained on Free
                  (1 apiary / 2 hives). Downgrade auto-archives extras; upgrade lifts limits.
                </li>
                <li>
                  <strong>NFC setup hub:</strong> <strong>Set Up NFC Tags</strong> is now the single
                  place for both Android and iPhone / iPad NFC setup.{" "}
                  <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>Android NFC routing:</strong> unknown Android tag → Android linking flow;
                  once linked, scanning that tag takes you directly to <em>New Inspection</em>.{" "}
                  <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>iPhone / iPad NFC routing:</strong> copied HiveTag link → written to tag →
                  opening the tag routes into <em>New Inspection</em>.{" "}
                  <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>Seasonal Guide tasks</strong> <Badge tone="blue">Premium</Badge>
                  <strong>:</strong> tasks created from the guide are saved with structured
                  metadata:
                  <code> category</code>, <code>priority</code>, <code>source</code>, and{" "}
                  <code>seasonal_month</code>.
                </li>
                <li>
                  <strong>Queen lifecycle:</strong> assignments, events, processes and inspection
                  snapshots are separate historical layers. Moving a Queen creates a new assignment
                  rather than rewriting the previous hive history.
                </li>
                <li>
                  <strong>Reports dataset:</strong> Step 1 loads the report data once. Screen tabs,
                  CSV, Excel and print reuse that same dataset and respect the Apiary/Hive/date and
                  archive selections.
                </li>
                <li>
                  <strong>CSV export (Settings):</strong> one CSV per table +{" "}
                  <code>photos.csv</code> with public URLs (images not bundled).
                </li>
              </ul>
            </section>

            {/* Glossary */}
            <section id="glossary">
              <h2 className="text-2xl font-bold mb-3">Glossary</h2>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <dt className="font-medium">Apiary</dt>
                  <dd className="text-gray-700">Site where you keep bees.</dd>
                </div>

                <div>
                  <dt className="font-medium">Hive</dt>
                  <dd className="text-gray-700">Individual bee colony housing.</dd>
                </div>

                <div>
                  <dt className="font-medium">Inspection</dt>
                  <dd className="text-gray-700">Structured record of a hive’s status.</dd>
                </div>

                <div>
                  <dt className="font-medium">Queen Record</dt>
                  <dd className="text-gray-700">
                    Dedicated identity and lifecycle record for a Queen, separate from short Queen
                    observations recorded during inspections.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Queen Assignment</dt>
                  <dd className="text-gray-700">
                    The dated relationship between a Queen and a hive. Transfers create a new
                    assignment while preserving the previous one.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Queen Snapshot</dt>
                  <dd className="text-gray-700">
                    Queen information preserved with an inspection so later lifecycle changes do not
                    rewrite what was recorded at the time.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Read only</dt>
                  <dd className="text-gray-700">
                    Records remain visible and reportable, but cannot be added, edited, progressed,
                    archived or deleted until the required plan is active.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Hive Health</dt>
                  <dd className="text-gray-700">
                    Premium inspection review page with smart badges, suggested kit, and linked
                    follow-up task/logbook actions.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Seasonal Guide</dt>
                  <dd className="text-gray-700">
                    Premium Year in the Apiary guide with monthly infographic guidance and
                    task-ready seasonal actions.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">NFC</dt>
                  <dd className="text-gray-700">
                    Near Field Communication — used in HiveTag to open the correct hive more
                    quickly.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Archive</dt>
                  <dd className="text-gray-700">
                    Hide from active lists without deleting. Linked inspection tasks and logbook
                    entries are archived together.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Linked Records</dt>
                  <dd className="text-gray-700">
                    Tasks or logbook entries connected to a specific inspection.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Triage</dt>
                  <dd className="text-gray-700">
                    A “what to check next” approach, not a medical/veterinary diagnosis.
                  </dd>
                </div>

                <div>
                  <dt className="font-medium">Notifiable (UK)</dt>
                  <dd className="text-gray-700">
                    A pest/disease with official reporting requirements. Follow GOV.UK / NBU
                    guidance and avoid moving equipment.
                  </dd>
                </div>
              </dl>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}