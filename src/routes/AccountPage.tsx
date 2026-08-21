import { FadeIn } from '@/components/motion/FadeIn'
import { ErrorState } from '@/components/state/ErrorState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PERMISSIONS } from '@/features/auth/permissions'
import { useAuth } from '@/features/auth/useAuth'
import { useI18n } from '@/features/i18n/useI18n'

/** Halaman terlindungi pertama — sekaligus bukti bahwa guard rute bekerja. */
export function AccountPage() {
  const { user, profile, profileError } = useAuth()
  const { t } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <FadeIn className="flex flex-col gap-2">
        <h1 className="text-2xl">{t('account.title')}</h1>
        <p className="text-text-muted">{t('account.description')}</p>
      </FadeIn>

      {profileError ? (
        <FadeIn delay={0.06}>
          <ErrorState title={t('error.profile.title')} description={t(`error.profile.${profileError}`)} />
        </FadeIn>
      ) : null}

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>{profile?.full_name ?? user?.email ?? t('account.noName')}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 font-mono text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-text-subtle">{t('account.role')}</span>
              <span className="text-text">
                {profile ? t(`role.${profile.role}`) : t('account.roleUnset')}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-text-subtle">{t('account.status')}</span>
              <span className={profile?.active === false ? 'text-danger' : 'text-ok'}>
                {profile?.active === false ? t('account.statusInactive') : t('account.statusActive')}
              </span>
            </div>
            {profile ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-text-subtle">
                  {t('account.permissions')}
                </span>
                <ul className="flex flex-wrap gap-2">
                  {PERMISSIONS[profile.role].map((permission) => (
                    <li
                      key={permission}
                      className="rounded border border-hairline bg-surface-elevated px-2 py-1 text-xs text-text-muted"
                    >
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
