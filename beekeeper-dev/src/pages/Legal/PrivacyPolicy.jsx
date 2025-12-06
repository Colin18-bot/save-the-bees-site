import React from "react";

export default function PrivacyPolicy() {
  return (
    <div id="top" className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-gray-600">
        <strong>Effective date:</strong> 14 June 2025
      </p>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">Who we are (Data Controller)</h2>
        <p>
          BeezKnees (“we”, “us”) is the Data Controller for the BeezKnees Members
          app. Contact:{" "}
          <a
            className="underline text-amber-700"
            href="/contact"
            title="Open the members contact form"
          >
            BeezKnees
          </a>
          .
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">1. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Account &amp; Authentication</strong> via Supabase (email,
            password, session tokens).
          </li>
          <li>
            <strong>App data you add</strong> (apiaries including optional
            lat/lng, hives including optional photos &amp; NFC tag IDs, inspections,
            logbook entries, to-dos).
          </li>
          <li>
            <strong>Billing &amp; orders</strong> when you upgrade your plan or buy
            HiveTag NFC labels. Payments are processed by Stripe (for example,
            name, email, billing and shipping details). We do not store full card
            numbers on our servers.
          </li>
          <li>
            <strong>Analytics</strong> (optional, if you consent) via Google
            Analytics (page views, device, usage).
          </li>
          <li>
            <strong>Geocoding</strong> via LocationIQ; <strong>map tiles</strong>{" "}
            via OpenStreetMap providers.
          </li>
          <li>
            <strong>Support</strong> communications if you contact us (for example,
            your name, email and the contents of your message).
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Provide core features (save and display your apiaries, hives,
            inspections, logbook entries and tasks).
          </li>
          <li>
            Authenticate you and keep your account secure (Supabase Auth).
          </li>
          <li>
            Process subscriptions and manage billing (Stripe).
          </li>
          <li>
            Process and deliver physical orders you place (for example, HiveTag NFC
            labels), including necessary shipping details handled by Stripe.
          </li>
          <li>
            Show place names for coordinates (LocationIQ) and maps (OpenStreetMap).
          </li>
          <li>
            Improve the service via aggregated analytics (Google Analytics, if you
            consent).
          </li>
          <li>Provide support and service-related notifications.</li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">3. Lawful Bases</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Contract</strong> — to provide the member features you request
            and to fulfil any physical products you order (such as HiveTag NFC
            labels).
          </li>
          <li>
            <strong>Consent</strong> — analytics/marketing cookies and related
            processing (you can withdraw any time in Cookie Settings).
          </li>
          <li>
            <strong>Legitimate interests / Legal obligation</strong> — fraud
            prevention, security, required records.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">4. Cookies &amp; Analytics</h2>
        <p>
          We use essential cookies/local storage to keep you signed in and run the
          app. Optional analytics cookies (Google Analytics) are used only if you
          consent. Manage your preferences any time on the{" "}
          <a href="/legal/cookies" className="underline text-amber-700">
            Cookie Settings
          </a>{" "}
          page.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Essential</strong>: required for authentication and core
            features.
          </li>
          <li>
            <strong>Analytics (optional)</strong>: Google Analytics to understand
            app usage.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-700"
            >
              Supabase
            </a>{" "}
            (Auth, Postgres, Storage)
          </li>
          <li>
            <a
              href="https://stripe.com/gb/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-700"
            >
              Stripe
            </a>{" "}
            (billing, payment processing and order handling for subscriptions and
            NFC tag sales)
          </li>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-700"
            >
              Google Analytics
            </a>{" "}
            (optional analytics)
          </li>
          <li>
            <a
              href="https://locationiq.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-700"
            >
              LocationIQ
            </a>{" "}
            (geocoding)
          </li>
          <li>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-700"
            >
              OpenStreetMap
            </a>{" "}
            (map tiles &amp; attribution)
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">6. NFC Tags</h2>
        <p>
          If you link an NFC tag UID to a hive, the UID is stored with that hive
          record to speed up lookups on supported devices (for example, when you
          tap a HiveTag and open the relevant hive or start a new inspection). The
          tag UID itself is not used for location tracking or behavioural profiling
          and is not shared with third parties. You can remove a tag from a hive
          at any time in the NFC Tag Manager.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">7. International Transfers</h2>
        <p>
          Some processors (e.g., Stripe, Google) may process data outside the
          UK/EEA. Where this occurs, we rely on appropriate safeguards (such as
          standard contractual clauses) provided by those processors.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">8. Data Security</h2>
        <p>
          Data is stored in Supabase Postgres with Row Level Security (RLS) so
          each user can only access their own data. Photos are stored in Supabase
          Storage with access policies.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">9. Your Rights</h2>
        <p>
          You have rights under UK data protection law, including access,
          rectification, erasure, restriction, data portability, and objection.
          Where processing is based on consent, you may withdraw consent at any
          time in{" "}
          <a href="/legal/cookies" className="underline text-amber-700">
            Cookie Settings
          </a>
          . You can also export or delete your data in Settings, or contact{" "}
          <a
            href="/contact"
            className="underline text-amber-700"
            title="Open the members contact form"
          >
            BeezKnees
          </a>
          .
        </p>
        <p>
          If you are unhappy with how we handle your data, you can complain to
          the UK Information Commissioner’s Office (ICO):{" "}
          <a
            className="underline text-amber-700"
            href="https://ico.org.uk"
            target="_blank"
            rel="noreferrer"
          >
            ico.org.uk
          </a>
          .
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">10. Data Retention</h2>
        <p>
          We retain your data while your account is active. If you cancel, we may
          keep minimal records required for billing or legal compliance and delete
          the rest on request.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">11. Children’s Data</h2>
        <p>
          This service is not intended for children under 13 (or under 16 where
          applicable). We do not knowingly collect data from children.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">12. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted here
          with an updated effective date.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">13. Contact</h2>
        <p>
          Questions or requests:{" "}
          <a
            href="/contact"
            className="underline text-amber-700"
            title="Open the members contact form"
          >
            BeezKnees
          </a>
          .
        </p>
      </section>

      <div className="pt-8">
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
