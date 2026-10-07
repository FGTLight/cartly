import { makeProduct } from '@/test/utils'

import { cartTotals, FREE_SHIPPING_FROM_CENTS, SHIPPING_FEE_CENTS } from './pricing'
import { useCart } from './store'

describe('cartTotals', () => {
  it('is all zeros for an empty cart', () => {
    expect(cartTotals([])).toMatchObject({ itemCount: 0, shippingCents: 0, totalCents: 0 })
  })

  it('charges shipping below the free-shipping threshold', () => {
    const totals = cartTotals([{ priceCents: 1000, quantity: 2 }])
    expect(totals).toEqual({
      itemCount: 2,
      subtotalCents: 2000,
      shippingCents: SHIPPING_FEE_CENTS,
      totalCents: 2000 + SHIPPING_FEE_CENTS,
      missingForFreeShippingCents: FREE_SHIPPING_FROM_CENTS - 2000,
    })
  })

  it('ships for free from the threshold, inclusive', () => {
    const totals = cartTotals([{ priceCents: FREE_SHIPPING_FROM_CENTS, quantity: 1 }])
    expect(totals.shippingCents).toBe(0)
    expect(totals.missingForFreeShippingCents).toBe(0)
  })
})

describe('cart store', () => {
  beforeEach(() => useCart.setState({ lines: [], drawerOpen: false }))

  it('adds a product and merges repeated adds', () => {
    const product = makeProduct()
    useCart.getState().add(product)
    useCart.getState().add(product, 2)
    expect(useCart.getState().lines).toHaveLength(1)
    expect(useCart.getState().lines[0]).toMatchObject({ productId: 'p1', quantity: 3 })
  })

  it('never exceeds the stock', () => {
    const product = makeProduct({ stock: 3 })
    useCart.getState().add(product, 5)
    expect(useCart.getState().lines[0].quantity).toBe(3)
    useCart.getState().setQuantity('p1', 10)
    expect(useCart.getState().lines[0].quantity).toBe(3)
  })

  it('keeps at least one unit when the quantity goes below 1', () => {
    useCart.getState().add(makeProduct())
    useCart.getState().setQuantity('p1', 0)
    expect(useCart.getState().lines[0].quantity).toBe(1)
  })

  it('refreshes the price snapshot when added again', () => {
    useCart.getState().add(makeProduct({ priceCents: 2500 }))
    useCart.getState().add(makeProduct({ priceCents: 2000 }))
    expect(useCart.getState().lines[0].priceCents).toBe(2000)
  })

  it('removes and clears lines', () => {
    useCart.getState().add(makeProduct())
    useCart.getState().add(makeProduct({ id: 'p2', slug: 'case' }))
    useCart.getState().remove('p1')
    expect(useCart.getState().lines.map((l) => l.productId)).toEqual(['p2'])
    useCart.getState().clear()
    expect(useCart.getState().lines).toEqual([])
  })

  it('persists lines but not the drawer state', () => {
    useCart.getState().add(makeProduct())
    useCart.getState().openDrawer()
    const stored = JSON.parse(localStorage.getItem('cartly-cart') ?? '{}')
    expect(stored.state.lines).toHaveLength(1)
    expect(stored.state).not.toHaveProperty('drawerOpen')
  })
})
