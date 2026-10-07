import { cn } from '@/lib/cn'
import { discountPercent, formatPrice } from '@/lib/money'

interface PriceProps {
  priceCents: number
  compareAtCents: number | null
  size?: 'md' | 'lg'
  /** Hide the "−20%" label (cards show it as a badge instead). */
  showDiscount?: boolean
}

export function Price({ priceCents, compareAtCents, size = 'md', showDiscount = true }: PriceProps) {
  const discount = discountPercent(priceCents, compareAtCents)
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn('font-semibold', size === 'lg' ? 'text-3xl' : 'text-base')}>
        {formatPrice(priceCents)}
      </span>
      {discount > 0 && compareAtCents && (
        <>
          <s className="text-sm text-zinc-500">
            <span className="sr-only">Was </span>
            {formatPrice(compareAtCents)}
          </s>
          {showDiscount && (
            <span className="text-sm font-medium text-brand-600 dark:text-brand-500">
              −{discount}%
            </span>
          )}
        </>
      )}
    </div>
  )
}
