# ADEN QHSE DIGITAL HUB

Portal & launchpad terpusat untuk seluruh web tool QHSE **PT Aden Service** — satu pintu untuk menemukan, meluncurkan, dan mengelola tool (compliance, inspection, training, dashboard, dll). Hub mengagregasi tool; hub **tidak** membangun ulang modul operasionalnya.

> Repo ini berisi **PRD + konfigurasi repo**, belum berisi kode aplikasi. Kode dibangun oleh Claude Code mengikuti dokumen di sini. Lihat `docs/CLAUDE_CODE_KICKOFF.md`.

## Stack
Vite · React · TypeScript · Tailwind · shadcn/ui · Framer Motion · Supabase (Auth/DB/Storage/RLS) · Deploy: Vercel

## Struktur repo
```
.
├── README.md                     ← kamu di sini
├── CLAUDE.md                     ← standar UI & animasi (universal, auto-dibaca Claude Code)
├── PROJECT.md                    ← konteks konkret: brand, palet, tipografi, perintah, deploy
├── PRD.md                        ← dokumen induk PRD
├── .env.example                  ← template env (Supabase)
├── vercel.json                   ← konfigurasi deploy Vercel (SPA rewrites)
├── public/                       ← manifest.webmanifest + ikon PWA (isi ikon saat Phase 6)
├── .gitignore / .nvmrc
├── features/                     ← 12 spesifikasi fitur hub
├── technical/                    ← spec teknis, ERD, frontend, backend, security, roadmap
├── governance/                   ← aturan kerja AI + standar UI/animasi
├── docs/                         ← kickoff Claude Code + panduan deploy Vercel
└── assets/                       ← slot logo/brand Aden Service (isi saat implementasi)
```

## Mulai cepat (untuk Claude Code)
1. Upload repo ini ke GitHub, buka di Claude Code (`claude` di root).
2. Buat proyek Supabase, salin `.env.example` → `.env`, isi URL + anon key.
3. Tempel **prompt kickoff** dari `docs/CLAUDE_CODE_KICKOFF.md`.
4. Claude Code membangun per-Phase (roadmap: `technical/06-development-roadmap.md`).
5. Deploy: ikuti `docs/DEPLOYMENT_VERCEL.md`.

## Urutan baca dokumen
`README.md` → `PROJECT.md` → `PRD.md` → `governance/` → `features/` + `technical/` (sesuai task).

## Prinsip non-negotiable
- Configuration-driven: tidak ada brand/warna/kategori/URL tool yang hardcoded.
- Keamanan server-side (Supabase RLS); **UI hiding bukan security**.
- No secrets in frontend (hanya anon key).
- UI & animasi mengikuti `CLAUDE.md` (60fps, reduced-motion, kontras AA).

## V1 priority
Auth → RBAC → Catalog → Catalog Console → Search/Filter → Analytics → i18n → QA → Deploy.

---
© 2026 PT Aden Service · Internal use.
