import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

/** Kode, bukan kalimat: penerjemahan terjadi di komponen lewat kamus i18n. */
export type LoginErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'not_configured'
  | 'unknown'

export type ProfileErrorCode = 'missing' | 'failed'

export type SignInResult = { ok: true } | { ok: false; code: LoginErrorCode }

export type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  user: User | null
  /** Profil RBAC milik user aktif; `null` bila belum login atau baris profil belum ada. */
  profile: Profile | null
  profileError: ProfileErrorCode | null
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
