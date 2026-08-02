// src/pages/Updates.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/en-gb"; // GB locale

dayjs.locale("en-gb");

// === MANUAL NOTES (edit these by hand) ===
const NOTES = [
  
  {
    version: "1.3.1",
    released_at: "2026-08-02T23:15:00Z",

    summary:
      "Completed production deployment and end-to-end validation of HiveTag's authentication, transactional email and subscription systems. Improved account onboarding using Brevo SMTP, strengthened production reliability and verified the complete Premium subscription lifecycle.",

    added: [
      "Added full **Brevo SMTP integration** for all transactional emails using the authenticated BeezKnees domain.",
      "Added automatic **email verification** for all newly registered accounts before first login.",
      "Added production-ready **Welcome Email** and **Email Confirmation** workflows for new members.",
      "Added production verification of the complete **Stripe Premium subscription lifecycle**, including upgrades, cancellations and customer notifications.",
      "Added comprehensive production testing covering registration, login, password reset, email verification, Premium upgrades and subscription cancellation.",
    ],

    changed: [
      "Updated Supabase Authentication to require **email confirmation** before first sign-in.",
      "Updated authentication email delivery to use the authenticated Brevo SMTP provider.",
      "Improved onboarding flow so new members now receive both an email verification message and a personalised welcome email.",
      "Updated subscription processing to ensure Premium status, Stripe customer details and renewal dates remain synchronised with user profiles.",
      "Refined production deployment and environment configuration following final infrastructure validation.",
    ],

    fixed: [
      "Fixed an issue preventing confirmation emails from being sent to newly registered users when email confirmation was disabled.",
      "Resolved production SMTP configuration to ensure all authentication emails are delivered successfully.",
      "Verified Welcome Email Edge Function execution and profile update behaviour.",
      "Verified Stripe webhook processing for Premium subscriptions, cancellations and renewal events.",
      "Improved overall authentication and subscription reliability following comprehensive end-to-end production testing.",
    ],

    removed: [],

    security: [
      "Enabled mandatory email verification for new accounts, improving account security and preventing unverified registrations.",
      "Verified authenticated SMTP delivery using DKIM, DMARC and branded domain configuration for improved email security and deliverability.",
    ],

    breaking: [],

    links: [
      { label: "Register", to: "/register" },
      { label: "Login", to: "/login" },
      { label: "Forgot Password", to: "/forgot-password" },
      { label: "Pricing", to: "/pricing" },
      { label: "Dashboard", to: "/dashboard" },
    ],

    known_issues: [
      "Email delivery depends on the recipient's mail provider and spam filtering policies. If an email is not received, users should check their Junk or Spam folder before requesting another verification email.",
    ],
  },

  {
    version: "1.3.0",
    released_at: "2026-07-16T18:00:00Z",

    summary:
      "Introduced the new Hive Health intelligence system, simplified the inspection workflow, improved disease and varroa recording, strengthened Premium functionality, refreshed the Help system, and delivered numerous usability, stability and workflow improvements across HiveTag.",

    added: [
      "Added a completely redesigned **Hive Health** system providing explainable colony health scores, risk assessments, trends, confidence levels and recommended actions.",
      "Added **Hive Health Overview** and **Hive Health Timeline** panels to the Dashboard for Premium users.",
      "Added direct **Open Hive Health** access from the Inspection List after every inspection.",
      "Added explainable intelligence showing why HiveTag has generated particular recommendations.",
      "Added confidence scoring based on available inspection history.",
      "Added a comprehensive **Hive Health** section to the Help system.",
      "Added a new **Which HiveTag feature should I use?** quick-start guide to help new users understand the application.",
    ],

    changed: [
      "Inspection workflow redesigned so Hive Health is now the primary follow-up after completing an inspection.",
      "Inspection summary cards now provide a concise overview using coloured status pills before opening Hive Health.",
      "Improved disease recording by separating Varroa from brood disease recording, reducing duplicate data entry.",
      "Updated Dashboard so Hive Health Overview and Timeline are available only to Premium users.",
      "Updated Reports Centre to better integrate Hive Intelligence and recommended actions.",
      "Updated Premium feature messaging throughout the application for greater consistency.",
      "Updated Help documentation to accurately reflect the current application and new workflows.",
    ],

    fixed: [
      "Fixed duplicate Varroa recording between inspection fields and disease selection.",
      "Fixed legacy Inspection Insights workflow by consolidating intelligence into Hive Health.",
      "Fixed inconsistent Premium access across Dashboard and Inspection workflows.",
      "Improved Hive Health recommendations and risk prioritisation.",
      "Improved intelligence consistency across inspections, reports and dashboard views.",
      "Improved overall application stability and navigation following the Hive Health redesign.",
    ],

    removed: [
      "Removed the standalone **Inspection Insights** workflow in favour of the unified Hive Health experience.",
      "Removed duplicate Varroa entries from disease recording.",
      "Removed obsolete inspection intelligence components no longer required by the new Hive Health architecture.",
    ],

    security: [],

    breaking: [],

    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Hive Health", to: "/hives" },
      { label: "Inspections", to: "/inspections" },
      { label: "Reports Centre", to: "/reports/print" },
      { label: "Help", to: "/help" },
      { label: "Pricing", to: "/pricing" },
    ],

    known_issues: [
      "Hive Health intelligence is based on recorded inspection data and becomes increasingly accurate as additional inspections are completed.",
      "Health scores are intended to support beekeeper decision-making and should always be considered alongside physical hive inspections.",
      "Future releases will continue expanding long-term trend analysis and colony intelligence.",
    ],
  },

  {
    version: "1.2.0",
    released_at: "2026-06-25T18:00:00Z",

    summary:
      "Completely redesigned the Reports Centre into a professional reporting suite with executive summaries, grouped inspection intelligence, photo galleries, persistent report filters, enhanced sharing and significantly improved printable reports.",

    added: [
      "Added a completely redesigned **Professional Print Report** layout with a modern document-style presentation.",
      "Added **Executive Summary** section providing an overview of the selected report.",
      "Added **Inspection Timeline** showing inspections in chronological order.",
      "Added grouped **Inspection Intelligence** so insights are organised by inspection date rather than individual alert cards.",
      "Added **Colony Health Score** calculations to provide a quick assessment of inspection results.",
      "Added automated **Recommendations** generated from inspection data.",
      "Added **Photo Timeline** displaying inspection photographs alongside their inspection dates.",
      "Added full-screen **Photo Gallery** with swipe-friendly viewing for inspection photographs.",
      "Added image **Download** support from the gallery.",
      "Added **Share Inspection** support using the browser's native sharing capabilities where available.",
      "Added automatic report filter persistence so selected apiaries, hives and date ranges are restored after refreshing or returning to the page.",
      "Added automatic regeneration of previously viewed reports after page reload.",
    ],

    changed: [
      "Completely redesigned the report layout to provide a cleaner, more professional printable document.",
      "Inspection insights are now grouped into a single intelligence section for each inspection, making reports significantly easier to read.",
      "Reorganised inspection records into collapsible sections to reduce excessive scrolling.",
      "Improved photo presentation with dedicated gallery viewing while retaining inline thumbnails within reports.",
      "Improved report navigation and readability across desktop and mobile devices.",
      "Updated report sharing to provide graceful fallbacks when native browser sharing is unavailable.",
      "Improved report generation workflow by preserving user selections between sessions.",
    ],

    fixed: [
      "Fixed report filters resetting after refreshing the page or returning from another browser tab.",
      "Fixed image downloads previously opening a new browser tab instead of downloading directly.",
      "Fixed duplicate gallery controls appearing within expanded inspection records.",
      "Fixed inconsistent sharing behaviour by providing clipboard fallbacks when native sharing is unavailable.",
      "Improved report stability when returning from gallery or download actions.",
      "Improved desktop report layout consistency and overall presentation.",
    ],

    removed: [
      "Removed duplicate gallery controls from detailed inspection records.",
      "Removed unnecessary repeated inspection insight cards in favour of grouped intelligence summaries.",
    ],

    security: [],

    breaking: [],

    links: [
      { label: "Reports Centre", to: "/reports/print" },
      { label: "Inspections", to: "/inspections" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Pricing", to: "/pricing" },
    ],

    known_issues: [
      "Native browser sharing depends on browser and operating system support. When unavailable, HiveTag automatically provides a copy-to-clipboard fallback.",
      "Large inspection reports containing many photographs may take slightly longer to generate on older mobile devices.",
      "Hive Intelligence analysis is currently based on recorded inspection data only. Future releases will introduce trend analysis across multiple inspections and enhanced colony intelligence.",
    ],
  },

  {
    version: "1.1.6",
    released_at: "2026-05-03T22:00:00Z",

    summary:
      "Completed full inspection workflow integration including Insights, task/log linking, improved weather handling, and manual inspection linking across the app.",

    added: [
      "Added new **Inspection Insights** detail screen for Premium users.",
      "Added smart insight detection for swarm risk, queen issues, colony strength, low stores, varroa and disease concerns.",
      "Added suggested kit prompts for next inspection visits (e.g. supers, feeders, nuc boxes, monitoring kits, test frames).",
      "Added insight-based actions to create pre-filled follow-up tasks and logbook entries.",
      "Added persistent database linking between inspections, tasks and logbook entries using `inspection_id`.",
      "Added task and logbook counts with quick navigation directly on Inspection List cards.",
      "Added manual **'Related Inspection' dropdown** when creating tasks outside of Insights.",
      "Added dynamic inspection lookup filtered by apiary/hive in New Task screen.",
      "Added ability to link tasks to inspections even when created manually or from Seasonal Guide.",
      "Added return-to-inspection behaviour when tasks are created from Insights.",
      "Added highlight-based navigation between inspections, tasks and logbook entries.",
      "Added safe archive flow to include linked tasks and logbook entries.",
      "Added detection of linked records before delete actions with user confirmation.",
      "Added support for JSON-based derived weather storage with proper UI formatting.",
    ],

    changed: [
      "Updated Inspection List cards to display insight badges, suggested kit prompts and linked record counts.",
      "Updated Inspection List to correctly display derived weather from JSON or fallback values.",
      "Updated inspection insight logic to prevent false 'queen issue' warnings when queen data is not recorded.",
      "Updated New Task flow to support both automatic (Insights) and manual inspection linking.",
      "Updated New Task to reset inspection linkage when apiary or hive changes.",
      "Updated Inspection Edit screen to preserve and display derived weather correctly.",
      "Updated archive behaviour so inspections, tasks and logbook entries are always kept in sync.",
      "Updated navigation so linked records open in filtered list views with highlight support.",
      "Updated Premium feature gating for Inspection Insights.",
      "Updated Seasonal Guide task creation to optionally link to inspections.",
    ],

    fixed: [
      "Fixed false 'Possible queen issue' insight when no queen data was recorded.",
      "Fixed tasks not appearing on Inspection List when created outside of Insights.",
      "Fixed missing `inspection_id` when creating tasks manually.",
      "Fixed archive flow not including linked tasks in some cases.",
      "Fixed inconsistent linking caused by relying on notes instead of proper database relationships.",
      "Fixed navigation inconsistencies between Inspection Insights, Tasks and Logbook.",
      "Fixed derived weather display inconsistencies across pages.",
      "Improved inspection-to-task linking reliability across all entry points.",
    ],

    removed: [
      "Removed reliance on note-based linking between inspections, tasks and logbook entries.",
      "Removed inconsistent archive logic that did not include all linked records.",
      "Removed assumption that tasks must be created via Insights to be linked.",
    ],

    security: [],

    breaking: [],

    links: [
      { label: "Inspections", to: "/inspections" },
      { label: "New Inspection", to: "/inspections/new" },
      { label: "Tasks", to: "/todos" },
      { label: "New Task", to: "/todos/new" },
      { label: "Logbook", to: "/logbook" },
      { label: "New Logbook Entry", to: "/logbook/new" },
      { label: "Pricing", to: "/pricing" },
    ],

    known_issues: [
      "Inspection Insights are based on recorded data and do not account for intentionally skipped inputs.",
      "Older tasks and logbook entries created before inspection linking was introduced will not be automatically associated.",
      "Suggested kit prompts are advisory and should be validated against real apiary conditions.",
      "Manual inspection linking requires user selection when not created from Insights.",
    ],
  },
  {
    version: "1.1.5",
    released_at: "2026-05-02T18:00:00Z",
    summary:
      "Added the new Premium Year in the Apiary seasonal guide, with monthly infographic guidance, practical checklists, and direct task creation from seasonal actions.",

    added: [
      "Added new **Year in the Apiary** Premium seasonal guide page.",
      "Added all 12 monthly beekeeping infographic guides into the app.",
      "Added month selector so users can quickly switch between January to December guidance.",
      "Added full-screen infographic viewer with previous/next month navigation.",
      "Added practical monthly action checklists.",
      "Added individual **+ Add task** buttons for each seasonal action.",
      "Added structured task metadata for seasonal actions, including category, priority, source and seasonal month.",
    ],

    changed: [
      "Updated Seasonal Guide actions from plain text into structured task-ready data.",
      "Updated New Task flow so seasonal guide actions pre-fill the task title and source information.",
      "Updated Tasks list to display seasonal task badges for priority, category and month.",
      "Updated Edit Task so seasonal task category and priority can be viewed and edited.",
      "Updated Premium Required messaging to mention the Year in the Apiary seasonal guide.",
      "Updated Pricing content to include the Year in the Apiary seasonal guide as a Premium benefit.",
    ],

    fixed: [
      "Fixed full-screen guide viewer layering so the infographic opens above the desktop navigation.",
      "Fixed React rendering issues caused by converting checklist actions from text into structured objects.",
      "Fixed duplicate/obsolete checklist-level Add Task behaviour by using individual task buttons instead.",
    ],

    removed: [
      "Removed the generic Add Task button from the Practical Checklist section because each action now has its own task button.",
    ],

    security: [],

    breaking: [],

    links: [
      { label: "Seasonal Guide", to: "/seasonal-guide" },
      { label: "Tasks", to: "/todos" },
      { label: "New Task", to: "/todos/new" },
      { label: "Pricing", to: "/pricing" },
      { label: "Dashboard", to: "/dashboard" },
    ],

    known_issues: [
      "Seasonal guide tasks still require the user to select an apiary and hive, or All Hives, before saving.",
      "Checklist tick boxes are for quick planning only and are not currently saved between sessions.",
      "Task filtering by category, priority or seasonal month may be added in a future update.",
    ],
  },
  {
    version: "1.1.4",
    released_at: "2026-04-29T18:00:00Z",
    summary:
      "Premium access rules updated across BeezKnees so Free and Premium plans are clearer, locked features are shown consistently, and protected routes now prevent direct URL access to Premium-only tools.",

    added: [
      "Added Premium gating for **Colony Health Check**, **Apiary Siting Guide**, **Hive Siting Guide**, and **Step-by-step Inspection Guide**.",
      "Added Premium gating for **Apiary Map Markers**.",
      "Added Premium gating for **Reports & Export**.",
      "Added Premium gating for **Inventory**, **Sales**, **Expenses**, **Profit & Loss**, **New Inventory**, **New Sale**, and **New Expense**.",
      "Added protected route checks so Premium-only pages cannot be accessed by typing the URL directly.",
    ],

    changed: [
      "Updated sidebar links so Free users see locked Premium feature buttons instead of normal access links.",
      "Updated Dashboard **Open Reports & Export** access so it follows the new Premium-only rules.",
      "Updated pricing content so Free and Premium plan features now match the actual feature access rules.",
      "Updated guide buttons across Apiary, Hive and Inspection pages so locked Premium tools are shown consistently.",
    ],

    fixed: [
      "Fixed cases where Free users could still reach Premium-only pages by entering the route manually.",
      "Fixed inconsistent locked-link behaviour where some buttons went to Pricing and others used the Premium-required flow.",
      "Fixed Premium plan checks using the correct `profiles.user_id` lookup.",
    ],

    removed: [],

    security: [
      "Strengthened client-side route protection for Premium-only tools and reporting pages.",
    ],

    breaking: [],

    links: [
      { label: "Pricing", to: "/pricing" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Apiaries", to: "/apiaries" },
      { label: "Hives", to: "/hives" },
      { label: "Inspections", to: "/inspections" },
      { label: "Reports", to: "/reports/print" },
      { label: "Inventory", to: "/inventory" },
    ],

    known_issues: [
      "Locked feature buttons are intentionally still visible to Free users so they can see what Premium unlocks.",
      "Server-side database access is still governed separately by Supabase RLS and app policies.",
    ],
  },
  {
    version: "1.1.3",
    released_at: "2026-03-27T14:30:00Z",
    summary:
      "NFC setup has been fully unified across Android and iPhone / iPad, with improved visibility of NFC status across the app and the ability to enable or clear iPhone NFC directly from the setup screen.",

    added: [
      "Added a new **iPhone / iPad NFC link flow** using **/nfc/open?hive_id=...**, allowing HiveTag links to be written directly to NFC tags for Apple devices.",
      "Added **Copy NFC Link** generation so iPhone / iPad users can copy the correct hive link without typing it manually.",
      "Added a new **NFC open route** that redirects straight into **New Inspection** for the linked hive.",
      "Scan NFC Tag now includes a new **iPhone / iPad setup card** with Apiary + Hive selection and link generation.",
      "Added **iPhone NFC status tracking** (`nfc_link_enabled`) to distinguish iPhone-linked hives from Android tag-based hives.",
      "Added **Clear iPhone NFC status** button in the setup screen, allowing users to remove iPhone NFC from a hive without affecting Android tags.",
    ],

    changed: [
      "Reworked **Scan NFC Tag** into a single NFC setup hub covering both **Android** and **iPhone / iPad** methods.",
      "Updated NFC wording across the app so Android tag scanning and iPhone link-writing are clearly explained as separate setup methods.",
      "Updated **NFC Setup Card** instructions to include both Android blank-tag scanning and iPhone / iPad link-based setup.",
      "Updated **NFC Tag Manager** wording to clarify that it manages **Android tag ID links** only.",
      "Updated **NFC Tag Store** product wording so compatibility, reuse and setup instructions now accurately reflect the two-device approach.",
      "Updated **NFC Link Hive** wording so it is clearly positioned as the **Android scanned tag ID** linking page.",
      "Updated **Hive List** so NFC badges now display for both Android (tag ID) and iPhone / iPad (link-enabled) hives.",
      "Updated **Edit Hive** to show NFC status (Android tag or iPhone enabled) in a read-only format.",
    ],

    fixed: [
      "Reduced subscriber confusion caused by NFC setup being split across different pages and device types.",
      "Fixed inconsistent NFC guidance where some pages still implied that iPhone and Android used the same blank-tag scanning process.",
      "Improved iPhone / iPad setup reliability by removing the need for users to manually type HiveTag links onto NFC tags.",
      "Fixed issue where iPhone NFC-enabled hives were not visible in the Hive List.",
      "Ensured NFC status persists correctly when editing and saving hives.",
    ],

    removed: [],

    security: [],

    breaking: [],

    links: [
      { label: "Set Up NFC Tags", to: "/nfc" },
      { label: "Manage Android NFC Tags", to: "/nfc/manage" },
      { label: "NFC Setup Card", to: "/nfc/instructions" },
      { label: "Buy NFC Tags", to: "/nfc/tags" },
      { label: "Hives", to: "/hives" },
      { label: "Inspections", to: "/inspections" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "Browser-based Web NFC scanning still depends on device/browser support and works best in Chrome on Android.",
      "iPhone / iPad NFC setup still requires a separate NFC writing app to write the copied HiveTag link onto the physical tag.",
      "Android-tagged hives and iPhone link-written tags are reusable, but they are reassigned in different ways.",
    ],
  },
  {
    version: "1.1.2",
    released_at: "2026-02-24T18:00:00Z",
    summary:
      "Weather handling improved across Inspections, Reports, printing and dashboard UX. Inspection weather is now date-accurate, temperature-aware, user-observable conditions are supported, and report exports include fully formatted weather values.",

    added: [
      "Added new **Weather (observed)** field to Inspections, allowing users to manually record real-world conditions at the time of inspection.",
      "Derived inspection weather now includes **average daily temperature (min/max)**, stored canonically in Celsius.",
      "Reports → Print Report now displays formatted **Weather (derived)** and **Weather (observed)** values.",
      "CSV exports (Combined + Inspections) now include a new `weather_observed` column and properly formatted derived weather.",
      "Dashboard stat tiles are now fully clickable and link directly to their respective sections (Apiaries, Hives, Inspections, Tasks, Logbook, NFC Manager).",
    ],

    changed: [
      "Weather in inspections is now **frozen to the inspection date** and no longer reflects current live conditions when editing past records.",
      "Derived weather now displays in the format `12°C – Light drizzle` and automatically respects the user’s temperature preference (°C / °F).",
      "Improved weather date parsing logic to handle mixed timestamp formats safely and prevent incorrect condition display.",
      "Improved report clarity by labelling weather columns explicitly as **derived** vs **observed**.",
      "Dashboard stat tiles redesigned for improved mobile UX with centred layout and enhanced visual feedback.",
    ],

    fixed: [
      "Fixed issue where edited inspections did not immediately reflect updated observed weather in list views.",
      "Resolved inconsistent weather behaviour between Dashboard, InspectionList and EditInspection flows.",
      "Fixed missing weather_observed data in Reports and CSV exports.",
      "Corrected edge cases where weather timestamps could display incorrect conditions due to format mismatches.",
      "Prevented raw JSON weather strings from appearing in Print Reports or CSV exports.",
    ],

    removed: [],

    security: [],

    breaking: [],

    links: [
      { label: "Inspections", to: "/inspections" },
      { label: "Reports", to: "/reports/print" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "Weather data is derived from historical forecast APIs and may not perfectly match hyper-local microclimates.",
      "If no historical forecast data is available for a specific timestamp, the derived weather field may be blank while observed weather remains available.",
      "Temperature display relies on stored canonical Celsius values and converts for display only.",
    ],
  },

  {
    version: "1.1.1",
    released_at: "2026-01-26T18:00:00Z",
    summary:
      "Improved the Apiary Map Markers experience: popups now properly overlay the header/pollen cards (no more hidden forms), reduced 'screen jump' behaviour, added pollen hide/show, tightened 'Pick again' behaviour, and restored the foraging-ring disclaimer.",

    added: [
      "Added a **Hide/Show** toggle on the **Pollen (apiary location)** card so users can collapse it when the map needs more space.",
      "Added stronger **popup styling** (subtle tinted border + clearer shadow) so marker forms stand out against the header/pollen cards.",
      "Restored the legend disclaimer for the foraging ring: **“Indicative range only — bees may forage further depending on conditions.”**",
    ],

    changed: [
      "Popup form sizing is now **responsive**: slightly wider on desktop, but constrained on mobile so it never feels cramped or overflows the viewport.",
      "Popup behaviour adjusted to avoid disorientating map movement: popups no longer force the map to auto-pan (users can move the map if needed).",
      "When a popup opens, the UI layering now temporarily prioritises the map/popup so the popup can sit **above** the header and pollen cards.",
    ],

    fixed: [
      "Fixed marker popups rendering **under** the header/pollen cards by correcting z-index/layering (popup now overlays the top UI).",
      "Fixed the **Pick again** flow so it behaves as intended: it clears the selected point and waits for the user to tap a new location, rather than instantly relocating unexpectedly.",
      "Fixed popup form layout issues where some labels/fields appeared to protrude or clip outside the popup container.",
      "Fixed occasional blank page / build errors caused by **syntax issues** (e.g., stray characters after export, missing braces).",
    ],

    removed: [],

    security: [],

    breaking: [],

    links: [
      { label: "Apiaries", to: "/apiaries" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "Satellite imagery depends on an external tile provider; if the provider rate-limits or has an outage, the Satellite layer may load slowly or appear blank.",
      "Pollen data is shown in the **header card only** (it does not place markers/heatmaps on the map yet). A future enhancement could add an optional on-map pollen overlay layer if desired.",
    ],
  },
  {
    version: "1.1.0",
    released_at: "2026-01-26T12:00:00Z",
    summary:
      "Added a full-screen Apiary Map page with simple map notes (markers) per apiary, including satellite view toggle, topic-specific icons, quick edit/delete, and mobile-friendly layout improvements.",

    added: [
      "New **Apiary Map Markers** page that loads a full-page map for an apiary and lets users add simple map notes (tap-to-drop marker).",
      "Added an **apiary selector dropdown** on the map page so users can switch between apiaries without leaving the map.",
      "Added a small **Markers: X** counter next to the dropdown to show how many notes exist for the selected apiary.",
      "Added **topic-specific marker icons** for common beekeeping map notes: water source, watercourse, forage hotspot, Asian hornet sighting, shelter/windbreak, risk, access/parking, and Other.",
      "Added **Satellite view** toggle alongside normal map view using a Layer control (Map ↔ Satellite).",
    ],

    changed: [
      "Map UI now uses a **full-screen layout** that remains user-friendly on mobile (header can wrap/stack on smaller screens).",
      "Map controls (layers + zoom) positioned to avoid clashing with the top header (controls moved to the bottom-right).",
      "Marker rendering hardened by ensuring coordinates are treated as numeric values when passed to Leaflet.",
    ],

    fixed: [
      "Fixed Leaflet controls overlapping the map header by disabling the default zoom control and rendering a bottom-right **ZoomControl**.",
      "Fixed markers appearing to drift / not follow zoom correctly by using a proper pin-style SVG icon with correct anchor settings (no manual CSS translate).",
      "Fixed popup forms being hidden under the header by measuring the header height and adding **dynamic top padding** to the map area.",
    ],

    removed: [],

    security: [],

    breaking: [],

    links: [
      { label: "Apiaries", to: "/apiaries" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "Satellite imagery depends on an external tile provider; if the provider rate-limits or has an outage, the Satellite layer may load slowly or appear blank.",
      "On very small screens, popups may still feel tight; the map header stacks to preserve tap targets and readability.",
    ],
  },

  {
    version: "1.0.9",
    released_at: "2026-01-25T12:00:00Z",
    summary:
      "Added beginner-friendly siting guides for apiary and hive placement, with quick access buttons on the New Apiary and New Hive pages.",

    added: [
      "New **Apiary Siting Guide** page (step-by-step) to help beginners choose a safe, practical apiary location.",
      "New **Hive Siting Guide** page (step-by-step) covering entrance orientation, flight paths, stand stability, shelter, and working space.",
      "Added **Apiary Siting Guide** button to **New Apiary** for quick access while creating a new apiary.",
      "Added **Hive Siting Guide** button to **New Hive** for quick access while creating a new hive.",
    ],

    changed: [
      "Routing updated with two new protected guide routes: **/apiaries/step-by-step** and **/hives/step-by-step**.",
    ],

    fixed: [
      "Back navigation on the new siting guide pages now returns correctly when opened from the New Apiary / New Hive flows (opened in the same tab).",
    ],

    removed: [],

    security: [],

    breaking: [],

    links: [
      { label: "Apiaries", to: "/apiaries" },
      { label: "Hives", to: "/hives" },
      { label: "Inspections", to: "/inspections" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Help", to: "/help" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "If the siting guides are opened in a new tab, browser history may be empty so the Back button cannot return to the originating form; open the guides in the same tab for expected Back behaviour.",
    ],
  },

  {
    version: "1.0.8",
    released_at: "2026-01-13T12:00:00Z",
    summary:
      "Bee Health Helper: added UK urgent-reporting alerts (shown even when not in top results), and improved results safety messaging for high-significance pests/diseases.",

    added: [
      "New **Bee Health Helper** foundations for triage (one question at a time) with **Yes / No / Not sure** answers and an **Expand all** option.",
      "Added **Reset all** and a persistent **disclaimer** block at the top of the Bee Health Helper page.",
      "Added an **urgent reporting trigger system** (`urgentReporting`) so the UI can surface **UK reporting guidance** even if a notifiable pest/disease does not appear in the top results.",
    ],

    changed: [
      "Bee Health Helper results now include an **urgent reporting banner** when urgent triggers are hit, not just when an alert condition appears in the top results.",
      "Results panel wiring updated to pass `urgentHit` through to the UI and choose the correct UK reporting panel mode (`asian_hornet`, `shb`, or general).",
    ],

    fixed: [
      "Fixed edge cases where high-significance reporting guidance could be missed when the related condition did not rank in the top list due to unknown/partial answers.",
    ],

    removed: [],

    security: [
      "Strengthened safe-use messaging by surfacing **official UK reporting guidance** when urgent triggers are selected, reducing the risk of delayed escalation for notifiable pests/diseases.",
    ],

    breaking: [],

    links: [
      { label: "Colony Health Check", to: "/bee-health" },
      { label: "Inspections", to: "/inspections" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Help", to: "/help" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "The Bee Health Helper is an early version and is **not a diagnostic tool**; it provides pattern-based triage only.",
      "Some results may remain inconclusive if many answers are set to “Not sure”; use **Recommended next checks** to narrow it down.",
    ],
  },

  {
    version: "1.0.7",
    released_at: "2026-01-04T12:00:00Z",
    summary:
      "Fixed cross-page navigation between Inspections and Logbook so highlighted items reliably jump to the correct page, and return-to-page behaviour is preserved when moving between linked records.",

    added: [
      "Added **return-to-page context** (`return_page`) when navigating from **Inspections → Logbook**, allowing **Logbook → View Inspection** to return to the exact inspection list page you came from.",
      "Added deterministic **page alignment for highlighted inspections** in InspectionList by fetching ordered IDs under the current filters and calculating the correct page for the highlighted record.",
    ],

    changed: [
      "Inspections pagination is now **URL-driven** (`?page=`) as the source of truth, improving consistency across refreshes and deep links.",
      "Updated Logbook → “View Inspection” links to include the original `page` when available, ensuring the inspection highlight is visible immediately on return.",
      "Standardised cross-list navigation params (`highlight`, `type`, `page`, `return_page`) to reduce unexpected page jumps and stale list state.",
    ],

    fixed: [
      "Fixed cases where **View Inspection** from a highlighted logbook entry would land on the wrong inspection page (record not visible until paging around).",
      "Fixed inconsistent ordering/page results caused by list views not aligning the highlight target with the current filter+sort set.",
      "Fixed navigation loops/edge cases by preventing repeated highlight-page alignment triggers for the same URL state.",
    ],

    removed: [],

    security: [],

    breaking: [],

    links: [
      { label: "Inspections", to: "/inspections" },
      { label: "Logbook", to: "/logbook" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Help", to: "/help" },
      { label: "Release Notes", to: "/updates" },
    ],

    known_issues: [
      "If you click the sidebar **Inspections** link while already on /inspections, React Router may preserve the current query string (including `page=`) depending on navigation behaviour; this is expected unless the link is changed to explicitly reset `?page=1`.",
      "Highlight alignment relies on the same filters/sort used by the list; changing filters after following a deep link may move the highlighted record to a different page.",
    ],
  },

  {
    version: "1.0.6",
    released_at: "2026-01-01T12:00:00Z",
    summary:
      "List pages unified with a consistent, responsive filter bar (Apiary + Hive + date range), improved Clear Hive behaviour, and server-side date filtering added for Tasks (Todos).",

    added: [
      "Added **Hive filtering** to Logbook list (LogEntryList) with apiary-aware hive dropdown options.",
      "Added **date range filtering (From/To)** to Logbook list, using the logbook `date` field (server-side).",
      "Added **date range filtering (From/To)** to Task list (TodoList), using the `due_date` field (server-side).",
      "Added **Hive filtering** to Task list (TodoList), with apiary-aware hive dropdown options.",
    ],

    changed: [
      "Aligned list page controls to a consistent layout: **filters sit under the heading**, run left-to-right on desktop, and **stack cleanly on mobile**.",
      "Updated Inspection list filter bar to match the same responsive style as Logbook (single-row layout on desktop, stacked on mobile).",
      "Improved **Clear Hive** behaviour so it appears **beside the Hive dropdown** (instead of dropping below/under other controls).",
      "Standardised URL-synced filters across lists using shared query params: `apiary_id`, `hive_id`, `from`, `to` (while preserving highlight/type params).",
    ],

    fixed: [
      "Fixed responsive layout issues where date inputs could appear misaligned (label left, input right) on smaller screens.",
      "Fixed cases where **Clear Hive** would appear under the date fields or disappear due to flex wrapping behaviour.",
      "Improved consistency of filter UX across Inspections, Logbook and Tasks (same stacking rules, spacing, and control sizing).",
    ],

    removed: [],

    security: [
      "Filters are now applied defensively using server-side query constraints (`gte/lte`) on DATE fields to reduce edge-case parsing and inconsistent client-side filtering.",
    ],

    breaking: [],

    links: [
      { label: "Inspections", to: "/inspections" },
      { label: "Logbook", to: "/logbook" },
      { label: "Tasks", to: "/todos" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Help", to: "/help" },
    ],

    known_issues: [
      "If a browser window is extremely narrow, the filter bar may wrap onto multiple rows (by design) to preserve input usability.",
      "Date filtering relies on saved dates being present; items with no date/due date may not appear when a From/To range is set.",
    ],
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
      "Dashboard preview now uses the same seasonal engine as the Weather page to ensure **identical logic** between both views.",
    ],

    changed: [
      "The Weather page ‘Beekeeper Notes’ heading is now **Seasonal Beekeeper Notes** for clarity and consistency.",
      "Advisories have been expanded to incorporate **season-specific treatment planning guidance** (e.g., late-summer Varroa timing, winter monitoring), while avoiding product-specific recommendations.",
      "Dashboard now renders a reduced version of the notes without altering layout or tile structure.",
      "Disclaimer wording revised to ensure stronger alignment with best-practice and to avoid ambiguity around inspections, feeding and chemical treatments.",
    ],

    fixed: [
      "Resolved mismatches between Dashboard and Weather advisory text where headings, disclaimers or preview formatting previously diverged.",
      "Fixed cases where the Dashboard would temporarily show empty notes even when Weather notes were available.",
      "Improved consistency in wind-speed displays (mph on Dashboard snapshot) to prevent UK/US unit confusion.",
    ],

    removed: [],

    security: [
      "Hardened language around treatments to avoid accidental interpretation as prescriptive instructions, reducing liability exposure.",
      "Ensured external weather data is handled safely with defensive parsing on Dashboard as well as Weather.",
    ],

    breaking: [],

    links: [
      { label: "Weather", to: "/weather" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Apiaries", to: "/apiaries" },
      { label: "Help", to: "/help" },
    ],

    known_issues: [
      "Weather loading time can still be slow when the forecast provider responds late; further optimisation planned (timeouts + fewer fallback calls).",
      "Seasonal notes depend on the user's system date; incorrect device date/time may result in mismatched seasonal advice.",
      "Dashboard preview shows only the first 3 notes by design — full context always requires visiting the Weather page.",
    ],
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
      "“Weather temporarily unavailable (provider error)” now includes a quiet **circuit breaker**: we back off for a short time after provider failures to keep the UI responsive.",
    ],

    changed: [
      "Weather page UX fully refreshed to use darker cards, clearer icons, and responsive horizontal scrolling for the hourly forecast on mobile.",
      "Current conditions now include **feels-like temperature**, humidity, wind speed and direction, with local time zone handled by the forecast provider.",
      "Behind the scenes, the app now tries multiple Open-Meteo forecast shapes (modern `current`, legacy `current_weather=true`, and a derived-from-hourly fallback) before giving up.",
      "Weather errors are now less noisy and more consistent, and successful calls clear any previous circuit-breaker lockout automatically.",
    ],

    fixed: [
      "Fixed cases where apiaries with missing or out-of-range coordinates caused confusing or broken weather displays.",
      "Resolved layout issues where the **Weather & temperature notes** and **Hive & feeding considerations** style logic in Beekeeper Notes could misalign under certain thresholds.",
      "Addressed occasional UI flicker when switching between apiaries on slower connections.",
    ],

    removed: [],

    security: [
      "Hardened weather fetching by enforcing JSON-only responses and defensive parsing to avoid crashes on unexpected provider output.",
    ],

    breaking: [],

    links: [
      { label: "Weather", to: "/weather" },
      { label: "Apiaries", to: "/apiaries" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Help", to: "/help" },
    ],

    known_issues: [
      "Official weather warnings and pollen feeds depend on external providers; in some regions they may show “No data” even when other services report something.",
      "If a provider outage occurs, the circuit breaker will temporarily suppress repeated calls; try again a little later or switch apiary once things recover.",
      "Accurate local forecasts still depend on you saving correct coordinates for each apiary.",
    ],
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
      "Reports → **Print Report** now includes a dedicated **NFC Tags** section and CSV export, respecting apiary/hive + archived filters.",
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
      "NFC checkout now uses a Stripe Shipping Rate for **UK-only flat shipping (£1.55)** and reads Stripe keys from environment for easy test/live switching.",
    ],

    fixed: [
      "Fixed redirect issues when purchasing NFC tags while logged out (now routes you through login and back to the NFC store).",
      "Fixed cases where NFCScan could run with stale subscription state.",
      "Resolved misreported NFC support on certain Android browsers by tightening feature detection.",
      "Fixed UI flicker when checking subscription level on NFCScan.",
      "Fixed missing image reference by adding `nfctag.webp` to `/public` for the NFC product preview.",
      "Corrected layout spacing on mobile for NFC pages.",
    ],

    removed: [],

    security: [
      "Enhanced CORS and header handling in `create-nfc-checkout` based on Supabase Edge best practices.",
      "Edge Function now validates quantity and ensures a logged-in user before creating a Checkout Session.",
    ],

    breaking: [],

    links: [
      { label: "Scan NFC Tag", to: "/nfc" },
      { label: "Manage NFC Tags", to: "/nfc/manage" },
      { label: "Buy NFC Tags", to: "/nfc/tags" },
      { label: "Premium Pricing", to: "/pricing" },
      { label: "Hives", to: "/hives" },
      { label: "Inspections", to: "/inspections" },
      { label: "Privacy Policy", to: "/legal/privacy" },
    ],

    known_issues: [
      "Web NFC support varies across devices: iOS Safari still does not support Web NFC scanning.",
      "If a tag UID is locked by the manufacturer, it cannot be rewritten (but still works for read-only flows).",
      "Shipping for NFC tag orders is currently UK-only, and Stripe’s address auto-fill may not pre-fill on some browsers.",
    ],
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
      "Sidebar: under **Inventory & Finance**, added a **Quick Create** dropdown containing **New Inventory**, **New Sale**, **New Expense**.",
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
      "**Default currency** now clearly drives: Sales totals display; **New Expense** currency pre-fills from your default (still editable); Inventory list uses the item’s currency when set, otherwise your default.",
    ],
    fixed: [
      "Resolved **New Item** save errors (now correctly uses `purchase_price`).",
      "Route imports/paths tidied for new pages to avoid Vite import-analysis hiccups.",
      "Minor stability tweaks to Inventory and post-save navigation.",
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
      { label: "Release Notes", to: "/updates" },
    ],
    known_issues: [
      "If a list doesn’t reflect an edit instantly, refresh the page (client cache may delay until next load).",
      "Sales/Expenses lists currently show all of your rows; filters may be added in a future update.",
    ],
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
      "Dashboard: recent items open list+highlight; tiny ✎ Edit per entry; “See all … →” links open full lists; tasks show Overdue; weather names default apiary.",
    ],
    changed: [
      "Calendar modal: clearer names and actions (Edit • View in list • Close).",
      "Removed duplicate “Mark complete” in Calendar modal to keep flows consistent.",
      "Lightboxes: keyboard controls (Esc/←/→).",
      "Filters persist in URLs on lists.",
      "Dashboard recent links prefer context-first review (list + highlight).",
    ],
    fixed: [
      "Fixed `todos.completed_at` errors when completing tasks or opening from Calendar.",
      "Task completion reliably updates record and UI.",
      "Replaced old Calendar “View” action that could 404 with the new “View in list”.",
      "Pagination edge cases when filters reduce results.",
      "Map/location edge cases with missing/invalid coords.",
      "Logbook: removed ambiguity for same-day inspections by adding Hive (Apiary) + time.",
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
      { label: "View Help", to: "/help" },
    ],
    known_issues: [
      "Reverse-geocoded location labels may appear shortly after first load.",
      "List highlight from Calendar fades after a brief time.",
      "Lightbox images depend on public URLs; deleted/moved files won’t display.",
    ],
  },
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

      <h2 className="text-2xl font-bold mb-2">Release Notes</h2>
      <p className="text-sm text-gray-600 mb-6">
        See what’s new, what changed, and what was fixed across releases.
      </p>

      {notes.length === 0 ? (
        <p className="text-gray-500">No releases yet.</p>
      ) : (
        <div className="space-y-6">
          {notes.map((n) => (
            <article key={n.version} id={`v-${n.version}`} className="border rounded-lg bg-white">
              <header className="px-4 py-3 border-b flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  v{n.version}
                </span>
                <time className="text-sm text-gray-600">
                  {dayjs(n.released_at).format("DD/MM/YYYY")}
                </time>
                {n.summary && <p className="text-sm text-gray-800">{n.summary}</p>}
              </header>

              <div className="p-4 grid md:grid-cols-2 gap-6">
                <NoteSection title="Added" items={n.added} />
                <NoteSection title="Changed" items={n.changed} />
                <NoteSection title="Fixed" items={n.fixed} />

                {(n.removed?.length > 0 || n.security?.length > 0) && (
                  <>
                    <NoteSection title="Removed/Deprecated" items={n.removed} />
                    <NoteSection title="Security" items={n.security} />
                  </>
                )}

                <NoteSection title="Breaking changes" items={n.breaking} highlight />
                <NoteSection title="Known issues" items={n.known_issues} muted />
              </div>
            </article>
          ))}
        </div>
      )}
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
          (highlight ? "text-red-700" : muted ? "text-gray-500" : "text-gray-700")
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
