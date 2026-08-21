import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { Category, ToolStatus } from '@/types/database'
import { STATUS_META } from './status'
import { SORT_OPTIONS, type SortKey } from './useCatalogFilters'

type CatalogToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  categories: Category[]
  categoryId: string | 'all'
  onCategoryChange: (value: string | 'all') => void
  status: ToolStatus | 'all'
  onStatusChange: (value: ToolStatus | 'all') => void
  tags: string[]
  tag: string | 'all'
  onTagChange: (value: string | 'all') => void
  sort: SortKey
  onSortChange: (value: SortKey) => void
  isFiltered: boolean
  onReset: () => void
  resultCount: number
  totalCount: number
}

// Status archived tidak pernah sampai ke katalog publik, jadi tidak ditawarkan sebagai filter.
const FILTERABLE_STATUSES: ToolStatus[] = ['active', 'beta', 'maintenance', 'coming_soon']

export function CatalogToolbar({
  query,
  onQueryChange,
  categories,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
  tags,
  tag,
  onTagChange,
  sort,
  onSortChange,
  isFiltered,
  onReset,
  resultCount,
  totalCount,
}: CatalogToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="catalog-search">Cari tool</Label>
          <span className="relative flex">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-3 size-4 text-text-subtle" />
            <Input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="nama, deskripsi, kategori, atau tag"
              className="pl-9"
            />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-category">Kategori</Label>
            <Select
              id="catalog-category"
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value as string | 'all')}
            >
              <option value="all">Semua</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-status">Status</Label>
            <Select
              id="catalog-status"
              value={status}
              onChange={(event) => onStatusChange(event.target.value as ToolStatus | 'all')}
            >
              <option value="all">Semua</option>
              {FILTERABLE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_META[item].label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-tag">Tag</Label>
            <Select
              id="catalog-tag"
              value={tag}
              disabled={tags.length === 0}
              onChange={(event) => onTagChange(event.target.value as string | 'all')}
            >
              <option value="all">Semua</option>
              {tags.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-sort">Urutkan</Label>
            <Select
              id="catalog-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="font-mono text-xs text-text-subtle">
          {resultCount} dari {totalCount} tool
        </p>
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X aria-hidden />
            Hapus filter
          </Button>
        ) : null}
      </div>
    </div>
  )
}
