import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ToolStatus } from '@/types/database'
import { STATUS_META } from './status'

export function StatusBadge({ status, className }: { status: ToolStatus; className?: string }) {
  const meta = STATUS_META[status]
  return <Badge className={cn(meta.className, className)}>{meta.label}</Badge>
}
