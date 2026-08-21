import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/useI18n'

export function NotFoundPage() {
  const { t } = useI18n()

  return (
    <FadeIn>
      <EmptyState
        icon={<Compass aria-hidden className="size-6" />}
        title={t('notFound.title')}
        description={t('notFound.body')}
        action={
          <Button asChild>
            <Link to="/">{t('notFound.action')}</Link>
          </Button>
        }
      />
    </FadeIn>
  )
}
