-- =============================================================================
-- ADEN QHSE DIGITAL HUB — Migration 0001 (Phase 1: Foundation)
-- Jalankan di Supabase → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempoten).
--
-- Cakupan: enum role, tabel profiles + app_config, helper role (SECURITY DEFINER),
-- RLS policy, trigger updated_at, auto-provision profil saat user baru dibuat,
-- dan seed branding awal.
-- Katalog (categories/tools/open_logs) menyusul di migration Phase 2.
-- =============================================================================

-- 1. ENUM ROLE ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'member', 'viewer');
  end if;
end
$$;

-- 2. UTILITAS -----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. TABEL: profiles ----------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       public.app_role not null default 'viewer',
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil RBAC; satu baris per auth.users. Role menentukan otorisasi server-side.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 4. TABEL: app_config --------------------------------------------------------
create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.app_config is 'Konfigurasi runtime (branding, accent token, bahasa default). Dibaca publik, ditulis super admin.';

drop trigger if exists app_config_set_updated_at on public.app_config;
create trigger app_config_set_updated_at
before update on public.app_config
for each row execute function public.set_updated_at();

-- 5. HELPER ROLE (SECURITY DEFINER agar policy profiles tidak rekursif) --------
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.active
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin', 'super_admin'), false)
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'super_admin', false)
$$;

revoke execute on function public.current_app_role() from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;

-- 6. PENJAGA KOLOM TERKUNCI pada profiles -------------------------------------
-- User boleh memperbarui barisnya sendiri (mis. full_name), TAPI role/active
-- hanya boleh berubah oleh super admin. Ditegakkan di server, bukan di UI.
create or replace function public.guard_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() null = konteks back-office (SQL Editor / service role), bukan
  -- permintaan API: di sanalah super admin pertama dipromosikan. Aman karena
  -- policy UPDATE profiles hanya untuk role `authenticated`, sehingga pemanggil
  -- anonim tidak pernah sampai ke trigger ini.
  if auth.uid() is null or public.is_super_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.active is distinct from old.active then
    raise exception 'Hanya super admin yang boleh mengubah id, role, atau status aktif profil.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_columns on public.profiles;
create trigger profiles_guard_columns
before update on public.profiles
for each row execute function public.guard_profile_columns();

-- 7. AUTO-PROVISION PROFIL saat user baru dibuat ------------------------------
-- User baru selalu masuk dengan hak paling kecil ('viewer'); super admin menaikkan
-- role secara sadar (least privilege, features/10).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill untuk user yang sudah ada sebelum migration ini.
insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;

-- 8. ROW LEVEL SECURITY -------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.app_config enable row level security;

-- profiles: user membaca dirinya sendiri; admin/super admin membaca semua.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

-- profiles: update baris sendiri (kolom terkunci dijaga trigger) atau super admin.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

-- profiles: insert & delete manual hanya super admin (jalur normal = trigger).
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
for insert to authenticated
with check (public.is_super_admin());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
for delete to authenticated
using (public.is_super_admin());

-- app_config: dibaca siapa pun (branding/tema), ditulis hanya super admin.
drop policy if exists app_config_select on public.app_config;
create policy app_config_select on public.app_config
for select to anon, authenticated
using (true);

drop policy if exists app_config_write on public.app_config;
create policy app_config_write on public.app_config
for all to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- 9. GRANTS -------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.app_config to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant insert, delete on public.profiles to authenticated; -- tetap disaring RLS
grant insert, update, delete on public.app_config to authenticated; -- tetap disaring RLS

-- 10. SEED KONFIGURASI --------------------------------------------------------
-- Nilai boleh diubah kapan saja lewat SQL/console tanpa menyentuh kode frontend.
insert into public.app_config (key, value) values
  ('branding', jsonb_build_object(
    'product_name',  'ADEN QHSE DIGITAL HUB',
    'company_name',  'PT Aden Service',
    'tagline',       'Satu pintu untuk menemukan, meluncurkan, dan mengelola tool QHSE.',
    'logo_url',      null,
    'default_lang',  'id',
    'default_theme', 'dark'
  )),
  ('accent_tokens', jsonb_build_object(
    'orange', '#F97316',
    'green',  '#22C55E',
    'navy',   '#24408E',
    'yellow', '#FACC15',
    'sky',    '#38BDF8',
    'pink',   '#EC4899'
  ))
on conflict (key) do nothing;

-- =============================================================================
-- LANGKAH MANUAL SETELAH RUN
-- 1) Buat user pertama: Supabase → Authentication → Users → Add user (email + password).
-- 2) Naikkan jadi super admin (ganti alamat emailnya):
--      update public.profiles p
--         set role = 'super_admin'
--       from auth.users u
--      where u.id = p.id and u.email = 'email-kamu@contoh.com';
-- 3) Verifikasi: select p.id, u.email, p.role, p.active
--                  from public.profiles p join auth.users u on u.id = p.id;
-- =============================================================================
