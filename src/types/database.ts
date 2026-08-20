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

/** Nilai `app_config.key = 'branding'`. Semua identitas brand berasal dari sini. */
export type Branding = {
  product_name: string
  company_name: string
  tagline: string | null
  logo_url: string | null
  default_lang: string
  default_theme: 'light' | 'dark'
}
