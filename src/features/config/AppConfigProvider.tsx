import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppConfigRow, Branding } from '@/types/database'
import { AppConfigContext, type AppConfigContextValue, type ConfigErrorCode } from './app-config-context'
import { FALLBACK_BRANDING, parseBranding } from './branding'

type ConfigResult = {
  config: Record<string, unknown>
  error: ConfigErrorCode | null
}

/** Fetch murni (tanpa state React) agar bisa dipakai effect maupun tombol muat ulang. */
async function fetchAppConfig(): Promise<ConfigResult> {
  if (!supabase) return { config: {}, error: null }

  const { data, error } = await supabase.from('app_config').select('key, value, updated_at')
  if (error) {
    return { config: {}, error: 'load_failed' }
  }

  const rows = (data ?? []) as AppConfigRow[]
  return {
    config: Object.fromEntries(rows.map((row) => [row.key, row.value])),
    error: null,
  }
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(Boolean(supabase))
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [branding, setBranding] = useState<Branding>(FALLBACK_BRANDING)
  const [error, setError] = useState<ConfigErrorCode | null>(null)

  const apply = useCallback((result: ConfigResult) => {
    setConfig(result.config)
    setBranding(result.error ? FALLBACK_BRANDING : parseBranding(result.config.branding))
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    let alive = true
    void fetchAppConfig().then((result) => {
      if (alive) apply(result)
    })
    return () => {
      alive = false
    }
  }, [apply])

  const reload = useCallback(async () => {
    setLoading(true)
    apply(await fetchAppConfig())
  }, [apply])

  const value = useMemo<AppConfigContextValue>(
    () => ({ loading, branding, config, error, reload }),
    [loading, branding, config, error, reload],
  )

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
}
