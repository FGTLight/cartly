const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Prices are integers in cents: `formatPrice(1999)` → `"$19.99"`. */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100)
}

/** Whole-number discount: 20 for $80 instead of $100. */
export function discountPercent(priceCents: number, compareAtCents: number | null): number {
  if (!compareAtCents || compareAtCents <= priceCents) return 0
  return Math.round((1 - priceCents / compareAtCents) * 100)
}

/** Dollars typed in a form → cents. Avoids float drift (`19.99 * 100`). */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}
