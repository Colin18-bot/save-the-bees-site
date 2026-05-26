// src/components/NavBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const NavBar = ({ isMobileMenuOpen, setIsMobileMenuOpen, displayName, avatarUrl }) => {
  const subscriptionLevel = localStorage.getItem("subscription_level") || "free";

  const planTooltip = {
    free: "You're on the Free plan. Upgrade to unlock full features.",
    standard: "You're on the Standard plan. Some limits may still apply.",
    premium: "You're on the Premium plan. All features unlocked.",
  };

  const planLabel =
    subscriptionLevel.charAt(0).toUpperCase() + subscriptionLevel.slice(1);

  const PlanBadge = () => (
    <span className="relative">
      <button
        onClick={(e) => {
          const tip = e.currentTarget.nextSibling;
          if (tip) tip.classList.toggle("hidden");
        }}
        className="text-xs bg-white border border-green-800 text-green-800 font-semibold px-2 py-0.5 rounded"
      >
        {planLabel}
      </button>
      <div
        className="hidden absolute z-10 bg-yellow-100 border border-green-800 text-green-900 text-xs px-3 py-2 rounded shadow max-w-[200px] mt-1 right-0"
        style={{ whiteSpace: "normal" }}
      >
        {planTooltip[subscriptionLevel]}
      </div>
    </span>
  );

  return (
    <nav className="bg-yellow-500 px-4 py-4">
      {/* Wrap contents so they line up with main content width */}
      <div className="max-w-6xl mx-auto">
        {/* Top row: logo + desktop nav + hamburger */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a
            href="https://beezknees.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <img
              src={logo}
              alt="HiveTag Logo"
              className="h-12 w-12 md:h-14 md:w-14"
            />
            <span className="text-green-800 text-xl font-bold">HiveTag by Beezknees</span>
          </a>

          {/* Desktop Navigation Links + Welcome + Avatar */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-green-900 hover:underline">
              Dashboard
            </a>
            <a href="/settings" className="text-green-900 hover:underline">
              Settings
            </a>
            <a href="/help" className="text-green-900 hover:underline">
              Help
            </a>

            {/* Welcome text and subscription badge */}
            {displayName && (
              <span className="text-green-900 font-semibold flex items-center gap-2">
                Welcome, {displayName}
                <PlanBadge />
              </span>
            )}

            {/* Avatar */}
            <Link
              to="/settings"
              aria-label="Open Settings"
              className="flex items-center"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName ? `${displayName}'s avatar` : "User avatar"}
                  className="w-14 h-14 rounded-full object-cover border border-green-900/20"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full bg-gray-300 border border-green-900/10"
                  title="Set your profile photo in Settings"
                />
              )}
            </Link>
          </div>

          {/* Hamburger Menu (Mobile) */}
          <button
            className="md:hidden text-green-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-9 h-9"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile: Welcome + Badge + Avatar on separate row */}
        {(displayName || avatarUrl) && (
          <div className="md:hidden mt-3 flex items-center justify-between gap-3">
            {displayName && (
              <span className="text-green-900 font-semibold flex items-center gap-2 text-sm">
                <span>Welcome, {displayName}</span>
                <PlanBadge />
              </span>
            )}
            <Link to="/settings" aria-label="Open Settings">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName ? `${displayName}'s avatar` : "User avatar"}
                  className="w-9 h-9 rounded-full object-cover border border-green-900/20"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full bg-gray-300 border border-green-900/10"
                  title="Set your profile photo in Settings"
                />
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
