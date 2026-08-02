import React from "react";

export default function PrivacyPolicy() {
  return (
    <div id="top" className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Privacy Policy</h2>
      <p className="text-gray-600">
        <strong>Effective date:</strong> 1 August 2026
      </p>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">Who we are (Data Controller)</h2>
        <p>
          BeezKnees (“we”, “us”) is the Data Controller for HiveTag by BeezKnees. Contact:{" "}
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
            <strong>Account &amp; Authentication</strong> via Supabase (email, password, session
            tokens).
          </li>
          <li>
            <strong>App data you add</strong> (apiaries including optional lat/lng, hives including
            optional photos &amp; NFC tag IDs, inspections, logbook entries, tasks/to-dos).
          </li>
          <li>
            <strong>Billing &amp; orders</strong> when you upgrade your plan or buy HiveTag NFC
            labels. Payments are processed by Stripe (for example, name, email, billing and shipping
            details). We do not store full card numbers on our servers.
          </li>
          <li>
            <strong>Analytics</strong> (optional, if you consent) via Google Analytics (page views,
            device, usage).
          </li>
          <li>
            <strong>Geocoding</strong> via LocationIQ; <strong>map tiles</strong> via OpenStreetMap
            providers.
          </li>
          <li>
            <strong>Weather lookups</strong> using your saved apiary coordinates and dates to
            request forecasts, pollen levels and warnings from a third-party weather API. We do not
            send your name, email or payment details with these requests.
          </li>
          <li>
            <strong>Support</strong> communications if you contact us (for example, your name, email
            and the contents of your message).
          </li>
          <li>
            <strong>Email communications</strong> sent through Brevo, including your name, email
            address, communication preferences and email delivery information, such as delivery
            status, bounces and unsubscribes. Where enabled, this may also include information about
            email opens and link clicks.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Provide core features (save and display your apiaries, hives, inspections, logbook
            entries and tasks).
          </li>
          <li>Authenticate you and keep your account secure (Supabase Auth).</li>
          <li>Process subscriptions and manage billing (Stripe).</li>
          <li>
            Process and deliver physical orders you place (for example, HiveTag NFC labels),
            including necessary shipping details handled by Stripe.
          </li>
          <li>Show place names for coordinates (LocationIQ) and maps (OpenStreetMap).</li>
          <li>
            Show weather forecasts, warnings and pollen levels for your apiaries, using their saved
            coordinates and a third-party weather provider.
          </li>
          <li>Improve the service via aggregated analytics (Google Analytics, if you consent).</li>
          <li>
            Provide support and send essential account and service-related communications, including
            account, subscription, payment and cancellation emails.
          </li>
          <li>Manage email delivery and communication preferences using Brevo.</li>
          <li>
            Send product news, feature updates and marketing communications where you have consented
            or where otherwise permitted by law.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">3. Lawful Bases</h2>

        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Contract</strong> — to create and manage your account, provide the HiveTag
            features you request, process subscriptions, fulfil physical product orders and send
            essential account, billing and service communications.
          </li>

          <li>
            <strong>Consent</strong> — for optional analytics cookies and marketing communications
            where consent is required. You can withdraw your consent at any time.
          </li>

          <li>
            <strong>Legitimate interests</strong> — to administer and secure the Service, prevent
            fraud, respond to support requests, improve email delivery and, where permitted by law,
            communicate with existing customers about similar HiveTag products or services.
          </li>

          <li>
            <strong>Legal obligation</strong> — to maintain records and comply with tax, accounting,
            consumer protection and other legal requirements.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">4. Cookies &amp; Analytics</h2>
        <p>
          We use essential cookies/local storage to keep you signed in and run the app. Optional
          analytics cookies (Google Analytics) are used only if you consent. Manage your preferences
          any time on the{" "}
          <a href="/legal/cookies" className="underline text-amber-700">
            Cookie Settings
          </a>{" "}
          page.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Essential</strong>: required for authentication and core features.
          </li>
          <li>
            <strong>Analytics (optional)</strong>: Google Analytics to understand app usage.
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">4A. Email Communications</h2>

        <p>
          We use Brevo to send transactional, service and marketing emails. Transactional and
          service emails may include account verification, password reset, subscription
          confirmation, payment failure, cancellation, security and other important information
          about your account or the Service.
        </p>

        <p>
          Marketing emails may include product news, feature announcements, offers and other
          promotional information. We send marketing emails only where you have consented or where
          they are otherwise permitted by applicable law.
        </p>

        <p>
          You can unsubscribe from marketing emails at any time by using the unsubscribe link
          included in those emails. Unsubscribing from marketing will not prevent us from sending
          essential account, billing, security or service communications.
        </p>
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
              href="https://www.brevo.com/legal/privacypolicy/"
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-700"
            >
              Brevo
            </a>{" "}
            (transactional and service emails, marketing communications, contact management and
            email delivery reporting)
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
            (billing, payment processing and order handling for subscriptions and NFC tag sales)
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
          <li>
            Weather API providers (currently a third-party forecast service used to fetch weather,
            pollen and warning data using your apiary coordinates; no names, emails or card details
            are sent).
          </li>
        </ul>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">6. NFC Tags</h2>
        <p>
          If you link an NFC tag UID to a hive, the UID is stored with that hive record to speed up
          lookups on supported devices (for example, when you tap a HiveTag NFC label and open the
          relevant hive or start a new inspection). The tag UID itself is not used for location
          tracking or behavioural profiling and is not shared with third parties. You can remove a
          tag from a hive at any time in the NFC Tag Manager.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">7. International Transfers</h2>

        <p>
          Some of our service providers, including their approved subprocessors, may process
          personal data outside the United Kingdom. Where personal data is transferred
          internationally, we use or rely on appropriate safeguards required by data protection law,
          such as adequacy regulations or approved contractual safeguards.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">8. Data Security</h2>
        <p>
          Data is stored in Supabase Postgres with Row Level Security (RLS) so each user can only
          access their own data. Photos are stored in Supabase Storage with access policies.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">9. Your Rights</h2>
        <p>
          You have rights under UK data protection law, including access, rectification, erasure,
          restriction, data portability, and objection. Where processing is based on consent, you
          may withdraw consent at any time in{" "}
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
          If you are unhappy with how we handle your data, you can complain to the UK Information
          Commissioner’s Office (ICO):{" "}
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
          We retain your account and HiveTag data while your account remains active. Cancelling a
          Premium subscription does not automatically delete your account or the information stored
          within it.
        </p>

        <p>
          If you delete your account, we will delete or anonymise your personal data, subject to any
          limited information that we must retain for billing, tax, fraud prevention, dispute
          resolution or other legal requirements.
        </p>

        <p>
          Email delivery records and communication logs are retained only for as long as reasonably
          necessary to operate the Service, investigate delivery problems, deal with support
          requests and demonstrate compliance. If you unsubscribe from marketing, we may retain your
          email address on a suppression list so that your preference continues to be respected.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">11. Children’s Data</h2>
        <p>
          This Service is intended for users aged 16 years or over. We do not knowingly collect
          personal data from anyone under the age of 16. We do not knowingly collect data from
          children.
        </p>
      </section>

      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">12. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted here with an updated
          effective date.
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
    </div>
  );
}
