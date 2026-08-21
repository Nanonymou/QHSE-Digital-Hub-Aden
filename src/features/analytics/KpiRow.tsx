import { CircleCheck, ExternalLink, LayoutGrid, Tags } from 'lucide-react'
import { useI18n } from '@/features/i18n/useI18n'
import type { Category, ToolWithCategory } from '@/types/database'
import { StatTile } from './StatTile'

/** KPI publik: seluruhnya agregat, tanpa data per pengguna (features/06). */
export function KpiRow({ tools, categories }: { tools: ToolWithCategory[]; categories: Category[] }) {
  const { t } = useI18n()
  const visible = tools.filter((tool) => tool.status !== 'archived')
  const active = visible.filter((tool) => tool.status === 'active').length
  const opens = visible.reduce((total, tool) => total + tool.opens, 0)
  const usedCategories = categories.filter((category) => category.active).length

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label={t('kpi.tools')}
        value={visible.length}
        icon={<LayoutGrid aria-hidden className="size-4" />}
      />
      <StatTile
        label={t('kpi.active')}
        value={active}
        hint={visible.length > 0 ? t('kpi.activeHint', { total: visible.length }) : undefined}
        icon={<CircleCheck aria-hidden className="size-4" />}
      />
      <StatTile
        label={t('kpi.categories')}
        value={usedCategories}
        icon={<Tags aria-hidden className="size-4" />}
      />
      <StatTile
        label={t('kpi.opens')}
        value={opens.toLocaleString('id-ID')}
        hint={t('kpi.opensHint')}
        icon={<ExternalLink aria-hidden className="size-4" />}
      />
    </div>
  )
}
