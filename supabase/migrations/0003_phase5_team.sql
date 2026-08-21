-- =============================================================================
-- ADEN QHSE DIGITAL HUB — Migration 0003 (Phase 5: Team QHSE)
-- Jalankan SETELAH 0002 di Supabase → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempoten).
--
-- Cakupan: tabel team_members, trigger penjaga kolom terkunci (self-edit),
-- RLS baca/tulis, dan bucket Storage untuk foto anggota.
-- =============================================================================

-- 1. TABEL: team_members ------------------------------------------------------
create table if not exists public.team_members (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null,
  full_name      text not null,
  position       text,
  department     text,
  photo_url      text,
  bio            text,
  email          text,
  phone          text,
  display_order  integer not null default 0,
  active         boolean not null default true,
  visible_public boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint team_members_phone_format check (phone is null or phone ~ '^\+?[0-9]{6,20}$'),
  constraint team_members_photo_https check (photo_url is null or photo_url ~* '^https://'),
  constraint team_members_user_unique unique (user_id)
);

comment on table public.team_members is 'Anggota tim QHSE. Satu baris boleh ditautkan ke satu auth.users untuk self-edit.';
comment on column public.team_members.visible_public is 'Kontrol privasi: baris hanya sampai ke pengunjung anonim bila true.';

create index if not exists team_members_order_idx on public.team_members (display_order, full_name);

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

-- 2. PENJAGA KOLOM TERKUNCI ---------------------------------------------------
-- RLS mengatur baris, bukan kolom. Anggota boleh memperbarui BARISNYA SENDIRI,
-- tapi hanya foto/kontak/bio; kolom lain ditolak di sini (technical/04).
create or replace function public.guard_team_member_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.id            is distinct from old.id
     or new.user_id       is distinct from old.user_id
     or new.full_name     is distinct from old.full_name
     or new.position      is distinct from old.position
     or new.department    is distinct from old.department
     or new.display_order is distinct from old.display_order
     or new.active        is distinct from old.active
     or new.visible_public is distinct from old.visible_public then
    raise exception 'Hanya SPV/admin yang boleh mengubah identitas, jabatan, urutan, atau status anggota.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists team_members_guard_columns on public.team_members;
create trigger team_members_guard_columns
before update on public.team_members
for each row execute function public.guard_team_member_columns();

-- 3. ROW LEVEL SECURITY -------------------------------------------------------
alter table public.team_members enable row level security;

-- Pengunjung anonim: hanya anggota aktif yang disetujui tampil publik.
drop policy if exists team_members_select_anon on public.team_members;
create policy team_members_select_anon on public.team_members
for select to anon
using (active and visible_public);

-- User login (viewer ke atas): seluruh anggota aktif; admin melihat yang nonaktif juga.
drop policy if exists team_members_select_auth on public.team_members;
create policy team_members_select_auth on public.team_members
for select to authenticated
using (active or public.is_admin());

drop policy if exists team_members_insert on public.team_members;
create policy team_members_insert on public.team_members
for insert to authenticated
with check (public.is_admin());

-- Baris sendiri boleh di-update (kolom terkunci dijaga trigger), selebihnya admin.
drop policy if exists team_members_update on public.team_members;
create policy team_members_update on public.team_members
for update to authenticated
using (public.is_admin() or user_id = auth.uid())
with check (public.is_admin() or user_id = auth.uid());

drop policy if exists team_members_delete on public.team_members;
create policy team_members_delete on public.team_members
for delete to authenticated
using (public.is_super_admin());

grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated; -- tetap disaring RLS

-- 4. STORAGE: foto anggota ----------------------------------------------------
-- Bucket publik agar foto bisa ditampilkan tanpa signed URL; hak TULIS tetap ketat.
insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do update set public = true;

drop policy if exists team_photos_read on storage.objects;
create policy team_photos_read on storage.objects
for select to anon, authenticated
using (bucket_id = 'team-photos');

-- Path wajib diawali <auth.uid()>/ agar anggota hanya menulis di foldernya sendiri.
drop policy if exists team_photos_insert on storage.objects;
create policy team_photos_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'team-photos'
  and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
);

drop policy if exists team_photos_update on storage.objects;
create policy team_photos_update on storage.objects
for update to authenticated
using (
  bucket_id = 'team-photos'
  and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
);

drop policy if exists team_photos_delete on storage.objects;
create policy team_photos_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'team-photos'
  and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
);

-- =============================================================================
-- CATATAN
-- • Anggota tim didaftarkan admin lewat halaman /team (tombol "Tambah anggota").
-- • Menautkan baris ke akun agar anggota bisa self-edit:
--     update public.team_members m
--        set user_id = u.id
--       from auth.users u
--      where u.email = 'anggota@contoh.com' and m.full_name = 'Nama Anggota';
-- • Batas ukuran/MIME foto divalidasi di client; batas keras bucket dapat
--   diatur di Supabase → Storage → team-photos → Settings bila diperlukan.
-- =============================================================================
