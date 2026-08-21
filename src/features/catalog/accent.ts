import type { CSSProperties } from 'react'
import type { AccentKey } from '@/types/database'

/**
 * Setiap tool memilih SATU accent key, bukan hex bebas (PROJECT.md § Accent tokens).
 * Key dipetakan ke custom property `--tool-accent` sehingga kartu tetap memakai token.
 */
export function accentStyle(accent: AccentKey): CSSProperties {
  return { '--tool-accent': `var(--accent-${accent})` } as CSSProperties
}
