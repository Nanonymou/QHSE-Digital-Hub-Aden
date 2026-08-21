import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAppConfig } from '@/features/config/useAppConfig'
import {
  DICTIONARIES,
  I18nContext,
  LANG_STORAGE_KEY,
  isLanguage,
  type I18nContextValue,
  type Language,
  type TranslationKey,
} from './i18n-context'

function readStoredLang(): Language | null {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    return isLanguage(stored) ? stored : null
  } catch {
    return null
  }
}

/** Ganti {nama} dengan nilai parameter; sisanya dibiarkan apa adanya. */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

/**
 * Urutan prioritas bahasa: pilihan user (localStorage) → `app_config.branding.default_lang`.
 * Ganti bahasa berlaku seketika tanpa reload karena seluruh teks dibaca dari kamus.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { branding } = useAppConfig()
  const [override, setOverride] = useState<Language | null>(readStoredLang)

  const configLang = isLanguage(branding.default_lang) ? branding.default_lang : 'id'
  const lang = override ?? configLang

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setOverride(next)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // Penyimpanan diblokir (mode privat): pilihan berlaku untuk sesi ini saja.
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      interpolate(DICTIONARIES[lang][key], params),
    [lang],
  )

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
