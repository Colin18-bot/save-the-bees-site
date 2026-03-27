// src/pages/Help.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const toc = [
  { id: "concepts", title: "Key Concepts" },
  { id: "membership", title: "Membership & Feature Availability" },
  { id: "getting-started", title: "Getting Started" },
  { id: "siting-guides", title: "Apiary & Hive Siting Guides" },
  { id: "navigation", title: "Navigation Overview" },
  { id: "apiary-map-markers", title: "Apiary Map Markers (Map Notes)" },
  { id: "bee-health-helper", title: "Colony Health Check (Bee Health Helper)" },
  { id: "business-inventory", title: "Inventory, Sales & Expenses" },
  { id: "currency-defaults", title: "Default Currency (How It Works)" },
  { id: "reports", title: "Reports" },
  { id: "workflows", title: "Typical Workflows" },
  { id: "nfc", title: "NFC (Premium): How It Works" },
  { id: "weather-maps-photos", title: "Weather, Maps & Photos" },
  { id: "apiary-map-markers-2", title: "Apiary Map & Markers" },
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
          <h1 className="text-3xl font-bold">HiveTag Help &amp; How-To</h1>
          <p className="mt-2 text-gray-600">
            Clear, practical guidance for every part of HiveTag—from your first
            apiary to NFC tag setup and inspections.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Features labeled <Badge tone="blue">Premium</Badge> require a Premium
            plan. Free plan limits are summarised below.
          </p>
        </header>

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
            {/* Key Concepts */}
            <section id="concepts">
              <h2 className="text-2xl font-bold mb-3">
                Key Concepts (Data Model)
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Apiary</strong> — a location where hives live.
                </li>
                <li>
                  <strong>Hive</strong> — an individual hive in an apiary (photo,
                  type, status, optional NFC tag).
                </li>
                <li>
                  <strong>Inspection</strong> — a dated record about a hive
                  (weather, behaviour, brood, stores, disease/pests, notes,
                  photos).
                </li>
                <li>
                  <strong>Tasks</strong> — scheduled actions with a due date and
                  status; can reference an apiary and/or hive.
                </li>
                <li>
                  <strong>Logbook</strong> — free-form notes (can link to an
                  inspection).
                </li>
                <li>
                  <strong>Archive</strong> — hides items from active lists
                  without deleting them. On the Dashboard’s recent lists,
                  archived items show an <Badge tone="amber">Archived</Badge>{" "}
                  pill and no action links. Manage archived content on the
                  dedicated <em>Archive</em> page.
                </li>
              </ul>
              <p className="mt-3 text-gray-700">
                Relationship: <em>Apiary → Hives → Inspections</em>. Tasks and
                Logbook entries can reference either or both.
              </p>
            </section>

            {/* Membership & Feature Availability */}
            <section id="membership">
              <h2 className="text-2xl font-bold mb-3">
                Membership &amp; Feature Availability
              </h2>

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
                        <strong>Weather tools</strong> (Weather page, Dashboard
                        snapshot, inspection auto-fill, Seasonal Beekeeper Notes
                        preview)
                      </li>
                      <li>
                        <strong>Calendar</strong>
                      </li>
                      <li>
                        <strong>Tasks</strong> &amp; <strong>Logbook</strong>
                      </li>
                      <li>
                        <strong>Export my data (CSV)</strong> via{" "}
                        <em>Settings → Export</em>
                      </li>
                      <li>
                        <strong>Colony Health Check</strong> (Bee Health Helper)
                      </li>
                      <li>
                        <strong>Siting Guides</strong> (Apiary Siting Guide + Hive Siting Guide)
                      </li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-600">
                      If you downgrade from Premium to Free, we keep{" "}
                      <strong>1 active apiary</strong> (preferring your{" "}
                      <em>default apiary</em>) and up to{" "}
                      <strong>2 active hives</strong> in it. The rest are
                      auto-archived.
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
                        <strong>NFC tools</strong>: <strong>Set Up NFC Tags</strong>,
                        <strong> Manage Android NFC Tags</strong>, printable NFC setup
                        card, and the iPhone / iPad link method
                      </li>
                      <li>
                        <strong>NFC tap-to-log</strong>: Android can scan blank
                        tags in-app; iPhone / iPad can use a HiveTag link written
                        to the tag
                      </li>
                      <li>
                        <strong>NFC quick-select</strong> in New Inspection (when
                        arriving from an NFC action)
                      </li>
                      <li>
                        <strong>Stripe Customer Portal</strong>:{" "}
                        <em>Settings → Manage billing</em>
                      </li>
                      <li>Priority enhancements &amp; future advanced features</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-gray-700">
                On Free, creating a 2nd apiary or a 3rd hive is blocked.
                Unarchiving beyond Free limits is also prevented while on Free.
              </p>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <h2 className="text-2xl font-bold mb-3">
                Getting Started (First 10 Minutes)
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Create an Apiary:</strong>{" "}
                  <span className="text-gray-700">Apiaries → New Apiary.</span>{" "}
                  Name it, set a date, optionally pin on the map or search by
                  address, then save.{" "}
                  <span className="ml-2">
                    <Badge>Free</Badge> 1 active apiary
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    Tip: Use the <strong>Apiary Siting Guide</strong> button on the New Apiary page if you’re unsure where to place an apiary.
                  </div>
                </li>
                <li>
                  <strong>Add a Hive:</strong>{" "}
                  <span className="text-gray-700">Hives → New Hive.</span>{" "}
                  Choose the apiary, name the hive, set type/status, add an
                  optional photo, and save.
                  <span className="ml-2">
                    <Badge>Free</Badge> 2 active hives total
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    Tip: Use the <strong>Hive Siting Guide</strong> button on the New Hive page to help with entrance direction, flight paths, and working space.
                  </div>
                </li>
                <li>
                  <strong>Log an Inspection:</strong>{" "}
                  <span className="text-gray-700">
                    Inspections → New Inspection
                  </span>
                  . Weather auto-fills from the apiary’s coordinates for that
                  date. <Badge>Free</Badge>
                </li>
                <li>
                  <strong>Try the Colony Health Check:</strong>{" "}
                  <span className="text-gray-700">Colony Health Check</span>{" "}
                  helps you decide what to check next when something looks “off”.
                  <Badge>Free</Badge>
                </li>
                <li>
                  <strong>NFC</strong> <Badge tone="blue">Premium</Badge>:
                  open <strong>Set Up NFC Tags</strong> to choose either the
                  Android scan method or the iPhone / iPad link method.
                </li>
              </ol>
            </section>

            {/* NEW: Siting Guides */}
            <section id="siting-guides">
              <h2 className="text-2xl font-bold mb-3">Apiary &amp; Hive Siting Guides</h2>

              <p className="text-gray-700">
                HiveTag includes two beginner-friendly guides designed to be used while you are setting up new records:
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Apiary Siting Guide</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Helps you choose a safe, practical apiary location: permission, access, working area,
                    flight paths, shelter/microclimate, water, security, and expansion space.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Best place to open it: <strong>Apiaries → New Apiary</strong> using the button at the top of the page.
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
                    Covers exact hive placement within an apiary: stand stability/height, entrance direction,
                    nuisance reduction, wind/sun/shade, spacing, and practical safety.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Best place to open it: <strong>Hives → New Hive</strong> using the button at the top of the page.
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
                  The guides include a <strong>Back</strong> button that returns to the page you came from.
                  For this to work as expected, open the guides in the <strong>same tab</strong> (not a new tab).
                </p>
              </div>
            </section>

            {/* Navigation Overview */}
            <section id="navigation">
              <h2 className="text-2xl font-bold mb-3">
                Navigation Overview (What Each Page Does)
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Dashboard</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Filter by Apiary</strong> to scope stats and recent
                      items; <em>Apiaries</em> count stays global.
                    </li>
                    <li>
                      <strong>Recent sections (Inspections, Tasks, Logbook):</strong>{" "}
                      “<em>Open →</em>” takes you to the relevant <em>list</em>{" "}
                      page with the item briefly <strong>highlighted</strong>.
                      Use <strong>✎ Edit</strong> to jump to editing.
                    </li>
                    <li>
                      <strong>Archived items:</strong> on these recent lists,
                      archived rows show an{" "}
                      <span className="ml-1 mr-1">
                        <Badge tone="amber">Archived</Badge>
                      </span>{" "}
                      pill on the far right and <strong>do not</strong> show{" "}
                      <em>Open</em> or <em>Edit</em> links. Use the{" "}
                      <em>Archive</em> page to view/manage them.
                    </li>
                    <li>
                      <strong>See all … →</strong> under each section opens the
                      full, filter-aware list for that content type.
                    </li>
                    <li>
                      <strong>Tasks</strong> show a status pill (Pending/Completed)
                      and an <strong>Overdue</strong> label when past the due
                      date.
                    </li>
                    <li>
                      <strong>Weather Snapshot</strong> uses your{" "}
                      <em>default apiary</em> and displays a banner naming it. If
                      the default has no coordinates, a clear note explains a
                      temporary London placeholder is shown.
                    </li>
                    <li>
                      <strong>Seasonal Beekeeper Notes (preview):</strong> small
                      panel under the snapshot showing the first few season-aware
                      notes with a <strong>“View full notes”</strong>{" "}
                      link that takes you to the full Weather page.
                    </li>
                    <li>
                      <strong>Reports &amp; Export card:</strong> opens the{" "}
                      <em>Reports &amp; Exports</em> page, where you can print
                      multi-section reports and download CSVs using the same
                      Apiary/Hive/date filters.
                    </li>
                    <li>
                      <strong>NFC summary (Premium):</strong> Premium users see an{" "}
                      <strong>NFC Tagged Hives</strong> panel showing how many
                      hives have Android-scanned tag IDs linked in HiveTag and a
                      short list of recent tagged hives.{" "}
                      <Badge tone="blue">Premium</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Apiaries</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Cards show a mini map (if coordinates exist), a
                      human-readable location, hive count, and actions.
                    </li>
                    <li>
                      Click the photo on a card to open a full-size{" "}
                      <strong>lightbox</strong>.
                    </li>
                    <li>
                      <strong>Apiary Map (markers):</strong> the Apiaries list includes a{" "}
                      <strong>Map</strong> action (on the apiary card) that opens a full-screen map
                      for that apiary. Use it to add simple map notes like forage hotspots, water
                      sources, access/parking, shelter/windbreaks, risks, and Asian hornet sightings.
                    </li>
                    <li>
                      New/Edit: name, date, coordinates, notes, photo, default
                      toggle.
                    </li>
                    <li>
                      New Apiary includes an <strong>Apiary Siting Guide</strong> button at the top for beginners.
                      (Quick link:{" "}
                      <Link to="/apiaries/step-by-step" className="text-blue-700 underline">
                        Apiary Siting Guide
                      </Link>
                      )
                    </li>
                    <li>
                      Free plan limit: <strong>1 active apiary</strong>.{" "}
                      <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Hives</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      List by apiary; shows inspection count; actions for Edit /{" "}
                      New Inspection.
                    </li>
                    <li>
                      If an Android NFC tag is linked, a small <strong>NFC Tag</strong>{" "}
                      pill appears on the hive card (Premium).
                    </li>
                    <li>
                      Photos open in a <strong>lightbox</strong> when clicked;
                      location and map come from the parent apiary.
                    </li>
                    <li>
                      New Hive includes a <strong>Hive Siting Guide</strong> button at the top to help choose entrance direction,
                      working space, and nuisance reduction. (Quick link:{" "}
                      <Link to="/hives/step-by-step" className="text-blue-700 underline">
                        Hive Siting Guide
                      </Link>
                      )
                    </li>
                    <li>
                      Free plan limit: <strong>2 active hives</strong> total.{" "}
                      <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Inspections</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Filter by apiary and/or hive; each card summarises key info
                      and photos.
                    </li>
                    <li>
                      Fields are provided for varroa and disease checks so you
                      can record what you observe; always follow official
                      guidance and your association’s advice on notifiable
                      diseases.
                    </li>
                    <li>
                      <strong>Linked Logbook:</strong> where logbook entries
                      reference an inspection, the card shows a count with a{" "}
                      <em>View logbook</em> link. Clicking it opens the{" "}
                      <strong>Logbook</strong> list <em>filtered to that
                      inspection</em> with a blue banner and a one-click “Clear
                      inspection filter”.
                    </li>
                    <li>
                      Unlimited on Free. <Badge>Free</Badge>
                    </li>
                    <li>
                      NFC quick-select is available when you arrive from an NFC
                      action. <Badge tone="blue">Premium</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Colony Health Check</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      A guided helper that asks one question at a time and suggests
                      what to check next when symptoms are unclear.
                    </li>
                    <li>
                      It includes a clear disclaimer and links to official UK reporting
                      guidance for high-significance pests/diseases.
                    </li>
                    <li>
                      You can switch between <strong>Guided mode</strong> and{" "}
                      <strong>Expand all</strong> at any time.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Tasks &amp; Calendar</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Create tasks with due dates and statuses; filter by{" "}
                      <strong>apiary</strong>, <strong>hive</strong>, and a{" "}
                      <strong>From/To date range</strong>.
                    </li>
                    <li>
                      <strong>Marking completed:</strong> update the status from
                      the <strong>Task List</strong> or from the{" "}
                      <strong>Edit Task</strong> page.
                    </li>
                    <li>
                      From the calendar, open an item and choose{" "}
                      <strong>View in list</strong> to jump to the Task List with
                      the task briefly highlighted.
                    </li>
                    <li>
                      The calendar surfaces dated items across apiaries and hives.{" "}
                      <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Logbook</h3>
                  <p className="text-gray-700">
                    Free-form notes with optional inspection links. Includes
                    list/grid toggle, per-apiary filter, and photo{" "}
                    <strong>lightbox</strong> on click.
                    <br />
                    <span className="text-gray-700">
                      When linking a <em>Related Inspection</em>, the dropdown is
                      grouped by date and each option shows{" "}
                      <strong>Hive (Apiary)</strong> and the <strong>time</strong>.
                    </span>{" "}
                    <Badge>Free</Badge>
                  </p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>
                      <strong>Arriving from Inspections:</strong> the Logbook list
                      may be <em>filtered to a specific inspection</em>. You’ll see a
                      blue banner plus a one-click “Clear inspection filter”.
                    </li>
                    <li>
                      <strong>Deep-links &amp; highlights:</strong> when you’re
                      sent to a list by “Open →” the target item briefly
                      highlights so it’s easy to spot.
                    </li>
                  </ul>
                </div>

                {/* SALES & EXPENSES – concise user guidance only */}
                <div>
                  <h3 className="font-semibold">Sales</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Sales (List):</strong> shows each sale with
                      invoice/customer/channel, items and totals. Use the{" "}
                      <strong>Edit</strong> button in the table to update a sale.
                    </li>
                    <li>
                      <strong>New Sale:</strong> add line items (qty, unit price,
                      discount, optional cost per unit). Totals display in your{" "}
                      <strong>default currency</strong>. After saving, you’re
                      returned to the <strong>Sales</strong> list.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Expenses</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Expenses (List):</strong> shows each expense with
                      category/vendor/invoice/amount. Use the{" "}
                      <strong>Edit</strong> button in the table to update an
                      expense.
                    </li>
                    <li>
                      <strong>New Expense:</strong> the <em>Currency</em> field
                      defaults to your <strong>default currency</strong> but can
                      be changed per expense. After saving, you’re returned to
                      the <strong>Expenses</strong> list.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Profile</strong> (name &amp; avatar),{" "}
                      <strong>Password</strong>, <strong>Default Apiary</strong>,
                      language/timezone.
                    </li>
                    <li>
                      <strong>Default Currency:</strong> choose your preferred
                      ISO code (e.g., GBP, EUR, USD).
                    </li>
                    <li>
                      <strong>Manage billing</strong> (Premium): opens Stripe
                      Customer Portal (update card, invoices, cancel).
                    </li>
                    <li>
                      <strong>Export my data (CSV)</strong>: downloads separate
                      CSV files for your tables plus a list of public photo URLs.
                    </li>
                    <li>
                      <strong>Delete Account</strong>: cancels subscription,
                      removes storage files and data, then deletes your account.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Archive</h3>
                  <p className="text-gray-700">
                    Central place for archived items. Archiving hides content
                    from active lists without deleting history. On Free,
                    unarchiving is limited by the 1 apiary / 2 hives active
                    limits.
                  </p>
                </div>
              </div>
            </section>

            {/* Apiary Map Markers */}
            <section id="apiary-map-markers">
              <h2 className="text-2xl font-bold mb-3">Apiary Map Markers (Map Notes)</h2>

              <p className="text-gray-700">
                The <strong>Apiary Map Markers</strong> page lets you add simple “map notes” for each apiary — for example:
                water sources, forage hotspots, risks, access/parking, shelter/windbreaks, or Asian hornet sightings.
                These markers are saved per apiary and are useful for remembering what’s around a site.
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">How to add a marker</h3>
                  <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
                    <li>Open an apiary’s map (Apiaries → open the apiary map/markers view).</li>
                    <li>Press <strong>Add marker</strong>.</li>
                    <li>Tap/click the map where you want the marker.</li>
                    <li>Choose a <strong>Type</strong>, then optionally add a <strong>Title</strong> and <strong>Notes</strong>.</li>
                    <li>Press <strong>Save</strong>.</li>
                  </ol>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <h3 className="font-semibold">Edit, delete, and “Pick again”</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                    <li>
                      Tap an existing marker to open it, then use <strong>Edit</strong> to change details or <strong>Delete</strong> to remove it.
                    </li>
                    <li>
                      <strong>Pick again</strong> is only for <em>new markers</em>: it clears the chosen point so you can tap the map again
                      to select a different location before saving.
                    </li>
                    <li>
                      If you press <strong>Pick again</strong>, you should then tap the map again to place the marker in the new spot.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded border bg-white p-4">
                <h3 className="font-semibold">Map layers, legend, and foraging ring</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Use the <strong>Map ↔ Satellite</strong> toggle to switch backgrounds (satellite imagery may load slower depending on provider).
                  </li>
                  <li>
                    The <strong>Legend</strong> explains marker types and the <strong>~3 mile foraging ring</strong> around the apiary.
                  </li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  Indicative range only — bees may forage further depending on conditions.
                </p>
              </div>

              <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Popup behaviour</div>
                <p className="mt-1">
                  The map is designed so popups sit <strong>above</strong> the header panels (so forms don’t get hidden).
                  The map will <strong>not</strong> automatically “jump” the view to fit a popup — if a popup is near the edge,
                  simply drag the map slightly to bring it fully into view.
                </p>
              </div>

              <div className="mt-4 rounded border bg-white p-4">
                <h3 className="font-semibold">Pollen on the Map Markers page</h3>
                <p className="mt-2 text-gray-700">
                  Pollen data (when available) is shown in the <strong>Pollen (apiary location)</strong> panel in the header area of the map page.
                  It does <strong>not</strong> appear as a marker on the map itself. The pollen panel is tied to the apiary’s saved coordinates.
                </p>
              </div>
            </section>

            {/* Colony Health Check */}
            <section id="bee-health-helper">
              <h2 className="text-2xl font-bold mb-3">
                Colony Health Check (Bee Health Helper)
              </h2>

              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-800">
                <div className="font-semibold">Important</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    The Bee Health Helper is <strong>not a diagnosis</strong>. It’s a
                    triage tool to guide what to check next.
                  </li>
                  <li>
                    Use <strong>Not sure</strong> whenever you haven’t opened the hive,
                    the weather is poor, or you simply can’t observe that detail.
                  </li>
                  <li>
                    If you suspect a <strong>notifiable disease/pest</strong>, avoid
                    moving colonies/equipment and follow official guidance.
                  </li>
                </ul>
              </div>

              <p className="text-gray-700">
                The Bee Health Helper is designed for real-world beekeeping where you
                might only have partial information. It asks a short set of context
                questions first, then adapts the next questions based on what you’ve
                selected.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">How to use it (simple)</h3>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
                    <li>
                      Open <strong>Colony Health Check</strong> from the sidebar.
                    </li>
                    <li>
                      Answer the first few “context” questions:{" "}
                      <strong>Season</strong>, <strong>Colony strength</strong>, and{" "}
                      <strong>How quickly did this start?</strong>
                    </li>
                    <li>
                      Pick your <strong>main concern</strong> (brood, adults, behaviour,
                      collapse, pests, or “not sure”).
                    </li>
                    <li>
                      Continue with the guided questions (or switch to{" "}
                      <strong>Expand all</strong> if you prefer).
                    </li>
                    <li>
                      Press <strong>Get results</strong> to see the most likely patterns
                      and what to check next.
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
                      <strong>Expand all</strong> shows everything that’s currently
                      relevant so you can jump around.
                    </li>
                    <li>
                      You can switch between them any time. Your answers stay in place.
                    </li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Why it asks “Season” and “Strength”</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                    <li>
                      These answers help the tool show more relevant questions (for
                      example, some symptoms are more common in certain seasons).
                    </li>
                    <li>
                      They can also nudge suggestions, but they are{" "}
                      <strong>not a diagnosis</strong> on their own.
                    </li>
                    <li>
                      If you’re unsure, choose the closest match — or use “Not sure”
                      where available.
                    </li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Recommended next checks</h3>
                  <p className="text-gray-700 mt-2">
                    After results, you may see <strong>Recommended next checks</strong>.
                    These are the most useful observations to confirm or rule out the
                    top suggestions. Clicking one jumps you straight to that question.
                  </p>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">UK reporting &amp; urgent guidance</h3>
                  <p className="text-gray-700 mt-2">
                    If you select a high-significance sign (or the results indicate an
                    urgent risk), the tool will show a <strong>UK action</strong> panel
                    with official links. This may appear even if the condition doesn’t
                    show as your “top” result, because reporting guidance is more
                    important than scoring.
                  </p>
                  <p className="text-gray-700 mt-2">
                    If you’re unsure, treat it as a prompt to{" "}
                    <strong>pause and check official guidance</strong> before moving
                    equipment or applying treatments.
                  </p>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Resetting</h3>
                  <p className="text-gray-700 mt-2">
                    Use <strong>Reset all</strong> to clear everything and start again.
                    This is helpful if you’re switching to a different hive, or your
                    situation changes.
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

            {/* Inventory, Sales & Expenses (overview) */}
            <section id="business-inventory">
              <h2 className="text-2xl font-bold mb-3">
                Inventory, Sales &amp; Expenses
              </h2>
              <p className="text-gray-700 mb-2">
                The business tools are optional but handy if you sell honey,
                nucleus colonies, equipment, or want to track what your beekeeping
                is costing you.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Inventory</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      The <strong>Inventory</strong> list lets you track items
                      such as hives, frames, feeders, jars, labels and other kit.
                    </li>
                    <li>
                      <strong>New Item:</strong> record category, purchase date,
                      quantity, unit price, total cost, supplier/invoice and optional link
                      to an apiary/hive.
                    </li>
                    <li>
                      Items can be marked as <em>consumable</em> or as tracked
                      stock so you can see how much you have left.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Sales</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Sales</strong> shows each sale with customer,
                      channel, invoice reference and totals.
                    </li>
                    <li>
                      <strong>New Sale:</strong> add line items including product
                      name, type, unit, quantity, unit price, optional discount
                      and cost-per-unit.
                    </li>
                    <li>
                      Amounts are displayed using your{" "}
                      <strong>default currency</strong>.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Expenses</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Expenses</strong> records your outgoings such as
                      feed, medication, equipment, fuel and{" "}
                      <strong>Training</strong>.
                    </li>
                    <li>
                      Each expense has a category, vendor, invoice/receipt
                      reference, date, amount and a currency (defaulted from your
                      chosen currency in Settings).
                    </li>
                    <li>
                      These feed into the <strong>Profit &amp; Loss</strong> view
                      so you can see income versus costs at a glance.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Profit &amp; Loss</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      The dedicated <strong>Profit &amp; Loss</strong> page brings
                      together your Sales and Expenses and shows a simple summary
                      using your default currency.
                    </li>
                    <li>
                      Use this when preparing accounts, talking to your
                      accountant, or just checking how your beekeeping hobby or
                      business is performing.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Default Currency */}
            <section id="currency-defaults">
              <h2 className="text-2xl font-bold mb-3">
                Default Currency (How It Works)
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  Your <strong>default currency</strong> is the ISO code you
                  prefer to see in totals and as the starting currency for new
                  entries. You can set it in <strong>Settings</strong>. Examples:{" "}
                  <code>GBP</code>, <code>EUR</code>, <code>USD</code>.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Sales &amp; Profit/Loss:</strong> totals are shown
                    using your default currency for display. (No FX conversion is
                    performed.)
                  </li>
                  <li>
                    <strong>New Expense:</strong> the Currency field is pre-filled
                    with your default currency; you can change it per expense.
                  </li>
                  <li>
                    <strong>Expenses List:</strong> each row shows the amount
                    formatted using the stored currency for that row.
                  </li>
                  <li>
                    <strong>Inventory List:</strong> rows display using the item’s
                    own currency; if an item has none saved, your default currency
                    is used.
                  </li>
                  <li>
                    <strong>Changing the default</strong> updates new-form
                    defaults and how totals are formatted going forward. It does{" "}
                    <em>not</em> convert past numbers or rewrite saved rows.
                  </li>
                  <li>
                    <strong>No conversions:</strong> BeezKnees formats amounts
                    using the currency code but does not apply exchange rates.
                  </li>
                </ul>
              </div>
            </section>

            {/* Reports */}
            <section id="reports">
              <h2 className="text-2xl font-bold mb-3">Reports</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Open <strong>Reports</strong> from the Sidebar to access the main{" "}
                  <strong>Reports &amp; Exports</strong> page.
                </li>
                <li>
                  On <strong>Reports &amp; Exports</strong> you can:
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>
                      Filter by <strong>apiary</strong> and <strong>hive</strong>.
                    </li>
                    <li>
                      Choose a date range and select which sections to include:
                      <strong> Inspections</strong>, <strong>Tasks</strong>,{" "}
                      <strong>Logbook</strong>, and <strong>NFC tagged hives</strong>.
                    </li>
                    <li>Print the page for a clean, multi-section report.</li>
                    <li>
                      Download CSV:
                      <ul className="list-disc pl-6 mt-1">
                        <li>
                          <strong>Combined CSV</strong> with a <code>type</code>{" "}
                          column.
                        </li>
                        <li>
                          Separate CSVs for Inspections, Tasks, Logbook, and NFC tags.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  Use the dedicated <strong>Profit &amp; Loss</strong> view to see
                  a simple summary of income versus expenses, formatted with your
                  default currency.
                </li>
                <li>
                  You can also use the{" "}
                  <strong>Dashboard → Reports &amp; Export</strong> card to jump
                  straight into a filtered print/export view.
                </li>
                <li>
                  For raw data, go to <strong>Settings → Export</strong> to
                  download CSVs of your tables (plus <code>photos.csv</code> with
                  image URLs).
                </li>
              </ul>
            </section>

            {/* Workflows */}
            <section id="workflows">
              <h2 className="text-2xl font-bold mb-3">Typical Workflows</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">A) Normal visit without NFC</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Go to <em>Inspections → New Inspection</em>.</li>
                    <li>
                      Select <strong>Apiary</strong>, then <strong>Hive</strong>.
                    </li>
                    <li>
                      Set the <strong>Date</strong> (today by default), review
                      auto-filled <strong>Weather</strong>.
                    </li>
                    <li>Record observations, add photos (up to 3), and save.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">B) Quick “something’s not right” check</h3>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>
                      Open <em>Colony Health Check</em> and answer the first few context questions.
                    </li>
                    <li>
                      Use <strong>Not sure</strong> freely (especially if you haven’t opened the hive yet).
                    </li>
                    <li>
                      Press <strong>Get results</strong>, then use <strong>Recommended next checks</strong> to narrow it down.
                    </li>
                    <li>
                      If a <strong>UK action</strong> panel appears, follow official guidance before moving equipment or treating.
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold">
                    C) NFC tag setup and tap-to-log <Badge tone="blue">Premium</Badge>
                  </h3>

                  <p className="text-gray-700">
                    <strong>Android:</strong>
                  </p>
                  <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                    <li>Open <strong>Set Up NFC Tags</strong>.</li>
                    <li>Use the <strong>Android setup</strong> card.</li>
                    <li>
                      Tap <strong>Scan Blank NFC Tag</strong> and hold the phone to
                      the tag.
                    </li>
                    <li>
                      If the Android tag is not linked yet, HiveTag will take you
                      to the linking flow so you can assign it to an existing hive
                      or create a new hive.
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
                    <li>Open <strong>Set Up NFC Tags</strong>.</li>
                    <li>Use the <strong>iPhone / iPad setup</strong> card.</li>
                    <li>
                      Choose the <strong>Apiary</strong> and <strong>Hive</strong>.
                    </li>
                    <li>Press <strong>Copy NFC Link</strong>.</li>
                    <li>
                      Paste that copied link into an NFC writing app and write it
                      to the physical tag.
                    </li>
                    <li>
                      On later visits, tapping that tag opens the linked hive in
                      HiveTag and routes you into <strong>New Inspection</strong>.
                    </li>
                  </ol>

                  <p className="text-gray-700 mt-2">
                    <strong>Once-per-day rule:</strong> to prevent accidental
                    duplicates, the NFC “New Inspection” shortcut is limited to{" "}
                    <strong>one NFC-started inspection per hive per day</strong>.
                    If you need a second inspection on the same day, open{" "}
                    <em>Inspections → New Inspection</em> and select the hive
                    manually.
                  </p>
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
                  <strong> Android scanning</strong> and <strong>iPhone / iPad link writing</strong>.
                </p>

                <ul className="list-disc pl-6">
                  <li>
                    <strong>Main NFC page:</strong> open <strong>Set Up NFC Tags</strong> to choose the correct method for your device.
                  </li>
                  <li>
                    <strong>Android support:</strong> Web NFC works best in Chrome for Android. Blank tags can be scanned directly in the app.
                  </li>
                  <li>
                    <strong>iPhone / iPad support:</strong> Apple browsers do not support Web NFC in the same way, so HiveTag uses a copied HiveTag link written to the tag with an NFC writing app.
                  </li>
                  <li>
                    <strong>Android linking:</strong> scanning an unknown Android tag opens the Android linking flow where you can assign it to an existing hive or create a new hive.
                  </li>
                  <li>
                    <strong>iPhone / iPad linking:</strong> choose a hive in the iPhone / iPad setup card, copy the generated HiveTag link, and write it to the tag.
                  </li>
                  <li>
                    <strong>Routing:</strong> once set up, both Android tags and iPhone / iPad URL tags open the correct hive’s <strong>New Inspection</strong> flow.
                  </li>
                  <li>
                    <strong>Once-per-day rule:</strong> NFC-started inspections are limited to{" "}
                    <strong>one per hive per day</strong>.
                  </li>
                  <li>
                    <strong>Manage Android NFC Tags:</strong> view all Android-scanned tag ID links, filter them, and clear them if you want to reuse them.
                  </li>
                  <li>
                    <strong>Reusing iPhone / iPad tags:</strong> overwrite the old HiveTag link on the physical tag with a new copied HiveTag link.
                  </li>
                  <li>
                    <strong>Buy tags:</strong> uses Stripe checkout and UK-only flat shipping.
                  </li>
                </ul>

                <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <div className="font-semibold">In short</div>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>Android:</strong> scan blank tag in HiveTag</li>
                    <li><strong>iPhone / iPad:</strong> copy HiveTag link → write it to the tag</li>
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
              <h2 className="text-2xl font-bold mb-3">
                Weather, Maps &amp; Photos
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Weather page:</strong> shows current conditions, a
                  “Today, hour by hour” strip, and the next 5 days for the selected
                  apiary. It can also show <strong>official weather warnings</strong>{" "}
                  and <strong>pollen levels</strong> where available.
                </li>
                <li>
                  <strong>Seasonal Beekeeper Notes (full):</strong> advisory, season-aware guidance.
                </li>
                <li>
                  <strong>Dashboard snapshot:</strong> summary for your default apiary plus a preview of notes.
                </li>
                <li>
                  <strong>Inspections:</strong> weather auto-fills using the apiary’s coordinates and the inspection date.
                </li>
                <li>
                  <strong>Maps:</strong> set apiary coordinates by clicking the map or searching by address.
                  HiveTag also includes an <strong>Apiary Map Markers</strong> page where you can save map notes (forage, water, risks, access, etc.)
                  per apiary.
                </li>
                <li>
                  <strong>Photos:</strong> Apiary/Hive support one optional photo;
                  Inspections allow up to <strong>3</strong>. Click photos to open a{" "}
                  <strong>lightbox</strong>.
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                Weather, warnings, pollen and notes depend on third-party providers and are for guidance only.
                Conditions vary by region and micro-climate. Pollen (when available) is shown in panels (e.g. Weather page and the Map Markers header),
                not as markers on the map.
              </p>
            </section>

            {/* Apiary Map & Markers */}
            <section id="apiary-map-markers-2">
              <h2 className="text-2xl font-bold mb-3">Apiary Map &amp; Markers</h2>

              <p className="text-gray-700">
                The Apiary Map is a full-screen map for one apiary. It helps you keep simple
                “map notes” (markers) for real-world features around the apiary such as forage,
                water, access points, shelter, risks, and sightings.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">How to open the map</h3>
                  <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                    <li>
                      Go to <strong>Apiaries</strong> and use the <strong>Map</strong> action on
                      the apiary card.
                    </li>
                    <li>
                      On the map page, you can also switch apiaries using the dropdown in the header.
                    </li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Add a marker (map note)</h3>
                  <ol className="list-decimal pl-6 mt-2 text-gray-700 space-y-1">
                    <li>Press <strong>Add marker</strong>.</li>
                    <li>
                      Tap/click the map where you want the marker placed. A “New marker” popup opens.
                    </li>
                    <li>
                      Choose a <strong>Type</strong> (forage, water source, access/parking, etc.).
                    </li>
                    <li>
                      Optional: add a <strong>Title</strong> and <strong>Notes</strong> (use this for gate codes,
                      landowner details, flowering times, or anything you want to remember).
                    </li>
                    <li>Press <strong>Save</strong> to store it.</li>
                  </ol>

                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Pick again:</strong> clears the selected point and puts you back into “tap the map to drop a marker”
                    so you can choose a different location before saving.
                  </div>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Edit or delete a marker</h3>
                  <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                    <li>Tap a marker to open its popup.</li>
                    <li>Use <strong>Edit</strong> to change the type/title/notes (and date where applicable).</li>
                    <li>Use <strong>Delete</strong> to remove the marker permanently.</li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Map layers &amp; foraging ring</h3>
                  <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                    <li>
                      Use the map layer control to switch between standard map and satellite imagery.
                    </li>
                    <li>
                      A <strong>~3 mile foraging ring</strong> is shown around the apiary as a visual guide.
                      <div className="mt-1 text-sm text-gray-600">
                        Indicative range only — bees may forage further depending on conditions.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="rounded border bg-white p-4">
                  <h3 className="font-semibold">Pollen on the map</h3>
                  <p className="text-gray-700 mt-2">
                    Pollen is shown as a small <strong>panel in the map header</strong> for the apiary’s coordinates (where available).
                    It does <strong>not</strong> draw a “pollen overlay” on the map itself.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: Pollen data is seasonal and provider-dependent, and can vary significantly by local microclimate.
                  </p>
                </div>
              </div>
            </section>

            {/* Filters, Counts & Archives */}
            <section id="filters-counts-archives">
              <h2 className="text-2xl font-bold mb-3">
                Filters, Counts &amp; Archives
              </h2>

              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Dashboard counts:</strong> Apiaries = global <em>active</em>{" "}
                  apiaries; Hives/Inspections/Tasks/Logbook respect the selected apiary
                  filter.
                </li>
                <li>
                  <strong>Date ranges:</strong> some list and export screens let you
                  set <strong>From</strong> and <strong>To</strong> dates.
                </li>
                <li>
                  <strong>Exports from Reports:</strong> respect Apiary/Hive and date filters.
                </li>
                <li>
                  <strong>List pages show active items</strong>; archived content lives
                  in the <em>Archive</em> page.
                </li>
              </ul>

              <div className="mt-4 p-4 rounded-lg border bg-white">
                <h3 className="font-semibold mb-2">
                  How archiving works (cascade rules)
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    <strong>Archiving an Apiary</strong> also archives all of its Hives
                    and their Inspections. Tasks and Logbook entries linked to those
                    archived Hives/Inspections are archived too.
                  </li>
                  <li>
                    <strong>Archiving a Hive</strong> also archives all Inspections for
                    that Hive. Tasks/Logbook entries that reference that Hive or those
                    Inspections are archived.
                  </li>
                  <li>
                    <strong>Archiving a single Inspection</strong> archives any Tasks or
                    Logbook entries linked to that Inspection. The parent Hive/Apiary
                    remain active.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Unarchiving rules</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    On <Badge>Free</Badge>, unarchiving is allowed only if it won’t
                    exceed the limits (max <strong>1 active Apiary</strong>,{" "}
                    <strong>2 active Hives</strong> total).
                  </li>
                  <li>
                    Unarchiving a parent may prompt you to unarchive its children; if limits are exceeded,
                    only allowable items are reactivated.
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
                    Public photo URLs remain accessible unless you delete the files from
                    storage.
                  </li>
                </ul>
              </div>
            </section>

            {/* Tips */}
            <section id="tips">
              <h2 className="text-2xl font-bold mb-3">
                Tips for Smooth Record-Keeping
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use consistent hive names (e.g., “Hive A2”, “Blue Queen 2024”).</li>
                <li>
                  Capture next-visit actions in <strong>Tasks</strong> and give them
                  clear due dates.
                </li>
                <li>Add apiary coordinates for accurate weather and map displays.</li>
                <li>
                  Set a <strong>default apiary</strong> to power Dashboard weather and
                  fallback logic.
                </li>
                <li>
                  Use <strong>Not sure</strong> in the Colony Health Check whenever you don’t have the information yet.
                </li>
                <li>
                  Use the <strong>Apiary Siting Guide</strong> / <strong>Hive Siting Guide</strong> buttons when setting up new locations—small siting choices prevent most future issues.
                </li>
                <li>
                  If you use NFC, send users to <strong>Set Up NFC Tags</strong> so they can choose the correct device method from one place.
                </li>
              </ul>
            </section>

            {/* FAQs */}
            <section id="faqs">
              <h2 className="text-2xl font-bold mb-3">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Is the Colony Health Check a diagnosis?</p>
                  <p className="text-gray-700">
                    No. It’s a triage helper that suggests what to check next. If a UK action/reporting panel appears,
                    follow official guidance.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What is the Apiary Map and what is “Pick again”?</p>
                  <p className="text-gray-700">
                    The Apiary Map is a full-screen map for one apiary where you can add “map notes” (markers) like forage, water,
                    access, shelter, risks, and sightings. When adding a new marker, <strong>Pick again</strong> clears the selected
                    point so you can tap the map again to choose a different location before saving.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Where do I find the Apiary Siting Guide and Hive Siting Guide?</p>
                  <p className="text-gray-700">
                    On the <strong>New Apiary</strong> page and <strong>New Hive</strong> page there’s a guide button at the top.
                    You can also open them directly here:{" "}
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
                    Those answers help the helper show the most relevant questions next. They can also influence suggestions slightly,
                    but they don’t “diagnose” anything on their own.
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
                    Yes, but not with in-browser Web NFC scanning. On iPhone / iPad, use <strong>Set Up NFC Tags</strong>, copy the HiveTag link for the hive, and write that link to the tag using an NFC writing app.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Can I reuse NFC tags?</p>
                  <p className="text-gray-700">
                    Yes. Android tags can be cleared in <strong>Manage Android NFC Tags</strong>. iPhone / iPad tags can be reused by overwriting the old HiveTag link on the physical tag with a new one.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Can I filter tasks by date range?</p>
                  <p className="text-gray-700">
                    Yes. On the <strong>Tasks</strong> list you can use <strong>From</strong> and <strong>To</strong> dates.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Why won’t NFC create another inspection for the same hive today?
                  </p>
                  <p className="text-gray-700">
                    The NFC shortcut is limited to{" "}
                    <strong>one NFC-started inspection per hive per day</strong> to prevent accidental duplicates.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What exactly do I get on Free?</p>
                  <p className="text-gray-700">
                    1 active apiary, 2 active hives total, unlimited inspections, weather tools, calendar, tasks, logbook entries,
                    Colony Health Check, and CSV export from Settings.
                  </p>
                </div>

                <div>
                  <p className="font-medium">How do I export my data?</p>
                  <p className="text-gray-700">
                    Go to <strong>Settings → Export</strong> and click <em>Export my data (CSV)</em>.
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <h2 className="text-2xl font-bold mb-3">Troubleshooting</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Colony Health Check seems stuck:</strong> switch to <strong>Expand all</strong> to see everything relevant,
                  or press <strong>Reset all</strong> and start again.
                </li>
                <li>
                  <strong>Colony Health Check shows a UK action panel:</strong> pause before moving equipment, and use the official
                  links shown for guidance/reporting.
                </li>
                <li>
                  <strong>Can’t add another apiary/hive:</strong> Free plan allows 1 active apiary and 2 active hives total. Upgrade
                  to add more.
                </li>
                <li>
                  <strong>Can’t unarchive an apiary/hive on Free:</strong> limits apply on Free. Upgrade to reactivate more.
                </li>
                <li>
                  <strong>Weather didn’t load or is very slow:</strong> confirm the apiary has valid coordinates saved; occasionally
                  providers are slow.
                </li>
                <li>
                  <strong>Map popups cover the header or feel “tight”:</strong> popups are designed to overlay the header panels without auto-panning
                  (to avoid screen “jumping”). If a popup is near the edge of the screen, drag the map slightly to bring it fully into view.
                </li>
                <li>
                  <strong>Satellite layer is blank or slow:</strong> satellite imagery comes from an external provider and may be rate-limited or temporarily unavailable.
                  Switch back to <strong>Map</strong> and try again later.
                </li>
                <li>
                  <strong>NFC says “not supported”:</strong> use Chrome on Android for direct tag scanning. On iPhone / iPad, use the NFC link method from <strong>Set Up NFC Tags</strong>.
                </li>
                <li>
                  <strong>I can’t find where to set up NFC:</strong> go to <strong>Set Up NFC Tags</strong> from the sidebar. That page now contains both Android and iPhone / iPad setup methods.
                </li>
                <li>
                  <strong>Android tag won’t link:</strong> if it is already linked elsewhere, clear it from <strong>Manage Android NFC Tags</strong> first and then scan it again.
                </li>
                <li>
                  <strong>iPhone tag opens the wrong hive:</strong> rewrite the tag with a newly copied HiveTag link from the iPhone / iPad setup card.
                </li>
                <li>
                  <strong>Back button on siting guides doesn’t return:</strong> the Back button relies on browser history. If you open a
                  guide in a new tab, there may be no history to go back to—open the guide in the same tab from New Apiary / New Hive.
                </li>
              </ul>
            </section>

            {/* Privacy */}
            <section id="privacy">
              <h2 className="text-2xl font-bold mb-3">Privacy &amp; Data</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your data is stored securely in your BeezKnees account.</li>
                <li>
                  <strong>Photos are public URLs</strong> for fast loading; your CSV export includes links to these files.
                </li>
                <li>
                  <strong>Android NFC tag IDs:</strong> HiveTag stores the scanned Android tag ID and its hive linkage so the correct hive can be opened later.
                </li>
                <li>
                  <strong>iPhone / iPad NFC tags:</strong> these use a HiveTag link written onto the physical tag. HiveTag does not track tag location.
                </li>
                <li>
                  <strong>Export</strong>: use <em>Settings → Export</em> to download CSVs of your data anytime.
                </li>
                <li>
                  <strong>Deletion</strong>: <em>Settings → Delete Account</em> cancels any subscription, removes storage files, deletes
                  your tables, and deletes the auth user.
                </li>
              </ul>
            </section>

            {/* Power Users */}
            <section id="power-users">
              <h2 className="text-2xl font-bold mb-3">Power-User Notes</h2>
              <p className="text-gray-700 mb-2">
                A <strong>power user</strong> is simply someone who prefers advanced controls: jumping around, seeing everything at once,
                and moving quickly without a guided wizard.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Colony Health Check:</strong> use <strong>Expand all</strong> to answer in any order. Use{" "}
                  <strong>Recommended next checks</strong> to narrow down the results efficiently.
                </li>
                <li>
                  <strong>Plan enforcement:</strong> inserts and unarchives are constrained on Free (1 apiary / 2 hives). Downgrade
                  auto-archives extras; upgrade lifts limits.
                </li>
                <li>
                  <strong>NFC setup hub:</strong> <strong>Set Up NFC Tags</strong> is now the single place for both Android and iPhone / iPad NFC setup. <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>Android NFC routing:</strong> unknown Android tag → Android linking flow; once linked, scanning that tag takes you directly to <em>New Inspection</em>. <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>iPhone / iPad NFC routing:</strong> copied HiveTag link → written to tag → opening the tag routes into <em>New Inspection</em>. <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>Reports export:</strong> CSV exports respect the Apiary/Hive filter.
                </li>
                <li>
                  <strong>CSV export (Settings):</strong> one CSV per table + <code>photos.csv</code> with public URLs (images not bundled).
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
                  <dt className="font-medium">NFC</dt>
                  <dd className="text-gray-700">
                    Near Field Communication—used in HiveTag to open the correct hive more quickly (Premium).
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Archive</dt>
                  <dd className="text-gray-700">Hide from active lists without deleting.</dd>
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
                    A pest/disease with official reporting requirements. Follow GOV.UK / NBU guidance and avoid moving equipment.
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