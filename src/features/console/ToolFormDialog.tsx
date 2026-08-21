import { useState, type FormEvent } from 'react'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { isSafeToolUrl } from '@/features/catalog/catalog-api'
import { STATUS_META } from '@/features/catalog/status'
import { TOOL_ICON_NAMES } from '@/features/catalog/tool-icons'
import type { TranslationKey } from '@/features/i18n/i18n-context'
import { useI18n } from '@/features/i18n/useI18n'
import {
  ACCENT_KEYS,
  ROLES,
  TOOL_STATUSES,
  VISIBILITIES,
  type AccentKey,
  type Category,
  type Role,
  type Visibility,
  type ToolStatus,
  type ToolWithCategory,
} from '@/types/database'
import { createTool, updateTool, type ToolInput } from './console-api'

type ToolFormDialogProps = {
  /** `null` berarti tambah tool baru. */
  tool: ToolWithCategory | null
  categories: Category[]
  onClose: () => void
  onSaved: () => Promise<void>
}

// Archived bukan pilihan form — status itu hasil aksi "Arsipkan" (features/03).
const EDITABLE_STATUSES = TOOL_STATUSES.filter(
  (status): status is Exclude<ToolStatus, 'archived'> => status !== 'archived',
)

function initialInput(tool: ToolWithCategory | null, categories: Category[]): ToolInput {
  return {
    name: tool?.name ?? '',
    category_id: tool?.category_id ?? categories[0]?.id ?? null,
    description: tool?.description ?? '',
    target_url: tool?.target_url ?? 'https://',
    icon: tool?.icon ?? TOOL_ICON_NAMES[0],
    accent: tool?.accent ?? 'orange',
    status: tool?.status ?? 'active',
    tags: tool?.tags ?? [],
    release_date: tool?.release_date ?? null,
    visibility: tool?.visibility ?? 'public',
    allowed_roles: tool?.allowed_roles ?? [],
  }
}

export function ToolFormDialog({ tool, categories, onClose, onSaved }: ToolFormDialogProps) {
  const [form, setForm] = useState<ToolInput>(() => initialInput(tool, categories))
  const [tagsText, setTagsText] = useState(tool?.tags.join(', ') ?? '')
  const [error, setError] = useState<TranslationKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { t } = useI18n()

  const set = <K extends keyof ToolInput>(key: K, value: ToolInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    // Validasi client; server memvalidasi ulang lewat constraint + RLS.
    const name = form.name.trim()
    if (!name) return setError('console.form.error.name')
    if (!form.category_id) return setError('console.form.error.category')
    if (!isSafeToolUrl(form.target_url.trim())) return setError('console.form.error.url')
    if (form.visibility === 'role_scoped' && form.allowed_roles.length === 0)
      return setError('visibility.error.roles')

    const payload: ToolInput = {
      ...form,
      name,
      target_url: form.target_url.trim(),
      description: form.description?.trim() ? form.description.trim() : null,
      release_date: form.release_date || null,
      tags: tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    setSubmitting(true)
    const result = tool ? await updateTool(tool.id, payload) : await createTool(payload)
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
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogTitle>{tool ? t('console.editTool', { name: tool.name }) : t('console.newTool')}</DialogTitle>

        <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="tool-name">{t('console.form.name')}</Label>
              <Input
                id="tool-name"
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder={t('console.form.namePlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-category">{t('console.form.category')}</Label>
              <Select
                id="tool-category"
                value={form.category_id ?? ''}
                onChange={(event) => set('category_id', event.target.value || null)}
              >
                <option value="" disabled>
                  {t('console.form.categoryPlaceholder')}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-status">{t('console.form.status')}</Label>
              <Select
                id="tool-status"
                value={form.status}
                onChange={(event) => set('status', event.target.value as ToolStatus)}
              >
                {EDITABLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(STATUS_META[status].labelKey)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="tool-url">{t('console.form.url')}</Label>
              <Input
                id="tool-url"
                type="url"
                inputMode="url"
                value={form.target_url}
                onChange={(event) => set('target_url', event.target.value)}
                placeholder="https://"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="tool-description">{t('console.form.description')}</Label>
              <Textarea
                id="tool-description"
                value={form.description ?? ''}
                onChange={(event) => set('description', event.target.value)}
                placeholder={t('console.form.descriptionPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-icon">{t('console.form.icon')}</Label>
              <Select
                id="tool-icon"
                value={form.icon ?? ''}
                onChange={(event) => set('icon', event.target.value || null)}
              >
                {TOOL_ICON_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-accent">{t('console.form.accent')}</Label>
              <Select
                id="tool-accent"
                value={form.accent}
                onChange={(event) => set('accent', event.target.value as AccentKey)}
              >
                {ACCENT_KEYS.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-tags">{t('console.form.tags')}</Label>
              <Input
                id="tool-tags"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder={t('console.form.tagsPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-release">{t('console.form.release')}</Label>
              <Input
                id="tool-release"
                type="date"
                value={form.release_date ?? ''}
                onChange={(event) => set('release_date', event.target.value || null)}
              />
            </div>
          </div>

          {/* Akses ditegakkan RLS; pilihan di sini hanya menentukan datanya. */}
          <fieldset className="flex flex-col gap-3 rounded-md border border-hairline p-4">
            <legend className="px-1 text-sm font-medium text-text-muted">{t('visibility.heading')}</legend>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-visibility">{t('visibility.field')}</Label>
              <Select
                id="tool-visibility"
                value={form.visibility}
                onChange={(event) => set('visibility', event.target.value as Visibility)}
              >
                {VISIBILITIES.map((item) => (
                  <option key={item} value={item}>
                    {t(`visibility.${item}`)}
                  </option>
                ))}
              </Select>
            </div>

            {form.visibility === 'role_scoped' ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-muted">{t('visibility.roles')}</span>
                <div className="flex flex-wrap gap-3">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-sm text-text-muted">
                      <input
                        type="checkbox"
                        className="size-4 accent-[rgb(var(--primary))]"
                        checked={form.allowed_roles.includes(role)}
                        onChange={(event) =>
                          set(
                            'allowed_roles',
                            event.target.checked
                              ? [...form.allowed_roles, role]
                              : form.allowed_roles.filter((item: Role) => item !== role),
                          )
                        }
                      />
                      {t(`role.${role}`)}
                    </label>
                  ))}
                </div>
                <span className="text-xs text-text-subtle">{t('visibility.hint')}</span>
              </div>
            ) : null}
          </fieldset>

          {error ? <ErrorState title={t('common.notSaved')} description={t(error)} /> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {tool ? t('common.save') : t('console.saveTool')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
