// src/pages/Contact.jsx
import React from "react";

export default function Contact() {
  // Dev-only: avoid POST 404 on localhost by navigating to /contact/sent
  const handleSubmit = (e) => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      e.preventDefault();
      // optional: emulate a tiny delay so it "feels" like submitting
      setTimeout(() => {
        window.location.assign("/contact/sent");
      }, 50);
    }
    // In production (Netlify), do nothing: Netlify will process the POST
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Contact BeezKnees</h1>
      <p className="text-sm text-gray-600 mb-6">
        Questions, feedback, or a quick hello—drop us a note below and we’ll get back to you.
      </p>

      {/* Netlify Forms:
         - keep method=POST + data-netlify for production handling
         - action=/contact/sent is your thank-you route (you already have it)
         - onSubmit handler only reroutes on localhost to avoid POST 404s
      */}
      <form
        name="member-contact"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        action="/contact/sent"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Required for Netlify to process */}
        <input type="hidden" name="form-name" value="member-contact" />

        {/* Honeypot (invisible to humans) */}
        <div className="hidden">
          <label>
            Don’t fill this out if you’re human:{" "}
            <input name="bot-field" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Your name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full border rounded px-3 py-2 bg-blue-50"
            placeholder="Jane Beekeeper"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Your email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border rounded px-3 py-2 bg-blue-50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Subject</label>
          <input
            name="subject"
            type="text"
            className="w-full border rounded px-3 py-2 bg-blue-50"
            placeholder="How do I…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            name="message"
            rows="5"
            required
            className="w-full border rounded px-3 py-2 bg-blue-50"
            placeholder="Tell us what’s up…"
          />
        </div>

        {/* ✅ Updated green button */}
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-3 py-2 rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-green-500
                     disabled:opacity-50"
        >
          Send message
        </button>

        <p className="text-xs text-gray-500">
          We’ll reply to the email you provided.
        </p>
      </form>
    </div>
  );
}
