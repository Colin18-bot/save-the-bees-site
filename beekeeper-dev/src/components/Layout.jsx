// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import bannerImage from "../assets/banner.jpg";
import { supabase } from "../services/supabase";

// ✅ Legal/consent
import AnalyticsGate from "../pages/Legal/AnalyticsGate";
import GAReporter from "../pages/Legal/GAReporter";   // ← NEW
import CookieBanner from "../pages/Legal/CookieBanner";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Initial fetch
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (!alive) return;
      if (profile) {
        if (profile.display_name) {
          setDisplayName(profile.display_name);
          document.title = `BeezKnees – Welcome ${profile.display_name}`;
        }
        if (profile.avatar_url) {
          const bust = `${profile.avatar_url}${
            profile.avatar_url.includes("?") ? "&" : "?"
          }v=${Date.now()}`;
          setAvatarUrl(bust);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 🔔 Listen for Settings broadcasts (instant Navbar refresh)
  useEffect(() => {
    const onProfileUpdated = (e) => {
      const detail = e?.detail || {};

      // Update avatar even if it's null/empty (clears cached image)
      if ("avatar_url" in detail) {
        const raw = detail.avatar_url;
        if (raw) {
          const busted = `${raw}${raw.includes("?") ? "&" : "?"}v=${Date.now()}`;
          setAvatarUrl(busted);
        } else {
          setAvatarUrl("");
        }
      }

      // Update display name; allow clearing to empty string
      if ("display_name" in detail) {
        const name = detail.display_name || "";
        setDisplayName(name);
        if (name) {
          document.title = `BeezKnees – Welcome ${name}`;
        }
      }
    };

    window.addEventListener("profile:updated", onProfileUpdated);
    return () => window.removeEventListener("profile:updated", onProfileUpdated);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-yellow-500">
      {/* ✅ Loads GA only if the user has granted analytics consent */}
      <AnalyticsGate />
      <GAReporter /> {/* ← NEW: reports page_view on route changes when analytics is allowed */}

      <NavBar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Backdrop Blur when Sidebar is open on mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Gold strip on the left */}
        <div className="w-12 bg-yellow-500 hidden md:block" />

        {/* Sidebar */}
        <div
          className={`fixed md:static top-0 left-0 z-40 w-64 bg-[#1a3329] text-white rounded-l-2xl overflow-y-auto scrollbar-none transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0 h-screen" : "-translate-x-full"
          } md:translate-x-0 md:h-auto`}
        >
          <Sidebar setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Banner */}
          <div className="relative z-0">
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full h-[350px] object-cover"
            />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-4 overflow-auto bg-white z-10">
            {children}
          </main>
        </div>
      </div>

      {/* Bottom strip */}
      <footer className="bg-yellow-500 h-16 w-full" />

      {/* Cookie banner mounted once, globally */}
      <CookieBanner />
    </div>
  );
};

export default Layout;
