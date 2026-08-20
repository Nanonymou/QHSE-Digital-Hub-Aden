# Backend Specification (Supabase)

## Model
Tidak ada server kustom (V1). Supabase menyediakan Auth, Postgres, Storage, RLS, RPC.

## RLS Rules
- **tools**: SELECT publik untuk status != 'archived'; INSERT/UPDATE/DELETE hanya admin/super_admin.
- **categories**: SELECT publik; tulis hanya admin.
- **open_logs**: INSERT via RPC (anon boleh via RPC); SELECT hanya admin.
- **profiles**: user baca dirinya; super_admin kelola semua.
- **app_config**: SELECT publik (branding/theme); tulis hanya super_admin.
- **team_members**: SELECT untuk `active=true` (+`visible_public=true` bila publik). Tulis: admin/super_admin penuh. **Self-edit**: user boleh UPDATE baris `user_id = auth.uid()` TAPI hanya kolom foto/kontak/bio.

## Team self-edit enforcement (penting)
Postgres RLS mengatur baris, bukan kolom. Untuk membatasi anggota hanya boleh mengubah
foto/kontak/bio pada barisnya sendiri:
- RLS policy UPDATE: `USING (user_id = auth.uid() OR is_admin())`.
- **BEFORE UPDATE trigger** menolak perubahan kolom terkunci (position, department, order,
  active, visible_public, user_id, full_name) bila user BUKAN admin/spv:
  - bandingkan OLD vs NEW; jika ada kolom terkunci berubah & bukan admin → RAISE EXCEPTION.
- Alternatif: RPC `update_own_profile(photo_url, email, phone, bio)` (security definer) yang
  hanya menyentuh kolom diizinkan; anggota memanggil ini, bukan UPDATE langsung.
- Admin/SPV memakai jalur update penuh biasa (dibatasi RLS role).

## RPC
- `increment_tool_opens(tool_id)` security definer:
  - validasi tool ada & tidak archived
  - increment opens
  - insert open_logs
  - tidak pernah membuka data sensitif

## File Upload (logo/brand)
- Supabase Storage; validasi MIME, ekstensi, size.
- URL publik untuk logo; write hanya admin.

## Status Transition
- Perubahan status hanya lewat operasi admin (RLS).
- Client tidak dapat memaksa status lewat payload.

## Error contract
- Struktur error konsisten; tidak ada silent failure.
