import { cn } from '@/lib/cn'

export const controlClass = cn(
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm',
  'text-zinc-900 placeholder:text-zinc-400',
  'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
  'aria-invalid:border-red-500 aria-invalid:ring-red-500/30',
  'disabled:opacity-60',
  'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
)

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary:
    'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 ' +
    'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  ghost: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'size-10',
}

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

/** Shared class names, also used to style links as buttons. */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-colors disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  )
}
