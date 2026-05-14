import React from "react";
import { Link } from "react-router-dom";

export default function ContactSent() {
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow text-center">
      <h2 className="text-2xl font-bold text-green-800 mb-3">Thanks — message sent!</h2>
      <p className="text-gray-600 mb-6">
        We’ve received your message and will get back to you via email.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/contact"
          className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          Send another
        </Link>
      </div>
    </div>
  );
}
