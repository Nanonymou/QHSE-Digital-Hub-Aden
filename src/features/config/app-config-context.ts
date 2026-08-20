import { createContext } from 'react'
import type { Branding } from '@/types/database'

export type AppConfigContextValue = {
  loading: boolean
  /** Branding selalu terisi — memakai fallback bila config belum ada. */
  branding: Branding
  /** Seluruh baris app_config, agar Phase berikutnya bisa membaca key lain tanpa fetch ulang. */
  config: Record<string, unknown>
  error: string | null
  reload: () => Promise<void>
}

export const AppConfigContext = createContext<AppConfigContextValue | null>(null)
