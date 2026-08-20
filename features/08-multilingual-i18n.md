# Feature 08 — Multilingual (i18n)

## Languages
- Indonesian (default)
- English
- 中文

## Rules
- Semua teks UI lewat dictionary i18n; **tidak ada string hardcoded** di komponen.
- Konten tool (name/description) dapat single-language dengan fallback, atau per-bahasa (opsional).
- Ganti bahasa instan, tanpa reload penuh.
- Preferensi bahasa disimpan (localStorage / profil).

## UI/Animation
- Transisi ganti bahasa halus (fade/cross-fade singkat) — lihat CLAUDE.md §4.
