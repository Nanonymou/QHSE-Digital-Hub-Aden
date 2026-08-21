import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { usePermission } from '@/features/auth/useAuth'
import { useI18n } from '@/features/i18n/useI18n'
import type { ToolWithCategory } from '@/types/database'
import { accentStyle } from './accent'
import { StatusBadge } from './StatusBadge'
import { STATUS_META } from './status'
import { ToolIcon } from './ToolIcon'

type ToolDetailDialogProps = {
  tool: ToolWithCategory | null
  onOpenChange: (open: boolean) => void
  onLaunch: (tool: ToolWithCategory) => void
}

function formatDate(value: string | null, locale: string): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ToolDetailDialog({ tool, onOpenChange, onLaunch }: ToolDetailDialogProps) {
  // Angka pemakaian hanya untuk admin (technical/05 § Data Isolation).
  const canSeeOpens = usePermission('catalog.write')
  const { lang, t } = useI18n()

  if (!tool) return null

  const meta = STATUS_META[tool.status]
  const released = formatDate(
    tool.release_date,
    lang === 'zh' ? 'zh-Hans' : lang === 'en' ? 'en-GB' : 'id-ID',
  )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent style={accentStyle(tool.accent)} aria-describedby={undefined}>
        <div className="flex items-start gap-3 pr-8">
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-md bg-[rgb(var(--tool-accent)/0.14)] text-[rgb(var(--tool-accent))]"
          >
            <ToolIcon name={tool.icon} className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <DialogTitle>{tool.name}</DialogTitle>
            <span className="font-mono text-xs text-text-subtle">
              {tool.category?.name ?? t('catalog.noCategory')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={tool.status} />
          {tool.tags.map((tag) => (
            <Badge key={tag} className="border-line/15 bg-surface-elevated font-mono text-text-subtle">
              {tag}
            </Badge>
          ))}
        </div>

        <DialogDescription>{tool.description ?? t('catalog.detailNoDescription')}</DialogDescription>

        {meta.warningKey ? <p className="text-sm text-warn">{t(meta.warningKey)}</p> : null}

        <dl className="grid gap-3 border-t border-hairline pt-4 font-mono text-xs sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="uppercase tracking-wide text-text-subtle">{t('catalog.address')}</dt>
            <dd className="break-all text-text-muted">{tool.target_url}</dd>
          </div>
          {released ? (
            <div className="flex flex-col gap-1">
              <dt className="uppercase tracking-wide text-text-subtle">{t('catalog.released')}</dt>
              <dd className="text-text-muted">{released}</dd>
            </div>
          ) : null}
          {canSeeOpens ? (
            <div className="flex flex-col gap-1">
              <dt className="uppercase tracking-wide text-text-subtle">{t('catalog.opened')}</dt>
              <dd className="text-text-muted">{t('insights.times', { count: tool.opens })}</dd>
            </div>
          ) : null}
        </dl>

        <div className="flex justify-end pt-1">
          <Button
            disabled={!meta.launchable}
            title={meta.launchable || !meta.warningKey ? undefined : t(meta.warningKey)}
            onClick={() => onLaunch(tool)}
          >
            <ExternalLink aria-hidden />
            {t('catalog.launch')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
