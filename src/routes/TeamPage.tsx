import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { FadeIn } from '@/components/motion/FadeIn'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { LoadingState } from '@/components/state/LoadingState'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuth, usePermission } from '@/features/auth/useAuth'
import { useI18n } from '@/features/i18n/useI18n'
import { TeamMemberCard } from '@/features/team/TeamMemberCard'
import { TeamMemberFormDialog } from '@/features/team/TeamMemberFormDialog'
import { useTeam } from '@/features/team/useTeam'
import type { TeamMember } from '@/types/database'

type EditTarget = { member: TeamMember | null; mode: 'full' | 'self' }

export function TeamPage() {
  const { loading, members, error, reload } = useTeam()
  const { user } = useAuth()
  // SPV = role admin (features/10). Anggota lain hanya boleh menyunting barisnya sendiri.
  const canManageTeam = usePermission('team.write')
  const { t } = useI18n()

  const [department, setDepartment] = useState<string | 'all'>('all')
  const [editing, setEditing] = useState<EditTarget | null>(null)

  const departments = [...new Set(members.map((member) => member.department).filter(Boolean))].sort((a, b) =>
    (a ?? '').localeCompare(b ?? ''),
  ) as string[]

  const visible = members.filter((member) => department === 'all' || member.department === department)

  const editModeFor = (member: TeamMember): 'full' | 'self' | null => {
    if (canManageTeam) return 'full'
    if (user && member.user_id === user.id) return 'self'
    return null
  }

  const reduced = useReducedMotion()

  return (
    <div className="flex flex-col gap-8">
      <FadeIn className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">{t('team.title')}</h1>
          <p className="max-w-prose text-text-muted">{t('team.description')}</p>
        </div>
        {canManageTeam ? (
          <Button size="sm" onClick={() => setEditing({ member: null, mode: 'full' })}>
            <Plus aria-hidden />
            {t('team.add')}
          </Button>
        ) : null}
      </FadeIn>

      {loading ? <LoadingState label={t('team.loading')} /> : null}

      {error ? (
        <ErrorState
          title={t('team.error.title')}
          description={t('team.error.body')}
          action={
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : null}

      {!loading && !error && members.length === 0 ? (
        <EmptyState
          icon={<Users aria-hidden className="size-6" />}
          title={t('team.empty.title')}
          description={t('team.empty.body')}
          action={
            canManageTeam ? (
              <Button size="sm" onClick={() => setEditing({ member: null, mode: 'full' })}>
                {t('team.add')}
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && members.length > 0 ? (
        <>
          {departments.length > 1 ? (
            <FadeIn delay={0.06} className="flex w-full max-w-xs flex-col gap-2">
              <Label htmlFor="team-department">{t('team.filterDepartment')}</Label>
              <Select
                id="team-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value as string | 'all')}
              >
                <option value="all">{t('catalog.filterAll')}</option>
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </FadeIn>
          ) : null}

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((member, index) => (
                <motion.li
                  key={member.id}
                  layout={!reduced}
                  className="h-full"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.42,
                          ease: [0.22, 1, 0.36, 1],
                          delay: Math.min(index, 7) * 0.05,
                        }
                  }
                >
                  <TeamMemberCard
                    member={member}
                    editMode={editModeFor(member)}
                    onEdit={(target) =>
                      setEditing({
                        member: target,
                        mode: editModeFor(target) ?? 'self',
                      })
                    }
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      ) : null}

      {editing ? (
        <TeamMemberFormDialog
          member={editing.member}
          mode={editing.mode}
          uploaderId={user?.id ?? null}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      ) : null}
    </div>
  )
}
