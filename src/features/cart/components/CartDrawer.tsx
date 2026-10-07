import { ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState } from '@/components/ui/feedback'

import { cartTotals } from '../pricing'
import { useCart } from '../store'
import { CartLineItem } from './CartLineItem'
import { OrderSummary } from './OrderSummary'

/**
 * Slide-over cart built on the native <dialog>: focus trapping, Escape to
 * close and the backdrop come from the browser.
 */
export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen)
  const close = useCart((s) => s.closeDrawer)
  const lines = useCart((s) => s.lines)
  const totals = cartTotals(lines)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal?.()
    if (!open && dialog.open) dialog.close?.()
  }, [open])

  // Close when the route changes (e.g. after following a link).
  useEffect(() => close(), [pathname, close])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-title"
      onClose={close}
      onClick={(e) => {
        // A click on the backdrop targets the <dialog> itself.
        if (e.target === e.currentTarget) close()
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm dark:bg-zinc-900 dark:text-zinc-100"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 id="cart-title" className="text-lg font-semibold">
            Your cart
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close cart"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        {lines.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-6" />}
            title="Your cart is empty"
            description="Find something you love and it will show up here."
            action={
              <Link to="/shop" className={buttonClass()} onClick={close}>
                Start shopping
              </Link>
            }
          />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-zinc-200 overflow-y-auto px-5 dark:divide-zinc-800">
              {lines.map((line) => (
                <CartLineItem key={line.productId} line={line} onNavigate={close} />
              ))}
            </ul>
            <footer className="border-t border-zinc-200 p-5 dark:border-zinc-800">
              <OrderSummary totals={totals}>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/cart" className={buttonClass('secondary')} onClick={close}>
                    View cart
                  </Link>
                  <Link to="/checkout" className={buttonClass()} onClick={close}>
                    Checkout
                  </Link>
                </div>
              </OrderSummary>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
