import { cva } from 'class-variance-authority'

/*
  Semua warna lewat token. Varian `primary` memakai --primary-deep (#C2410C)
  agar teks putih di atasnya lolos WCAG AA (PROJECT.md § Aturan kontras).
*/
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-micro ease-out-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary-deep text-primary-contrast hover:bg-primary',
        outline: 'border border-hairline bg-transparent text-text hover:bg-surface-elevated',
        ghost: 'text-text-muted hover:bg-surface-elevated hover:text-text',
        danger: 'bg-danger text-primary-contrast hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)
