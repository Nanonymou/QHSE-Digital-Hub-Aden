import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import type { ToolStatus, ToolWithCategory } from '@/types/database'

export const SORT_OPTIONS = [
  { key: 'name', label: 'Nama (A-Z)' },
  { key: 'recent', label: 'Terbaru' },
  { key: 'opens', label: 'Paling sering dibuka' },
] as const

export type SortKey = (typeof SORT_OPTIONS)[number]['key']

function matchesQuery(tool: ToolWithCategory, query: string): boolean {
  if (!query) return true
  const haystack = [tool.name, tool.description ?? '', tool.category?.name ?? '', ...tool.tags]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

/**
 * Pencarian + filter + sort berjalan bersamaan di client.
 * Katalog hub berskala puluhan tool, jadi menyaring di memori jauh lebih responsif
 * daripada bolak-balik ke server tiap ketikan; pencarian tetap di-debounce.
 */
export function useCatalogFilters(tools: ToolWithCategory[]) {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | 'all'>('all')
  const [status, setStatus] = useState<ToolStatus | 'all'>('all')
  const [tag, setTag] = useState<string | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('name')

  const debouncedQuery = useDebouncedValue(query.trim(), 250)

  const availableTags = useMemo(() => {
    const unique = new Set<string>()
    for (const tool of tools) for (const item of tool.tags) unique.add(item)
    return [...unique].sort((a, b) => a.localeCompare(b, 'id'))
  }, [tools])

  const results = useMemo(() => {
    const filtered = tools.filter(
      (tool) =>
        matchesQuery(tool, debouncedQuery) &&
        (categoryId === 'all' || tool.category_id === categoryId) &&
        (status === 'all' || tool.status === status) &&
        (tag === 'all' || tool.tags.includes(tag)),
    )

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'opens':
          return b.opens - a.opens || a.name.localeCompare(b.name, 'id')
        case 'recent':
          return (b.release_date ?? '').localeCompare(a.release_date ?? '') || a.name.localeCompare(b.name, 'id')
        default:
          return a.name.localeCompare(b.name, 'id')
      }
    })
  }, [tools, debouncedQuery, categoryId, status, tag, sort])

  const isFiltered = Boolean(debouncedQuery) || categoryId !== 'all' || status !== 'all' || tag !== 'all'

  const reset = () => {
    setQuery('')
    setCategoryId('all')
    setStatus('all')
    setTag('all')
  }

  return {
    query,
    setQuery,
    categoryId,
    setCategoryId,
    status,
    setStatus,
    tag,
    setTag,
    sort,
    setSort,
    availableTags,
    results,
    isFiltered,
    reset,
  }
}
