import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { ToolIcon } from '@/features/catalog/ToolIcon'
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
  const [recent, setRecent] = useState<RecentOpensResult>({ count: null, error: null })

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
      <h2 className="text-xl">Pemakaian</h2>

      {recent.error ? <ErrorState title="Log pemakaian tidak termuat" description={recent.error} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          label={`Dibuka ${PERIOD_DAYS} hari terakhir`}
          value={recent.count === null ? '—' : recent.count.toLocaleString('id-ID')}
          hint="dari catatan launch"
        />
        <StatTile
          label="Tool paling sering dibuka"
          value={ranked[0]?.name ?? '—'}
          hint={ranked[0] ? `${ranked[0].opens.toLocaleString('id-ID')}× sepanjang waktu` : undefined}
        />
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          title="Belum ada tool yang dibuka"
          description="Peringkat muncul setelah ada tool yang diluncurkan dari katalog. Bagikan tautan hub ke tim agar pemakaiannya tercatat."
        />
      ) : (
        <ol className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-5">
          {ranked.map((tool) => (
            <li key={tool.id} className="flex items-center gap-3">
              <ToolIcon name={tool.icon} className="size-4 shrink-0 text-text-subtle" />
              <span className="min-w-0 flex-1 truncate text-sm text-text sm:w-40 sm:flex-none">{tool.name}</span>
              {/* Batang perbandingan butuh ruang; di layar sempit angkanya sudah cukup. */}
              <span className="hidden h-2 flex-1 overflow-hidden rounded-sm bg-surface-elevated sm:block">
                <span
                  className="block h-full rounded-sm bg-primary"
                  style={{ width: `${max > 0 ? Math.max((tool.opens / max) * 100, 2) : 0}%` }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-xs text-text-muted">
                {tool.opens.toLocaleString('id-ID')}×
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
