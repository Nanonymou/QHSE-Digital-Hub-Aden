import type { TranslationKey } from '@/features/i18n/i18n-context'
import type { ToolStatus } from '@/types/database'

type StatusMeta = {
  /** Kelas token — warna status konsisten di seluruh app (features/07). */
  className: string
  launchable: boolean
  labelKey: TranslationKey
  /** Peringatan sebelum/saat launch; `null` bila status tidak perlu diberi catatan. */
  warningKey: TranslationKey | null
}

export const STATUS_META: Record<ToolStatus, StatusMeta> = {
  active: {
    className: 'border-ok/40 bg-ok/10 text-ok',
    launchable: true,
    labelKey: 'status.active.label',
    warningKey: null,
  },
  beta: {
    className: 'border-info/40 bg-info/10 text-info',
    launchable: true,
    labelKey: 'status.beta.label',
    warningKey: 'status.beta.warning',
  },
  maintenance: {
    className: 'border-warn/40 bg-warn/10 text-warn',
    launchable: true,
    labelKey: 'status.maintenance.label',
    warningKey: 'status.maintenance.warning',
  },
  coming_soon: {
    className: 'border-line/20 bg-surface-elevated text-text-muted',
    launchable: false,
    labelKey: 'status.coming_soon.label',
    warningKey: 'status.coming_soon.warning',
  },
  archived: {
    className: 'border-danger/40 bg-danger/10 text-danger',
    launchable: false,
    labelKey: 'status.archived.label',
    warningKey: 'status.archived.warning',
  },
}
