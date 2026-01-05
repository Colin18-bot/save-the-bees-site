// src/pages/Help.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const toc = [
  { id: "concepts", title: "Key Concepts" },
  { id: "membership", title: "Membership & Feature Availability" },
  { id: "getting-started", title: "Getting Started" },
  { id: "navigation", title: "Navigation Overview" },
  { id: "business-inventory", title: "Inventory, Sales & Expenses" },
  { id: "currency-defaults", title: "Default Currency (How It Works)" },
  { id: "reports", title: "Reports" },
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
          <h1 className="text-3xl font-bold">HiveTag Help &amp; How-To</h1>
          <p className="mt-2 text-gray-600">
            Clear, practical guidance for every part of HiveTag—from your first
            apiary to tap-to-log NFC inspections.
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
                        <strong>NFC tap-to-log</strong> (link a tag to a hive;
                        scan to jump into that hive’s inspection flow)
                      </li>
                      <li>
                        <strong>NFC tools</strong>: Scan NFC Tag, NFC Tag
                        Manager, and a printable NFC setup card.
                      </li>
                      <li>
                        <strong>NFC quick-select</strong> in New Inspection (when
                        arriving from a scan).
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
                  address, then save. <Badge>Free</Badge> 1 active apiary
                </li>
                <li>
                  <strong>Add a Hive:</strong>{" "}
                  <span className="text-gray-700">Hives → New Hive.</span>{" "}
                  Choose the apiary, name the hive, set type/status, add an
                  optional photo, and save.
                  <span className="ml-2">
                    <Badge>Free</Badge> 2 active hives total
                  </span>
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
                  <strong>NFC</strong> <Badge tone="blue">Premium</Badge>:
                  optional tap-to-log flow—see the NFC section below.
                </li>
              </ol>
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
                      notes (e.g., winter feeding, spring build-up, late-summer
                      Varroa timing) with a <strong>“View full notes”</strong>{" "}
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
                      hives have tags and a short list of recent tagged hives.{" "}
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
                      New/Edit: name, date, coordinates, notes, photo, default
                      toggle.
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
                      If an NFC tag is linked, a small <strong>NFC Tag</strong>{" "}
                      pill appears on the hive card (Premium), so you can see at
                      a glance which hives are tagged.
                    </li>
                    <li>
                      Photos open in a <strong>lightbox</strong> when clicked;
                      location and map come from the parent apiary.
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
                      Where the inspection belongs to a hive with an NFC tag, the
                      card can show a small <strong>NFC Tag</strong> pill,
                      especially when you’ve arrived via the NFC flow or are
                      filtered to that hive.
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
                      NFC quick-select available in New Inspection when you
                      arrive from a scan. <Badge tone="blue">Premium</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Tasks &amp; Calendar</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Create tasks with due dates and statuses; filter by{" "}
                      <strong>apiary</strong>, <strong>hive</strong>, and (where
                      available) a <strong>From/To date range</strong> to focus
                      on a specific period.
                    </li>
                    <li>
                      <strong>Marking completed:</strong> update the status from
                      the <strong>Task List</strong> (blue <em>Mark complete</em>{" "}
                      button) or from the <strong>Edit Task</strong> page.
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
                      <strong>Hive (Apiary)</strong> and the <strong>time</strong>,
                      making same-day inspections easy to tell apart. Use the Hive
                      selector above to narrow the list.
                    </span>{" "}
                    <Badge>Free</Badge>
                  </p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>
                      <strong>Arriving from Inspections:</strong> the Logbook list
                      may be <em>filtered to a specific inspection</em> (via{" "}
                      <em>View logbook</em>). You’ll see a blue banner with the
                      inspection ref/date, a <em>Back to that inspection</em>{" "}
                      link, and a <em>Clear inspection filter</em> action.
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
                      ISO code (e.g., GBP, EUR, USD). This sets the default used
                      in Sales totals and pre-fills in New Expense. You can still
                      override currency on individual expenses.
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
                      <strong>New Item:</strong> record category (e.g. “Bee
                      equipment”, “Bottling”, “Other”), purchase date, quantity,
                      unit price, total cost, supplier/invoice and optional link
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
                      channel (e.g. farm shop, direct), invoice reference and
                      totals.
                    </li>
                    <li>
                      <strong>New Sale:</strong> add line items including product
                      name, type, unit, quantity, unit price, optional discount
                      and cost-per-unit (for profit calculations).
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
                  <h3 className="font-semibold">
                    B) Tap-to-log with NFC <Badge tone="blue">Premium</Badge>
                  </h3>
                  <p className="text-gray-700">
                    <strong>First time using a new NFC tag:</strong>
                  </p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Open the <strong>Scan NFC</strong> page (Premium).</li>
                    <li>
                      Tap the tag. If it isn’t linked to any hive yet, you’ll be
                      taken to <strong>New Hive</strong> with the tag ID pre-filled
                      and locked—choose the correct apiary, name the hive, and save.
                    </li>
                    <li>
                      Tap the same tag again—because a hive now exists, the app
                      takes you straight to <strong>New Inspection</strong>.
                    </li>
                  </ol>
                  <p className="text-gray-700 mt-2">
                    <strong>Future visits:</strong> once a hive is linked to a tag,
                    every tap on that tag always opens{" "}
                    <strong>New Inspection</strong> for that hive immediately. The
                    assumption is that if you’re at the hive scanning the tag,
                    you’re there to inspect it. You can still review past
                    inspections afterwards via the normal <em>Inspections</em> pages.
                  </p>
                  <p className="text-gray-700 mt-2">
                    <strong>Once-per-day rule:</strong> to prevent accidental
                    duplicates, the NFC “New Inspection” shortcut is limited to{" "}
                    <strong>one NFC-started inspection per hive per day</strong>.
                    If you need a second inspection on the same day, open{" "}
                    <em>Inspections → New Inspection</em> and select the hive
                    manually.
                  </p>
                  <p className="text-gray-700 mt-2">
                    When you arrive from NFC and view inspection history for that
                    hive, you may also see a small <strong>NFC Tag</strong> pill
                    on relevant rows to remind you that this hive is tagged.
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
                  Each NFC tag has a globally unique ID and is linked to one{" "}
                  <em>active</em> hive. When you tap, the app resolves that exact
                  hive—no risk of mixing tags, even with hives close together at
                  the same apiary.
                </p>
                <ul className="list-disc pl-6">
                  <li>
                    <strong>Support:</strong> Web NFC works on Chrome for Android.
                    iOS Safari and many desktops don’t support Web NFC—use the
                    standard flow instead, or tags pre-encoded with a URL that
                    opens the <strong>Scan NFC</strong> page.
                  </li>
                  <li>
                    <strong>Linking:</strong> tap an unlinked tag → <em>New Hive</em>{" "}
                    with its ID locked; select the apiary and save to bind that tag
                    to the hive.
                  </li>
                  <li>
                    <strong>Routing:</strong> once a tag is linked to a hive, every
                    tap always opens a <strong>New Inspection</strong> for that
                    hive. This keeps the NFC flow fast and predictable during
                    real-life apiary visits. You can still review history from the
                    hive or inspections pages.
                  </li>
                  <li>
                    <strong>Once-per-day rule:</strong> to avoid accidental duplicate
                    records, the NFC shortcut to create a new inspection is limited to{" "}
                    <strong>one NFC-started inspection per hive per day</strong>.
                    If you need another inspection on the same day, use{" "}
                    <em>Inspections → New Inspection</em> and select the hive
                    manually.
                  </li>
                  <li>
                    <strong>Scan page messages:</strong> the <strong>Scan NFC</strong>{" "}
                    page shows clear messages if your device doesn’t support Web
                    NFC, if permission is blocked, if a scan is cancelled, if a tag
                    is unknown, or if a tag is linked to an archived hive. You’re
                    always told what happened and what to try next.
                  </li>
                  <li>
                    When viewing a tagged hive or its inspections, you’ll often see
                    a small <strong>NFC Tag</strong> pill on the hive and, where
                    applicable, on related inspection cards so it’s clear which
                    records belong to NFC-tagged hives.
                  </li>
                  <li>
                    <strong>NFC Tag Manager:</strong> use the{" "}
                    <strong>Manage NFC Tags</strong> page to see all tagged hives,
                    filter by apiary/hive, and clear a tag from a hive if you want
                    to re-use it. Clearing a tag doesn’t remove any inspections; it
                    simply frees that UID so it can be linked to a different hive later.
                  </li>
                  <li>
                    <strong>Duplicates:</strong> two active hives cannot share the
                    same tag. Archive or clear the old hive’s tag first, or re-link
                    the tag to a different hive via the edit flow.
                  </li>
                  <li>
                    <strong>Buy tags:</strong> the <strong>Buy NFC Tags</strong>{" "}
                    page uses Stripe checkout with quantity selection and UK-only
                    flat shipping via Stripe Shipping Rates. Orders are currently
                    limited to UK shipping addresses.
                  </li>
                  <li>
                    <strong>Troubleshooting:</strong> enable NFC; hold the tag near
                    the phone’s antenna; try another supported phone if needed. If
                    the app reports the tag is already linked, look up that hive
                    and adjust your setup before re-using the tag.
                  </li>
                </ul>
                <p className="text-gray-700 text-sm">
                  For a printable step-by-step guide to ship with tags or save as
                  PDF, use the{" "}
                  <Link to="/nfc/instructions" className="text-blue-700 underline">
                    NFC Tag Setup
                  </Link>{" "}
                  page. It’s designed as an A4-style card you can print and include
                  in the envelope with each HiveTag order.
                </p>
                <p className="text-gray-700 text-xs">
                  At the bottom of the <strong>Scan NFC</strong> page there is an
                  optional <em>“Show debug info”</em> toggle for troubleshooting.
                  It shows raw tag details (serial number, record types) and the
                  last error/lookup result. Most beekeepers can ignore this; it’s
                  mainly useful if you’re diagnosing device/browser issues.
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
                  <strong>Weather page:</strong> shows your current conditions, a
                  “Today, hour by hour” strip, and the next 5 days for the selected
                  apiary. It can also show <strong>official weather warnings</strong>{" "}
                  and <strong>pollen levels</strong> where the provider supplies
                  them. Temperature and wind units can be toggled between °C/°F and
                  km/h/mph.
                </li>
                <li>
                  <strong>Seasonal Beekeeper Notes (full):</strong> the Weather page
                  includes a full “Seasonal Beekeeper Notes” panel giving season-aware
                  guidance (e.g. winter feeding, spring build-up, late-summer Varroa
                  treatment windows, autumn feeding and moisture control). All notes
                  are advisory and assume typical cool–temperate conditions—always
                  follow product labels, official guidance and local association advice.
                </li>
                <li>
                  <strong>Dashboard snapshot:</strong> shows a small “now + next 5
                  days” summary for your default apiary and a <strong>preview</strong>{" "}
                  of the Seasonal Beekeeper Notes (a few key points). Use the “View
                  full notes” link on the Dashboard to jump straight to the Weather page.
                </li>
                <li>
                  <strong>Inspections:</strong> when you create a new inspection, the
                  weather section uses the apiary’s coordinates and the inspection date
                  to auto-fill basic conditions for that day.
                </li>
                <li>
                  <strong>Maps:</strong> set coordinates by clicking the map or
                  searching by address. This improves weather forecasts and gives you
                  location context for each apiary.
                </li>
                <li>
                  <strong>Photos:</strong> Apiary/Hive support one optional photo;
                  Inspections allow up to <strong>3</strong>. Click photos to open a{" "}
                  <strong>lightbox</strong>.
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                Weather, warnings, pollen and notes all depend on third-party providers
                and are for guidance only. Conditions, forage and disease pressure vary
                by region and micro-climate; always use your own judgement and any
                instructions from product labels, Bee Inspectors, vets or your local
                association.
              </p>
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
                  set <strong>From</strong> and <strong>To</strong> dates so you can
                  focus on a specific period (helpful for monthly summaries, a honey
                  flow window, or “last inspection cycle” reporting).
                </li>
                <li>
                  <strong>Exports from Reports:</strong> CSV exports on the{" "}
                  <em>Reports &amp; Exports</em> page respect your Apiary/Hive and date
                  filters so you can download focused views.
                </li>
                <li>
                  <strong>List pages show active items</strong>; archived content lives
                  in the <em>Archive</em> page.
                </li>
                <li>
                  <strong>Dashboard recent lists &amp; archiving:</strong> archived rows
                  display an <Badge tone="amber">Archived</Badge> pill on the far right
                  and have no <em>Open</em>/<em>Edit</em> actions. Use the{" "}
                  <em>Archive</em> page to view details or restore (where allowed).
                </li>
                <li>
                  <strong>After downgrade to Free:</strong> extra apiaries/hives are
                  auto-archived. You can view/export them, but cannot unarchive beyond
                  Free limits until you upgrade.
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
                    Unarchiving a parent (e.g., Apiary → Hive → Inspection) may prompt
                    you to unarchive its children; if limits are exceeded, only
                    allowable items are reactivated.
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

                <h3 className="font-semibold mt-4 mb-2">Tips</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Before downgrading, manually archive extra Apiaries/Hives so you
                    choose which stay active on Free.
                  </li>
                  <li>
                    Use the <em>Archive</em> page as your “history” area—keep current
                    operations uncluttered while preserving full records.
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
                  Click photos on cards to open a <strong>lightbox</strong> for a closer
                  look.
                </li>
                <li>
                  Filtering by apiary updates the page URL—bookmark or share filtered
                  views.
                </li>
              </ul>
            </section>

            {/* FAQs */}
            <section id="faqs">
              <h2 className="text-2xl font-bold mb-3">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Can I use the app without NFC?</p>
                  <p className="text-gray-700">
                    Yes. NFC <Badge tone="blue">Premium</Badge> just speeds up hive
                    selection.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Can I filter tasks by date range?</p>
                  <p className="text-gray-700">
                    Yes. On the <strong>Tasks</strong> list you can use{" "}
                    <strong>From</strong> and <strong>To</strong> dates (alongside Apiary
                    and Hive) to focus on a specific period.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Why won’t NFC create another inspection for the same hive today?
                  </p>
                  <p className="text-gray-700">
                    The NFC shortcut is limited to <strong>one NFC-started inspection per
                    hive per day</strong> to prevent accidental duplicates. If you need a
                    second inspection on the same day, open{" "}
                    <em>Inspections → New Inspection</em> and select the hive manually.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What exactly do I get on Free?</p>
                  <p className="text-gray-700">
                    1 active apiary, 2 active hives total, unlimited inspections, weather
                    tools (Weather page, snapshot and auto-fill), calendar, tasks, logbook
                    entries, and CSV export from Settings.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    What happens if I downgrade from Premium to Free?
                  </p>
                  <p className="text-gray-700">
                    We keep 1 active apiary (preferring your default) and up to 2 active
                    hives within it; everything else is auto-archived. Your data remains
                    available to view/export. Upgrade again to reactivate more.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Why can’t I unarchive an extra apiary or hive on Free?
                  </p>
                  <p className="text-gray-700">
                    Free limits enforce 1 active apiary and 2 active hives. Unarchiving
                    beyond that is blocked while on Free. Upgrade to activate more.
                  </p>
                </div>

                <div>
                  <p className="font-medium">How do I manage billing or cancel?</p>
                  <p className="text-gray-700">
                    Go to <strong>Settings → Manage billing</strong>. This opens the
                    Stripe Customer Portal to update your card, download invoices, or
                    cancel.
                  </p>
                </div>

                <div>
                  <p className="font-medium">How do I export my data?</p>
                  <p className="text-gray-700">
                    Go to <strong>Settings → Export</strong> and click{" "}
                    <em>Export my data (CSV)</em>. You’ll get separate CSV files for your
                    tables plus <code>photos.csv</code> with public links to your images.
                  </p>
                </div>

                <div>
                  <p className="font-medium">What happens if I delete my account?</p>
                  <p className="text-gray-700">
                    <strong>Settings → Delete Account</strong> cancels your subscription,
                    removes your photos &amp; data, and deletes your account. This is
                    permanent and cannot be undone.
                  </p>
                </div>

                <div>
                  <p className="font-medium">NFC says “not supported.”</p>
                  <p className="text-gray-700">
                    Your device/browser likely doesn’t support Web NFC (e.g., iOS Safari).
                    Use the normal New Inspection flow or tags encoded with a URL that
                    opens the <strong>Scan NFC</strong> page.
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Why is Dashboard weather a different location?
                  </p>
                  <p className="text-gray-700">
                    Weather uses your <strong>default apiary</strong>. Edit the correct
                    apiary and set as default.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Where can I buy compatible NFC tags?</p>
                  <p className="text-gray-700">
                    Use the <strong>Buy NFC Tags</strong> page in the app. It uses Stripe
                    Checkout with quantity selection and UK-only flat shipping. Non-UK
                    shipping isn’t currently supported.
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <h2 className="text-2xl font-bold mb-3">Troubleshooting</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Can’t add another apiary/hive:</strong> Free plan allows 1
                  active apiary and 2 active hives total. Upgrade to add more.
                </li>
                <li>
                  <strong>Can’t unarchive an apiary/hive on Free:</strong> limits apply
                  on Free. Upgrade to reactivate more.
                </li>
                <li>
                  <strong>Can’t save Apiary/Hive/Inspection:</strong> fill required
                  fields; wait for photo upload; confirm you’re signed in.
                </li>
                <li>
                  <strong>Task didn’t change to Completed:</strong> set status from the
                  Task List (Mark complete) or the Edit Task page.
                </li>
                <li>
                  <strong>Need to find tasks for a specific period:</strong> use the{" "}
                  <strong>From</strong> and <strong>To</strong> date filters (alongside
                  Apiary/Hive) on the Tasks list.
                </li>
                <li>
                  <strong>
                    Can’t find the right inspection in the Logbook’s Related Inspection
                    list:
                  </strong>{" "}
                  pick the correct date group, then look for the option labelled{" "}
                  <em>Hive (Apiary) • time</em>; switch the Hive selector above to narrow
                  results.
                </li>
                <li>
                  <strong>NFC permission blocked:</strong> if the browser shows that NFC
                  access was denied, you’ll see a message on the <strong>Scan NFC</strong>{" "}
                  page. Re-enable NFC permissions for your browser/site and try again.
                </li>
                <li>
                  <strong>NFC scan cancelled or no tag detected:</strong> if you move
                  away before a tag is read, the scan is cancelled and you’ll see a note
                  telling you no tag was read. Start another scan and hold your phone
                  steady over the tag until it beeps or vibrates.
                </li>
                <li>
                  <strong>Tag read but no serial/unknown tag:</strong> if a tag doesn’t
                  provide a usable ID, you’ll see a message explaining that the tag
                  couldn’t be identified. If the tag is readable and has a usable ID but
                  isn’t yet linked, the app will say it’s unlinked and send you to{" "}
                  <strong>New Hive</strong> with the tag ID pre-filled and locked.
                </li>
                <li>
                  <strong>NFC tag already linked:</strong> if a tag belongs to an
                  existing active hive, the app resolves that hive and opens{" "}
                  <strong>New Inspection</strong> for it. If it’s linked to an archived
                  hive, you’ll see a message telling you to unarchive or update the hive
                  before re-using the tag.
                </li>
                <li>
                  <strong>NFC won’t create another inspection today:</strong> the NFC
                  shortcut is limited to <strong>one NFC-started inspection per hive per
                  day</strong>. If you need a second inspection, use{" "}
                  <em>Inspections → New Inspection</em> and select the hive manually.
                </li>
                <li>
                  <strong>Android shows “New tag collected / Empty tag”:</strong> this
                  message comes from Android’s built-in NFC handler, not BeezKnees. It
                  appears when your browser isn’t actively scanning. Open the{" "}
                  <strong>Scan NFC</strong> page again, tap <strong>Scan NFC Tag</strong>
                  , then tap the tag—your phone will route the tap to HiveTag and you’ll
                  go straight into the correct hive’s inspection flow.
                </li>
                <li>
                  <strong>Weather didn’t load or is very slow:</strong> check that the
                  apiary has valid coordinates saved. Occasionally the forecast provider
                  is slow or unavailable; try again in a few minutes, or switch apiary.
                  The app may briefly pause new requests after a failed attempt to keep
                  the UI responsive.
                </li>
                <li>
                  <strong>Export didn’t download:</strong> check your browser’s download
                  permissions/pop-up blocker and retry.
                </li>
              </ul>
            </section>

            {/* Privacy */}
            <section id="privacy">
              <h2 className="text-2xl font-bold mb-3">Privacy &amp; Data</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your data is stored securely in your BeezKnees account.</li>
                <li>
                  <strong>Photos are public URLs</strong> for fast loading; your CSV
                  export includes links to these files.
                </li>
                <li>
                  <strong>NFC UIDs:</strong> only the tag’s unique ID and its hive
                  linkage are stored, used solely to route you to the correct
                  hive/inspection. NFC tags are <strong>not tracked for location</strong>
                  , and no movement history is recorded.
                </li>
                <li>
                  <strong>Export</strong>: use <em>Settings → Export</em> to download CSVs
                  of your data anytime.
                </li>
                <li>
                  <strong>Deletion</strong>: <em>Settings → Delete Account</em> cancels
                  any subscription, removes storage files, deletes your tables, and
                  deletes the auth user.
                </li>
                <li>
                  Analytics respect consent; events are sent only when you grant
                  analytics consent.
                </li>
              </ul>
            </section>

            {/* Power Users */}
            <section id="power-users">
              <h2 className="text-2xl font-bold mb-3">Power-User Notes</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Plan enforcement:</strong> inserts and unarchives are constrained
                  on Free (1 apiary / 2 hives). Downgrade auto-archives extras; upgrade
                  lifts limits.
                </li>
                <li>
                  <strong>NFC scan routing:</strong> unlinked tag → <em>New Hive</em>;
                  once linked, every tap on that tag takes you directly to{" "}
                  <em>New Inspection</em> for the associated hive.{" "}
                  <Badge tone="blue">Premium</Badge>
                </li>
                <li>
                  <strong>NFC once-per-day guard:</strong> NFC-started inspections are
                  limited to one per hive per day to prevent accidental duplicates.
                </li>
                <li>
                  <strong>Duplicate NFC guard:</strong> enforced when creating a hive and
                  in NFC quick-select / Tag Manager flows so one UID cannot belong to two
                  active hives.
                </li>
                <li>
                  <strong>Reports export:</strong> CSV exports on the{" "}
                  <em>Reports &amp; Exports</em> page respect the Apiary/Hive filter; ideal
                  for per-yard summaries.
                </li>
                <li>
                  <strong>Print Report:</strong> the Reports → Print page is designed for
                  clean PDF/printouts of Inspections, Tasks, Logbook entries and
                  NFC-tagged hives, with matching CSV exports.
                </li>
                <li>
                  <strong>CSV export (Settings):</strong> one CSV per table +{" "}
                  <code>photos.csv</code> with public URLs (images not bundled).
                </li>
                <li>
                  <strong>Print:</strong> Dashboard → Reports card gives a quick route into
                  a printable, filter-aware view.
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
                    Near Field Communication—tap a tag to identify the hive (Premium).
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Archive</dt>
                  <dd className="text-gray-700">
                    Hide from active lists without deleting.
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
