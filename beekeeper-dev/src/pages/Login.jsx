// src/pages/Login.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/auth";
import { supabase } from "../services/supabase";
import { sendWelcomeEmail } from "../services/email.js";
import googleIcon from "../assets/google-icon.svg";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Only allow redirects to pages within this application
const getSafeRedirect = (search) => {
  const params = new URLSearchParams(search);
  const redirect = params.get("redirect");

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/dashboard";
  }

  return redirect;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectMessage, setRedirectMessage] = useState("");

  // Show/hide password state
  const [showPassword, setShowPassword] = useState(false);

  const completeLoginSetup = useCallback(async (user) => {
    if (!user?.id) {
      throw new Error("No authenticated user was found.");
    }

    const userEmail = user.email || "";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_level, welcome_email_sent_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    let subscriptionLevel = profile?.subscription_level ?? "free";

    if (!profile) {
      const { error: createError } = await supabase.from("profiles").insert({
        user_id: user.id,
        email: userEmail,
        subscription_level: "free",
        updated_at: new Date().toISOString(),
      });

      if (createError) {
        throw createError;
      }

      subscriptionLevel = "free";
    }

    localStorage.setItem("subscription_level", subscriptionLevel);

    /*
     * A Welcome-email failure must not prevent the user from logging in.
     * The Edge Function prevents the email being sent more than once.
     */
    if (!profile?.welcome_email_sent_at) {
      if (!profile?.welcome_email_sent_at) {
        try {
          const emailResult = await sendWelcomeEmail();
          console.log("Welcome email result:", emailResult);
        } catch (emailError) {
          console.error("Welcome email could not be sent:", emailError);
        }
      }
    }
  }, []);

  // Complete account setup after Google OAuth or for an existing session
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user || cancelled) {
          return;
        }

        await completeLoginSetup(session.user);

        if (!cancelled) {
          const redirect = getSafeRedirect(location.search);
          navigate(redirect, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Post-login setup failed:", err);

          setError(
            err.message ||
              "Your account was authenticated, but account setup could not be completed."
          );
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [completeLoginSetup, navigate, location.search]);

  // Show one-time messages from navigation state
  useEffect(() => {
    const state = location.state || {};

    if (state.successMessage) {
      setSuccessMessage(state.successMessage);
    }

    if (state.showLoginRequired) {
      setRedirectMessage("You must be logged in to access that page.");
    }

    // Clear the state so messages do not persist on back/forward
    if (state.successMessage || state.showLoginRequired) {
      navigate(location.pathname + location.search, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  const isValidEmail = (value) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { user } = await loginUser(email, password);

      if (!user) {
        throw new Error("No user returned from authentication.");
      }

      await completeLoginSetup(user);

      const redirect = getSafeRedirect(location.search);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    // Preserve the page the user originally requested
    const redirect = getSafeRedirect(location.search);

    const callbackUrl = `${window.location.origin}/login?redirect=${encodeURIComponent(redirect)}`;

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (googleError) {
      setError(googleError.message);
    }
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
            placeholder="e.g. name@example.com"
          />

          {email && !isValidEmail(email) && (
            <p className="text-sm text-red-500 mt-1">Please enter a valid email address.</p>
          )}
        </div>

        <div className="relative">
          <label className="block font-medium mb-1">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-blue-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          {/* Password eye icon */}
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>

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
          <img src={googleIcon} alt="Google" className="w-5 h-5 bg-white rounded" />
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
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Create one here
          </a>
        </p>

        <p>
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
