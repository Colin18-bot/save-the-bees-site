// Sends a page_view to GA on client-side route changes (React Router).
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { canUse } from "./CookieConsent";

export default function GAReporter() {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag || !canUse("analytics")) return;
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}
