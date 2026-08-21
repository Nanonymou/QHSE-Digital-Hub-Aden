import { cn } from '@/lib/utils'

/** Pil kecil untuk status & tag. Warna selalu datang dari kelas token pemanggil. */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium leading-5',
        className,
      )}
      {...props}
    />
  )
}
