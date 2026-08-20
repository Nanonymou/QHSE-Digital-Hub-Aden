# Claude Code — Kickoff Guide

Panduan agar Claude Code membangun ADEN QHSE DIGITAL HUB dengan benar dan token-efisien.

## Sebelum mulai
1. Pastikan `CLAUDE.md`, `PROJECT.md`, `PRD.md`, `governance/`, `technical/` ada di repo.
2. Siapkan proyek Supabase (URL + anon key) → isi `.env` dari `.env.example`.
3. Node 20 (`.nvmrc`).

## Prompt kickoff (copy-paste ke Claude Code)
```
Baca README.md, PROJECT.md, PRD.md, governance/, dan technical/ terlebih dahulu.
Bangun ADEN QHSE DIGITAL HUB mengikuti roadmap di technical/06-development-roadmap.md,
satu Phase per langkah. Patuhi governance/01-ai-development-rules.md dan CLAUDE.md untuk
semua keputusan UI/animasi. Stack: Vite + React + TS + Tailwind + shadcn/ui + Framer Motion
+ Supabase, deploy target Vercel.

Mulai dari Phase 1 (Foundation): scaffold Vite+React+TS, Tailwind + token dari PROJECT.md,
struktur folder, Supabase client, Auth, RBAC (profiles), app_config, routing.
Jangan lanjut ke Phase berikutnya sebelum Phase ini: lint ✓, typecheck ✓, build ✓,
dan aku konfirmasi. Tampilkan ringkasan perubahan tiap akhir Phase.
```

## Aturan per Phase
- Kerjakan **satu Phase**; jangan lompat.
- Akhir tiap Phase: jalankan `npm run lint`, `tsc -b`, `npm run build`.
- Untuk perubahan UI: verifikasi visual via Playwright (screenshot), bukan menebak.
- Migration DB: tulis SQL, jalankan manual di Supabase SQL Editor (jangan auto-exec destruktif).
- Jangan hardcode brand/warna/kategori/URL tool — semua dari token/config.

## Urutan Phase (ringkas)
1. Foundation: Vite/TS, Tailwind token, Supabase client, Auth, RBAC, app_config, routing
2. Catalog Core: schema tools+categories, ToolCard/Grid, launch + RPC increment_tool_opens
3. Admin: Catalog Console (CRUD), category management, RLS write
4. Discovery & Analytics: search/filter/sort (debounced), KPI, open_logs
5. i18n & Branding: dictionary ID/EN/中文, language switcher, branding + logo
6. Polish & QA: animasi penuh (CLAUDE.md), **PWA installable** (features/13 + technical/07), Playwright, a11y, performa, hardening
7. Future: SSO, favorites, health-check, per-role visibility, AI

## Checklist siap-Vercel (akhir Phase 6)
- [ ] `npm run build` sukses, output ke `dist/`
- [ ] `vercel.json` ada (SPA rewrites) — sudah disertakan
- [ ] Env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` diset di Vercel dashboard
- [ ] Tidak ada secret selain anon key di client
- [ ] Deep link (refresh di route dalam) tidak 404
- [ ] Reduced-motion & kontras AA lolos
- [ ] PWA: manifest + service worker aktif; Lighthouse installable ✓; theme_color #EA580C
