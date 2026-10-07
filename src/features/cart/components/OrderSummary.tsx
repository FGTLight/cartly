import { Truck } from 'lucide-react'
import type { ReactNode } from 'react'

import { formatPrice } from '@/lib/money'

import { FREE_SHIPPING_FROM_CENTS, type Totals } from '../pricing'

/** Subtotal / shipping / total, plus the free-shipping progress bar. */
export function OrderSummary({ totals, children }: { totals: Totals; children?: ReactNode }) {
  const progress = Math.min(100, (totals.subtotalCents / FREE_SHIPPING_FROM_CENTS) * 100)
  return (
    <div className="flex flex-col gap-4">
      {totals.itemCount > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-700/20 dark:text-brand-100">
          <p className="flex items-center gap-2">
            <Truck className="size-4 shrink-0" aria-hidden />
            {totals.missingForFreeShippingCents > 0 ? (
              <span>
                Add <strong>{formatPrice(totals.missingForFreeShippingCents)}</strong> more for
                free shipping
              </span>
            ) : (
              <span>You get free shipping!</span>
            )}
          </p>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-700/40"
            role="progressbar"
            aria-label="Progress to free shipping"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-600 dark:text-zinc-400">
            Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd>{formatPrice(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-600 dark:text-zinc-400">Shipping</dt>
          <dd>{totals.shippingCents === 0 ? 'Free' : formatPrice(totals.shippingCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold dark:border-zinc-800">
          <dt>Total</dt>
          <dd>{formatPrice(totals.totalCents)}</dd>
        </div>
      </dl>
      {children}
    </div>
  )
}
