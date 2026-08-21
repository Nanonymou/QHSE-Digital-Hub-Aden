import { useState } from 'react'
import { Archive, ArchiveRestore, Pencil, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StatusBadge } from '@/features/catalog/StatusBadge'
import { ToolIcon } from '@/features/catalog/ToolIcon'
import { usePermission } from '@/features/auth/useAuth'
import type { Category, ToolWithCategory } from '@/types/database'
import { deleteTool, setToolStatus } from './console-api'
import { ToolFormDialog } from './ToolFormDialog'

type ToolManagerProps = {
  tools: ToolWithCategory[]
  categories: Category[]
  onChanged: () => Promise<void>
}

type Pending = { kind: 'archive' | 'restore' | 'delete'; tool: ToolWithCategory }

export function ToolManager({ tools, categories, onChanged }: ToolManagerProps) {
  // Hapus permanen hanya super admin — dan RLS menegakkannya lagi di server.
  const canDelete = usePermission('catalog.delete')
  const [editing, setEditing] = useState<ToolWithCategory | null>(null)
  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)

  const confirmCopy = {
    archive: {
      title: 'Arsipkan tool ini?',
      confirmLabel: 'Arsipkan',
      body: (tool: ToolWithCategory) =>
        `${tool.name} hilang dari katalog publik, tapi datanya tetap tersimpan dan bisa dipulihkan kapan saja.`,
    },
    restore: {
      title: 'Pulihkan tool ini?',
      confirmLabel: 'Pulihkan',
      body: (tool: ToolWithCategory) => `${tool.name} kembali tampil di katalog dengan status aktif.`,
    },
    delete: {
      title: 'Hapus permanen tool ini?',
      confirmLabel: 'Hapus permanen',
      body: (tool: ToolWithCategory) =>
        `${tool.name} dan seluruh catatan pemakaiannya dihapus dan tidak bisa dikembalikan. Arsipkan saja bila kamu hanya ingin menyembunyikannya.`,
    },
  }

  const runPending = async (): Promise<string | null> => {
    if (!pending) return null
    const { kind, tool } = pending
    const result =
      kind === 'delete'
        ? await deleteTool(tool.id)
        : await setToolStatus(tool.id, kind === 'archive' ? 'archived' : 'active')

    if (!result.ok) return result.message
    await onChanged()
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl">Tool</h2>
        <Button size="sm" disabled={categories.length === 0} onClick={() => setAdding(true)}>
          <Plus aria-hidden />
          Tambah tool
        </Button>
      </div>

      {tools.length === 0 ? (
        <EmptyState
          title="Katalog masih kosong"
          description={
            categories.length === 0
              ? 'Buat kategori lebih dulu, lalu daftarkan tool QHSE pertama ke dalamnya.'
              : 'Daftarkan tool QHSE pertama: beri nama, kategori, dan alamat https tujuannya.'
          }
          action={
            categories.length > 0 ? (
              <Button size="sm" onClick={() => setAdding(true)}>
                Tambah tool
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {tools.map((tool) => {
            const archived = tool.status === 'archived'
            return (
              <li
                key={tool.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-surface px-4 py-3"
              >
                <ToolIcon name={tool.icon} className="size-4 text-text-subtle" />
                <span className="min-w-40 flex-1 text-sm text-text">{tool.name}</span>
                <span className="font-mono text-xs text-text-subtle">{tool.category?.name ?? 'Tanpa kategori'}</span>
                <StatusBadge status={tool.status} />
                <span className="font-mono text-xs text-text-subtle">{tool.opens}× dibuka</span>

                <span className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Ubah ${tool.name}`} onClick={() => setEditing(tool)}>
                    <Pencil aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={archived ? `Pulihkan ${tool.name}` : `Arsipkan ${tool.name}`}
                    onClick={() => setPending({ kind: archived ? 'restore' : 'archive', tool })}
                  >
                    {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
                  </Button>
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus permanen ${tool.name}`}
                      onClick={() => setPending({ kind: 'delete', tool })}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {adding ? (
        <ToolFormDialog tool={null} categories={categories} onClose={() => setAdding(false)} onSaved={onChanged} />
      ) : null}
      {editing ? (
        <ToolFormDialog
          tool={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={onChanged}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending ? confirmCopy[pending.kind].title : ''}
        description={pending ? confirmCopy[pending.kind].body(pending.tool) : ''}
        confirmLabel={pending ? confirmCopy[pending.kind].confirmLabel : ''}
        destructive={pending?.kind === 'delete'}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        onConfirm={runPending}
      />
    </section>
  )
}
