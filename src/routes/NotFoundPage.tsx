import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <FadeIn>
      <EmptyState
        icon={<Compass aria-hidden className="size-6" />}
        title="Alamat ini tidak ada di hub"
        description="Tautannya mungkin salah ketik atau halamannya sudah dipindahkan. Mulai lagi dari beranda hub."
        action={
          <Button asChild>
            <Link to="/">Ke beranda</Link>
          </Button>
        }
      />
    </FadeIn>
  )
}
