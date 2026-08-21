import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title: string
  /** Jelaskan langkah berikutnya — empty state adalah ajakan bertindak (CLAUDE.md §5). */
  description: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-hairline bg-surface px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? <div className="text-primary">{icon}</div> : null}
      <h2 className="text-lg">{title}</h2>
      <p className="max-w-prose text-sm text-text-muted">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  )
}
