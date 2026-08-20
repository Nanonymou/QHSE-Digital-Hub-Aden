import { Outlet } from 'react-router-dom'
import { useAppConfig } from '@/features/config/useAppConfig'
import { Header } from './Header'

export function AppShell() {
  const { branding } = useAppConfig()
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-deep focus:px-4 focus:py-2 focus:text-sm focus:text-primary-contrast"
      >
        Lompat ke konten
      </a>

      <Header />

      <main id="konten" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-text-subtle sm:px-6">
          <span className="font-mono">
            © {year}
            {branding.company_name ? ` ${branding.company_name}` : ''}
          </span>
          <span className="font-mono">Internal use</span>
        </div>
      </footer>
    </div>
  )
}
