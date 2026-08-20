# Feature 07 — Tool Status Lifecycle

## States
- **Active** — siap dipakai.
- **Beta** — dapat dipakai, masih diuji.
- **Maintenance** — sedang diperbaiki; launch diberi peringatan.
- **Coming soon** — terdaftar, belum bisa dibuka.
- **Archived** — soft delete; hilang dari katalog publik.

## Rules
- Status configuration-driven; warnanya lewat token, bukan hex hardcoded.
- Transisi status hanya oleh admin berwenang.
- Coming soon: kartu disabled untuk launch.
- Archived: tidak tampil publik, masih bisa di-restore admin.

## UI
- Badge status konsisten warnanya di seluruh app.
