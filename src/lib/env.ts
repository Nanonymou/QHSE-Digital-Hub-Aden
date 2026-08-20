/**
 * Pembacaan env terpusat. Hanya key `VITE_*` yang boleh dipakai di client,
 * dan hanya anon key Supabase (technical/05-security-rbac.md).
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const env = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  /** Sebelum `.env` diisi, app tetap jalan tapi fitur data dimatikan dengan pesan jelas. */
  isSupabaseConfigured: url.length > 0 && anonKey.length > 0,
}
