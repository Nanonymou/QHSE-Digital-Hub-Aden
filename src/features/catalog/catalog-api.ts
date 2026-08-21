import { supabase } from '@/lib/supabase'
import type { Category, Tool, ToolWithCategory } from '@/types/database'

export type CatalogData = {
  tools: ToolWithCategory[]
  categories: Category[]
}

export type CatalogErrorCode = 'load_failed'

export type CatalogResult = {
  data: CatalogData
  error: CatalogErrorCode | null
}

const EMPTY: CatalogData = { tools: [], categories: [] }

/**
 * Katalog dibaca dalam satu putaran: kategori (untuk urutan & label) dan tool.
 * Baris archived tidak pernah sampai ke client publik — disaring RLS, bukan di sini.
 */
export async function fetchCatalog(): Promise<CatalogResult> {
  if (!supabase) return { data: EMPTY, error: null }

  const [categoryQuery, toolQuery] = await Promise.all([
    supabase.from('categories').select('id, name, slug, display_order, active').order('display_order'),
    supabase
      .from('tools')
      .select(
        'id, name, category_id, description, target_url, icon, accent, status, tags, release_date, opens',
      )
      .order('name'),
  ])

  if (categoryQuery.error || toolQuery.error) {
    return { data: EMPTY, error: 'load_failed' }
  }

  const categories = (categoryQuery.data ?? []) as Category[]
  const byId = new Map(categories.map((category) => [category.id, category]))
  const tools = ((toolQuery.data ?? []) as Tool[]).map<ToolWithCategory>((tool) => ({
    ...tool,
    category: tool.category_id ? (byId.get(tool.category_id) ?? null) : null,
  }))

  return { data: { tools, categories }, error: null }
}

/** URL tool wajib https (features/02). Dicek di client DAN di constraint tabel. */
export function isSafeToolUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Catat satu open. Sengaja tidak melempar: kegagalan pencatatan tidak boleh
 * membatalkan atau memperlambat launch (PRD §4).
 */
export async function recordToolOpen(toolId: string): Promise<void> {
  if (!supabase) return
  await supabase.rpc('increment_tool_opens', { tool_id: toolId })
}
