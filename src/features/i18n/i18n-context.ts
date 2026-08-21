import { createContext } from 'react'
import { en } from './dictionaries/en'
import { id, type Dictionary } from './dictionaries/id'
import { zh } from './dictionaries/zh'

export const LANGUAGES = ['id', 'en', 'zh'] as const
export type Language = (typeof LANGUAGES)[number]

export const DICTIONARIES: Record<Language, Dictionary> = { id, en, zh }

export type TranslationKey = keyof Dictionary

export type I18nContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  /** `t('catalog.resultCount', { count: 3, total: 8 })` — parameter ditulis sebagai {nama}. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
export const LANG_STORAGE_KEY = 'aden-hub.lang'

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}
