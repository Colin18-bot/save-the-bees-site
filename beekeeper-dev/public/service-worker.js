// public/service-worker.js
// Minimal, no-op service worker: no offline caching, no route handling.

self.addEventListener("install", () => {
  // Optional: console.log("BeezKnees SW installed");
  // self.skipWaiting();
});

self.addEventListener("activate", () => {
  // Optional: console.log("BeezKnees SW activated");
  // clients.claim();
});

// No fetch handler: this SW does not intercept or cache network requests.