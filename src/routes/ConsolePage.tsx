import { FadeIn } from '@/components/motion/FadeIn'
import { ErrorState } from '@/components/state/ErrorState'
import { LoadingState } from '@/components/state/LoadingState'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/features/auth/useAuth'
import { useCatalog } from '@/features/catalog/useCatalog'
import { useI18n } from '@/features/i18n/useI18n'
import { BrandingManager } from '@/features/console/BrandingManager'
import { CategoryManager } from '@/features/console/CategoryManager'
import { ToolManager } from '@/features/console/ToolManager'

/**
 * Catalog Console (features/03). Data dibaca lewat hook katalog yang sama
 * dengan halaman publik — bedanya RLS mengirim juga baris archived ke admin.
 */
export function ConsolePage() {
  const { loading, tools, categories, error, reload } = useCatalog()
  const { t } = useI18n()
  // Tulis app_config hanya untuk super admin — RLS menolak yang lain.
  const canEditBranding = usePermission('config.write')

  return (
    <div className="flex flex-col gap-10">
      <FadeIn className="flex flex-col gap-2">
        <h1 className="text-2xl">{t('console.title')}</h1>
        <p className="max-w-prose text-text-muted">{t('console.description')}</p>
      </FadeIn>

      {loading ? <LoadingState label={t('console.loading')} /> : null}

      {error ? (
        <ErrorState
          title={t('error.catalogLoad.title')}
          description={t('error.catalogLoad.body')}
          action={
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : null}

      {!loading && !error ? (
        <>
          <FadeIn delay={0.06}>
            <ToolManager tools={tools} categories={categories} onChanged={reload} />
          </FadeIn>
          <FadeIn delay={0.1}>
            <CategoryManager categories={categories} tools={tools} onChanged={reload} />
          </FadeIn>
          {canEditBranding ? (
            <FadeIn delay={0.14}>
              <BrandingManager />
            </FadeIn>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
