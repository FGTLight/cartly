import { CreditCard, MapPin } from 'lucide-react'

import { ProductImage } from '@/features/products/components/ProductImage'
import { formatPrice } from '@/lib/money'

import type { Order } from '../types'

/** Items, totals, address and payment of one order. Shared with admin. */
export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section aria-label="Items" className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <ProductImage
                src={item.productImage}
                alt=""
                className="size-16 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-zinc-500">
                  {item.quantity} × {formatPrice(item.unitPriceCents)}
                </p>
              </div>
              <p className="text-sm font-semibold">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 border-t border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal</dt>
            <dd>{formatPrice(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Shipping</dt>
            <dd>{order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <h2 className="mb-2 flex items-center gap-2 font-semibold">
            <MapPin className="size-4" aria-hidden />
            Shipping to
          </h2>
          <address className="not-italic leading-relaxed text-zinc-600 dark:text-zinc-400">
            {order.shipping.full_name}
            <br />
            {order.shipping.address}
            <br />
            {order.shipping.postal_code} {order.shipping.city}
            <br />
            {order.shipping.country}
          </address>
        </section>
        <section className="rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <h2 className="mb-2 flex items-center gap-2 font-semibold">
            <CreditCard className="size-4" aria-hidden />
            Payment
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Card ending in <span className="font-mono">{order.paymentLast4}</span>
          </p>
        </section>
      </div>
    </div>
  )
}
