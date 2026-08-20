# Technical Specification

## Architecture
Modular web app dengan pemisahan jelas:
UI (React) → Supabase (Auth + Postgres + RLS + Storage) → RPC untuk operasi terkontrol.

Hub bersifat **client-heavy** dengan Supabase sebagai backend terkelola. Tidak ada server backend kustom untuk V1.

## Principles
- Type-safe (TypeScript).
- Server-side authorization via RLS.
- Validasi client + server.
- Reusable components.
- Configuration-driven (kategori, status, accent, branding).
- Tidak ada business logic terduplikasi.
- **UI & animasi mengikuti `CLAUDE.md`** di root.

## Quality gate
Setiap perubahan menjalankan:
- lint
- typecheck
- production build
- verifikasi visual (Playwright) untuk perubahan UI

## Stack
- Vite + React + TypeScript + Tailwind + shadcn/ui + Framer Motion + lucide-react
- Supabase (Postgres, Auth, Storage, RLS, RPC)
- Deploy: Netlify / Vercel
