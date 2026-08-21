import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatTileProps = {
  label: string
  value: string | number
  /** Konteks singkat di bawah angka; kosongkan bila angkanya sudah jelas. */
  hint?: string
  icon?: ReactNode
  className?: string
}

/**
 * Angka tunggal, bukan grafik: KPI hub tidak punya dimensi waktu di kartu ini.
 * Angka dan teks memakai token teks; ikon yang membawa identitas visual, bukan warnanya.
 */
export function StatTile({ label, value, hint, icon, className }: StatTileProps) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-5', className)}>
      <div className="flex items-center gap-2 text-text-subtle">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <span className="font-display text-3xl leading-none text-text">{value}</span>
      {hint ? <span className="font-mono text-xs text-text-subtle">{hint}</span> : null}
    </div>
  )
}
