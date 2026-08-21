import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ErrorState } from '@/components/state/ErrorState'
import { useI18n } from '@/features/i18n/useI18n'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  destructive?: boolean
  onConfirm: () => Promise<string | null>
  onOpenChange: (open: boolean) => void
}

/**
 * Konfirmasi untuk aksi yang sulit dibatalkan (arsip, hapus permanen).
 * `onConfirm` mengembalikan pesan error, atau null bila berhasil — dialog
 * menutup sendiri hanya saat berhasil, supaya kegagalan tidak lewat diam-diam.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleConfirm = async () => {
    setBusy(true)
    setError(null)
    const message = await onConfirm()
    setBusy(false)
    if (message) setError(message)
    else onOpenChange(false)
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>

        {error ? <ErrorState title={t('common.actionFailed')} description={error} /> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            loading={busy}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
