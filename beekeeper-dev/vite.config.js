// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // App is served from the root of beezknees-members.netlify.app
  base: '/',

  plugins: [
    react(),

    VitePWA({
      // Generate and register the service worker automatically
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      manifest: {
        name: 'BeezKnees',
        short_name: 'BeezKnees',
        description: 'Smart Beekeeping Management Platform',
        theme_color: '#1a3329',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',

        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: '/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        // SPA fallback at the root
        navigateFallback: '/index.html',
      },
    }),
  ],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
