# Feature 03 — Catalog Console (Admin)

## Purpose
Panel admin untuk mengelola isi katalog tanpa menyentuh kode.

## Capabilities
- Add tool
- Edit tool
- Archive / restore tool (soft delete)
- Delete permanen (hanya Super Admin, dengan konfirmasi)

## Add/Edit form fields
- Name (required)
- Category (required, dari master)
- Description
- Target URL (required, https)
- Icon (dari icon set)
- Accent (pilih token, bukan hex bebas)
- Status (Active/Beta/Maintenance/Coming soon)
- Tags (comma-separated)
- Release date

## Rules
- Semua operasi tulis divalidasi server-side (RLS), bukan hanya di UI.
- created_by / updated_by tercatat otomatis.
- Validasi: URL valid, name tidak kosong, category ada di master.
- Konfirmasi wajib untuk delete permanen.
- Form punya state: idle, submitting, success, error (tidak silent).
