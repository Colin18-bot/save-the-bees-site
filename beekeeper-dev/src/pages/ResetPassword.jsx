import React, { useState } from "react";
import { supabase } from "../services/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [criteria, setCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRequirements.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    const { error: emailError } = await supabase.functions.invoke("send-password-changed-email");

    if (emailError) {
      console.error("Password changed email failed:", emailError);

      setMessage(
        "Password reset successful. You can now log in. The confirmation email could not be sent."
      );
      return;
    }

    setMessage(
      "Password reset successful. A confirmation email has been sent. You can now log in."
    );
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setCriteria({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[\W_]/.test(value),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        onClick={() => (window.location.href = "https://www.beezknees.co.uk")}
        aria-label="Close"
      >
        &times;
      </button>
      <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block font-medium" htmlFor="new-password">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            placeholder="Enter a secure password"
            title="At least 8 characters, with uppercase, lowercase, number, and special character"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />
          <ul className="text-sm mt-2 ml-2">
            <li className={criteria.length ? "text-green-600" : "text-gray-500"}>
              ✔️ At least 8 characters
            </li>
            <li className={criteria.upper ? "text-green-600" : "text-gray-500"}>
              ✔️ One uppercase letter
            </li>
            <li className={criteria.lower ? "text-green-600" : "text-gray-500"}>
              ✔️ One lowercase letter
            </li>
            <li className={criteria.number ? "text-green-600" : "text-gray-500"}>✔️ One number</li>
            <li className={criteria.special ? "text-green-600" : "text-gray-500"}>
              ✔️ One special character
            </li>
          </ul>
        </div>
        <div>
          <label className="block font-medium" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            className="w-full border px-3 py-2 rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
