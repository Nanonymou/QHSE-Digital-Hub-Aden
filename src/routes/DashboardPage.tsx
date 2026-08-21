import { ErrorState } from '@/components/state/ErrorState'
import { FadeIn } from '@/components/motion/FadeIn'
import { AdminInsights } from '@/features/analytics/AdminInsights'
import { KpiRow } from '@/features/analytics/KpiRow'
import { useAuth, usePermission } from '@/features/auth/useAuth'
import { CatalogSection } from '@/features/catalog/CatalogSection'
import { HeroConstellation } from '@/features/catalog/HeroConstellation'
import { useCatalog } from '@/features/catalog/useCatalog'
import { useAppConfig } from '@/features/config/useAppConfig'
import { useI18n } from '@/features/i18n/useI18n'

export function DashboardPage() {
  const { branding, error: configError } = useAppConfig()
  const { status, profileError } = useAuth()
  // Satu fetch katalog dipakai bersama KPI, grid, dan panel admin.
  const catalog = useCatalog()
  const canSeeUsageDetail = usePermission('catalog.write')
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-10">
      {/* Hero = tesis hub: jaringan tool. Satu elemen signature, sisanya tenang. */}
      <FadeIn className="relative isolate -mx-4 overflow-hidden rounded-lg px-4 py-10 sm:-mx-6 sm:px-6 sm:py-14">
        <HeroConstellation tools={catalog.tools} />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent-sky/10" />
        <div className="relative flex flex-col gap-3">
          <h1 className="text-4xl">{branding.product_name}</h1>
          {branding.tagline ? <p className="max-w-prose text-text-muted">{branding.tagline}</p> : null}
        </div>
      </FadeIn>

      {status === 'unavailable' ? (
        <FadeIn delay={0.06}>
          <ErrorState
            title={t('error.supabaseMissing.title')}
            description={t('error.supabaseMissing.body')}
          />
        </FadeIn>
      ) : null}

      {configError ? (
        <FadeIn delay={0.06}>
          <ErrorState title={t('error.configLoad.title')} description={t('error.configLoad.body')} />
        </FadeIn>
      ) : null}

      {profileError ? (
        <FadeIn delay={0.06}>
          <ErrorState title={t('error.profile.title')} description={t(`error.profile.${profileError}`)} />
        </FadeIn>
      ) : null}

      {!catalog.loading && !catalog.error ? (
        <FadeIn delay={0.1}>
          <KpiRow tools={catalog.tools} categories={catalog.categories} />
        </FadeIn>
      ) : null}

      <FadeIn delay={0.14} className="flex flex-col gap-4">
        <h2 className="text-xl">{t('catalog.heading')}</h2>
        <CatalogSection catalog={catalog} />
      </FadeIn>

      {canSeeUsageDetail && !catalog.loading && !catalog.error ? (
        <FadeIn delay={0.18}>
          <AdminInsights tools={catalog.tools} />
        </FadeIn>
      ) : null}
    </div>
  )
}
