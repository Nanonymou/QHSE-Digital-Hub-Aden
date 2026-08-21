import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Select native yang dibungkus token. Dipilih ketimbang menu kustom karena
 * lebih ringan, sudah keyboard-friendly, dan pas dengan form admin.
 */
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <span className="relative flex">
      <select
        ref={ref}
        className={cn(
          'h-10 w-full appearance-none rounded-md border border-hairline bg-surface px-3 pr-9 text-sm text-text',
          'transition-colors duration-micro ease-out-soft',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-55',
          'aria-[invalid=true]:border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-3 size-4 text-text-subtle" />
    </span>
  ),
)
Select.displayName = 'Select'
