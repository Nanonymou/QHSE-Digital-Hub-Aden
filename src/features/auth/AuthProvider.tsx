import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { env } from '@/lib/env'
import type { Profile } from '@/types/database'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

/** Pesan login yang jelas tanpa membocorkan detail sensitif (features/09). */
function loginMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Email atau kata sandi tidak cocok. Periksa lagi, lalu coba masuk kembali.'
    case 'email_not_confirmed':
      return 'Email ini belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk lebih dulu.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Terlalu banyak percobaan. Tunggu satu menit sebelum mencoba lagi.'
    default:
      return fallback
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(env.isSupabaseConfigured ? 'loading' : 'unavailable')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, active, created_at')
      .eq('id', userId)
      .maybeSingle<Profile>()

    if (error) {
      setProfile(null)
      setProfileError('Profil akses tidak bisa dimuat. Muat ulang halaman, atau hubungi super admin bila berlanjut.')
      return
    }
    if (!data) {
      setProfile(null)
      setProfileError('Akun ini belum punya profil akses. Minta super admin menetapkan role di Supabase.')
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

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Koneksi Supabase belum dikonfigurasi. Isi .env lebih dulu.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(loginMessage(error.code, 'Masuk gagal. Coba lagi sebentar lagi.'))
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error('Keluar gagal. Periksa koneksi, lalu coba lagi.')
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
