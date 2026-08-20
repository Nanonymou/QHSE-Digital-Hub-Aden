# UI & Animation Standards

## Sumber kebenaran
Standar penuh ada di **`CLAUDE.md`** (root repository). File ini adalah ringkasan pointer; jika ada konflik, `CLAUDE.md` menang.

## Ringkasan wajib
- **Warna via token**, bukan hex hardcoded; light & dark; kontras AA.
- **Tipografi** punya kepribadian: display + body (+ mono untuk data). Bukan default browser.
- **Hindari 3 tampilan AI-default**: cream+terracotta / near-black+acid / broadsheet — kecuali diminta brief.
- **Satu elemen signature**; sisanya tenang & disiplin.
- **Animasi**: hanya `transform`/`opacity` untuk gerak sering; easing bermakna; durasi micro 120-260ms, seksi 300-600ms; 60fps.
- **`prefers-reduced-motion` wajib dihormati** — sediakan versi minimal.
- **Framer Motion**: `variants` + `AnimatePresence` + `useReducedMotion`.
- **State interaktif lengkap**: default, hover, focus-visible, active, disabled, loading.
- **Empty/error state** mengarahkan, bukan malas.

## Konteks Hub (spesifik proyek ini)
- Signature yang disarankan: **mesh/constellation "operations network"** di hero yang merepresentasikan jaringan tool (merespons pointer) — eksekusi dengan restraint.
- Kartu tool: **stagger reveal** + hover lift; accent per tool dari token.
- Ganti bahasa & filter: transisi cross-fade singkat, tidak "meloncat".
- Verifikasi visual via Playwright sebelum menandai selesai.
