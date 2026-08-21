/**
 * Tipe entitas Phase 1 (technical/02-database-erd.md).
 * Entitas katalog (categories/tools/open_logs) menyusul di Phase 2.
 */

export const ROLES = ['super_admin', 'admin', 'member', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export type Profile = {
  id: string
  full_name: string | null
  role: Role
  active: boolean
  created_at: string
}

export type AppConfigRow = {
  key: string
  value: unknown
  updated_at: string
}

export const TOOL_STATUSES = ['active', 'beta', 'maintenance', 'coming_soon', 'archived'] as const
export type ToolStatus = (typeof TOOL_STATUSES)[number]

export const ACCENT_KEYS = ['orange', 'green', 'navy', 'yellow', 'sky', 'pink'] as const
export type AccentKey = (typeof ACCENT_KEYS)[number]

export type Category = {
  id: string
  name: string
  slug: string
  display_order: number
  active: boolean
}

export type Tool = {
  id: string
  name: string
  category_id: string | null
  description: string | null
  target_url: string
  icon: string | null
  accent: AccentKey
  status: ToolStatus
  tags: string[]
  release_date: string | null
  opens: number
}

/** Tool yang sudah dipasangkan dengan kategorinya untuk keperluan tampilan. */
export type ToolWithCategory = Tool & { category: Category | null }

export type TeamMember = {
  id: string
  user_id: string | null
  full_name: string
  position: string | null
  department: string | null
  photo_url: string | null
  bio: string | null
  email: string | null
  phone: string | null
  display_order: number
  active: boolean
  visible_public: boolean
}

/** Nilai `app_config.key = 'branding'`. Semua identitas brand berasal dari sini. */
export type Branding = {
  product_name: string
  company_name: string
  tagline: string | null
  logo_url: string | null
  default_lang: string
  default_theme: 'light' | 'dark'
}
