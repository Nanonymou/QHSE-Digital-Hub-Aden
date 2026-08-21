import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/useI18n'

export function ForbiddenPage() {
  const { t } = useI18n()

  return (
    <FadeIn>
      <EmptyState
        icon={<ShieldAlert aria-hidden className="size-6" />}
        title={t('forbidden.title')}
        description={t('forbidden.body')}
        action={
          <Button asChild variant="outline">
            <Link to="/">{t('forbidden.action')}</Link>
          </Button>
        }
      />
    </FadeIn>
  )
}
