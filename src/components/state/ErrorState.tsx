import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorStateProps = {
  title: string
  /** Apa yang salah + cara memperbaikinya, dengan suara interface (CLAUDE.md §5). */
  description: string
  action?: ReactNode
  className?: string
}

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border border-danger/40 bg-danger/5 px-5 py-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-danger">
        <AlertTriangle aria-hidden className="size-4" />
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      <p className="text-sm text-text-muted">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
