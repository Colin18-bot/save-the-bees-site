// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/auth";
import { supabase } from "../services/supabase";
import googleIcon from "../assets/google-icon.svg";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectMessage, setRedirectMessage] = useState("");

  // If already logged in, go where they intended or to /dashboard
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const params = new URLSearchParams(location.search);
        const redirect = params.get("redirect") || "/dashboard";
        navigate(redirect, { replace: true });
      }
    };
    checkSession();
  }, [navigate, location.search]);

  // Show one-time messages from navigation state
  useEffect(() => {
    const state = location.state || {};
    if (state.successMessage) setSuccessMessage(state.successMessage);
    if (state.showLoginRequired) {
      setRedirectMessage("You must be logged in to access that page.");
    }
    // Clear the state so messages don't persist on back/forward
    if (state.successMessage || state.showLoginRequired) {
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const isValidEmail = (value) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { user } = await loginUser(email, password);
      if (!user) throw new Error("No user returned from authentication.");

      // Ensure a profile exists (create if missing)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        const { error: createErr } = await supabase.from("profiles").insert({
          user_id: user.id,
          email, // from form state
          subscription_level: "free",
          updated_at: new Date().toISOString(),
        });
        if (createErr) throw createErr;
        localStorage.setItem("subscription_level", "free");
      } else {
        localStorage.setItem(
          "subscription_level",
          profile.subscription_level ?? "free"
        );
      }

      // Respect ?redirect=... if present
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect") || "/dashboard";
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // Ensure we land back on the Login page in this app
      options: { redirectTo: window.location.origin + "/login" },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="relative max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg border border-gray-100">
      {/* Close Button */}
      <a
        href="https://www.beezknees.co.uk"
        className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
        aria-label="Close and return to main site"
      >
        ×
      </a>

      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Sign In</h2>

      {redirectMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {redirectMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            className={`w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
              email && !isValidEmail(email) ? "border-red-500" : "border-gray-300"
            } bg-blue-50`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g. john.doe@example.com"
          />
          {email && !isValidEmail(email) && (
            <p className="text-sm text-red-500 mt-1">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <p className="text-sm text-gray-500 mt-1">
            Must be at least 8 characters with uppercase, lowercase, number, and symbol.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 shadow"
        >
          Login
        </button>
      </form>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-[#4285F4] text-white py-2 rounded flex items-center justify-center gap-3 shadow hover:bg-[#357ae8] transition"
        >
          <img
            src={googleIcon}
            alt="Google"
            className="w-5 h-5 bg-white rounded"
          />
          Sign in with Google
        </button>
      </div>

      <div className="text-sm text-center mt-6 space-y-2">
        <p>
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Reset it here
          </a>
        </p>
        <p>
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Create one here
          </a>
        </p>
        <p className="text-sm text-center mt-6 space-y-2">
          Curious what’s included?{" "}
          <a href="/pricing" className="text-blue-600 hover:underline">
            Compare Plans
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
