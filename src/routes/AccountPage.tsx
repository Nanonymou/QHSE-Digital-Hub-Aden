import { FadeIn } from '@/components/motion/FadeIn'
import { ErrorState } from '@/components/state/ErrorState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PERMISSIONS, ROLE_LABEL } from '@/features/auth/permissions'
import { useAuth } from '@/features/auth/useAuth'

/** Halaman terlindungi pertama — sekaligus bukti bahwa guard rute bekerja. */
export function AccountPage() {
  const { user, profile, profileError } = useAuth()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <FadeIn className="flex flex-col gap-2">
        <h1 className="text-2xl">Akun kamu</h1>
        <p className="text-text-muted">
          Role menentukan apa yang boleh kamu ubah. Penegakannya di server lewat RLS — tampilan ini hanya cermin.
        </p>
      </FadeIn>

      {profileError ? (
        <FadeIn delay={0.06}>
          <ErrorState title="Profil akses bermasalah" description={profileError} />
        </FadeIn>
      ) : null}

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>{profile?.full_name ?? user?.email ?? 'Tanpa nama'}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 font-mono text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-text-subtle">Role</span>
              <span className="text-text">{profile ? ROLE_LABEL[profile.role] : 'Belum diset'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-text-subtle">Status akun</span>
              <span className={profile?.active === false ? 'text-danger' : 'text-ok'}>
                {profile?.active === false ? 'Dinonaktifkan' : 'Aktif'}
              </span>
            </div>
            {profile ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-text-subtle">Kemampuan</span>
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
