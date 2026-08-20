# Feature 01 — Tool Catalog

## Purpose
Menampilkan seluruh web tool QHSE sebagai grid kartu yang dapat dicari, difilter, dan diluncurkan dalam satu klik.

## Card content
- Icon + Name
- Category
- Description ringkas
- Status badge (Active/Beta/Maintenance/Coming soon)
- Tags
- Accent (token warna per tool)

## Rules
- Kartu status **Coming soon** tidak dapat diklik-launch; tampilkan sebagai disabled dengan label jelas.
- Kartu **Archived** tidak tampil di katalog publik.
- Katalog mengikuti visibility user (future: role-scoped tool).
- Grid responsif: 1 kolom (mobile) → 2 (tablet) → 3-4 (desktop).
- Wajib ada empty state (belum ada tool) & loading state.

## UI/Animation (lihat CLAUDE.md §4)
- Kartu masuk dengan **stagger reveal** saat masuk viewport.
- Hover: lift halus (translateY kecil + shadow), accent menegas.
- Hormati `prefers-reduced-motion`.
