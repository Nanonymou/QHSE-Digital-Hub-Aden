import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import type { Profile } from '@/types/database'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
  type LoginErrorCode,
  type ProfileErrorCode,
  type SignInResult,
} from './auth-context'

/** Pemetaan kode Supabase → kode internal, tanpa membocorkan detail sensitif (features/09). */
function loginErrorCode(code: string | undefined): LoginErrorCode {
  switch (code) {
    case 'invalid_credentials':
      return 'invalid_credentials'
    case 'email_not_confirmed':
      return 'email_not_confirmed'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'rate_limited'
    default:
      return 'unknown'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(env.isSupabaseConfigured ? 'loading' : 'unavailable')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState<ProfileErrorCode | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, active, created_at')
      .eq('id', userId)
      .maybeSingle<Profile>()

    if (error) {
      setProfile(null)
      setProfileError('failed')
      return
    }
    if (!data) {
      setProfile(null)
      setProfileError('missing')
      return
    }
    setProfileError(null)
    setProfile(data)
  }, [])

  useEffect(() => {
    if (!supabase) return

    let alive = true

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return
      setSession(data.session)
      if (data.session?.user) await loadProfile(data.session.user.id)
      if (!alive) return
      setStatus(data.session ? 'authenticated' : 'anonymous')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) {
        void loadProfile(next.user.id)
        setStatus('authenticated')
      } else {
        setProfile(null)
        setProfileError(null)
        setStatus('anonymous')
      }
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    if (!supabase) return { ok: false, code: 'not_configured' }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) return { ok: false, code: loginErrorCode(error.code) }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(async () => {
    const userId = session?.user.id
    if (userId) await loadProfile(userId)
  }, [session?.user.id, loadProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      profileError,
      signIn,
      signOut,
      refreshProfile,
    }),
    [status, session, profile, profileError, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
