import { supabase } from '@/lib/supabase'

export type AnalyticsErrorCode = 'logs_failed'

export type RecentOpensResult = {
  count: number | null
  error: AnalyticsErrorCode | null
}

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
    return { count: null, error: 'logs_failed' }
  }
  return { count: count ?? 0, error: null }
}
