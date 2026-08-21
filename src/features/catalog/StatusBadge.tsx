import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/features/i18n/useI18n'
import { cn } from '@/lib/utils'
import type { ToolStatus } from '@/types/database'
import { STATUS_META } from './status'

export function StatusBadge({ status, className }: { status: ToolStatus; className?: string }) {
  const { t } = useI18n()
  const meta = STATUS_META[status]
  return <Badge className={cn(meta.className, className)}>{t(meta.labelKey)}</Badge>
}
