import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProductCard } from '@/features/products/components/ProductCard'
import { makeProduct, renderWithProviders } from '@/test/utils'

import CartPage from './pages/CartPage'
import { useCart } from './store'

beforeEach(() => useCart.setState({ lines: [], drawerOpen: false }))

describe('ProductCard', () => {
  it('adds the product to the cart', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductCard product={makeProduct()} />)
    await user.click(screen.getByRole('button', { name: 'Add Wireless Earbuds to cart' }))
    expect(useCart.getState().lines[0]).toMatchObject({ productId: 'p1', quantity: 1 })
  })

  it('cannot add a sold-out product', () => {
    renderWithProviders(<ProductCard product={makeProduct({ stock: 0 })} />)
    expect(screen.getByRole('button', { name: /add .* to cart/i })).toBeDisabled()
    expect(screen.getByText('Sold out')).toBeInTheDocument()
  })

  it('shows the discount', () => {
    renderWithProviders(
      <ProductCard product={makeProduct({ priceCents: 7500, compareAtCents: 10000 })} />,
    )
    expect(screen.getAllByText('−25%').length).toBeGreaterThan(0)
  })
})

describe('CartPage', () => {
  it('shows an empty state', () => {
    renderWithProviders(<CartPage />)
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('updates totals when the quantity changes', async () => {
    const user = userEvent.setup()
    useCart.getState().add(makeProduct({ priceCents: 2000 }))
    renderWithProviders(<CartPage />)

    const summary = screen.getByRole('complementary')
    expect(within(summary).getByText('Shipping').nextSibling).toHaveTextContent('$4.99')

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    // 3 × $20 = $60, over the $50 free-shipping threshold.
    expect(within(summary).getByText('Total').nextSibling).toHaveTextContent('$60.00')
    expect(within(summary).getByText('Shipping').nextSibling).toHaveTextContent('Free')
  })

  it('removes a line', async () => {
    const user = userEvent.setup()
    useCart.getState().add(makeProduct())
    renderWithProviders(<CartPage />)
    await user.click(screen.getByRole('button', { name: 'Remove Wireless Earbuds' }))
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })
})
