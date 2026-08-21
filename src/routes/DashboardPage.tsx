import { ErrorState } from '@/components/state/ErrorState'
import { FadeIn } from '@/components/motion/FadeIn'
import { useAuth } from '@/features/auth/useAuth'
import { CatalogSection } from '@/features/catalog/CatalogSection'
import { useAppConfig } from '@/features/config/useAppConfig'

export function DashboardPage() {
  const { branding, error: configError } = useAppConfig()
  const { status, profileError } = useAuth()

  return (
    <div className="flex flex-col gap-10">
      <FadeIn className="flex flex-col gap-3">
        <h1 className="text-3xl">{branding.product_name}</h1>
        {branding.tagline ? <p className="max-w-prose text-text-muted">{branding.tagline}</p> : null}
      </FadeIn>

      {status === 'unavailable' ? (
        <FadeIn delay={0.06}>
          <ErrorState
            title="Supabase belum terhubung"
            description="Salin .env.example menjadi .env, isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dari dashboard Supabase, lalu jalankan ulang npm run dev."
          />
        </FadeIn>
      ) : null}

      {configError ? (
        <FadeIn delay={0.06}>
          <ErrorState title="Konfigurasi tidak termuat" description={configError} />
        </FadeIn>
      ) : null}

      {profileError ? (
        <FadeIn delay={0.06}>
          <ErrorState title="Profil akses bermasalah" description={profileError} />
        </FadeIn>
      ) : null}

      <FadeIn delay={0.14} className="flex flex-col gap-4">
        <h2 className="text-xl">Katalog tool</h2>
        <CatalogSection />
      </FadeIn>
    </div>
  )
}
