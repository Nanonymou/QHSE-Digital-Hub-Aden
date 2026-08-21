import { Link, NavLink } from 'react-router-dom'
import { usePermission } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'
import { AccountMenu } from './AccountMenu'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

/** Item navigasi hanya muncul bila relevan; aksesnya tetap dijaga guard rute + RLS. */
export function Header() {
  const canManageCatalog = usePermission('catalog.write')

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring">
          <BrandMark />
        </Link>

        <nav aria-label="Navigasi utama" className="flex flex-1 items-center gap-1">
          {canManageCatalog ? (
            <NavLink
              to="/console"
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm transition-colors duration-micro ease-out-soft',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-surface-elevated text-text' : 'text-text-muted hover:text-text',
                )
              }
            >
              Catalog Console
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
