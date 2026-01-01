// src/pages/Updates.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/en-gb"; // GB locale

dayjs.locale("en-gb");

// === MANUAL NOTES (edit these by hand) ===
const NOTES = [
{
  version: "1.0.6",
  released_at: "2026-01-01T12:00:00Z",
  summary:
    "List pages unified with a consistent, responsive filter bar (Apiary + Hive + date range), improved Clear Hive behaviour, and server-side date filtering added for Tasks (Todos).",

  added: [
    "Added **Hive filtering** to Logbook list (LogEntryList) with apiary-aware hive dropdown options.",
    "Added **date range filtering (From/To)** to Logbook list, using the logbook `date` field (server-side).",
    "Added **date range filtering (From/To)** to Task list (TodoList), using the `due_date` field (server-side).",
    "Added **Hive filtering** to Task list (TodoList), with apiary-aware hive dropdown options."
  ],

  changed: [
    "Aligned list page controls to a consistent layout: **filters sit under the heading**, run left-to-right on desktop, and **stack cleanly on mobile**.",
    "Updated Inspection list filter bar to match the same responsive style as Logbook (single-row layout on desktop, stacked on mobile).",
    "Improved **Clear Hive** behaviour so it appears **beside the Hive dropdown** (instead of dropping below/under other controls).",
    "Standardised URL-synced filters across lists using shared query params: `apiary_id`, `hive_id`, `from`, `to` (while preserving highlight/type params)."
  ],

  fixed: [
    "Fixed responsive layout issues where date inputs could appear misaligned (label left, input right) on smaller screens.",
    "Fixed cases where **Clear Hive** would appear under the date fields or disappear due to flex wrapping behaviour.",
    "Improved consistency of filter UX across Inspections, Logbook and Tasks (same stacking rules, spacing, and control sizing)."
  ],

  removed: [],

  security: [
    "Filters are now applied defensively using server-side query constraints (`gte/lte`) on DATE fields to reduce edge-case parsing and inconsistent client-side filtering."
  ],

  breaking: [],

  links: [
    { label: "Inspections", to: "/inspections" },
    { label: "Logbook", to: "/logbook" },
    { label: "Tasks", to: "/todos" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Help", to: "/help" }
  ],

  known_issues: [
    "If a browser window is extremely narrow, the filter bar may wrap onto multiple rows (by design) to preserve input usability.",
    "Date filtering relies on saved dates being present; items with no date/due date may not appear when a From/To range is set."
  ]
},

  {
  version: "1.0.5",
  released_at: "2025-12-06T18:00:00Z",
  summary:
    "Seasonal Beekeeper Notes unified across Weather and Dashboard, new treatment advisories added, disclaimers strengthened, dashboard preview added, and multiple stability improvements to weather behaviour.",

  added: [
    "New **Seasonal Beekeeper Notes** system providing season-aware guidance for winter, spring, summer and autumn, now including **Varroa/treatment advisory cues** in a legally safe, non-prescriptive form.",
    "Dashboard now shows a **Beekeeper Notes preview** (first 3 items) with a **“View full notes”** link taking the user directly to the Weather page.",
    "New strengthened **disclaimer** text across Weather and Dashboard, clarifying that notes are advisory only, not treatment instructions, and depend on local conditions.",
    "Dashboard preview now uses the same seasonal engine as the Weather page to ensure **identical logic** between both views."
  ],

  changed: [
    "The Weather page ‘Beekeeper Notes’ heading is now **Seasonal Beekeeper Notes** for clarity and consistency.",
    "Advisories have been expanded to incorporate **season-specific treatment planning guidance** (e.g., late-summer Varroa timing, winter monitoring), while avoiding product-specific recommendations.",
    "Dashboard now renders a reduced version of the notes without altering layout or tile structure.",
    "Disclaimer wording revised to ensure stronger alignment with best-practice and to avoid ambiguity around inspections, feeding and chemical treatments."
  ],

  fixed: [
    "Resolved mismatches between Dashboard and Weather advisory text where headings, disclaimers or preview formatting previously diverged.",
    "Fixed cases where the Dashboard would temporarily show empty notes even when Weather notes were available.",
    "Improved consistency in wind-speed displays (mph on Dashboard snapshot) to prevent UK/US unit confusion."
  ],

  removed: [],

  security: [
    "Hardened language around treatments to avoid accidental interpretation as prescriptive instructions, reducing liability exposure.",
    "Ensured external weather data is handled safely with defensive parsing on Dashboard as well as Weather."
  ],

  breaking: [],

  links: [
    { label: "Weather", to: "/weather" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Apiaries", to: "/apiaries" },
    { label: "Help", to: "/help" }
  ],

  known_issues: [
    "Weather loading time can still be slow when the forecast provider responds late; further optimisation planned (timeouts + fewer fallback calls).",
    "Seasonal notes depend on the user's system date; incorrect device date/time may result in mismatched seasonal advice.",
    "Dashboard preview shows only the first 3 notes by design — full context always requires visiting the Weather page."
  ]
},
  
   {
    version: "1.0.4",
    released_at: "2025-12-03T18:00:00Z",
    summary:
      "Weather page rebuilt with apiary-aware forecasts, beekeeper-focused guidance, live pollen levels, official weather warnings, unit toggles, and more resilient error handling.",

    added: [
      "New **Weather** page layout with a clear ‘Now’, **Today (hour by hour)** strip, and **Next 5 days** forecast cards.",
      "Weather is now **apiary-aware**: forecasts are pulled per-apiary using stored latitude/longitude, with a safe London fallback if coordinates are missing or invalid.",
      "New **Beekeeper Notes** sidebar that turns raw weather into practical guidance (strong wind alerts, heavy rain, cold nights, hot spells, and inspection-friendly days).",
      "Temperature **unit toggle** (°C/°F) and wind **speed toggle** (km/h ↔ mph) added, wired through all current + forecast panels and beekeeper notes.",
      "New **Official Weather Warnings** panel that surfaces severe-weather alerts for the selected apiary when the forecast provider supplies them.",
      "New **Pollen** cards showing current and peak **tree**, **grass** and **weed** pollen levels for the next few hours, based on the selected apiary location.",
      "“Weather temporarily unavailable (provider error)” now includes a quiet **circuit breaker**: we back off for a short time after provider failures to keep the UI responsive."
    ],

    changed: [
      "Weather page UX fully refreshed to use darker cards, clearer icons, and responsive horizontal scrolling for the hourly forecast on mobile.",
      "Current conditions now include **feels-like temperature**, humidity, wind speed and direction, with local time zone handled by the forecast provider.",
      "Behind the scenes, the app now tries multiple Open-Meteo forecast shapes (modern `current`, legacy `current_weather=true`, and a derived-from-hourly fallback) before giving up.",
      "Weather errors are now less noisy and more consistent, and successful calls clear any previous circuit-breaker lockout automatically."
    ],

    fixed: [
      "Fixed cases where apiaries with missing or out-of-range coordinates caused confusing or broken weather displays.",
      "Resolved layout issues where the **Weather & temperature notes** and **Hive & feeding considerations** style logic in Beekeeper Notes could misalign under certain thresholds.",
      "Addressed occasional UI flicker when switching between apiaries on slower connections."
    ],

    removed: [],

    security: [
      "Hardened weather fetching by enforcing JSON-only responses and defensive parsing to avoid crashes on unexpected provider output."
    ],

    breaking: [],

    links: [
      { label: "Weather", to: "/weather" },
      { label: "Apiaries", to: "/apiaries" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Help", to: "/help" }
    ],

    known_issues: [
      "Official weather warnings and pollen feeds depend on external providers; in some regions they may show “No data” even when other services report something.",
      "If a provider outage occurs, the circuit breaker will temporarily suppress repeated calls; try again a little later or switch apiary once things recover.",
      "Accurate local forecasts still depend on you saving correct coordinates for each apiary."
    ]
  },

  {
    version: "1.0.3",
    released_at: "2025-11-29T09:00:00Z",
    summary:
      "Complete NFC system (scan, manage, store), new Stripe checkout for NFC tags, UK-only NFC shipping, Premium gating UX, privacy updates, and NFC-related UI polish across the platform.",

    added: [
      // NFC System
      "New **Scan NFC Tag** page with Premium-only gating, permission handling, Web NFC support detection and friendly fallbacks.",
      "New **NFC Tag Manager** to view, filter, and clear linked NFC UIDs for hives.",
      "New **NFC Setup Card** (printable A4-style instructions) linked from the NFC Scan page.",
      "New **Buy NFC Tags** store page with quantity selector, estimated totals, technical specs, and product image.",
      "New **NFC tag UID linking**: unknown tags automatically open **New Hive** with `nfc_uid` pre-filled and locked.",
      "New **tap-to-log inspections**: known tags jump straight into **New Inspection** with hive + apiary pre-filled.",
      "Added **NFC UIDs** to Hive records and database lookup for fast tag→hive resolution.",
      "Reports → **Print Report** now includes a dedicated **NFC Tags** section and CSV export, respecting apiary/hive + archived filters."
    ],

    // Stripe + Checkout
    changed: [
      // NFC UX
      "Improved Web NFC error handling with clearer messages for NotAllowed, Abort, NotSupported and empty UIDs.",
      "NFCScan redesigned with clearer Premium messaging, improved device-browser warnings, and polished layout.",
      "Updated New Inspection and New Hive flows to correctly handle NFC-origin navigation (`source=nfc`) so scans route cleanly into the right hive.",

      // Privacy Policy
      "Privacy Policy updated with a new **NFC Tags** section explaining UID storage, lookup behaviour, and non-tracking use.",
      "Clarified third-party references (Stripe billing, LocationIQ, OpenStreetMap).",

      // Routing & Checkout
      "Added new protected route **/nfc/tags** for the NFC store checkout screen.",
      "Grouped NFC routes together for clarity: `/nfc`, `/nfc/manage`, `/nfc/instructions`, `/nfc/tags`.",
      "NFC checkout now uses a Stripe Shipping Rate for **UK-only flat shipping (£1.55)** and reads Stripe keys from environment for easy test/live switching."
    ],

    fixed: [
      "Fixed redirect issues when purchasing NFC tags while logged out (now routes you through login and back to the NFC store).",
      "Fixed cases where NFCScan could run with stale subscription state.",
      "Resolved misreported NFC support on certain Android browsers by tightening feature detection.",
      "Fixed UI flicker when checking subscription level on NFCScan.",
      "Fixed missing image reference by adding `nfctag.webp` to `/public` for the NFC product preview.",
      "Corrected layout spacing on mobile for NFC pages."
    ],

    removed: [],

    security: [
      "Enhanced CORS and header handling in `create-nfc-checkout` based on Supabase Edge best practices.",
      "Edge Function now validates quantity and ensures a logged-in user before creating a Checkout Session."
    ],

    breaking: [],

    links: [
      { label: "Scan NFC Tag", to: "/nfc" },
      { label: "Manage NFC Tags", to: "/nfc/manage" },
      { label: "Buy NFC Tags", to: "/nfc/tags" },
      { label: "Premium Pricing", to: "/pricing" },
      { label: "Hives", to: "/hives" },
      { label: "Inspections", to: "/inspections" },
      { label: "Privacy Policy", to: "/legal/privacy" }
    ],

    known_issues: [
      "Web NFC support varies across devices: iOS Safari still does not support Web NFC scanning.",
      "If a tag UID is locked by the manufacturer, it cannot be rewritten (but still works for read-only flows).",
      "Shipping for NFC tag orders is currently UK-only, and Stripe’s address auto-fill may not pre-fill on some browsers."
    ]
  },

  {
    version: "1.0.2",
    released_at: "2025-11-01T11:30:00Z",
    summary:
      "Sales & Expenses list pages with edit flows, unified Edit buttons, Sidebar re-organised (lists first + Quick Create), and Default Currency behaviour documented.",
    added: [
      // Lists & edit pages
      "New **Expenses (List)** with category, vendor, invoice #, amount, and an **Edit** button on each row.",
      "New **Edit Expense** page and routes.",
      "New **Sales (List)** with invoice/customer/channel, item count, totals, and an **Edit** button on each row.",
      "New **Edit Sale** page and routes.",
      // Help / Currency docs
      "Help updated with a new **Default Currency (How It Works)** subsection covering where your default currency is used (Sales totals display, **New Expense** prefill, Inventory list display).",
      // Sidebar IA
      "Sidebar: under **Inventory & Finance**, added a **Quick Create** dropdown containing **New Inventory**, **New Sale**, **New Expense**."
    ],
    changed: [
      // Navigation / IA
      "Sidebar: **Inventory & Finance** now lists **Inventory**, **Sales**, **Expenses**, **Profit & Loss**, **Reports** first, followed by a **Quick Create** dropdown.",
      // Flows
      "After saving **New Expense**, you now return to **Expenses (List)**.",
      "After saving **New Sale**, you now return to **Sales (List)**.",
      // Dates & display
      "Profit & Loss report dates show in **DD/MM/YYYY**.",
      // Buttons
      "Unified **Edit** button styling in **Sales (List)** and **Expenses (List)** to match Inventory (compact bordered button instead of blue text link).",
      // Currency behaviour
      "**Default currency** now clearly drives: Sales totals display; **New Expense** currency pre-fills from your default (still editable); Inventory list uses the item’s currency when set, otherwise your default."
    ],
    fixed: [
      "Resolved **New Item** save errors (now correctly uses `purchase_price`).",
      "Route imports/paths tidied for new pages to avoid Vite import-analysis hiccups.",
      "Minor stability tweaks to Inventory and post-save navigation."
    ],
    removed: [],
    security: [],
    breaking: [],
    links: [
      { label: "Inventory", to: "/inventory" },
      { label: "Sales (List)", to: "/sales" },
      { label: "Expenses (List)", to: "/finance/expenses" },
      { label: "Profit & Loss", to: "/reports/pnl" },
      { label: "Reports", to: "/reports/print" },
      { label: "Quick Create → New Inventory", to: "/inventory/new" },
      { label: "Quick Create → New Sale", to: "/sales/new" },
      { label: "Quick Create → New Expense", to: "/finance/expenses/new" },
      { label: "Help", to: "/help" },
      { label: "Release Notes", to: "/updates" }
    ],
    known_issues: [
      "If a list doesn’t reflect an edit instantly, refresh the page (client cache may delay until next load).",
      "Sales/Expenses lists currently show all of your rows; filters may be added in a future update."
    ]
  },

  {
    version: "1.0.1",
    released_at: "2025-10-31T10:00:00Z",
    summary:
      "Calendar → List deep-link + highlight, unified list filters/pagination, reliable task completion, clearer Logbook ‘Related Inspection’ choices, Dashboard polish, and fixes.",
    added: [
      "Calendar: “View in list” jumps to the list page and auto-highlights the exact item.",
      "Lists support highlight via URL (?highlight=ID&type=...).",
      "Logbook: image lightbox, list/grid toggle, and pagination.",
      "Apiary/Hive/Inspection lists: URL-synced filters + pagination.",
      "Apiaries/Hives: human-readable location labels when coordinates exist.",
      "Hives: inspection counts and safe map rendering when coords are missing.",
      "Tasks: inline “Mark complete” on the list with instant UI update.",
      "Logbook: clearer “Related Inspection” options as “Hive (Apiary) • time”, grouped by date and auto-narrowed by Hive filter.",
      "Inspections: ‘Logbook’ badge + deep-link to Logbook filtered to that inspection with highlight.",
      "Dashboard: recent items open list+highlight; tiny ✎ Edit per entry; “See all … →” links open full lists; tasks show Overdue; weather names default apiary."
    ],
    changed: [
      "Calendar modal: clearer names and actions (Edit • View in list • Close).",
      "Removed duplicate “Mark complete” in Calendar modal to keep flows consistent.",
      "Lightboxes: keyboard controls (Esc/←/→).",
      "Filters persist in URLs on lists.",
      "Dashboard recent links prefer context-first review (list + highlight)."
    ],
    fixed: [
      "Fixed `todos.completed_at` errors when completing tasks or opening from Calendar.",
      "Task completion reliably updates record and UI.",
      "Replaced old Calendar “View” action that could 404 with the new “View in list”.",
      "Pagination edge cases when filters reduce results.",
      "Map/location edge cases with missing/invalid coords.",
      "Logbook: removed ambiguity for same-day inspections by adding Hive (Apiary) + time."
    ],
    removed: [],
    security: [],
    breaking: [],
    links: [
      { label: "Open Calendar", to: "/calendar" },
      { label: "Task List", to: "/todos" },
      { label: "Inspections", to: "/inspections" },
      { label: "Apiaries", to: "/apiaries" },
      { label: "Hives", to: "/hives" },
      { label: "Logbook", to: "/logbook" },
      { label: "View Help", to: "/help" }
    ],
    known_issues: [
      "Reverse-geocoded location labels may appear shortly after first load.",
      "List highlight from Calendar fades after a brief time.",
      "Lightbox images depend on public URLs; deleted/moved files won’t display."
    ]
  }
];

export default function Updates() {
  useEffect(() => {
    document.title = "Release Notes • BeezKnees";
  }, []);

  // Always show most recent first
  const notes = [...NOTES].sort(
    (a, b) => dayjs(b.released_at).valueOf() - dayjs(a.released_at).valueOf()
  );

  return (
    <div id="top" className="p-6 max-w-5xl mx-auto">
      {/* Back link (blue) */}
      <Link
        to="/dashboard"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
      >
        <span className="mr-2" aria-hidden="true">
          ←
        </span>
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-2">Release Notes</h1>
      <p className="text-sm text-gray-600 mb-6">
        See what’s new, what changed, and what was fixed across releases.
      </p>

      {notes.length === 0 ? (
        <p className="text-gray-500">No releases yet.</p>
      ) : (
        <div className="space-y-6">
          {notes.map((n) => (
            <article
              key={n.version}
              id={`v-${n.version}`}
              className="border rounded-lg bg-white"
            >
              <header className="px-4 py-3 border-b flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  v{n.version}
                </span>
                <time className="text-sm text-gray-600">
                  {dayjs(n.released_at).format("DD/MM/YYYY")}
                </time>
                {n.summary && (
                  <p className="text-sm text-gray-800">{n.summary}</p>
                )}
              </header>

              <div className="p-4 grid md:grid-cols-2 gap-6">
                <NoteSection title="Added" items={n.added} />
                <NoteSection title="Changed" items={n.changed} />
                <NoteSection title="Fixed" items={n.fixed} />

                {(n.removed?.length > 0 || n.security?.length > 0) && (
                  <>
                    <NoteSection
                      title="Removed/Deprecated"
                      items={n.removed}
                    />
                    <NoteSection title="Security" items={n.security} />
                  </>
                )}

                <NoteSection
                  title="Breaking changes"
                  items={n.breaking}
                  highlight
                />
                <NoteSection
                  title="Known issues"
                  items={n.known_issues}
                  muted
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Back to top link */}
      <div className="pt-6">
        <a
          href="#top"
          className="inline-block text-sm text-blue-700 hover:underline"
        >
          ↑ Back to top
        </a>
      </div>
    </div>
  );
}

function NoteSection({ title, items, highlight = false, muted = false }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h3
        className={
          "text-sm font-semibold mb-1 " +
          (highlight
            ? "text-red-700"
            : muted
            ? "text-gray-500"
            : "text-gray-700")
        }
      >
        {title}
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
        {items.map((t, idx) => (
          <li key={idx}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
