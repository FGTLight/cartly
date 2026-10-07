/**
 * Mirrors the constants in `place_order()` so the cart can preview totals.
 * Display only: the database recomputes everything when the order is placed.
 */
export const FREE_SHIPPING_FROM_CENTS = 5000
export const SHIPPING_FEE_CENTS = 499
export const MAX_QUANTITY = 99

export interface Totals {
  itemCount: number
  subtotalCents: number
  shippingCents: number
  totalCents: number
  /** How much more to spend for free shipping (0 when already free). */
  missingForFreeShippingCents: number
}

export function cartTotals(
  lines: ReadonlyArray<{ priceCents: number; quantity: number }>,
): Totals {
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0)
  const free = subtotalCents >= FREE_SHIPPING_FROM_CENTS
  const shippingCents = itemCount === 0 || free ? 0 : SHIPPING_FEE_CENTS
  return {
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    missingForFreeShippingCents: free ? 0 : FREE_SHIPPING_FROM_CENTS - subtotalCents,
  }
}
