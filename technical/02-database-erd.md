# Database ERD (Supabase / Postgres)

## Core Entities

profiles (extends auth.users)
- id (uuid, FK auth.users)
- full_name
- role (super_admin | admin | viewer)
- active (bool)
- created_at

categories
- id (uuid)
- name
- slug (unique)
- order (int)
- active (bool)
- created_at

tools
- id (uuid)
- name
- category_id (FK categories)
- description
- target_url
- icon
- accent (token key, mis. 'cyan'|'amber'|...)
- status (active | beta | maintenance | coming_soon | archived)
- tags (text[])
- release_date (date)
- visibility (public | role_scoped)  -- future
- opens (int, default 0)
- created_by (FK profiles)
- updated_by (FK profiles)
- created_at
- updated_at

open_logs
- id (uuid)
- tool_id (FK tools)
- opened_at (timestamptz)

team_members
- id (uuid)
- user_id (uuid, FK auth.users, nullable)  -- penanda kepemilikan utk self-edit
- full_name
- position (text; i18n opsional via jsonb atau kolom terpisah)
- department
- photo_url (Supabase Storage; nullable → fallback avatar)
- bio (text, nullable)
- email (nullable)
- phone (nullable; format E.164 untuk wa.me)
- site (nullable)
- order (int)
- active (bool, default true)
- visible_public (bool, default false)  -- kontrol privasi
- created_at
- updated_at

app_config
- key (text, pk)
- value (jsonb)   -- branding, default_lang, theme tokens, status colors

## Relationships
- categories 1:N tools
- tools 1:N open_logs
- profiles 1:N tools (created_by / updated_by)
- team_members: mandiri (dikelola admin)

## RPC
- increment_tool_opens(tool_id uuid) — security definer; increment opens + insert open_logs; callable oleh anon.

## Notes
- Accent & status **hanya key token**; nilai warnanya di app_config / token CSS, bukan di baris tool.
- Soft delete = status 'archived' (bukan hapus baris), kecuali delete permanen oleh Super Admin.
