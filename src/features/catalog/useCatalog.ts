import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ToolWithCategory } from '@/types/database'
import { fetchCatalog, isSafeToolUrl, recordToolOpen, type CatalogData } from './catalog-api'
import { STATUS_META } from './status'

const EMPTY: CatalogData = { tools: [], categories: [] }

export function useCatalog() {
  const [loading, setLoading] = useState(Boolean(supabase))
  const [data, setData] = useState<CatalogData>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchCatalog>>) => {
    setData(result.data)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    let alive = true
    void fetchCatalog().then((result) => {
      if (alive) apply(result)
    })
    return () => {
      alive = false
    }
  }, [apply])

  const reload = useCallback(async () => {
    setLoading(true)
    apply(await fetchCatalog())
  }, [apply])

  /**
   * Buka tab dulu, catat kemudian. Urutannya penting: pencatatan yang gagal
   * atau lambat tidak boleh menahan launch, dan tab dibuka pada gestur user
   * agar tidak diblokir browser.
   */
  const launchTool = useCallback((tool: ToolWithCategory): { ok: boolean; message?: string } => {
    if (!STATUS_META[tool.status].launchable) {
      return { ok: false, message: STATUS_META[tool.status].warning ?? 'Tool ini belum bisa dibuka.' }
    }
    if (!isSafeToolUrl(tool.target_url)) {
      return { ok: false, message: 'Alamat tool tidak valid (harus https). Minta admin memperbaikinya.' }
    }

    window.open(tool.target_url, '_blank', 'noopener,noreferrer')
    void recordToolOpen(tool.id)
    setData((current) => ({
      ...current,
      tools: current.tools.map((item) => (item.id === tool.id ? { ...item, opens: item.opens + 1 } : item)),
    }))
    return { ok: true }
  }, [])

  return { loading, tools: data.tools, categories: data.categories, error, reload, launchTool }
}
