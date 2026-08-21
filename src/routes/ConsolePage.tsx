import { FadeIn } from '@/components/motion/FadeIn'
import { ErrorState } from '@/components/state/ErrorState'
import { LoadingState } from '@/components/state/LoadingState'
import { Button } from '@/components/ui/button'
import { useCatalog } from '@/features/catalog/useCatalog'
import { CategoryManager } from '@/features/console/CategoryManager'
import { ToolManager } from '@/features/console/ToolManager'

/**
 * Catalog Console (features/03). Data dibaca lewat hook katalog yang sama
 * dengan halaman publik — bedanya RLS mengirim juga baris archived ke admin.
 */
export function ConsolePage() {
  const { loading, tools, categories, error, reload } = useCatalog()

  return (
    <div className="flex flex-col gap-10">
      <FadeIn className="flex flex-col gap-2">
        <h1 className="text-2xl">Catalog Console</h1>
        <p className="max-w-prose text-text-muted">
          Kelola isi katalog tanpa menyentuh kode. Setiap perubahan divalidasi ulang server; tombol yang tampil di sini
          bukan jaminan izin.
        </p>
      </FadeIn>

      {loading ? <LoadingState label="Memuat isi katalog" /> : null}

      {error ? (
        <ErrorState
          title="Isi katalog tidak termuat"
          description={error}
          action={
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              Muat ulang
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
        </>
      ) : null}
    </div>
  )
}
