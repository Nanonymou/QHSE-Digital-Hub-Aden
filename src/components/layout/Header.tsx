import { Link, NavLink } from 'react-router-dom'
import { usePermission } from '@/features/auth/useAuth'
import { useI18n } from '@/features/i18n/useI18n'
import { cn } from '@/lib/utils'
import { AccountMenu } from './AccountMenu'
import { BrandMark } from './BrandMark'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-3 py-2 text-sm transition-colors duration-micro ease-out-soft',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    isActive ? 'bg-surface-elevated text-text' : 'text-text-muted hover:text-text',
  )
}

/** Item navigasi hanya muncul bila relevan; aksesnya tetap dijaga guard rute + RLS. */
export function Header() {
  const canManageCatalog = usePermission('catalog.write')
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur">
      {/* Di layar sempit navigasi turun ke baris kedua agar header tidak memaksa scroll horizontal. */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0 sm:pl-6 sm:pr-6">
        <Link to="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring">
          <BrandMark />
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:order-last">
          <LanguageSwitcher />
          <ThemeToggle />
          <AccountMenu />
        </div>

        <nav
          aria-label={t('nav.main')}
          className="order-last -mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:overflow-visible sm:px-0"
        >
          <NavLink to="/" end className={navClass}>
            {t('nav.catalog')}
          </NavLink>
          <NavLink to="/team" className={navClass}>
            {t('nav.team')}
          </NavLink>
          {canManageCatalog ? (
            <NavLink to="/console" className={navClass}>
              {t('nav.console')}
            </NavLink>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
