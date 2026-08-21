import { Languages } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { LANGUAGES, type Language } from '@/features/i18n/i18n-context'
import { useI18n } from '@/features/i18n/useI18n'

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <span className="flex items-center gap-1">
      <Languages aria-hidden className="size-4 text-text-subtle" />
      <Select
        aria-label={t('lang.switch')}
        value={lang}
        onChange={(event) => setLang(event.target.value as Language)}
        className="h-9 w-32 border-transparent bg-transparent pr-8 text-sm text-text-muted hover:text-text"
      >
        {LANGUAGES.map((item) => (
          <option key={item} value={item}>
            {t(`lang.${item}`)}
          </option>
        ))}
      </Select>
    </span>
  )
}
