# Frontend Specification

## UI
Portal QHSE yang **premium, cepat, dan jelas**. Desktop + Tablet first; mobile fungsional.
Bahasa default Indonesian (+ EN + 中文).

## Wajib: ikuti CLAUDE.md
Seluruh keputusan UI & animasi tunduk pada `CLAUDE.md` di root:
- Warna via token (bukan hex hardcoded); light & dark.
- Tipografi: display + body (+ mono untuk data/telemetri) — pairing ditentukan saat implementasi, bukan default generik.
- Hindari 3 tampilan "AI-generated default" (cream+terracotta / near-black+acid / broadsheet) kecuali diminta.
- **Satu elemen signature** (mis. mesh/constellation tool network di hero) — sisanya tenang.
- Animasi: 60fps, `transform`/`opacity`, `prefers-reduced-motion` dihormati.

## Navigation
- Dashboard / Katalog
- (Admin) Catalog Console
- Team QHSE (halaman terpisah, route /team)
- Language switcher (ID/EN/中文)
- Auth (Sign in / Sign out)

## Components (reusable)
- ToolCard, ToolGrid, StatusBadge, CategoryFilter, SearchBar
- StatTile (KPI), Hero, LanguageSwitcher
- AdminLoginModal, CatalogConsole, ToolForm
- EmptyState, LoadingState, ErrorState
- TeamPage, TeamMemberCard, ContactLinks (mailto/tel/wa.me)

## UX states
- Loading, empty, error, success di setiap list & form.
- Konfirmasi untuk aksi destruktif (archive/delete).
- Focus terlihat; keyboard-navigable.

## Animation highlights (CLAUDE.md §4)
- Kartu: stagger reveal + hover lift.
- Hero: satu momen bermakna (signature).
- Ganti bahasa & filter: transisi halus.
