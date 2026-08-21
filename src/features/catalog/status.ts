import type { ToolStatus } from '@/types/database'

type StatusMeta = {
  label: string
  /** Kelas token — warna status konsisten di seluruh app (features/07). */
  className: string
  launchable: boolean
  /** Peringatan yang ditampilkan sebelum/at launch, bila ada. */
  warning: string | null
}

export const STATUS_META: Record<ToolStatus, StatusMeta> = {
  active: {
    label: 'Aktif',
    className: 'border-ok/40 bg-ok/10 text-ok',
    launchable: true,
    warning: null,
  },
  beta: {
    label: 'Beta',
    className: 'border-info/40 bg-info/10 text-info',
    launchable: true,
    warning: 'Tool ini masih diuji. Laporkan ke admin bila ada yang janggal.',
  },
  maintenance: {
    label: 'Perbaikan',
    className: 'border-warn/40 bg-warn/10 text-warn',
    launchable: true,
    warning: 'Tool sedang diperbaiki. Sebagian fungsi mungkin belum jalan.',
  },
  coming_soon: {
    label: 'Segera hadir',
    className: 'border-line/20 bg-surface-elevated text-text-subtle',
    launchable: false,
    warning: 'Tool ini belum bisa dibuka. Tunggu pengumuman dari admin.',
  },
  archived: {
    label: 'Diarsipkan',
    className: 'border-danger/40 bg-danger/10 text-danger',
    launchable: false,
    warning: 'Tool ini sudah diarsipkan dan tidak lagi dipakai.',
  },
}
