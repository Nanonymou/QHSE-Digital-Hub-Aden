import { useState } from 'react'
import { Archive, ArchiveRestore, Lock, Pencil, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/state/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { StatusBadge } from '@/features/catalog/StatusBadge'
import { ToolIcon } from '@/features/catalog/ToolIcon'
import { usePermission } from '@/features/auth/useAuth'
import { useI18n } from '@/features/i18n/useI18n'
import type { Category, ToolWithCategory } from '@/types/database'
import { deleteTool, setToolStatus } from './console-api'
import { ToolFormDialog } from './ToolFormDialog'

type ToolManagerProps = {
  tools: ToolWithCategory[]
  categories: Category[]
  onChanged: () => Promise<void>
}

type Pending = {
  kind: 'archive' | 'restore' | 'delete'
  tool: ToolWithCategory
}

export function ToolManager({ tools, categories, onChanged }: ToolManagerProps) {
  // Hapus permanen hanya super admin — dan RLS menegakkannya lagi di server.
  const canDelete = usePermission('catalog.delete')
  const { t } = useI18n()
  const [editing, setEditing] = useState<ToolWithCategory | null>(null)
  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)

  const confirmCopy = {
    archive: {
      title: t('console.confirmArchive.title'),
      confirmLabel: t('console.confirmArchive.action'),
      body: (tool: ToolWithCategory) => t('console.confirmArchive.body', { name: tool.name }),
    },
    restore: {
      title: t('console.confirmRestore.title'),
      confirmLabel: t('console.confirmRestore.action'),
      body: (tool: ToolWithCategory) => t('console.confirmRestore.body', { name: tool.name }),
    },
    delete: {
      title: t('console.confirmDelete.title'),
      confirmLabel: t('console.confirmDelete.action'),
      body: (tool: ToolWithCategory) => t('console.confirmDelete.body', { name: tool.name }),
    },
  }

  const runPending = async (): Promise<string | null> => {
    if (!pending) return null
    const { kind, tool } = pending
    const result =
      kind === 'delete'
        ? await deleteTool(tool.id)
        : await setToolStatus(tool.id, kind === 'archive' ? 'archived' : 'active')

    if (!result.ok) return t(`error.write.${result.code}`)
    await onChanged()
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl">{t('console.tools')}</h2>
        <Button size="sm" disabled={categories.length === 0} onClick={() => setAdding(true)}>
          <Plus aria-hidden />
          {t('console.addTool')}
        </Button>
      </div>

      {tools.length === 0 ? (
        <EmptyState
          title={t('console.toolsEmpty.title')}
          description={
            categories.length === 0 ? t('console.toolsEmpty.needCategory') : t('console.toolsEmpty.body')
          }
          action={
            categories.length > 0 ? (
              <Button size="sm" onClick={() => setAdding(true)}>
                {t('console.addTool')}
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
                <span className="font-mono text-xs text-text-subtle">
                  {tool.category?.name ?? t('catalog.noCategory')}
                </span>
                {tool.visibility === 'role_scoped' ? (
                  <Badge
                    className="border-line/15 bg-surface-elevated text-text-muted"
                    title={t('visibility.badgeTitle', {
                      roles: tool.allowed_roles.map((role) => t(`role.${role}`)).join(', '),
                    })}
                  >
                    <Lock aria-hidden className="size-3" />
                    {t('visibility.badge')}
                  </Badge>
                ) : null}
                <StatusBadge status={tool.status} />
                <span className="font-mono text-xs text-text-subtle">
                  {t('console.openedTimes', { count: tool.opens })}
                </span>

                <span className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('console.edit', { name: tool.name })}
                    onClick={() => setEditing(tool)}
                  >
                    <Pencil aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      archived
                        ? t('console.restore', { name: tool.name })
                        : t('console.archive', { name: tool.name })
                    }
                    onClick={() =>
                      setPending({
                        kind: archived ? 'restore' : 'archive',
                        tool,
                      })
                    }
                  >
                    {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
                  </Button>
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('console.deleteTool', { name: tool.name })}
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
        <ToolFormDialog
          tool={null}
          categories={categories}
          onClose={() => setAdding(false)}
          onSaved={onChanged}
        />
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
