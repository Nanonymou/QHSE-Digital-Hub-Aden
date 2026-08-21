import { ACCENT_KEYS, type AccentKey } from '@/types/database'

/**
 * Departemen dipetakan ke accent token secara stabil (hash sederhana),
 * jadi warna kartu konsisten antar-sesi tanpa perlu kolom warna di database.
 */
export function departmentAccent(department: string | null): AccentKey {
  if (!department) return 'navy'
  let hash = 0
  for (const char of department) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return ACCENT_KEYS[hash % ACCENT_KEYS.length]
}
