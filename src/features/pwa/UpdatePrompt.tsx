import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/useI18n'

/**
 * Service worker didaftarkan dengan registerType 'prompt': versi baru menunggu
 * keputusan user, tidak pernah memaksa reload di tengah pengisian form (technical/07).
 */
export function UpdatePrompt() {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <AnimatePresence>
      {needRefresh ? (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-3 rounded-lg border border-hairline bg-surface p-4 shadow-lift sm:left-auto sm:right-6"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduced ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-text">{t('pwa.updateTitle')}</h2>
            <p className="text-sm text-text-muted">{t('pwa.updateBody')}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setNeedRefresh(false)}>
              {t('pwa.later')}
            </Button>
            <Button size="sm" onClick={() => void updateServiceWorker(true)}>
              {t('pwa.reload')}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
