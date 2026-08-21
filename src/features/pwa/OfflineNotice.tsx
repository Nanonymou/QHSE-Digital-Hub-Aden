import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useI18n } from '@/features/i18n/useI18n'

/**
 * Hub tidak menjanjikan offline penuh: shell dan katalog terakhir tetap terbaca,
 * tapi launch dan operasi tulis butuh koneksi — dan itu dikatakan terang-terangan.
 */
export function OfflineNotice() {
  const { t } = useI18n()
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div role="status" aria-live="polite" className="border-b border-warn/30 bg-warn/10">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-3 px-4 py-2 sm:px-6">
        <WifiOff aria-hidden className="mt-0.5 size-4 shrink-0 text-warn" />
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text">{t('offline.title')}</span> — {t('offline.body')}
        </p>
      </div>
    </div>
  )
}
