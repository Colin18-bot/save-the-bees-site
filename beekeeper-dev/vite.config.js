// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const base = isProd ? '/beekeeper-dev/' : '/'

  return {
    // important: Vite rewrites all asset links with this
    base,

    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',

        // make the PWA aware of the subfolder
        manifest: {
          name: 'BeezKnees',
          short_name: 'BeezKnees',
          description: 'Smart Beekeeping Management Platform',

          // critical for subfolder deploys
          start_url: base,     // '/' in dev, '/beekeeper-dev/' in prod
          scope: base,

          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#1a3329',
          orientation: 'portrait-primary',
          categories: ['productivity', 'utilities', 'beekeeping'],

          // paths are relative to the manifest location (served from base)
          icons: [
            { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
            { src: 'favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { src: 'favicon-16x16.png', sizes: '16x16', type: 'image/png' }
          ],

          // relative so they resolve under the PWA scope
          shortcuts: [
            {
              name: 'New Inspection',
              short_name: 'Inspection',
              url: 'inspections/new',
              icons: [{ src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }]
            },
            {
              name: 'To-Do List',
              short_name: 'To-Do',
              url: 'todos',
              icons: [{ src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }]
            }
          ]
        },

        // ensure navigation fallbacks work inside subfolder in offline mode
        workbox: {
          navigateFallback: `${base}index.html`
        }
      })
    ],

    // optional, but explicit never hurts
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  }
})
