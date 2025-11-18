// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../services/auth";
import { supabase } from "../services/supabase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, send to dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) navigate("/dashboard");
    };
    checkUser();
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const isPasswordValid = (pw) => ({
    length: pw.length >= 8,
    lowercase: /[a-z]/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    special: /[\W_]/.test(pw),
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const criteria = isPasswordValid(password);
    const allValid = Object.values(criteria).every(Boolean);
    if (!allValid) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      // 1) Create auth user
      //    IMPORTANT: registerUser should return the full `data` from supabase.auth.signUp
      //    e.g. { user, session }
      const signUpData = await registerUser(email, password);

      // Prefer the session returned by signUp (most reliable)
      let session = signUpData?.session || null;
      let userId = signUpData?.user?.id || null;

      // Fallback: read session once (covers rare race where storage isn't populated yet)
      if (!session) {
        const { data: sessData } = await supabase.auth.getSession();
        session = sessData?.session || null;
      }
      if (session && !userId) userId = session.user.id;

      // If we have a session, we can upsert the profile now
      if (session && userId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            [{
              user_id: userId,
              email,
              subscription_level: "free",
              updated_at: new Date().toISOString(),
            }],
            { onConflict: "user_id" }
          );
        if (profileError) throw profileError;

        // Sign out so the next step is a proper login
        await supabase.auth.signOut();

        // Redirect to Login with success message
        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect") || "/login";
        navigate(redirect, { state: { successMessage: "Registration successful. Please log in." } });
        return;
      }

      // No session visible yet — don't block the user.
      // Just go to Login with success message (profile can be created after first login if needed).
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect") || "/login";
      navigate(redirect, { state: { successMessage: "Registration successful. Please log in." } });

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    }
  };

  const criteria = isPasswordValid(password);

  return (
    <div className="relative max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg border border-gray-100">
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
        onClick={() => (window.location.href = "https://www.beezknees.co.uk")}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Register</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 px-3 py-2 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            className={`w-full border px-3 py-2 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              password && !Object.values(criteria).every(Boolean) ? "border-red-500" : "border-gray-300"
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <ul className="text-sm mt-2 space-y-1">
            <li className="flex items-center">
              {criteria.length ? <FaCheckCircle className="text-green-600 mr-2" /> : <FaTimesCircle className="text-gray-400 mr-2" />}
              Minimum 8 characters
            </li>
            <li className="flex items-center">
              {criteria.lowercase ? <FaCheckCircle className="text-green-600 mr-2" /> : <FaTimesCircle className="text-gray-400 mr-2" />}
              At least one lowercase letter
            </li>
            <li className="flex items-center">
              {criteria.uppercase ? <FaCheckCircle className="text-green-600 mr-2" /> : <FaTimesCircle className="text-gray-400 mr-2" />}
              At least one uppercase letter
            </li>
            <li className="flex items-center">
              {criteria.number ? <FaCheckCircle className="text-green-600 mr-2" /> : <FaTimesCircle className="text-gray-400 mr-2" />}
              At least one number
            </li>
            <li className="flex items-center">
              {criteria.special ? <FaCheckCircle className="text-green-600 mr-2" /> : <FaTimesCircle className="text-gray-400 mr-2" />}
              At least one special character
            </li>
          </ul>
        </div>

        <div>
          <label className="block font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 rounded bg-blue-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 shadow">
          Register
        </button>

        <p className="text-sm text-center mt-2">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
        <p className="text-sm text-center mt-6">
          Curious what’s included? <a href="/pricing" className="text-blue-600 hover:underline">Compare Plans</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
