import React, { useState } from "react";
import { resetPassword } from "../services/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (email) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset link sent. Check your email.");
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg border border-gray-100">
      {/* Close button */}
      <a
        href="https://www.beezknees.co.uk/"
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
        aria-label="Close and return to main site"
      >
        ×
      </a>

      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Forgot Password</h2>

      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="e.g. name@example.com"
            className={`w-full bg-blue-50 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
              email && !isValidEmail(email) ? "border-red-500" : "border-gray-300"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {email && !isValidEmail(email) && (
            <p className="text-sm text-red-500 mt-1">Please enter a valid email address.</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 shadow"
        >
          Send Reset Link
        </button>
      </form>

      <p className="text-sm text-center mt-6">
        Remembered your password?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Back to Login
        </a>
      </p>
    </div>
  );
};

export default ForgotPassword;
