import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { ROLE_LABEL } from '@/features/auth/permissions'
import { useAuth } from '@/features/auth/useAuth'

export function ForbiddenPage() {
  const { profile } = useAuth()

  return (
    <FadeIn>
      <EmptyState
        icon={<ShieldAlert aria-hidden className="size-6" />}
        title="Halaman ini di luar hak aksesmu"
        description={`Role ${profile ? ROLE_LABEL[profile.role] : 'kamu'} belum mencakup halaman ini. Minta super admin menaikkan role bila kamu memang perlu mengaksesnya.`}
        action={
          <Button asChild variant="outline">
            <Link to="/">Kembali ke beranda</Link>
          </Button>
        }
      />
    </FadeIn>
  )
}
