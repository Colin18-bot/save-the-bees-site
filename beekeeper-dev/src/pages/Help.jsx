// src/pages/Help.jsx
import React, { useEffect } from "react";

const toc = [
  { id: "concepts", title: "Key Concepts" },
  { id: "membership", title: "Membership & Feature Availability" },
  { id: "getting-started", title: "Getting Started" },
  { id: "navigation", title: "Navigation Overview" },
  { id: "business-inventory", title: "Inventory, Sales & Expenses" },
  { id: "currency-defaults", title: "Default Currency (How It Works)" }, // ← added
  { id: "reports", title: "Reports" },
  { id: "workflows", title: "Typical Workflows" },
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
    amber: "bg-amber-100 text-amber-900 border-amber-200", // used for Archived colour
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
            Clear, practical guidance for every part of BeezKnees—from your first apiary to your first inspection.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Features labeled <Badge tone="blue">Premium</Badge> require a Premium plan. Free plan limits are summarised below.
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
              <h2 className="text-2xl font-bold mb-3">Key Concepts (Data Model)</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Apiary</strong> — a location where hives live.
                </li>
                <li>
                  <strong>Hive</strong> — an individual hive in an apiary (photo, type, status).
                </li>
                <li>
                  <strong>Inspection</strong> — a dated record about a hive (weather, behaviour, brood, stores, disease/pests, notes, photos).
                </li>
                <li>
                  <strong>Tasks</strong> — scheduled actions with a due date and status; can reference an apiary and/or hive.
                </li>
                <li>
                  <strong>Logbook</strong> — free-form notes (can link to an inspection).
                </li>
                <li>
                  <strong>Archive</strong> — hides items from active lists without deleting them.
                  On the Dashboard’s recent lists, archived items show an{" "}
                  <Badge tone="amber">Archived</Badge> pill and no action links.
                  Manage archived content on the dedicated <em>Archive</em> page.
                </li>
              </ul>
              <p className="mt-3 text-gray-700">
                Relationship: <em>Apiary → Hives → Inspections</em>. Tasks and Logbook entries can reference either or both.
              </p>
            </section>

            {/* Membership & Feature Availability */}
            <section id="membership">
              <h2 className="text-2xl font-bold mb-3">Membership &amp; Feature Availability</h2>

              <div className="overflow-hidden rounded-xl border bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  {/* Free plan */}
                  <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      Free plan <Badge tone="green">Included</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Everything you need to manage a single yard.
                    </p>
                    <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                      <li>
                        <strong>1 apiary (active)</strong>
                      </li>
                      <li>
                        <strong>Up to 2 hives</strong> total (active)
                      </li>
                      <li>
                        <strong>Full inspection records</strong> — brood, stores, behaviour, disease/pests, notes, photos
                      </li>
                      <li>
                        <strong>Weather snapshots</strong> (Dashboard &amp; inspection auto-fill)
                      </li>
                      <li>
                        <strong>Task &amp; reminder tracking</strong>
                      </li>
                      <li>
                        <strong>To-Dos &amp; calendar reminders</strong>
                      </li>
                      <li>
                        <strong>Photo uploads</strong> to apiaries, hives & inspections
                      </li>
                      <li>
                        <strong>Printable reports</strong> &amp; <strong>Logbook &amp; archive</strong>
                      </li>
                      <li>
                        <strong>Export my data (CSV)</strong> via <em>Settings → Export</em>
                      </li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-600">
                      If you downgrade from Premium to Free, we keep{" "}
                      <strong>1 active apiary</strong> (preferring your <em>default apiary</em>) and up to{" "}
                      <strong>2 active hives</strong> in it. The rest are auto-archived.
                    </p>
                  </div>

                  {/* Premium plan */}
                  <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      Premium plan <Badge tone="blue">Premium</Badge>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      For growing hobbyists and sideline or commercial setups.
                    </p>
                    <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
                      <li>
                        <strong>Unlimited apiaries</strong>
                      </li>
                      <li>
                        <strong>Unlimited hives</strong>
                      </li>
                      <li>
                        <strong>All features included — nothing locked</strong>
                      </li>
                      <li>
                        <strong>Advanced seasonal &amp; per-apiary reporting</strong>
                      </li>
                      <li>
                        <strong>Ideal for larger yards</strong> and multi-site operations
                      </li>
                      <li>
                        <strong>Priority support</strong>
                      </li>
                      <li>
                        <strong>Directly supports ongoing development</strong> of BeezKnees
                      </li>
                      <li>
                        <strong>Stripe Customer Portal</strong>: <em>Settings → Manage billing</em>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-gray-700">
                On Free, creating a 2nd apiary or a 3rd hive is blocked. Unarchiving beyond Free limits is also prevented while on Free.
              </p>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <h2 className="text-2xl font-bold mb-3">Getting Started (First 10 Minutes)</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Create an Apiary:</strong>{" "}
                  <span className="text-gray-700">Apiaries → New Apiary.</span>{" "}
                  Name it, set a date, optionally pin on the map or search by address, then save.{" "}
                  <Badge>Free</Badge> 1 active apiary
                </li>
                <li>
                  <strong>Add a Hive:</strong>{" "}
                  <span className="text-gray-700">Hives → New Hive.</span> Choose
                  the apiary, name the hive, set type/status, add an optional photo, and save.
                  <span className="ml-2">
                    <Badge>Free</Badge> 2 active hives total
                  </span>
                </li>
                <li>
                  <strong>Log an Inspection:</strong>{" "}
                  <span className="text-gray-700">Inspections → New Inspection</span>.
                  Weather auto-fills from the apiary’s coordinates for that date. <Badge>Free</Badge>
                </li>
              </ol>
            </section>

            {/* Navigation Overview */}
            <section id="navigation">
              <h2 className="text-2xl font-bold mb-3">Navigation Overview (What Each Page Does)</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Dashboard</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Filter by Apiary</strong> to scope stats and recent items;{" "}
                      <em>Apiaries</em> count stays global.
                    </li>
                    <li>
                      <strong>Recent sections (Inspections, Tasks, Logbook):</strong>{" "}
                      “<em>Open →</em>” takes you to the relevant <em>list</em> page with the item briefly{" "}
                      <strong>highlighted</strong>. Use <strong>✎ Edit</strong> to jump to editing.
                    </li>
                    <li>
                      <strong>Archived items:</strong> on these recent lists, archived rows show an
                      <span className="ml-1 mr-1">
                        <Badge tone="amber">Archived</Badge>
                      </span>
                      pill on the far right and **do not** show <em>Open</em> or <em>Edit</em> links. Use the{" "}
                      <em>Archive</em> page to view/manage them.
                    </li>
                    <li>
                      <strong>See all … →</strong> under each section opens the full, filter-aware list for that content type.
                    </li>
                    <li>
                      <strong>Tasks</strong> show a status pill (Pending/Completed) and an{" "}
                      <strong>Overdue</strong> label when past the due date.
                    </li>
                    <li>
                      <strong>Weather Snapshot</strong> uses your <em>default apiary</em> and displays a banner naming it.
                      If the default has no coordinates, a clear note explains a temporary London placeholder is shown.
                    </li>
                    <li>
                      <strong>Open · Print · Export</strong>: the toolbar lets you print the page or export CSV; exports respect the Apiary filter.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Apiaries</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Cards show a mini map (if coordinates exist), a human-readable location, hive count, and actions.
                    </li>
                    <li>
                      Click the photo on a card to open a full-size <strong>lightbox</strong>.
                    </li>
                    <li>New/Edit: name, date, coordinates, notes, photo, default toggle.</li>
                    <li>
                      Free plan limit: <strong>1 active apiary</strong>. <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Hives</h3>
                  <ul className="list-disc pl-6">
                    <li>List by apiary; shows inspection count; actions for Edit / New Inspection.</li>
                    <li>
                      Photos open in a <strong>lightbox</strong> when clicked; location and map come from the parent apiary.
                    </li>
                    <li>
                      Free plan limit: <strong>2 active hives</strong> total. <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Inspections</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      Filter by apiary and/or hive; each card summarises key info and photos.
                    </li>
                    <li>Compliance call-outs appear for notifiable diseases or varroa.</li>
                    <li>
                      <strong>Linked Logbook:</strong> where logbook entries reference an inspection, the card shows a count with a{" "}
                      <em>View logbook</em> link. Clicking it opens the <strong>Logbook</strong> list
                      <em> filtered to that inspection</em> with a blue banner and a one-click “Clear inspection filter”.
                    </li>
                    <li>
                      Unlimited on Free. <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Tasks & Calendar</h3>
                  <ul className="list-disc pl-6">
                    <li>Create tasks with due dates and statuses; filter by apiary/hive.</li>
                    <li>
                      <strong>Marking completed:</strong> update the status from the <strong>Task List</strong> (blue{" "}
                      <em>Mark complete</em> button) or from the <strong>Edit Task</strong> page.
                    </li>
                    <li>
                      From the calendar, open an item and choose <strong>View in list</strong> to jump to the Task List
                      with the task briefly highlighted.
                    </li>
                    <li>
                      The calendar surfaces dated items across apiaries and hives. <Badge>Free</Badge>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Logbook</h3>
                  <p className="text-gray-700">
                    Free-form notes with optional inspection links. Includes list/grid toggle, per-apiary filter, and photo{" "}
                    <strong>lightbox</strong> on click.
                    <br />
                    <span className="text-gray-700">
                      When linking a <em>Related Inspection</em>, the dropdown is grouped by date and each option shows{" "}
                      <strong>Hive (Apiary)</strong> and the <strong>time</strong>, making same-day inspections easy to tell apart.
                      Use the Hive selector above to narrow the list.
                    </span>{" "}
                    <Badge>Free</Badge>
                  </p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>
                      <strong>Arriving from Inspections:</strong> the Logbook list may be{" "}
                      <em>filtered to a specific inspection</em> (via <em>View logbook</em>). You’ll see a blue banner with
                      the inspection ref/date, a <em>Back to that inspection</em> link, and a <em>Clear inspection filter</em> action.
                    </li>
                    <li>
                      <strong>Deep-links & highlights:</strong> when you’re sent to a list by “Open →” the target item briefly
                      highlights so it’s easy to spot.
                    </li>
                  </ul>
                </div>

                {/* SALES & EXPENSES – concise user guidance only */}
                <div>
                  <h3 className="font-semibold">Sales</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Sales (List):</strong> shows each sale with invoice/customer/channel, items and totals.
                      Use the <strong>Edit</strong> button in the table to update a sale.
                    </li>
                    <li>
                      <strong>New Sale:</strong> add line items (qty, unit price, discount, optional cost per unit).
                      Totals display in your <strong>default currency</strong>. After saving, you’re returned to the{" "}
                      <strong>Sales</strong> list.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Expenses</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Expenses (List):</strong> shows each expense with category/vendor/invoice/amount.
                      Use the <strong>Edit</strong> button in the table to update an expense.
                    </li>
                    <li>
                      <strong>New Expense:</strong> the <em>Currency</em> field defaults to your{" "}
                      <strong>default currency</strong> but can be changed per expense. After saving, you’re returned to the{" "}
                      <strong>Expenses</strong> list.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Settings</h3>
                  <ul className="list-disc pl-6">
                    <li>
                      <strong>Profile</strong> (name & avatar), <strong>Password</strong>,{" "}
                      <strong>Default Apiary</strong>, language/timezone.
                    </li>
                    <li>
                      <strong>Default Currency:</strong> choose your preferred ISO code (e.g., GBP, EUR, USD). This sets the default
                      used in Sales totals and pre-fills in New Expense. You can still override currency on individual expenses.
                    </li>
                    <li>
                      <strong>Manage billing</strong> (Premium): opens Stripe Customer Portal (update card, invoices, cancel).
                    </li>
                    <li>
                      <strong>Export my data (CSV)</strong>: downloads separate CSV files for your tables plus a list of public photo URLs.
                    </li>
                    <li>
                      <strong>Delete Account</strong>: cancels subscription, removes storage files and data, then deletes your account.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Archive</h3>
                  <p className="text-gray-700">
                    Central place for archived items. Archiving hides content from active lists without deleting history.
                    On Free, unarchiving is limited by the 1 apiary / 2 hives active limits.
                  </p>
                </div>
              </div>
            </section>

            {/* NEW: Default Currency */}
            <section id="currency-defaults">
              <h2 className="text-2xl font-bold mb-3">Default Currency (How It Works)</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  Your <strong>default currency</strong> is the ISO code you prefer to see in totals and as the starting currency
                  for new entries. You can set it in <strong>Settings</strong>. Examples: <code>GBP</code>,{" "}
                  <code>EUR</code>, <code>USD</code>.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <strong>Sales &amp; Profit/Loss:</strong> totals are shown using your default currency for display.
                    (No FX conversion is performed.)
                  </li>
                  <li>
                    <strong>New Expense:</strong> the Currency field is pre-filled with your default currency; you can change it per expense.
                  </li>
                  <li>
                    <strong>Expenses List:</strong> each row shows the amount formatted using the stored currency for that row.
                  </li>
                  <li>
                    <strong>Inventory List:</strong> rows display using the item’s own currency; if an item has none saved,
                    your default currency is used.
                  </li>
                  <li>
                    <strong>Changing the default</strong> updates new-form defaults and how totals are formatted going forward.
                    It does <em>not</em> convert past numbers or rewrite saved rows.
                  </li>
                  <li>
                    <strong>No conversions:</strong> BeezKnees formats amounts using the currency code but does not apply exchange rates.
                  </li>
                </ul>
              </div>
            </section>

            {/* Reports */}
            <section id="reports">
              <h2 className="text-2xl font-bold mb-3">Reports</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Open <strong>Reports</strong> from the Sidebar to access printable summaries.</li>
                <li>Use filters (where available) to scope your view, then print or export as needed.</li>
                <li>
                  You can also use the <strong>Dashboard → Print</strong> for a quick summary of current metrics and recent items.
                </li>
                <li>
                  For raw data, go to <strong>Settings → Export</strong> to download CSVs of your tables (plus{" "}
                  <code>photos.csv</code> with image URLs).
                </li>
              </ul>
            </section>

            {/* Workflows */}
            <section id="workflows">
              <h2 className="text-2xl font-bold mb-3">Typical Workflows</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Normal visit</h3>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Go to <em>Inspections → New Inspection</em>.</li>
                    <li>Select <strong>Apiary</strong>, then <strong>Hive</strong>.</li>
                    <li>
                      Set the <strong>Date</strong> (today by default), review auto-filled <strong>Weather</strong>.
                    </li>
                    <li>Record observations, add photos (up to 3), and save.</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Weather, Maps & Photos */}
            <section id="weather-maps-photos">
              <h2 className="text-2xl font-bold mb-3">Weather, Maps &amp; Photos</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Weather</strong> is fetched by apiary coordinates for the inspection date.{" "}
                  <Badge>Free</Badge>
                </li>
                <li>
                  <strong>Maps:</strong> set coordinates by clicking the map or searching by address.
                </li>
                <li>
                  <strong>Photos:</strong> Apiary/Hive support one optional photo; Inspections allow up to{" "}
                  <strong>3</strong>. Click photos to open a <strong>lightbox</strong>.
                </li>
              </ul>
            </section>

            {/* Filters, Counts & Archives */}
            <section id="filters-counts-archives">
              <h2 className="text-2xl font-bold mb-3">Filters, Counts &amp; Archives</h2>

              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Dashboard counts:</strong> Apiaries = global <em>active</em> apiaries;
                  Hives/Inspections/Tasks/Logbook respect the selected apiary filter.
                </li>
                <li>
                  <strong>Export from Dashboard:</strong> CSV export respects the apiary filter so you can download focused views.
                </li>
                <li>
                  <strong>List pages show active items</strong>; archived content lives in the <em>Archive</em> page.
                </li>
                <li>
                  <strong>Dashboard recent lists &amp; archiving:</strong> archived rows display an{" "}
                  <Badge tone="amber">Archived</Badge> pill on the far right and have no <em>Open</em>/<em>Edit</em> actions.
                  Use the <em>Archive</em> page to view details or restore (where allowed).
                </li>
                <li>
                  <strong>After downgrade to Free:</strong> extra apiaries/hives are auto-archived. You can view/export them,
                  but cannot unarchive beyond Free limits until you upgrade.
                </li>
              </ul>

              <div className="mt-4 p-4 rounded-lg border bg-white">
                <h3 className="font-semibold mb-2">How archiving works (cascade rules)</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    <strong>Archiving an Apiary</strong> also archives all of its Hives and their Inspections.
                    Tasks and Logbook entries linked to those archived Hives/Inspections are archived too.
                  </li>
                  <li>
                    <strong>Archiving a Hive</strong> also archives all Inspections for that Hive.
                    Tasks/Logbook entries that reference that Hive or those Inspections are archived.
                  </li>
                  <li>
                    <strong>Archiving a single Inspection</strong> archives any Tasks or Logbook entries linked to that Inspection.
                    The parent Hive/Apiary remain active.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Unarchiving rules</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    On <Badge>Free</Badge>, unarchiving is allowed only if it won’t exceed the limits
                    (max <strong>1 active Apiary</strong>, <strong>2 active Hives</strong> total).
                  </li>
                  <li>
                    Unarchiving a parent (e.g., Apiary → Hive → Inspection) may prompt you to unarchive its children;
                    if limits are exceeded, only allowable items are reactivated.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">
                  What archiving does <em>not</em> do
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    It does <strong>not delete</strong> data. You can still view it in <em>Archive</em> and include it in CSV exports.
                  </li>
                  <li>
                    Public photo URLs remain accessible unless you delete the files from storage.
                  </li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Tips</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>
                    Before downgrading, manually archive extra Apiaries/Hives so you choose which stay active on Free.
                  </li>
                  <li>
                    Use the <em>Archive</em> page as your “history” area—keep current operations uncluttered while preserving full records.
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
                  Capture next-visit actions in <strong>Tasks</strong> and give them clear due dates.
                </li>
                <li>
                  Add apiary coordinates for accurate weather and map displays.
                </li>
                <li>
                  Set a <strong>default apiary</strong> to power Dashboard weather and fallback logic.
                </li>
                <li>
                  Click photos on cards to open a <strong>lightbox</strong> for a closer look.
                </li>
                <li>
                  Filtering by apiary updates the page URL—bookmark or share filtered views.
                </li>
              </ul>
            </section>

            {/* FAQs */}
            <section id="faqs">
              <h2 className="text-2xl font-bold mb-3">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">What exactly do I get on Free?</p>
                  <p className="text-gray-700">
                    1 active apiary, 2 active hives total, unlimited inspections, weather snapshots, calendar, tasks, logbook entries,
                    printable reports, and CSV export from Settings.
                  </p>
                </div>
                <div>
                  <p className="font-medium">What happens if I downgrade from Premium to Free?</p>
                  <p className="text-gray-700">
                    We keep 1 active apiary (preferring your default) and up to 2 active hives within it; everything else is auto-archived.
                    Your data remains available to view/export. Upgrade again to reactivate more.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Why can’t I unarchive an extra apiary or hive on Free?</p>
                  <p className="text-gray-700">
                    Free limits enforce 1 active apiary and 2 active hives. Unarchiving beyond that is blocked while on Free.
                    Upgrade to activate more.
                  </p>
                </div>
                <div>
                  <p className="font-medium">How do I manage billing or cancel?</p>
                  <p className="text-gray-700">
                    Go to <strong>Settings → Manage billing</strong>. This opens the Stripe Customer Portal to update your card,
                    download invoices, or cancel.
                  </p>
                </div>
                <div>
                  <p className="font-medium">How do I export my data?</p>
                  <p className="text-gray-700">
                    Go to <strong>Settings → Export</strong> and click <em>Export my data (CSV)</em>. You’ll get separate CSV files
                    for your tables plus <code>photos.csv</code> with public links to your images.
                  </p>
                </div>
                <div>
                  <p className="font-medium">What happens if I delete my account?</p>
                  <p className="text-gray-700">
                    <strong>Settings → Delete Account</strong> cancels your subscription, removes your photos &amp; data, and deletes
                    your account. This is permanent and cannot be undone.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Why is Dashboard weather a different location?</p>
                  <p className="text-gray-700">
                    Weather uses your <strong>default apiary</strong>. Edit the correct apiary and set as default.
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <h2 className="text-2xl font-bold mb-3">Troubleshooting</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Can’t add another apiary/hive:</strong> Free plan allows 1 active apiary and 2 active hives total.
                  Upgrade to add more.
                </li>
                <li>
                  <strong>Can’t unarchive an apiary/hive on Free:</strong> limits apply on Free.
                  Upgrade to reactivate more.
                </li>
                <li>
                  <strong>Can’t save Apiary/Hive/Inspection:</strong> fill required fields; wait for photo upload;
                  confirm you’re signed in.
                </li>
                <li>
                  <strong>Task didn’t change to Completed:</strong> set status from the Task List (Mark complete) or the Edit Task page.
                </li>
                <li>
                  <strong>Can’t find the right inspection in the Logbook’s Related Inspection list:</strong> pick the correct date
                  group, then look for the option labelled <em>Hive (Apiary) • time</em>; switch the Hive selector above to narrow results.
                </li>
                <li>
                  <strong>Weather didn’t load:</strong> add coordinates to the apiary and retry; occasional provider outages can happen.
                </li>
                <li>
                  <strong>Export didn’t download:</strong> check your browser’s download permissions/pop-up blocker and retry.
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
                  <strong>Export</strong>: use <em>Settings → Export</em> to download CSVs of your data anytime.
                </li>
                <li>
                  <strong>Deletion</strong>: <em>Settings → Delete Account</em> cancels any subscription, removes storage files,
                  deletes your tables, and deletes the auth user.
                </li>
                <li>
                  Analytics respect consent; events are sent only when you grant analytics consent.
                </li>
              </ul>
            </section>

            {/* Power Users */}
            <section id="power-users">
              <h2 className="text-2xl font-bold mb-3">Power-User Notes</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Plan enforcement:</strong> inserts and unarchives are constrained on Free (1 apiary / 2 hives).
                  Downgrade auto-archives extras; upgrade lifts limits.
                </li>
                <li>
                  <strong>Dashboard export:</strong> CSV export respects the Apiary filter; great for per-yard summaries.
                </li>
                <li>
                  <strong>CSV export (Settings):</strong> one CSV per table + <code>photos.csv</code> with public URLs (images not bundled).
                </li>
                <li>
                  <strong>Print:</strong> Dashboard “Print” renders a clean report of the current view.
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
                  <dt className="font-medium">Archive</dt>
                  <dd className="text-gray-700">Hide from active lists without deleting.</dd>
                </div>
              </dl>
            </section>

            <div className="pt-6">
              <a
                href="#top"
                className="inline-block text-sm text-blue-700 hover:underline"
                aria-label="Back to top"
              >
                ↑ Back to top
              </a>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
