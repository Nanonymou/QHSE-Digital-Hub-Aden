# Feature 11 — Branding & Configuration

## Purpose
Identitas PT Aden Service tampil dari konfigurasi, bukan ditanam di kode.

## Configurable
- Logo (Aden Service) → `assets/logo` / Supabase Storage
- Nama produk & tagline
- Theme light/dark (token warna)
- Accent tokens
- Bahasa default
- Kategori & status set

## Rules
- Tidak ada nama perusahaan / warna brand hardcoded di komponen.
- Logo di-load dari konfigurasi; sediakan fallback bila belum diset.
- Ganti branding tidak butuh perubahan kode.

## Catatan aset
- File logo Aden Service ditaruh di `assets/` (atau di-upload ke Storage) — belum disertakan dalam paket PRD ini, siapkan saat implementasi.
