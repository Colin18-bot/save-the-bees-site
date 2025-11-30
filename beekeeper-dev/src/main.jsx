// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AnalyticsGate from "./pages/Legal/AnalyticsGate.jsx";
import "./index.css";

// Only enable AnalyticsGate when:
// - we are in production, AND
// - a GA measurement ID is configured
const enableAnalytics =
  import.meta.env.PROD && !!import.meta.env.VITE_GA_MEASUREMENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {enableAnalytics && <AnalyticsGate />}
    <App />
  </React.StrictMode>
);

// Minimal PWA: register a no-op service worker in production only
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  });
}
