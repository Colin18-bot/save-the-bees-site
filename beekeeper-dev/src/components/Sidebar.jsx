// src/components/Sidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

// APP_VERSION=1.2.3
const APP_VERSION = "1.0.2";

const Sidebar = ({ setIsMobileMenuOpen }) => {
  const [quickCreateOpen, setQuickCreateOpen] = useState(true);
  const [bizQuickCreateOpen, setBizQuickCreateOpen] = useState(true);
  const [subscriptionLevel, setSubscriptionLevel] = useState(
    () => localStorage.getItem("subscription_level") || "free"
  );

  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    alert("You have been logged out successfully.");
    navigate("/login");
  };

  // Fetch fresh plan from Supabase and sync to localStorage
  const refreshPlan = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubscriptionLevel("free");
      localStorage.setItem("subscription_level", "free");
      return;
    }
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("user_id", user.id)
      .maybeSingle();

    const next = profile?.subscription_level || "free";
    if (!error) {
      setSubscriptionLevel(next);
      localStorage.setItem("subscription_level", next);
    }
  }, []);

  useEffect(() => {
    // 1) On mount
    refreshPlan();

    // 2) When auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshPlan();
    });

    // 3) If other tabs/windows update localStorage
    const onStorage = (e) => {
      if (e.key === "subscription_level" && e.newValue) {
        setSubscriptionLevel(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      sub?.subscription?.unsubscribe?.();
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshPlan]);

  const userIsPremium = subscriptionLevel === "premium";

  // Core (beekeeping) navigation
  const coreTopNavItems = [
    // Upgrade button (only if not premium)
    ...(!userIsPremium
      ? [{ to: "/pricing", label: "Upgrade Plan", highlight: true }]
      : []),
    // Dashboard always shown
    { to: "/dashboard", label: "Dashboard" },
  ];

  const coreSecondaryNavItems = [
    { to: "/apiaries", label: "Apiaries" },
    { to: "/hives", label: "Hives" },
    { to: "/inspections", label: "Inspections" },
    { to: "/logbook", label: "Hive Logbook" },
    { to: "/todos", label: "Tasks" },
    { to: "/calendar", label: "Calendar" },
    { to: "/weather", label: "Weather" },
    { to: "/settings", label: "Settings" },
    { to: "/archive", label: "Archive" },
    { to: "/help", label: "Help" },
  ];

  const coreQuickCreate = [
    { to: "/apiaries/new", label: "New Apiary" },
    { to: "/hives/new", label: "New Hive" },
    { to: "/inspections/new", label: "New Inspection" },
    { to: "/logbook/new", label: "New Log Entry" },
    { to: "/todos/new", label: "New Task" },
  ];

  const businessListLinks = [
    { to: "/inventory", label: "Inventory" },
    { to: "/sales", label: "Sales" },
    { to: "/finance/expenses", label: "Expenses" },
    { to: "/reports/pnl", label: "Profit & Loss" },
    { to: "/reports/print", label: "Reports" },
  ];

  const businessQuickCreate = [
    { to: "/inventory/new", label: "New Inventory" },
    { to: "/sales/new", label: "New Sale" },
    { to: "/finance/expenses/new", label: "New Expense" },
  ];

  const SectionTitle = ({ children }) => (
    <div className="mt-6 mb-2 px-2 text-xs font-semibold text-yellow-300 uppercase tracking-wider opacity-90">
      {children}
    </div>
  );

  const LinkItem = ({ item }) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={handleLinkClick}
      className={({ isActive }) =>
        `block px-4 py-2 rounded text-sm font-medium transition-colors duration-150 ${
          item.highlight
            ? "bg-orange-400 text-[#1a3329] font-bold border border-white"
            : isActive
            ? "bg-yellow-400 text-[#1a3329]"
            : "text-white hover:bg-yellow-400 hover:text-[#1a3329]"
        }`
      }
    >
      {item.label}
    </NavLink>
  );

  return (
    <div className="w-64 bg-[#1a3329] h-full flex flex-col pt-10 px-4 pb-4">
      <nav className="flex flex-col gap-1">
        <SectionTitle>Beekeeping</SectionTitle>

        {/* Upgrade Plan + Dashboard at the top */}
        {coreTopNavItems.map((item) => (
          <LinkItem key={item.to} item={item} />
        ))}

        {/* Beekeeping Quick Create directly under Dashboard */}
        <button
          onClick={() => setQuickCreateOpen(!quickCreateOpen)}
          className="w-full text-left mt-2 mb-1 px-2 py-1 text-xs font-semibold text-yellow-300 uppercase tracking-wider hover:text-yellow-400"
        >
          Quick Create {quickCreateOpen ? "▼" : "▶"}
        </button>
        {quickCreateOpen && (
          <div className="flex flex-col gap-1 bg-[#1a3329]">
            {coreQuickCreate.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-yellow-400 text-[#1a3329]"
                      : "text-white hover:bg-yellow-400 hover:text-[#1a3329]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Divider between quick create and the rest of the beekeeping links */}
        <div className="my-4 border-t border-white/20" />

        {/* Remaining beekeeping links: Apiaries, Hives, Inspections, etc. */}
        {coreSecondaryNavItems.map((item) => (
          <LinkItem key={item.to} item={item} />
        ))}

        <div className="my-4 border-t border-white/20" />

        {/* Business Quick Create ABOVE Inventory & Finance heading */}
        <button
          onClick={() => setBizQuickCreateOpen(!bizQuickCreateOpen)}
          className="w-full text-left mt-2 mb-1 px-2 py-1 text-xs font-semibold text-yellow-300 uppercase tracking-wider hover:text-yellow-400"
        >
          Quick Create {bizQuickCreateOpen ? "▼" : "▶"}
        </button>
        {bizQuickCreateOpen && (
          <div className="flex flex-col gap-1 bg-[#1a3329]">
            {businessQuickCreate.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-yellow-400 text-[#1a3329]"
                      : "text-white hover:bg-yellow-400 hover:text-[#1a3329]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Inventory & Finance heading + links */}
        <SectionTitle>Inventory &amp; Finance</SectionTitle>
        {businessListLinks.map((item) => (
          <LinkItem key={item.to} item={item} />
        ))}
      </nav>

      <div className="pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className="block w-full px-4 py-2 rounded text-sm font-medium transition-colors duration-150 text-white bg-orange-600 hover:bg-orange-700"
        >
          Log Out
        </button>

        <div className="mt-4 text-xs text-yellow-400 text-center space-y-1">
          <NavLink
            to="/legal/privacy"
            onClick={handleLinkClick}
            className="hover:underline block"
          >
            Privacy Policy
          </NavLink>
          <NavLink
            to="/legal/cookies"
            onClick={handleLinkClick}
            className="hover:underline block"
          >
            Cookie Settings
          </NavLink>
          <NavLink
            to="/contact"
            onClick={handleLinkClick}
            className="hover:underline block"
          >
            Contact
          </NavLink>
        </div>

        <div className="mt-4 text-xs text-yellow-400 text-center">
          <p>
            Plan:{" "}
            {subscriptionLevel.charAt(0).toUpperCase() +
              subscriptionLevel.slice(1)}
          </p>
          <p className="mt-1">© {new Date().getFullYear()} BeezKnees</p>
          <p>All rights reserved.</p>
        </div>

        <div className="mt-6 pt-3 border-t border-white/10 text-[11px] text-yellow-300/90 text-center">
          <p
            className="font-mono tracking-wide"
            aria-label="Application version"
          >
            Version {APP_VERSION}
          </p>
          <NavLink
            to="/updates"
            onClick={handleLinkClick}
            className="block mt-1 hover:underline"
          >
            Release notes
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
