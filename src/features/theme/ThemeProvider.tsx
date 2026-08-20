import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAppConfig } from '@/features/config/useAppConfig'
import { THEME_STORAGE_KEY, ThemeContext, type Theme, type ThemeContextValue } from './theme-context'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

/**
 * Urutan prioritas: pilihan user (localStorage) → `app_config.branding.default_theme`.
 * Tema hanya mengganti nilai token yang sama (CLAUDE.md §1), bukan set warna terpisah.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { branding } = useAppConfig()
  const [override, setOverride] = useState<Theme | null>(readStoredTheme)

  // Turunan, bukan state duplikat: config yang berubah langsung terpakai
  // selama user belum memilih temanya sendiri.
  const theme = override ?? branding.default_theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setOverride(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Penyimpanan diblokir (mode privat): tema tetap berlaku untuk sesi ini.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
