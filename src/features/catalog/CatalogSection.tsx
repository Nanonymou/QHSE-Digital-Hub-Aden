import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { LoadingState } from '@/components/state/LoadingState'
import { Button } from '@/components/ui/button'
import type { ToolWithCategory } from '@/types/database'
import { ToolDetailDialog } from './ToolDetailDialog'
import { ToolGrid } from './ToolGrid'
import { useCatalog } from './useCatalog'

export function CatalogSection() {
  const { loading, tools, error, reload, launchTool } = useCatalog()
  const [detailTool, setDetailTool] = useState<ToolWithCategory | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleLaunch = (tool: ToolWithCategory) => {
    const result = launchTool(tool)
    setNotice(result.ok ? null : (result.message ?? null))
  }

  if (loading) return <LoadingState label="Memuat katalog tool" />

  if (error) {
    return (
      <ErrorState
        title="Katalog tidak termuat"
        description={error}
        action={
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            Muat ulang katalog
          </Button>
        }
      />
    )
  }

  if (tools.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid aria-hidden className="size-6" />}
        title="Belum ada tool terdaftar"
        description="Daftarkan tool QHSE pertama lewat Catalog Console (Phase 3), atau tambahkan langsung di Supabase mengikuti contoh pada migration 0002."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {notice ? <ErrorState title="Tool belum bisa dibuka" description={notice} /> : null}

      <ToolGrid tools={tools} onLaunch={handleLaunch} onDetail={setDetailTool} />

      <ToolDetailDialog
        tool={detailTool}
        onOpenChange={(open) => {
          if (!open) setDetailTool(null)
        }}
        onLaunch={handleLaunch}
      />
    </div>
  )
}
