// src/pages/Legal/Terms.jsx
import React from "react";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Terms of Use</h2>
      <p className="text-gray-600">
        <strong>Effective date:</strong> 14 June 2025
      </p>

      {/* 1. Who we are */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">1. Who we are</h2>
        <p>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of the
          BeezKnees Members app (&quot;Service&quot;). References to &quot;BeezKnees&quot;,
          &quot;we&quot;, &quot;us&quot; or &quot;our&quot; in these Terms refer to the operator of the
          Service.
        </p>
        <p>
          If you have any questions about these Terms, please contact{" "}
          <a
            href="/contact"
            className="underline text-amber-700"
            title="Open the members contact form"
          >
            BeezKnees
          </a>.
        </p>
      </section>

      {/* 2. Acceptance of these Terms */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">2. Acceptance of these Terms</h2>
        <p>
          By creating an account, logging in, or otherwise using the Service, you
          agree to be bound by these Terms. If you do not agree, you must not use
          the Service.
        </p>
        <p>
          We may update these Terms from time to time. We will post the updated
          version on this page with an updated effective date. Your continued use
          of the Service after changes have been made means you accept the revised
          Terms.
        </p>
      </section>

      {/* 3. Eligibility and age */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">3. Eligibility and age</h2>
        <p>
          The Service is intended for users aged 16 or over. By using the Service,
          you confirm that you are at least 16 years old and have the legal
          capacity to enter into these Terms.
        </p>
        <p>
          We do not knowingly collect personal data from children. For more
          information, please see our{" "}
          <a href="/legal/privacy" className="underline text-amber-700">
            Privacy Policy
          </a>.
        </p>
      </section>

      {/* 4. Accounts and security */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">4. Accounts and security</h2>
        <p>
          To use most features of the Service, you must create an account and keep
          your login details secure. You are responsible for all activity that
          occurs under your account.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Keep your password confidential and do not share it with others.</li>
          <li>
            Notify us promptly if you suspect any unauthorised access to your
            account.
          </li>
          <li>
            Ensure that your registration information is accurate and kept up to
            date.
          </li>
        </ul>
      </section>

      {/* 5. Subscriptions, billing and cancellation */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">
          5. Subscriptions, billing and cancellation
        </h2>
        <p>
          The Service offers a free plan and an optional paid subscription plan
          (&quot;Premium&quot;). Details of current pricing and features are shown on the
          Pricing page within the app.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Payments are processed securely by Stripe. BeezKnees does not store
            full card details.
          </li>
          <li>
            Premium subscriptions automatically renew at the end of each billing
            period unless you cancel through the Billing or account settings
            managed by Stripe.
          </li>
          <li>
            Cancelling stops future renewals but you will normally retain access to
            Premium features until the end of the current billing period.
          </li>
        </ul>
        <p>
          Any additional subscription terms (for example, trial periods or
          promotions) will be clearly presented at the time of sign-up.
        </p>
      </section>

      {/* 6. Use of the Service (no professional advice) */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">
          6. Use of the Service (no professional advice)
        </h2>
        <p>
          The Service is intended as a tool to help you record, organise and
          manage your beekeeping activities. It does not provide veterinary,
          legal, or professional beekeeping advice.
        </p>
        <p>
          You remain responsible for your own beekeeping decisions, compliance
          with local laws and regulations, and for seeking professional advice
          where necessary. BeezKnees is not responsible for any loss or damage
          arising from how you choose to act on information stored in or presented
          by the Service.
        </p>
      </section>

      {/* 7. User content (photos, notes, inspection data) */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">
          7. User content (photos, notes and inspection data)
        </h2>
        <p>
          You may upload or create content within the Service, including but not
          limited to apiary locations, hive details, inspection records, logbook
          entries, tasks, and photos (&quot;User Content&quot;).
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You retain ownership of your User Content.</li>
          <li>
            You grant BeezKnees a limited licence to store and process your User
            Content solely for the purposes of operating the Service.
          </li>
          <li>
            You are responsible for ensuring that your User Content does not
            infringe the rights of any third party and does not contain unlawful or
            inappropriate material.
          </li>
        </ul>
        <p>
          We may remove or restrict User Content that we reasonably believe is
          unlawful, offensive, or in breach of these Terms.
        </p>
      </section>

      {/* 8. Acceptable use */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">8. Acceptable use</h2>
        <p>
          You agree not to use the Service in any way that is unlawful, harmful,
          or may damage our reputation or impair the availability or security of
          the Service.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Do not attempt to gain unauthorised access to the Service.</li>
          <li>
            Do not use the Service to store or transmit malicious code, spam, or
            other harmful material.
          </li>
          <li>
            Do not reverse engineer, decompile or otherwise attempt to extract the
            source code of the Service except to the extent permitted by law.
          </li>
          <li>
            Do not use the Service in a way that infringes the rights of others or
            violates applicable law.
          </li>
        </ul>
      </section>

      {/* 9. Third-party services */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">9. Third-party services</h2>
        <p>
          The Service relies on third-party providers, including but not limited
          to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Supabase (authentication, database, storage)</li>
          <li>Stripe (payments and billing)</li>
          <li>Google Analytics (optional usage analytics)</li>
          <li>LocationIQ and OpenStreetMap (geocoding and map tiles)</li>
          <li>
            Weather API providers (forecast, warning and pollen data fetched using
            your apiary coordinates)
          </li>
        </ul>
        <p>
          Your use of those third-party services may be subject to their own terms
          and privacy policies. We are not responsible for the availability,
          security, or accuracy of third-party services.
        </p>
      </section>

      {/* 10. Availability and changes to the Service */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">
          10. Availability and changes to the Service
        </h2>
        <p>
          We aim to keep the Service available and running smoothly, but we do not
          guarantee uninterrupted or error-free operation. The Service may be
          suspended or limited from time to time for maintenance, updates or for
          other reasons.
        </p>
        <p>
          We may add, change or remove features over time. Where such changes are
          significant, we will endeavour to give reasonable notice within the
          app or on our website.
        </p>
      </section>

      {/* 11. Viruses, security and your equipment */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">
          11. Viruses, security and your equipment
        </h2>
        <p>
          We take reasonable steps to keep the Service secure and free from known
          vulnerabilities, but we cannot guarantee that it will be free from bugs,
          viruses, or other harmful components.
        </p>
        <p>
          You are responsible for configuring your devices and software to access
          the Service, including using your own virus protection and security
          measures. To the fullest extent permitted by law, BeezKnees is not
          responsible for any loss or damage caused by viruses, malware, or
          security issues that may affect your equipment, software or data as a
          result of using the Service or downloading content from it.
        </p>
      </section>

      {/* 12. Limitation of liability */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">12. Limitation of liability</h2>
        <p>
          Nothing in these Terms excludes or limits liability where it would be
          unlawful to do so, including liability for death or personal injury
          caused by negligence, or for fraud or fraudulent misrepresentation.
        </p>
        <p>
          Subject to the above, and to the fullest extent permitted by law:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            BeezKnees is not liable for any indirect, consequential or special
            loss, or for loss of profits, revenue, data, goodwill or business
            opportunities.
          </li>
          <li>
            BeezKnees is not liable for any loss or damage resulting from your
            reliance on data stored in the Service, including inspection records,
            hive data or reminders.
          </li>
          <li>
            If we are found liable for any claim arising out of or in connection
            with the Service, our total aggregate liability will be limited to the
            amount you have paid to us for the Service in the 12 months preceding
            the event giving rise to the claim (or £0 if you are on the free plan).
          </li>
        </ul>
      </section>

      {/* 13. Suspension and termination */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">13. Suspension and termination</h2>
        <p>
          We may suspend or terminate your access to the Service if you materially
          breach these Terms, use the Service in an unlawful or abusive way, or if
          we are required to do so by law or by a third-party provider (for
          example, where your payment method is invalid or cancelled).
        </p>
        <p>
          You may stop using the Service at any time, and you can delete your
          account through the app or by contacting{" "}
          <a
            href="/contact"
            className="underline text-amber-700"
            title="Open the members contact form"
          >
            BeezKnees
          </a>.
        </p>
      </section>

      {/* 14. Governing law and jurisdiction */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">
          14. Governing law and jurisdiction
        </h2>
        <p>
          These Terms, and any dispute or claim arising out of or in connection
          with them or the Service, are governed by the laws of England and Wales.
        </p>
        <p>
          If you are a consumer resident in the UK, you may also have rights to
          bring claims in the courts of your home jurisdiction. If you access the
          Service from outside the UK, you are responsible for compliance with
          local laws where they apply.
        </p>
      </section>

      {/* 15. Contact */}
      <section className="space-y-3 mt-6">
        <h2 className="text-lg font-semibold">15. Contact</h2>
        <p>
          If you have any questions about these Terms or the Service, please
          contact{" "}
          <a
            href="/contact"
            className="underline text-amber-700"
            title="Open the members contact form"
          >
            BeezKnees
          </a>.
        </p>
      </section>
    </div>
  );
}
