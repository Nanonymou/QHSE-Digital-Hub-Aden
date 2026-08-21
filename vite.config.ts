import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': user yang memutuskan kapan memuat versi baru — jangan reload diam-diam
      // saat dia sedang mengisi form (technical/07).
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ADEN QHSE Digital Hub',
        short_name: 'ADEN QHSE',
        description: 'Portal & launchpad tool QHSE PT Aden Service',
        lang: 'id',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#EA580C',
        background_color: '#140D0A',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // Hanya shell + katalog (GET) yang di-cache. Endpoint auth dan seluruh
        // operasi tulis TIDAK pernah masuk cache (features/13 § Rules).
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (url.pathname.includes('/rest/v1/tools') || url.pathname.includes('/rest/v1/categories')),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'catalog-cache',
              expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Vendor besar dipisah agar shell terasa ringan dan cache lebih awet
        // (versi app berubah tanpa membatalkan cache library).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils'))
            return 'motion'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/'))
            return 'react'
          return undefined
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
