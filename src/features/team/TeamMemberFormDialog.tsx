import { useRef, useState, type FormEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { TranslationKey } from '@/features/i18n/i18n-context'
import { useI18n } from '@/features/i18n/useI18n'
import type { TeamMember } from '@/types/database'
import {
  createTeamMember,
  updateOwnProfile,
  updateTeamMember,
  uploadTeamPhoto,
  type TeamMemberInput,
} from './team-api'

type TeamMemberFormDialogProps = {
  /** `null` berarti tambah anggota baru (hanya mode full). */
  member: TeamMember | null
  /** `full` = SPV/admin, `self` = anggota mengubah barisnya sendiri. */
  mode: 'full' | 'self'
  /** Pemilik folder foto di Storage: id user yang sedang login. */
  uploaderId: string | null
  onClose: () => void
  onSaved: () => Promise<void>
}

const PHONE_PATTERN = /^\+?[0-9]{6,20}$/

function initialInput(member: TeamMember | null): TeamMemberInput {
  return {
    full_name: member?.full_name ?? '',
    position: member?.position ?? '',
    department: member?.department ?? '',
    photo_url: member?.photo_url ?? null,
    bio: member?.bio ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    display_order: member?.display_order ?? 0,
    active: member?.active ?? true,
    visible_public: member?.visible_public ?? false,
  }
}

export function TeamMemberFormDialog({
  member,
  mode,
  uploaderId,
  onClose,
  onSaved,
}: TeamMemberFormDialogProps) {
  const { t } = useI18n()
  const [form, setForm] = useState<TeamMemberInput>(() => initialInput(member))
  const [error, setError] = useState<TranslationKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const set = <K extends keyof TeamMemberInput>(key: K, value: TeamMemberInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const trimmed = (value: string | null) => (value?.trim() ? value.trim() : null)

  const handlePhoto = async (file: File) => {
    setError(null)
    setUploading(true)
    const result = await uploadTeamPhoto(file, uploaderId ?? 'shared')
    setUploading(false)

    if (!result.ok) {
      setError(
        result.code === 'photoType' || result.code === 'photoSize' || result.code === 'photoUpload'
          ? `team.form.error.${result.code}`
          : `error.write.${result.code}`,
      )
      return
    }
    set('photo_url', result.url)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const fullName = form.full_name.trim()
    if (mode === 'full' && !fullName) return setError('team.form.error.fullName')
    if (form.phone && !PHONE_PATTERN.test(form.phone.trim())) return setError('team.form.error.phone')

    setSubmitting(true)
    const result =
      mode === 'self' && member
        ? await updateOwnProfile(member.id, {
            photo_url: form.photo_url,
            bio: trimmed(form.bio),
            email: trimmed(form.email),
            phone: trimmed(form.phone),
          })
        : member
          ? await updateTeamMember(member.id, {
              ...form,
              full_name: fullName,
              position: trimmed(form.position),
              department: trimmed(form.department),
              bio: trimmed(form.bio),
              email: trimmed(form.email),
              phone: trimmed(form.phone),
            })
          : await createTeamMember({
              ...form,
              full_name: fullName,
              position: trimmed(form.position),
              department: trimmed(form.department),
              bio: trimmed(form.bio),
              email: trimmed(form.email),
              phone: trimmed(form.phone),
            })
    setSubmitting(false)

    if (!result.ok) return setError(`error.write.${result.code}`)
    await onSaved()
    onClose()
  }

  const canEditLocked = mode === 'full'

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !submitting) onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          {member
            ? mode === 'self'
              ? t('team.editMine')
              : t('team.edit', { name: member.full_name })
            : t('team.add')}
        </DialogTitle>

        <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="flex items-start gap-4">
            {form.photo_url ? (
              <img src={form.photo_url} alt="" className="size-16 rounded-md object-cover" />
            ) : (
              <span
                aria-hidden
                className="grid size-16 place-items-center rounded-md bg-surface-elevated text-text-subtle"
              >
                <Upload className="size-5" />
              </span>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="member-photo">{t('team.form.photo')}</Label>
              <input
                ref={fileInput}
                id="member-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="text-sm text-text-muted file:mr-3 file:rounded-md file:border file:border-hairline file:bg-surface-elevated file:px-3 file:py-1.5 file:text-sm file:text-text"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handlePhoto(file)
                }}
              />
              <span className="font-mono text-xs text-text-subtle">{t('team.form.photoHint')}</span>
              {form.photo_url ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    set('photo_url', null)
                    if (fileInput.current) fileInput.current.value = ''
                  }}
                >
                  <X aria-hidden />
                  {t('team.form.photoRemove')}
                </Button>
              ) : null}
              {uploading ? <span className="text-xs text-text-muted">{t('common.loading')}…</span> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="member-name">{t('team.form.fullName')}</Label>
              <Input
                id="member-name"
                value={form.full_name}
                disabled={!canEditLocked}
                onChange={(event) => set('full_name', event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-position">{t('team.form.position')}</Label>
              <Input
                id="member-position"
                value={form.position ?? ''}
                disabled={!canEditLocked}
                onChange={(event) => set('position', event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-department">{t('team.form.department')}</Label>
              <Input
                id="member-department"
                value={form.department ?? ''}
                disabled={!canEditLocked}
                onChange={(event) => set('department', event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-email">{t('team.form.email')}</Label>
              <Input
                id="member-email"
                type="email"
                inputMode="email"
                value={form.email ?? ''}
                onChange={(event) => set('email', event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-phone">{t('team.form.phone')}</Label>
              <Input
                id="member-phone"
                type="tel"
                inputMode="tel"
                value={form.phone ?? ''}
                onChange={(event) => set('phone', event.target.value)}
                placeholder="+62"
              />
              <span className="font-mono text-xs text-text-subtle">{t('team.form.phoneHint')}</span>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="member-bio">{t('team.form.bio')}</Label>
              <Textarea
                id="member-bio"
                value={form.bio ?? ''}
                onChange={(event) => set('bio', event.target.value)}
              />
            </div>

            {canEditLocked ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="member-order">{t('team.form.order')}</Label>
                  <Input
                    id="member-order"
                    type="number"
                    inputMode="numeric"
                    value={form.display_order}
                    onChange={(event) => set('display_order', Number(event.target.value) || 0)}
                  />
                </div>

                <div className="flex items-end gap-4">
                  <label className="flex h-10 items-center gap-2 text-sm text-text-muted">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) => set('active', event.target.checked)}
                      className="size-4 accent-[rgb(var(--primary))]"
                    />
                    {t('team.form.active')}
                  </label>
                  <label className="flex h-10 items-center gap-2 text-sm text-text-muted">
                    <input
                      type="checkbox"
                      checked={form.visible_public}
                      onChange={(event) => set('visible_public', event.target.checked)}
                      className="size-4 accent-[rgb(var(--primary))]"
                    />
                    {t('team.form.visiblePublic')}
                  </label>
                </div>
              </>
            ) : (
              <p className="text-sm text-text-subtle sm:col-span-2">{t('team.form.lockedNote')}</p>
            )}
          </div>

          {error ? <ErrorState title={t('common.notSaved')} description={t(error)} /> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" size="sm" loading={submitting} disabled={uploading}>
              {member ? t('common.save') : t('team.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
