import { CircleCheck, ExternalLink, LayoutGrid, Tags } from 'lucide-react'
import type { Category, ToolWithCategory } from '@/types/database'
import { StatTile } from './StatTile'

/** KPI publik: seluruhnya agregat, tanpa data per pengguna (features/06). */
export function KpiRow({ tools, categories }: { tools: ToolWithCategory[]; categories: Category[] }) {
  const visible = tools.filter((tool) => tool.status !== 'archived')
  const active = visible.filter((tool) => tool.status === 'active').length
  const opens = visible.reduce((total, tool) => total + tool.opens, 0)
  const usedCategories = categories.filter((category) => category.active).length

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label="Tool terdaftar"
        value={visible.length}
        icon={<LayoutGrid aria-hidden className="size-4" />}
      />
      <StatTile
        label="Siap dipakai"
        value={active}
        hint={visible.length > 0 ? `dari ${visible.length} tool` : undefined}
        icon={<CircleCheck aria-hidden className="size-4" />}
      />
      <StatTile label="Kategori aktif" value={usedCategories} icon={<Tags aria-hidden className="size-4" />} />
      <StatTile
        label="Total dibuka"
        value={opens.toLocaleString('id-ID')}
        hint="sejak hub berjalan"
        icon={<ExternalLink aria-hidden className="size-4" />}
      />
    </div>
  )
}
