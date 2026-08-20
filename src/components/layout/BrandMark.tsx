import { useAppConfig } from '@/features/config/useAppConfig'
import { cn } from '@/lib/utils'

/**
 * Identitas visual sepenuhnya dari `app_config.branding`.
 * Bila logo belum diset, tampilkan monogram dari nama produk — bukan aset yang ditanam di kode.
 */
export function BrandMark({ className }: { className?: string }) {
  const { branding } = useAppConfig()
  const monogram = branding.product_name.trim().charAt(0).toUpperCase() || '·'

  return (
    <span className={cn('flex items-center gap-3', className)}>
      {branding.logo_url ? (
        <img
          src={branding.logo_url}
          alt={branding.company_name || branding.product_name}
          className="size-8 rounded object-contain"
        />
      ) : (
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded bg-primary-deep font-display text-sm font-bold text-primary-contrast"
        >
          {monogram}
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className="font-display text-sm font-semibold tracking-tight text-text">{branding.product_name}</span>
        {branding.company_name ? (
          <span className="font-mono text-xs text-text-subtle">{branding.company_name}</span>
        ) : null}
      </span>
    </span>
  )
}
