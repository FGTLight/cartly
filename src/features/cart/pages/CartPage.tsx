import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState } from '@/components/ui/feedback'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { CartLineItem } from '../components/CartLineItem'
import { OrderSummary } from '../components/OrderSummary'
import { cartTotals } from '../pricing'
import { useCart } from '../store'

export default function CartPage() {
  useDocumentTitle('Cart')
  const lines = useCart((s) => s.lines)
  const clear = useCart((s) => s.clear)

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" />}
        title="Your cart is empty"
        description="Find something you love and it will show up here."
        action={
          <Link to="/shop" className={buttonClass()}>
            Start shopping
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section aria-label="Items">
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {lines.map((line) => (
              <CartLineItem key={line.productId} line={line} />
            ))}
          </ul>
          <div className="mt-4 flex justify-between">
            <Link to="/shop" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              ← Continue shopping
            </Link>
            <button
              type="button"
              onClick={clear}
              className="text-sm text-zinc-500 hover:text-red-600"
            >
              Clear cart
            </button>
          </div>
        </section>
        <aside className="h-fit rounded-2xl border border-zinc-200 p-6 lg:sticky lg:top-24 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <OrderSummary totals={cartTotals(lines)}>
            <Link to="/checkout" className={buttonClass('primary', 'lg', 'w-full')}>
              Proceed to checkout
            </Link>
            <p className="text-center text-xs text-zinc-500">
              Taxes included. Final prices are confirmed at checkout.
            </p>
          </OrderSummary>
        </aside>
      </div>
    </div>
  )
}
