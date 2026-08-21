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
import { ACCENT_KEYS, TOOL_STATUSES, type AccentKey, type Category, type ToolStatus, type ToolWithCategory } from '@/types/database'
import { createTool, updateTool, type ToolInput } from './console-api'

type ToolFormDialogProps = {
  /** `null` berarti tambah tool baru. */
  tool: ToolWithCategory | null
  categories: Category[]
  onClose: () => void
  onSaved: () => Promise<void>
}

// Archived bukan pilihan form — status itu hasil aksi "Arsipkan" (features/03).
const EDITABLE_STATUSES = TOOL_STATUSES.filter((status): status is Exclude<ToolStatus, 'archived'> => status !== 'archived')

function initialInput(tool: ToolWithCategory | null, categories: Category[]): ToolInput {
  return {
    name: tool?.name ?? '',
    category_id: tool?.category_id ?? (categories[0]?.id ?? null),
    description: tool?.description ?? '',
    target_url: tool?.target_url ?? 'https://',
    icon: tool?.icon ?? TOOL_ICON_NAMES[0],
    accent: tool?.accent ?? 'orange',
    status: tool?.status ?? 'active',
    tags: tool?.tags ?? [],
    release_date: tool?.release_date ?? null,
  }
}

export function ToolFormDialog({ tool, categories, onClose, onSaved }: ToolFormDialogProps) {
  const [form, setForm] = useState<ToolInput>(() => initialInput(tool, categories))
  const [tagsText, setTagsText] = useState(tool?.tags.join(', ') ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof ToolInput>(key: K, value: ToolInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    // Validasi client; server memvalidasi ulang lewat constraint + RLS.
    const name = form.name.trim()
    if (!name) return setError('Nama tool wajib diisi.')
    if (!form.category_id) return setError('Pilih kategori dari master kategori.')
    if (!isSafeToolUrl(form.target_url.trim())) return setError('Alamat tool harus URL lengkap yang diawali https://.')

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

    if (!result.ok) return setError(result.message)
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
        <DialogTitle>{tool ? `Ubah ${tool.name}` : 'Tambah tool'}</DialogTitle>

        <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="tool-name">Nama tool</Label>
              <Input
                id="tool-name"
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder="mis. Compliance Monitor"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-category">Kategori</Label>
              <Select
                id="tool-category"
                value={form.category_id ?? ''}
                onChange={(event) => set('category_id', event.target.value || null)}
              >
                <option value="" disabled>
                  Pilih kategori
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-status">Status</Label>
              <Select
                id="tool-status"
                value={form.status}
                onChange={(event) => set('status', event.target.value as ToolStatus)}
              >
                {EDITABLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="tool-url">Alamat tool</Label>
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
              <Label htmlFor="tool-description">Deskripsi</Label>
              <Textarea
                id="tool-description"
                value={form.description ?? ''}
                onChange={(event) => set('description', event.target.value)}
                placeholder="Satu-dua kalimat: tool ini dipakai untuk apa."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-icon">Ikon</Label>
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
              <Label htmlFor="tool-accent">Accent</Label>
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
              <Label htmlFor="tool-tags">Tag</Label>
              <Input
                id="tool-tags"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="pisahkan dengan koma"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tool-release">Tanggal rilis</Label>
              <Input
                id="tool-release"
                type="date"
                value={form.release_date ?? ''}
                onChange={(event) => set('release_date', event.target.value || null)}
              />
            </div>
          </div>

          {error ? <ErrorState title="Belum bisa disimpan" description={error} /> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              {tool ? 'Simpan perubahan' : 'Tambahkan tool'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
