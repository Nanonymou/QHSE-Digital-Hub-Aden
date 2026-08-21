import { useState, type FormEvent } from 'react'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAppConfig } from '@/features/config/useAppConfig'
import { LANGUAGES } from '@/features/i18n/i18n-context'
import type { TranslationKey } from '@/features/i18n/i18n-context'
import { useI18n } from '@/features/i18n/useI18n'
import { requireSupabase } from '@/lib/supabase'
import type { Branding } from '@/types/database'
import { runWrite } from './console-api'

/**
 * Editor `app_config.branding` (features/11). RLS hanya mengizinkan super admin,
 * jadi admin biasa yang memaksa simpan akan ditolak server dengan pesan jelas.
 */
export function BrandingManager() {
  const { branding, reload } = useAppConfig()
  const { t } = useI18n()
  const [form, setForm] = useState<Branding>(branding)
  const [error, setError] = useState<TranslationKey | null>(null)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof Branding>(key: K, value: Branding[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSaved(false)

    const productName = form.product_name.trim()
    const logoUrl = form.logo_url?.trim() ?? ''
    if (!productName) return setError('branding.error.productName')
    if (logoUrl && !logoUrl.startsWith('https://')) return setError('branding.error.logoUrl')

    const value: Branding = {
      ...form,
      product_name: productName,
      company_name: form.company_name.trim(),
      tagline: form.tagline?.trim() ? form.tagline.trim() : null,
      logo_url: logoUrl || null,
    }

    setSubmitting(true)
    const result = await runWrite(
      async () => await requireSupabase().from('app_config').upsert({ key: 'branding', value }),
    )
    setSubmitting(false)

    if (!result.ok) return setError(`error.write.${result.code}`)
    await reload()
    setSaved(true)
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl">{t('branding.heading')}</h2>
        <p className="max-w-prose text-text-muted">{t('branding.description')}</p>
      </div>

      <form
        className="grid gap-4 rounded-lg border border-hairline bg-surface p-5 sm:grid-cols-2"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="branding-product">{t('branding.productName')}</Label>
          <Input
            id="branding-product"
            value={form.product_name}
            onChange={(event) => set('product_name', event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="branding-company">{t('branding.companyName')}</Label>
          <Input
            id="branding-company"
            value={form.company_name}
            onChange={(event) => set('company_name', event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="branding-tagline">{t('branding.tagline')}</Label>
          <Input
            id="branding-tagline"
            value={form.tagline ?? ''}
            onChange={(event) => set('tagline', event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="branding-logo">{t('branding.logoUrl')}</Label>
          <Input
            id="branding-logo"
            type="url"
            inputMode="url"
            value={form.logo_url ?? ''}
            onChange={(event) => set('logo_url', event.target.value)}
            placeholder="https://"
          />
          <span className="font-mono text-xs text-text-subtle">{t('branding.logoHint')}</span>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="branding-lang">{t('branding.defaultLang')}</Label>
          <Select
            id="branding-lang"
            value={form.default_lang}
            onChange={(event) => set('default_lang', event.target.value)}
          >
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {t(`lang.${item}`)}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="branding-theme">{t('branding.defaultTheme')}</Label>
          <Select
            id="branding-theme"
            value={form.default_theme}
            onChange={(event) => set('default_theme', event.target.value === 'light' ? 'light' : 'dark')}
          >
            <option value="dark">{t('branding.themeDark')}</option>
            <option value="light">{t('branding.themeLight')}</option>
          </Select>
        </div>

        {error ? (
          <div className="sm:col-span-2">
            <ErrorState title={t('common.notSaved')} description={t(error)} />
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 sm:col-span-2">
          {saved ? <span className="text-sm text-ok">{t('branding.saved')}</span> : null}
          <Button type="submit" size="sm" loading={submitting}>
            {t('branding.save')}
          </Button>
        </div>
      </form>
    </section>
  )
}
