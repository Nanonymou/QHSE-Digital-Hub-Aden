# Feature 13 — Progressive Web App (Installable)

## Phase
Phase 6 (polish). Jangan dikerjakan sebelum V1 fungsional stabil.

## Purpose
Membuat shell hub dapat di-install ("Add to Home Screen") dan berjalan standalone
(fullscreen tanpa UI browser) agar terasa "ala native", dengan ikon, splash, dan theme brand.

## Scope (jujur)
- Yang jadi PWA = **shell hub** (dashboard, katalog, search) — installable + cache read-only.
- **Tool eksternal** yang diluncurkan tetap buka di browser dan butuh online — hub tidak dapat
  membuat tool pihak lain jadi offline.
- **Supabase**: katalog (read) boleh di-cache; login & operasi tulis tetap butuh online.
  Offline-first penuh untuk data dinamis TIDAK termasuk V1.

## Requirements
- `manifest.webmanifest` valid: name, short_name, icons (192/512 + maskable), start_url,
  display=standalone, theme_color (#EA580C), background_color (#140D0A), lang.
- Service worker (via `vite-plugin-pwa` / Workbox):
  - precache app shell (HTML/CSS/JS build).
  - runtime cache: aset statis + GET katalog (stale-while-revalidate).
  - JANGAN cache endpoint auth / mutasi.
- Ikon lengkap + `apple-touch-icon` + meta iOS (lihat technical/07).
- HTTPS (Vercel otomatis).
- Update flow: saat ada versi baru service worker, tampilkan prompt "Muat ulang untuk update".

## Rules
- PWA tidak mengubah otorisasi: RLS tetap berlaku; jangan cache data ter-proteksi.
- theme_color & background_color diambil dari token brand, konsisten dengan UI.
- Reduced-motion & a11y tetap dihormati di mode standalone.
- Jangan klaim offline penuh; komunikaslikan status offline dengan jelas ke user.

## Acceptance
- [ ] Lolos audit PWA (Lighthouse installable).
- [ ] Bisa di-install di Android (Chrome) & iOS (Safari, dengan batasannya).
- [ ] Dibuka standalone: tanpa address bar, splash + ikon brand muncul.
- [ ] Offline: shell + katalog terakhir tampil; aksi online memberi pesan bila tak ada jaringan.
- [ ] Update service worker terdeteksi & bisa di-refresh.
