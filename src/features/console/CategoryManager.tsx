import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Category, ToolWithCategory } from '@/types/database'
import { CategoryFormDialog } from './CategoryFormDialog'
import { deleteCategory } from './console-api'

type CategoryManagerProps = {
  categories: Category[]
  tools: ToolWithCategory[]
  onChanged: () => Promise<void>
}

export function CategoryManager({ categories, tools, onChanged }: CategoryManagerProps) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<Category | null>(null)

  const usage = new Map<string, number>()
  for (const tool of tools) {
    if (tool.category_id) usage.set(tool.category_id, (usage.get(tool.category_id) ?? 0) + 1)
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl">Kategori</h2>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus aria-hidden />
          Tambah kategori
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="Belum ada kategori"
          description="Kategori mengelompokkan tool di katalog. Tambahkan satu kategori sebelum mendaftarkan tool pertama."
          action={
            <Button size="sm" onClick={() => setAdding(true)}>
              Tambah kategori
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => {
            const used = usage.get(category.id) ?? 0
            return (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-surface px-4 py-3"
              >
                <span className="font-mono text-xs text-text-subtle">{category.display_order}</span>
                <span className="flex-1 text-sm text-text">{category.name}</span>
                <span className="font-mono text-xs text-text-subtle">{category.slug}</span>
                <Badge className="border-line/15 bg-surface-elevated font-mono text-text-subtle">
                  {used} tool
                </Badge>
                {!category.active ? (
                  <Badge className="border-warn/40 bg-warn/10 text-warn">Nonaktif</Badge>
                ) : null}

                <span className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Ubah ${category.name}`} onClick={() => setEditing(category)}>
                    <Pencil aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus ${category.name}`}
                    onClick={() => setRemoving(category)}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {adding ? <CategoryFormDialog category={null} onClose={() => setAdding(false)} onSaved={onChanged} /> : null}
      {editing ? (
        <CategoryFormDialog category={editing} onClose={() => setEditing(null)} onSaved={onChanged} />
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title="Hapus kategori ini?"
        description={
          removing
            ? `${removing.name} akan hilang dari master kategori. Kategori yang masih dipakai tool akan ditolak server sampai tool-nya dipindahkan.`
            : ''
        }
        confirmLabel="Hapus kategori"
        destructive
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        onConfirm={async () => {
          if (!removing) return null
          const result = await deleteCategory(removing.id)
          if (!result.ok) return result.message
          await onChanged()
          return null
        }}
      />
    </section>
  )
}
