import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Satu instance client untuk seluruh app.
 * `null` bila `.env` belum diisi — pemanggil wajib menangani kondisi ini
 * (lihat `requireSupabase`) agar app tidak crash saat konfigurasi kosong.
 */
export const supabase: SupabaseClient | null = env.isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Koneksi Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.')
    this.name = 'SupabaseNotConfiguredError'
  }
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new SupabaseNotConfiguredError()
  return supabase
}
