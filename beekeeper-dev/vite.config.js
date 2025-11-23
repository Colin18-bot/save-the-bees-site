// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Dev on localhost uses "/", Netlify uses "/beekeeper-dev/"
  const isDev = mode === "development";
  const base = isDev ? "/" : "/beekeeper-dev/";

  return {
    // Vite rewrites all asset links with this base
    base,

    plugins: [
      react(),

      VitePWA({
        registerType: "autoUpdate",

        manifest: {
          name: "BeezKnees",
          short_name: "BeezKnees",
          description: "Smart Beekeeping Management Platform",

          // Use the computed base so PWA works under /beekeeper-dev/
          start_url: base,
          scope: base,

          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#1a3329",
          orientation: "portrait-primary",
          categories: ["productivity", "utilities", "beekeeping"],

          icons: [
            { src: "android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
            { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
            { src: "favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { src: "favicon-16x16.png", sizes: "16x16", type: "image/png" }
          ],

          shortcuts: [
            {
              name: "New Inspection",
              short_name: "Inspection",
              // Relative to scope, so this becomes "/beekeeper-dev/inspections/new" in prod
              url: "inspections/new",
              icons: [
                {
                  src: "android-chrome-192x192.png",
                  sizes: "192x192",
                  type: "image/png"
                }
              ]
            },
            {
              name: "To-Do List",
              short_name: "To-Do",
              url: "todos",
              icons: [
                {
                  src: "android-chrome-192x192.png",
                  sizes: "192x192",
                  type: "image/png"
                }
              ]
            }
          ]
        },

        workbox: {
          // SPA fallback at the correct base
          navigateFallback: `${base}index.html`
        }
      })
    ],

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false
    }
  };
});
