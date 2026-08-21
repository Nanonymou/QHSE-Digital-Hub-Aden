import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingState({ label = 'Memuat', className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex min-h-40 flex-col items-center justify-center gap-3 px-6 py-12 text-text-muted', className)}
    >
      <Loader2 aria-hidden className="size-5 animate-spin text-primary motion-reduce:animate-none" />
      <p className="text-sm">{label}…</p>
    </div>
  )
}
