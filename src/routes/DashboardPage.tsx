import { LayoutGrid } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { FadeIn } from '@/components/motion/FadeIn'
import { useAuth } from '@/features/auth/useAuth'
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

      <FadeIn delay={0.14}>
        <EmptyState
          icon={<LayoutGrid aria-hidden className="size-6" />}
          title="Katalog tool belum aktif"
          description="Fondasi hub sudah berdiri: tema, sesi, dan hak akses. Kartu tool QHSE menyusul pada Phase 2 setelah tabel tools dan categories dibuat."
        />
      </FadeIn>
    </div>
  )
}
