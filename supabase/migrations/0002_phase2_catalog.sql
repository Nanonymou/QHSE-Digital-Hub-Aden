-- =============================================================================
-- ADEN QHSE DIGITAL HUB — Migration 0002 (Phase 2: Catalog Core)
-- Jalankan SETELAH 0001 di Supabase → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempoten).
--
-- Cakupan: enum status tool, tabel categories / tools / open_logs, RLS,
-- RPC increment_tool_opens, dan seed kategori awal.
-- CRUD lewat Catalog Console menyusul di Phase 3 (memakai policy tulis di sini).
-- =============================================================================

-- 1. ENUM STATUS --------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tool_status') then
    create type public.tool_status as enum ('active', 'beta', 'maintenance', 'coming_soon', 'archived');
  end if;
end
$$;

-- 2. TABEL: categories --------------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.categories is 'Master kategori tool. Configuration-driven: tidak ada kategori yang ditanam di kode frontend.';
comment on column public.categories.display_order is 'Urutan tampil; "order" adalah kata kunci SQL sehingga dinamai display_order.';

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- 3. TABEL: tools -------------------------------------------------------------
create table if not exists public.tools (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category_id  uuid references public.categories (id) on delete restrict,
  description  text,
  target_url   text not null,
  icon         text,
  accent       text not null default 'orange',
  status       public.tool_status not null default 'active',
  tags         text[] not null default '{}',
  release_date date,
  visibility   text not null default 'public',
  opens        integer not null default 0,
  created_by   uuid references public.profiles (id) on delete set null,
  updated_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Validasi server (governance/01 rule 15): URL wajib https, accent hanya key token.
  constraint tools_target_url_https check (target_url ~* '^https://'),
  constraint tools_accent_key check (accent in ('orange', 'green', 'navy', 'yellow', 'sky', 'pink')),
  constraint tools_visibility_key check (visibility in ('public', 'role_scoped'))
);

comment on table public.tools is 'Entitas utama hub: satu tool = satu kartu = satu URL target.';
comment on column public.tools.accent is 'Key token warna, bukan hex. Peta key→warna ada di app_config/token CSS.';
comment on column public.tools.opens is 'Agregat pemakaian; hanya boleh naik lewat RPC increment_tool_opens.';

create index if not exists tools_category_id_idx on public.tools (category_id);
create index if not exists tools_status_idx on public.tools (status);

drop trigger if exists tools_set_updated_at on public.tools;
create trigger tools_set_updated_at
before update on public.tools
for each row execute function public.set_updated_at();

-- Jejak audit diisi server, bukan dari payload client (PRD §2 poin 13).
create or replace function public.stamp_tool_actor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
  else
    new.created_by := old.created_by;
    -- `opens` hanya boleh berubah lewat increment_tool_opens, yang menyalakan
    -- penanda transaksi di bawah ini. Jalur UPDATE biasa selalu dikembalikan,
    -- jadi counter tidak bisa dimanipulasi lewat payload client.
    if coalesce(current_setting('app.opens_bump', true), '') = '1' then
      new.updated_by := old.updated_by; -- peluncuran bukan perubahan editorial
    else
      new.updated_by := auth.uid();
      new.opens := old.opens;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tools_stamp_actor on public.tools;
create trigger tools_stamp_actor
before insert or update on public.tools
for each row execute function public.stamp_tool_actor();

-- 4. TABEL: open_logs ---------------------------------------------------------
create table if not exists public.open_logs (
  id        uuid primary key default gen_random_uuid(),
  tool_id   uuid not null references public.tools (id) on delete cascade,
  opened_at timestamptz not null default now()
);

comment on table public.open_logs is 'Satu baris per peluncuran tool. Diisi hanya lewat RPC increment_tool_opens.';

create index if not exists open_logs_tool_id_opened_at_idx on public.open_logs (tool_id, opened_at desc);

-- 5. RPC: increment_tool_opens ------------------------------------------------
-- Satu-satunya jalan menaikkan `opens`. Tidak mengembalikan data sensitif,
-- dan kegagalannya tidak boleh membatalkan launch di sisi client.
create or replace function public.increment_tool_opens(tool_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  -- Penanda transaksi-lokal: memberi tahu trigger audit bahwa kenaikan `opens`
  -- ini memang berasal dari RPC, bukan dari payload client.
  perform set_config('app.opens_bump', '1', true);

  update public.tools t
     set opens = t.opens + 1
   where t.id = increment_tool_opens.tool_id
     and t.status <> 'archived'
     and t.status <> 'coming_soon';

  get diagnostics affected = row_count;

  if affected = 0 then
    raise exception 'Tool tidak ditemukan atau tidak dapat diluncurkan.' using errcode = '22023';
  end if;

  insert into public.open_logs (tool_id) values (increment_tool_opens.tool_id);

  perform set_config('app.opens_bump', '0', true);
end;
$$;

grant execute on function public.increment_tool_opens(uuid) to anon, authenticated;

-- 6. ROW LEVEL SECURITY -------------------------------------------------------
alter table public.categories enable row level security;
alter table public.tools      enable row level security;
alter table public.open_logs  enable row level security;

-- categories: dibaca publik, ditulis admin.
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
for select to anon, authenticated
using (true);

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- tools: publik hanya menerima tool non-archived; admin melihat semuanya.
drop policy if exists tools_select on public.tools;
create policy tools_select on public.tools
for select to anon, authenticated
using (status <> 'archived' or public.is_admin());

drop policy if exists tools_insert on public.tools;
create policy tools_insert on public.tools
for insert to authenticated
with check (public.is_admin());

drop policy if exists tools_update on public.tools;
create policy tools_update on public.tools
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Soft delete = status 'archived'. Hapus permanen hanya super admin (ERD § Notes).
drop policy if exists tools_delete on public.tools;
create policy tools_delete on public.tools
for delete to authenticated
using (public.is_super_admin());

-- open_logs: tidak ada policy INSERT — satu-satunya jalur masuk adalah RPC.
drop policy if exists open_logs_select on public.open_logs;
create policy open_logs_select on public.open_logs
for select to authenticated
using (public.is_admin());

-- 7. GRANTS -------------------------------------------------------------------
grant select on public.categories to anon, authenticated;
grant select on public.tools to anon, authenticated;
grant insert, update, delete on public.categories to authenticated; -- tetap disaring RLS
grant insert, update, delete on public.tools to authenticated;      -- tetap disaring RLS
grant select on public.open_logs to authenticated;                  -- tetap disaring RLS

-- 8. SEED KATEGORI ------------------------------------------------------------
-- Titik awal yang bisa diubah admin kapan saja; bukan daftar tetap.
insert into public.categories (name, slug, display_order) values
  ('Compliance', 'compliance', 10),
  ('Inspection', 'inspection', 20),
  ('Training',   'training',   30),
  ('Dashboard',  'dashboard',  40),
  ('HR',         'hr',         50),
  ('F&B',        'f-and-b',    60),
  ('Operations', 'operations', 70)
on conflict (slug) do nothing;

-- =============================================================================
-- CATATAN
-- Tool belum diseed: daftarkan lewat Catalog Console (Phase 3), atau sementara
-- lewat SQL — `target_url` wajib https dan `accent` salah satu dari
-- orange | green | navy | yellow | sky | pink.
--
--   insert into public.tools (name, category_id, description, target_url, icon, accent, status, tags)
--   select 'Nama Tool', c.id, 'Deskripsi singkat.', 'https://contoh.co.id', 'shield-check', 'green', 'active',
--          array['audit','iso']
--     from public.categories c where c.slug = 'compliance';
-- =============================================================================
