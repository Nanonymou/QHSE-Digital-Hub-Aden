-- =============================================================================
-- ADEN QHSE DIGITAL HUB — Migration 0004 (Phase 7: visibility tool per role)
-- Jalankan SETELAH 0003 di Supabase → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempoten). Backward-aware: tool lama tetap 'public'.
--
-- Cakupan: kolom allowed_roles, policy SELECT tools yang menghormati scope,
-- dan penjaga konsistensi data (role_scoped wajib punya minimal satu role).
--
-- CATATAN LINGKUP: scope ditentukan oleh ROLE saja. ERD menyebut "per role/site",
-- tetapi tidak ada entitas site di skema mana pun — menambahkannya butuh
-- spesifikasi tersendiri, jadi sengaja TIDAK diarang di sini.
-- =============================================================================

-- 1. KOLOM allowed_roles ------------------------------------------------------
alter table public.tools
  add column if not exists allowed_roles public.app_role[] not null default '{}';

comment on column public.tools.allowed_roles is
  'Role yang boleh melihat tool saat visibility = role_scoped. Kosong untuk tool publik.';

-- Konsistensi: tool role_scoped tanpa role sama sekali akan tak terlihat siapa pun
-- (kecuali admin) — itu hampir pasti salah isi, jadi ditolak di server.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tools_role_scope_needs_roles'
  ) then
    alter table public.tools
      add constraint tools_role_scope_needs_roles
      check (visibility <> 'role_scoped' or array_length(allowed_roles, 1) >= 1);
  end if;
end
$$;

-- Tool publik tidak perlu menyimpan daftar role; bersihkan agar datanya jujur.
create or replace function public.normalize_tool_visibility()
returns trigger
language plpgsql
as $$
begin
  if new.visibility = 'public' then
    new.allowed_roles := '{}';
  end if;
  return new;
end;
$$;

drop trigger if exists tools_normalize_visibility on public.tools;
create trigger tools_normalize_visibility
before insert or update on public.tools
for each row execute function public.normalize_tool_visibility();

-- 2. POLICY SELECT yang menghormati scope -------------------------------------
-- Penegakan ada DI SERVER: baris di luar scope tidak pernah dikirim ke client,
-- jadi memanipulasi request API pun tidak membocorkannya (technical/05).
drop policy if exists tools_select on public.tools;
create policy tools_select on public.tools
for select to anon, authenticated
using (
  public.is_admin()
  or (
    status <> 'archived'
    and (
      visibility = 'public'
      or (
        visibility = 'role_scoped'
        and public.current_app_role() is not null
        and public.current_app_role() = any (allowed_roles)
      )
    )
  )
);

-- current_app_role() dipakai policy untuk pengunjung anonim juga (hasilnya null).
grant execute on function public.current_app_role() to anon;

-- =============================================================================
-- CATATAN
-- • Tool yang sudah ada tetap visibility='public' → tidak ada perubahan perilaku.
-- • Membatasi sebuah tool ke role tertentu lewat SQL:
--     update public.tools
--        set visibility = 'role_scoped',
--            allowed_roles = array['admin','super_admin']::public.app_role[]
--      where name = 'Nama Tool';
--   atau lewat Catalog Console → form tool → bagian "Akses".
-- • Admin & super admin selalu melihat semua tool (termasuk yang di-scope dan
--   yang diarsipkan) agar katalog tetap bisa dikelola.
-- =============================================================================
