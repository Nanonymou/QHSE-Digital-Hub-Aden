import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

export type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  user: User | null
  /** Profil RBAC milik user aktif; `null` bila belum login atau baris profil belum ada. */
  profile: Profile | null
  profileError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
