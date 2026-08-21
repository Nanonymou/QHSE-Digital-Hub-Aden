import { useState } from 'react'
import { LayoutGrid, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { LoadingState } from '@/components/state/LoadingState'
import { Button } from '@/components/ui/button'
import type { ToolWithCategory } from '@/types/database'
import { CatalogToolbar } from './CatalogToolbar'
import { ToolDetailDialog } from './ToolDetailDialog'
import { ToolGrid } from './ToolGrid'
import type { CatalogState } from './useCatalog'
import { useCatalogFilters } from './useCatalogFilters'

export function CatalogSection({ catalog }: { catalog: CatalogState }) {
  const { loading, tools, categories, error, reload, launchTool } = catalog
  const filters = useCatalogFilters(tools)
  const [detailTool, setDetailTool] = useState<ToolWithCategory | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleLaunch = (tool: ToolWithCategory) => {
    const result = launchTool(tool)
    setNotice(result.ok ? null : (result.message ?? null))
  }

  if (loading) return <LoadingState label="Memuat katalog tool" />

  if (error) {
    return (
      <ErrorState
        title="Katalog tidak termuat"
        description={error}
        action={
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            Muat ulang katalog
          </Button>
        }
      />
    )
  }

  if (tools.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid aria-hidden className="size-6" />}
        title="Belum ada tool terdaftar"
        description="Daftarkan tool QHSE pertama lewat Catalog Console, atau tambahkan langsung di Supabase mengikuti contoh pada migration 0002."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <CatalogToolbar
        query={filters.query}
        onQueryChange={filters.setQuery}
        categories={categories}
        categoryId={filters.categoryId}
        onCategoryChange={filters.setCategoryId}
        status={filters.status}
        onStatusChange={filters.setStatus}
        tags={filters.availableTags}
        tag={filters.tag}
        onTagChange={filters.setTag}
        sort={filters.sort}
        onSortChange={filters.setSort}
        isFiltered={filters.isFiltered}
        onReset={filters.reset}
        resultCount={filters.results.length}
        totalCount={tools.length}
      />

      {notice ? <ErrorState title="Tool belum bisa dibuka" description={notice} /> : null}

      {filters.results.length === 0 ? (
        <EmptyState
          icon={<SearchX aria-hidden className="size-6" />}
          title="Tidak ada tool yang cocok"
          description="Coba kata kunci yang lebih pendek, pilih kategori lain, atau hapus filter untuk melihat seluruh katalog."
          action={
            <Button variant="outline" size="sm" onClick={filters.reset}>
              Hapus filter
            </Button>
          }
        />
      ) : (
        <ToolGrid tools={filters.results} onLaunch={handleLaunch} onDetail={setDetailTool} />
      )}

      <ToolDetailDialog
        tool={detailTool}
        onOpenChange={(open) => {
          if (!open) setDetailTool(null)
        }}
        onLaunch={handleLaunch}
      />
    </div>
  )
}
