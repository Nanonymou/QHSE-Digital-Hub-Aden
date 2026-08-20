# ADEN QHSE DIGITAL HUB
## Product Requirements Document (PRD)

**Product:** ADEN QHSE DIGITAL HUB
**Purpose:** Portal & launchpad terpusat untuk seluruh web tool QHSE perusahaan
**Company:** PT Aden Service
**Primary User:** QHSE Staff, SPV QHSE, Site PIC, Management, Admin Hub
**Language:** Indonesian (default) + English + 中文
**Target:** Desktop + Tablet, responsive (mobile tetap fungsional)
**Architecture:** Web application, modular, configuration-driven
**V1 Focus:** Aggregation Hub (catalog + launch + admin management)

---

## 1. Product Vision

ADEN QHSE DIGITAL HUB menyatukan seluruh web tool QHSE yang tersebar — compliance monitoring, inspection, training, dashboard, dan tool lain — ke dalam **satu launchpad**. Tidak ada lagi kumpulan link, bookmark, dan file yang berserakan.

Core value:

Satu pintu → temukan tool → satu klik → jalan.

Hub adalah **direktori hidup**: tool baru cukup didaftarkan sekali, langsung tampil rapi di dashboard yang sama dengan status, kategori, dan branding konsisten.

Hub **bukan** pengganti tool operasional. Hub adalah lapisan agregasi, discovery, dan kontrol akses di atasnya.

## 2. V1 Scope

V1 wajib mencakup:

1. Authentication (admin)
2. RBAC (public/viewer vs admin)
3. Tool Catalog (grid kartu tool)
4. Tool Launch & Detail
5. Catalog Console (admin CRUD tool)
6. Category Management
7. Search, filter, sort
8. Tool Status Lifecycle (Active / Beta / Maintenance / Coming soon)
9. Usage Analytics (open tracking + KPI ringkas)
10. Multilingual (ID / EN / 中文)
11. Branding & configuration (logo, nama, tagline)
12. Empty/loading/error state di semua list
13. Audit-safe: created_by / updated_by pada perubahan katalog
14. PWA installable (Phase 6): manifest + service worker, shell offline-capable
15. Team QHSE (Phase 5): halaman terpisah /team — foto, nama, jabatan, departemen, kontak

V1 **tidak** wajib mencakup: pembangunan modul operasional QHSE (finding/NCR/inspection/compliance), SSO enterprise, native mobile app, AI assistant, integrasi WhatsApp/email, health-check otomatis tiap tool.

## 3. Future Modules

Arsitektur harus siap untuk:

- SSO / directory (Google Workspace, Azure AD)
- Favorites & recently used per user
- Per-tool embedded analytics (deep link metrics)
- Notifikasi update tool (changelog per tool)
- Health-check / uptime monitor tiap tool
- AI assistant (Guardian) untuk discovery & bantuan
- Role-based visibility per tool (tool tertentu hanya untuk role/site tertentu)

## 4. Core Principles

- **Tool adalah entitas utama.** Setiap tool = satu kartu = satu URL target.
- Katalog **configuration-driven**: kategori, status, accent, dan branding tidak boleh hardcoded.
- **Launch tidak pernah mengubah** state tool eksternal — hub hanya membuka URL + mencatat open.
- Hanya role berwenang yang dapat menambah/mengubah/menghapus tool.
- **UI hiding bukan security.** Backend/RLS wajib memvalidasi setiap operasi tulis.
- Multibahasa konsisten di seluruh UI; tidak ada string hardcoded di komponen.
- Data pemakaian (opens) tidak boleh menghalangi atau memperlambat launch.
- Branding perusahaan (logo, nama, tagline) diambil dari konfigurasi, bukan ditanam di kode.
- **Standar UI & animasi mengikuti `CLAUDE.md`** di root repository — wajib, bukan opsional.

## 5. Core Workflow

**User (publik/viewer):**
Masuk hub → lihat katalog → search/filter → klik kartu → tool terbuka (open tercatat).

**Admin:**
Sign in → Catalog Console → Add/Edit/Delete tool → set kategori/status/accent → Publish → tampil di katalog.

Status tool:
ACTIVE → (BETA / MAINTENANCE / COMING SOON sesuai kebutuhan) → ARCHIVED (soft, tidak tampil publik)

## 6. Tool Data

Minimum fields per tool:

- Tool ID (auto, unik)
- Name
- Category
- Description (ringkas)
- Target URL (web tool / GAS webapp / app lain)
- Icon (referensi icon set, mis. lucide/FontAwesome)
- Accent (token warna, bukan hex mentah)
- Status (Active / Beta / Maintenance / Coming soon / Archived)
- Tags (multi)
- Release date
- Visibility (public / role-scoped — future)
- Opens (counter)
- Created by / Updated by / timestamps

Status makna:
- **Active** — siap dipakai
- **Beta** — dapat dipakai, masih diuji
- **Maintenance** — sementara tidak stabil / sedang diperbaiki
- **Coming soon** — terdaftar, belum bisa dibuka
- **Archived** — disembunyikan dari publik (soft delete)

## 7. Catalog & Dashboard

Dashboard hub menjawab: **"Tool apa yang saya butuhkan, dan mana yang siap dipakai?"**

KPI ringkas:
- Total tools
- Tools active
- Categories
- Total opens (periode)

Bagian:
- Hero (identitas hub + CTA ke katalog)
- Katalog (grid kartu, dikelompokkan/difilter per kategori)
- Search + filter bar
- (Admin) Catalog Console

Aturan:
- Klik KPI kategori memfilter katalog.
- Kartu status non-active tampil dengan badge jelas; "Coming soon" tidak bisa diklik-launch.

## 8. Search & Filtering

Global search berdasarkan:
- Name
- Description
- Category
- Tags

Filter:
- Category
- Status
- Tags

Sort:
- Terbaru (release date)
- Nama (A-Z)
- Paling sering dibuka (opens)

Search wajib debounced; hasil kosong menampilkan empty state yang mengarahkan (bukan sekadar "No result").

## 9. Usage Analytics

- Setiap launch mencatat 1 open (tool_id, waktu).
- Counter opens di-increment via operasi server (RPC), bukan dari client langsung yang bisa dimanipulasi.
- KPI opens ditampilkan agregat; detail log hanya untuk admin.
- Analytics tidak boleh memblokir launch bila pencatatan gagal (fail-open pada pencatatan, bukan pada akses).

## 10. Multilingual (i18n)

- Bahasa: **Indonesian (default), English, 中文**.
- Semua teks UI lewat dictionary i18n; **tidak ada string hardcoded** di komponen.
- Konten tool (name/description) dapat disimpan per-bahasa (opsional) atau single-language dengan fallback.
- Ganti bahasa harus instan, tanpa reload penuh, dengan transisi halus (lihat `CLAUDE.md` §4).

## 11. Non-Functional Requirements

- Responsive Desktop + Tablet; mobile tetap fungsional.
- Target interaksi < 2 detik untuk operasi normal.
- Pagination / lazy untuk katalog besar.
- Debounced search.
- Validasi client + server.
- Secure config: **no secrets in frontend** (hanya anon key Supabase; service key tidak pernah di client).
- Error state informatif; empty state tersedia; **tidak ada silent failure**.
- Build & deployment reproducible.
- **UI & animasi mengikuti `CLAUDE.md`**: 60fps, `prefers-reduced-motion` dihormati, focus terlihat, kontras AA.

## 12. Configuration

Configuration-driven:
- Company profile (nama, logo, tagline)
- Categories
- Status set & warnanya (token)
- Accent tokens
- Roles & permissions
- Bahasa aktif
- Branding & theme (light/dark)

Tidak boleh hardcode nama perusahaan, kategori, atau warna di source code.

## 13. Suggested Stack

Frontend:
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animasi; sesuai `CLAUDE.md`)
- lucide-react (icon set konsisten)

Backend & Data:
- **Supabase** — Postgres + Auth + Storage
- Row Level Security (RLS) untuk otorisasi
- RPC untuk increment opens

Deployment:
- Netlify atau Vercel (frontend)
- Supabase (managed backend)

Repository:
- Satu Git repository
- `CLAUDE.md` di root

Storage:
- Supabase Storage untuk logo/aset brand

## 14. Success Criteria

V1 berhasil jika:

1. User melihat seluruh tool dalam satu katalog konsisten.
2. Klik kartu meluncurkan tool dan mencatat open.
3. Admin dapat menambah/mengubah/menghapus tool tanpa menyentuh kode.
4. Kategori, status, dan accent sepenuhnya dari konfigurasi/data.
5. Search & filter bekerja cepat dan debounced.
6. Tiga bahasa (ID/EN/中文) berfungsi penuh tanpa string hardcoded.
7. Otorisasi tulis divalidasi di server (RLS), bukan hanya disembunyikan di UI.
8. UI & animasi memenuhi standar `CLAUDE.md` (premium, 60fps, reduced-motion, AA).
9. Build production berhasil tanpa error.
10. Branding PT Aden Service tampil dari konfigurasi (logo + nama + tagline).

## 15. Development Strategy

Incremental:

Phase 1: Foundation + Auth + RBAC + Config
Phase 2: Tool Catalog + Tool Data + Launch
Phase 3: Catalog Console (admin CRUD) + Category
Phase 4: Search/Filter/Sort + Usage Analytics
Phase 5: i18n (ID/EN/中文) + Branding
Phase 6: UI/animation polish (CLAUDE.md) + PWA (installable) + QA + hardening
Phase 7: Future modules (SSO, favorites, health-check, AI)

Prioritas: **stabilitas & keamanan > jumlah fitur > kemewahan visual** — namun visual polish (Phase 6) adalah bagian eksplisit dari V1, bukan afterthought.
