import { useState } from 'react'
import { LayoutGrid, SearchX } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { LoadingState } from '@/components/state/LoadingState'
import { Button } from '@/components/ui/button'
import type { TranslationKey } from '@/features/i18n/i18n-context'
import { useI18n } from '@/features/i18n/useI18n'
import type { ToolWithCategory } from '@/types/database'
import { STATUS_META } from './status'
import { CatalogToolbar } from './CatalogToolbar'
import { ToolDetailDialog } from './ToolDetailDialog'
import { ToolGrid } from './ToolGrid'
import type { CatalogState } from './useCatalog'
import { useCatalogFilters } from './useCatalogFilters'

export function CatalogSection({ catalog }: { catalog: CatalogState }) {
  const { loading, tools, categories, error, reload, launchTool } = catalog
  const filters = useCatalogFilters(tools)
  const { t } = useI18n()
  const [detailTool, setDetailTool] = useState<ToolWithCategory | null>(null)
  const [notice, setNotice] = useState<TranslationKey | null>(null)

  const handleLaunch = (tool: ToolWithCategory) => {
    const result = launchTool(tool)
    if (result.ok) return setNotice(null)
    setNotice(
      result.reason === 'invalid_url'
        ? 'catalog.launchBlocked.invalidUrl'
        : (STATUS_META[result.status].warningKey ?? 'catalog.launchBlocked.status'),
    )
  }

  if (loading) return <LoadingState label={t('catalog.loading')} />

  if (error) {
    return (
      <ErrorState
        title={t('error.catalogLoad.title')}
        description={t('error.catalogLoad.body')}
        action={
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            {t('catalog.reload')}
          </Button>
        }
      />
    )
  }

  if (tools.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid aria-hidden className="size-6" />}
        title={t('catalog.empty.title')}
        description={t('catalog.empty.body')}
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

      {notice ? <ErrorState title={t('catalog.launchBlocked.title')} description={t(notice)} /> : null}

      {filters.results.length === 0 ? (
        <EmptyState
          icon={<SearchX aria-hidden className="size-6" />}
          title={t('catalog.noResult.title')}
          description={t('catalog.noResult.body')}
          action={
            <Button variant="outline" size="sm" onClick={filters.reset}>
              {t('catalog.clearFilter')}
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
