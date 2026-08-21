import { ExternalLink, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/useI18n'
import { cn } from '@/lib/utils'
import type { ToolWithCategory } from '@/types/database'
import { accentStyle } from './accent'
import { StatusBadge } from './StatusBadge'
import { STATUS_META } from './status'
import { ToolIcon } from './ToolIcon'

type ToolCardProps = {
  tool: ToolWithCategory
  onLaunch: (tool: ToolWithCategory) => void
  onDetail: (tool: ToolWithCategory) => void
}

export function ToolCard({ tool, onLaunch, onDetail }: ToolCardProps) {
  const { t } = useI18n()
  const meta = STATUS_META[tool.status]
  const launchable = meta.launchable

  return (
    <article
      style={accentStyle(tool.accent)}
      className={cn(
        'group relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-hairline bg-surface p-5',
        'shadow-card transition-[transform,box-shadow] duration-micro ease-out-soft',
        // Kartu "segera hadir" tidak diredupkan: badge dan tombol nonaktif sudah
        // menyampaikan statusnya, sedangkan meredupkan teks merusak kontras AA.
        launchable ? 'hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0' : null,
      )}
    >
      {/* Garis accent menegas saat hover — satu-satunya dekorasi kartu. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-[rgb(var(--tool-accent))] opacity-40 transition-opacity duration-micro group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-md bg-[rgb(var(--tool-accent)/0.14)] text-[rgb(var(--tool-accent))]"
        >
          <ToolIcon name={tool.icon} className="size-5" />
        </span>
        <StatusBadge status={tool.status} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-snug text-text">{tool.name}</h3>
        <p className="font-mono text-xs text-text-subtle">{tool.category?.name ?? t('catalog.noCategory')}</p>
      </div>

      {tool.description ? (
        <p className="line-clamp-3 flex-1 text-sm text-text-muted">{tool.description}</p>
      ) : (
        <p className="flex-1 text-sm text-text-subtle">{t('catalog.noDescription')}</p>
      )}

      {tool.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              <Badge className="border-line/15 bg-surface-elevated font-mono text-text-subtle">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-2 pt-1">
        {launchable ? (
          // `after:absolute inset-0` membuat seluruh kartu ikut membuka tool,
          // tanpa mengorbankan tombol sungguhan untuk keyboard & screen reader.
          <Button
            size="sm"
            className="after:absolute after:inset-0 after:content-['']"
            onClick={() => onLaunch(tool)}
          >
            <ExternalLink aria-hidden />
            {t('catalog.launch')}
          </Button>
        ) : (
          <Button size="sm" disabled title={meta.warningKey ? t(meta.warningKey) : undefined}>
            {t(meta.labelKey)}
          </Button>
        )}

        <Button variant="ghost" size="sm" className="relative z-10" onClick={() => onDetail(tool)}>
          <Info aria-hidden />
          {t('catalog.detail')}
        </Button>
      </div>
    </article>
  )
}
