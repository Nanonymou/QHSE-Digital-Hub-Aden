# PWA Specification (Vite + React)

## Library
`vite-plugin-pwa` (Workbox di belakang layar) — generate manifest + service worker otomatis.

## Install (saat Phase 6)
```
npm i -D vite-plugin-pwa
```

## vite.config.ts (tambahan)
```ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',           // tampilkan prompt update, jangan auto-reload diam-diam
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ADEN QHSE Digital Hub',
        short_name: 'ADEN QHSE',
        description: 'Portal & launchpad tool QHSE PT Aden Service',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#EA580C',         // oren (brand) — samakan dgn <meta theme-color>
        background_color: '#140D0A',    // warm-dark (splash)
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // katalog Supabase (GET) — stale-while-revalidate
            urlPattern: ({ url }) => url.pathname.includes('/rest/v1/tools'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'catalog-cache', expiration: { maxAgeSeconds: 86400 } }
          }
          // JANGAN cache /auth/ atau mutasi (POST/PATCH/DELETE)
        ]
      }
    })
  ]
})
```

## index.html (meta wajib, terutama iOS)
```html
<meta name="theme-color" content="#EA580C" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="ADEN QHSE" />
```

## Ikon yang harus disediakan (public/)
- favicon.ico
- apple-touch-icon.png (180x180)
- icons/icon-192.png, icons/icon-512.png, icons/icon-512-maskable.png
- (opsional) masked-icon.svg
> Generate dari logo Aden Service. Maskable: beri padding aman (~10-20%) agar tidak terpotong.

## Update flow (React)
- `registerType: 'prompt'` → gunakan hook `useRegisterSW` (virtual:pwa-register/react)
  untuk menampilkan banner "Versi baru tersedia — Muat ulang".
- Jangan reload paksa saat user sedang mengisi form.

## Batasan yang harus dikomunikasikan
- iOS Safari: dukungan service worker & push lebih terbatas dari Android.
- Tool eksternal (URL target) tetap butuh online; hub hanya cache shell + katalog.
- Data ter-proteksi (auth/mutasi) TIDAK di-cache.

## Verifikasi
- Lighthouse → PWA installable ✓
- Uji install Android (Chrome) & iOS (Safari, Add to Home Screen)
- Uji offline: matikan jaringan → shell + katalog terakhir tampil, aksi online beri pesan jelas
