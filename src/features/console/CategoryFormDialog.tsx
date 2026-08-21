import { useState, type FormEvent } from 'react'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TranslationKey } from '@/features/i18n/i18n-context'
import { useI18n } from '@/features/i18n/useI18n'
import type { Category } from '@/types/database'
import { createCategory, slugify, updateCategory, type CategoryInput } from './console-api'

type CategoryFormDialogProps = {
  /** `null` berarti tambah kategori baru. */
  category: Category | null
  onClose: () => void
  onSaved: () => Promise<void>
}

export function CategoryFormDialog({ category, onClose, onSaved }: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryInput>({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    display_order: category?.display_order ?? 0,
    active: category?.active ?? true,
  })
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [error, setError] = useState<TranslationKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { t } = useI18n()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const name = form.name.trim()
    const slug = (slugTouched ? form.slug : slugify(name)).trim()
    if (!name) return setError('category.form.error.name')
    if (!slug) return setError('category.form.error.slug')

    setSubmitting(true)
    const payload: CategoryInput = { ...form, name, slug }
    const result = category ? await updateCategory(category.id, payload) : await createCategory(payload)
    setSubmitting(false)

    if (!result.ok) return setError(`error.write.${result.code}`)
    await onSaved()
    onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !submitting) onClose()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle>
          {category ? t('category.edit', { name: category.name }) : t('category.add')}
        </DialogTitle>

        <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">{t('category.form.name')}</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => {
                const name = event.target.value
                setForm((current) => ({
                  ...current,
                  name,
                  slug: slugTouched ? current.slug : slugify(name),
                }))
              }}
              placeholder={t('category.form.namePlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-slug">{t('category.form.slug')}</Label>
            <Input
              id="category-slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true)
                setForm((current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }}
              className="font-mono"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="category-order">{t('category.form.order')}</Label>
              <Input
                id="category-order"
                type="number"
                inputMode="numeric"
                value={form.display_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    display_order: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>

            <label className="flex h-10 items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
                className="size-4 accent-[rgb(var(--primary))]"
              />
              {t('category.form.active')}
            </label>
          </div>

          {error ? <ErrorState title={t('common.notSaved')} description={t(error)} /> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {category ? t('common.save') : t('category.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
