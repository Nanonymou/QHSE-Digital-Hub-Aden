import { Link } from 'react-router-dom'
import { AccountMenu } from './AccountMenu'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

/**
 * Header Phase 1: brand + kontrol sesi saja.
 * Slot navigasi sengaja kosong — item katalog/console/tim menyusul di Phase 2–5.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="rounded-md focus-visible:ring-2 focus-visible:ring-ring">
          <BrandMark />
        </Link>

        <nav aria-label="Navigasi utama" className="flex flex-1 items-center gap-1" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
