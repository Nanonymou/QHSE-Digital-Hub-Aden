import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { ToolIcon } from '@/features/catalog/ToolIcon'
import { useI18n } from '@/features/i18n/useI18n'
import type { ToolWithCategory } from '@/types/database'
import { fetchRecentOpens, type RecentOpensResult } from './analytics-api'
import { StatTile } from './StatTile'

const PERIOD_DAYS = 30
const TOP_LIMIT = 5

/**
 * Detail pemakaian hanya untuk admin (technical/05 § Data Isolation).
 * Peringkat memakai satu ukuran (opens) dan satu warna — batang di sini
 * menunjukkan besaran relatif, bukan identitas seri.
 */
export function AdminInsights({ tools }: { tools: ToolWithCategory[] }) {
  const [recent, setRecent] = useState<RecentOpensResult>({
    count: null,
    error: null,
  })
  const { t } = useI18n()

  useEffect(() => {
    let alive = true
    void fetchRecentOpens(PERIOD_DAYS).then((result) => {
      if (alive) setRecent(result)
    })
    return () => {
      alive = false
    }
  }, [])

  const ranked = [...tools]
    .filter((tool) => tool.status !== 'archived' && tool.opens > 0)
    .sort((a, b) => b.opens - a.opens)
    .slice(0, TOP_LIMIT)

  const max = ranked[0]?.opens ?? 0

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl">{t('insights.heading')}</h2>

      {recent.error ? (
        <ErrorState title={t('insights.logsFailed.title')} description={t('insights.logsFailed.body')} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          label={t('insights.recent', { days: PERIOD_DAYS })}
          value={recent.count === null ? '—' : recent.count.toLocaleString()}
          hint={t('insights.recentHint')}
        />
        <StatTile
          label={t('insights.top')}
          value={ranked[0]?.name ?? '—'}
          hint={
            ranked[0]
              ? t('insights.topHint', {
                  count: ranked[0].opens.toLocaleString(),
                })
              : undefined
          }
        />
      </div>

      {ranked.length === 0 ? (
        <EmptyState title={t('insights.empty.title')} description={t('insights.empty.body')} />
      ) : (
        <ol className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-5">
          {ranked.map((tool) => (
            <li key={tool.id} className="flex items-center gap-3">
              <ToolIcon name={tool.icon} className="size-4 shrink-0 text-text-subtle" />
              <span className="min-w-0 flex-1 truncate text-sm text-text sm:w-40 sm:flex-none">
                {tool.name}
              </span>
              {/* Batang perbandingan butuh ruang; di layar sempit angkanya sudah cukup. */}
              <span className="hidden h-2 flex-1 overflow-hidden rounded-sm bg-surface-elevated sm:block">
                <span
                  className="block h-full rounded-sm bg-primary"
                  style={{
                    width: `${max > 0 ? Math.max((tool.opens / max) * 100, 2) : 0}%`,
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-xs text-text-muted">
                {t('insights.times', { count: tool.opens.toLocaleString() })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
