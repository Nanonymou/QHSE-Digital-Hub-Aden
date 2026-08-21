import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LoadingState } from '@/components/state/LoadingState'
import { useAppConfig } from '@/features/config/useAppConfig'
import { useI18n } from '@/features/i18n/useI18n'
import { OfflineNotice } from '@/features/pwa/OfflineNotice'
import { UpdatePrompt } from '@/features/pwa/UpdatePrompt'
import { Header } from './Header'

export function AppShell() {
  const { branding } = useAppConfig()
  const { lang, t } = useI18n()
  const reduced = useReducedMotion()
  const year = new Date().getFullYear()

  // Judul tab ikut branding dari app_config, bukan string yang ditanam di kode.
  useEffect(() => {
    const parts = [branding.product_name, branding.company_name].filter(Boolean)
    document.title = parts.join(' · ')
  }, [branding.product_name, branding.company_name])

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-deep focus:px-4 focus:py-2 focus:text-sm focus:text-primary-contrast"
      >
        {t('nav.skip')}
      </a>

      <Header />
      <OfflineNotice />

      <main id="konten" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Ganti bahasa menukar seluruh teks sekaligus; cross-fade singkat menahan "loncatan". */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={lang}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
          >
            {/* Halaman dimuat per-rute (lazy); fallback memakai state loading yang sama. */}
            <Suspense fallback={<LoadingState label={t('common.loading')} />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-text-subtle sm:px-6">
          <span className="font-mono">
            © {year}
            {branding.company_name ? ` ${branding.company_name}` : ''}
          </span>
          <span className="font-mono">{t('footer.internal')}</span>
        </div>
      </footer>

      <UpdatePrompt />
    </div>
  )
}
