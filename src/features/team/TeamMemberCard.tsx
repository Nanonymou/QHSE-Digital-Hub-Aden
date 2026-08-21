import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { accentStyle } from '@/features/catalog/accent'
import { useI18n } from '@/features/i18n/useI18n'
import type { TeamMember } from '@/types/database'
import { ContactLinks } from './ContactLinks'
import { departmentAccent } from './department-accent'

type TeamMemberCardProps = {
  member: TeamMember
  /** `null` bila penonton tidak boleh mengubah kartu ini. */
  editMode: 'full' | 'self' | null
  onEdit: (member: TeamMember) => void
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function TeamMemberCard({ member, editMode, onEdit }: TeamMemberCardProps) {
  const { t } = useI18n()

  return (
    <article
      style={accentStyle(departmentAccent(member.department))}
      className="group flex h-full flex-col gap-4 rounded-lg border border-hairline bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-micro ease-out-soft hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start gap-4">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt=""
            loading="lazy"
            className="size-16 shrink-0 rounded-md object-cover ring-2 ring-[rgb(var(--tool-accent)/0.35)]"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-md bg-[rgb(var(--tool-accent)/0.14)] font-display text-lg font-semibold text-[rgb(var(--tool-accent))]"
          >
            {initials(member.full_name)}
          </span>
        )}

        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-base font-semibold leading-snug text-text">{member.full_name}</h3>
          {member.position ? <p className="text-sm text-text-muted">{member.position}</p> : null}
          {member.department ? (
            <p className="font-mono text-xs text-[rgb(var(--tool-accent))]">{member.department}</p>
          ) : null}
        </div>
      </div>

      {member.bio ? (
        <p className="line-clamp-3 flex-1 text-sm text-text-muted">{member.bio}</p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!member.active ? (
          <Badge className="border-warn/40 bg-warn/10 text-warn">{t('team.inactive')}</Badge>
        ) : null}
        {member.active && !member.visible_public ? (
          <Badge className="border-line/15 bg-surface-elevated text-text-subtle">{t('team.hidden')}</Badge>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <ContactLinks member={member} />
        {editMode === 'self' ? (
          <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
            <Pencil aria-hidden />
            {t('team.editMine')}
          </Button>
        ) : null}
        {editMode === 'full' ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('team.edit', { name: member.full_name })}
            onClick={() => onEdit(member)}
          >
            <Pencil aria-hidden />
          </Button>
        ) : null}
      </div>
    </article>
  )
}
