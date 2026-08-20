import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROLE_LABEL } from '@/features/auth/permissions'
import { useAuth } from '@/features/auth/useAuth'

export function AccountMenu() {
  const { status, user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  if (status === 'unavailable') {
    return <span className="font-mono text-xs text-warn">env belum diisi</span>
  }

  if (status !== 'authenticated') {
    return (
      <Button asChild size="sm">
        <Link to="/masuk">Masuk</Link>
      </Button>
    )
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/akun"
        className="hidden flex-col items-end rounded-md leading-tight focus-visible:ring-2 focus-visible:ring-ring sm:flex"
      >
        <span className="text-sm text-text">{profile?.full_name ?? user?.email}</span>
        <span className="font-mono text-xs text-text-subtle">
          {profile ? ROLE_LABEL[profile.role] : 'Role belum diset'}
        </span>
      </Link>
      <Button variant="outline" size="sm" loading={signingOut} onClick={() => void handleSignOut()}>
        <LogOut aria-hidden />
        Keluar
      </Button>
    </div>
  )
}
