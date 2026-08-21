import { supabase } from '@/lib/supabase'

export type RecentOpensResult = { count: number | null; error: string | null }

/**
 * Jumlah peluncuran dalam N hari terakhir dari `open_logs`.
 * RLS hanya mengizinkan admin membaca tabel ini, jadi pemanggil non-admin
 * akan menerima 0 baris — bukan data orang lain.
 */
export async function fetchRecentOpens(days = 30): Promise<RecentOpensResult> {
  if (!supabase) return { count: null, error: null }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from('open_logs')
    .select('id', { count: 'exact', head: true })
    .gte('opened_at', since)

  if (error) {
    return { count: null, error: 'Log pemakaian tidak bisa dibaca. Coba muat ulang halaman.' }
  }
  return { count: count ?? 0, error: null }
}
