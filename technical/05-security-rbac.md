# Security & RBAC

## Requirements
- Supabase Auth (managed) untuk admin.
- **No secrets in frontend** — hanya anon key. Service role key TIDAK PERNAH di client.
- Server-side role checks via RLS.
- Protected write: hanya admin/super_admin.
- Input sanitization & validasi URL (https).
- Rate limiting login (bawaan Supabase).

## Anti-pattern yang dilarang
- Login admin berbasis pengecekan password di frontend (versi lama Guardian AI) — DILARANG.
- Menyembunyikan tombol admin di UI sebagai satu-satunya "keamanan" — UI hiding bukan security.

## Team self-edit
- Anggota hanya boleh mengubah profil SENDIRI (baris `user_id = auth.uid()`),
  terbatas kolom foto/kontak/bio (ditegakkan trigger/RPC, bukan UI).
- Field jabatan/departemen/aktif/urutan hanya SPV(=Admin)/Super Admin.
- Percobaan lintas-user via API ditolak RLS.

## Data Isolation
- Publik hanya menerima tool non-archived.
- Log & analytics detail hanya untuk admin.
- Future role-scoped tool: user tidak menerima tool di luar scope lewat manipulasi API.
