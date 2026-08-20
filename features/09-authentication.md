# Feature 09 — Authentication

## Purpose
Membedakan pengunjung publik/viewer dari admin pengelola katalog.

## Method
- Supabase Auth (email + password) untuk admin.
- Publik/viewer: akses baca tanpa login (atau login ringan bila diperlukan).

## Rules
- **No secrets in frontend.** Hanya anon key yang boleh di client.
- Session dikelola aman (Supabase session).
- Login gagal memberi pesan jelas tanpa membocorkan detail sensitif.
- Rate limiting pada percobaan login (bawaan Supabase / konfigurasi).

## Catatan
- Login admin **tidak boleh** berupa pengecekan password di frontend (anti-pattern versi lama). Otorisasi selalu server-side.
