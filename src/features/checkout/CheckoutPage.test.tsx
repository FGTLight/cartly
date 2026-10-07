import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCart } from '@/features/cart/store'
import { placeOrder } from '@/features/orders/api'
import { makeProduct, renderWithProviders, signedIn } from '@/test/utils'

import CheckoutPage from './pages/CheckoutPage'
import { DECLINED_CARD, TEST_CARD } from './schema'

vi.mock('@/features/orders/api', () => ({ placeOrder: vi.fn() }))
// Same gateway, without the artificial delay.
vi.mock('./payment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./payment')>()
  return { ...actual, authorizePayment: (card: string) => actual.authorizePayment(card, 0) }
})

const mockedPlaceOrder = vi.mocked(placeOrder)

function renderCheckout() {
  return renderWithProviders(<CheckoutPage />, {
    route: '/checkout',
    path: '/checkout',
    auth: signedIn,
    routes: { '/orders/:id': <p>Order confirmation page</p> },
  })
}

async function fillForm(card: string) {
  const user = userEvent.setup()
  // Full name and name on card come from the profile.
  await user.type(screen.getByLabelText('Address'), '12 Analytical St')
  await user.type(screen.getByLabelText('City'), 'London')
  await user.type(screen.getByLabelText('Postal code'), 'NW1 6XE')
  await user.type(screen.getByLabelText('Country'), 'United Kingdom')
  await user.type(screen.getByLabelText('Card number'), card)
  await user.type(screen.getByLabelText('Expiry'), '1240')
  await user.type(screen.getByLabelText('CVC'), '123')
  return user
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCart.setState({ lines: [] })
    // 2 × $20 = $40, under the free-shipping threshold.
    useCart.getState().add(makeProduct({ priceCents: 2000 }), 2)
  })

  it('shows the order total, including shipping', () => {
    renderCheckout()
    expect(screen.getByRole('button', { name: /pay \$44\.99/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace')
  })

  it('validates the form before paying', async () => {
    const user = userEvent.setup()
    renderCheckout()
    await user.click(screen.getByRole('button', { name: /pay/i }))
    expect(await screen.findByText('Enter your address')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid card number')).toBeInTheDocument()
    expect(mockedPlaceOrder).not.toHaveBeenCalled()
  })

  it('places the order with ids, quantities and only the last 4 digits', async () => {
    mockedPlaceOrder.mockResolvedValue('order-123')
    renderCheckout()
    const user = await fillForm(TEST_CARD)
    await user.click(screen.getByRole('button', { name: /pay/i }))

    expect(await screen.findByText('Order confirmation page')).toBeInTheDocument()
    expect(mockedPlaceOrder.mock.calls[0][0]).toEqual({
      items: [{ productId: 'p1', quantity: 2 }],
      shipping: {
        full_name: 'Ada Lovelace',
        address: '12 Analytical St',
        city: 'London',
        postal_code: 'NW1 6XE',
        country: 'United Kingdom',
      },
      paymentLast4: '4242',
    })
    expect(useCart.getState().lines).toEqual([])
  })

  it('keeps the cart when the card is declined', async () => {
    renderCheckout()
    const user = await fillForm(DECLINED_CARD)
    await user.click(screen.getByRole('button', { name: /pay/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /pay/i })).toBeEnabled())
    expect(mockedPlaceOrder).not.toHaveBeenCalled()
    expect(useCart.getState().lines).toHaveLength(1)
  })

  it('keeps the cart when the database rejects the order', async () => {
    mockedPlaceOrder.mockRejectedValue({ code: 'P0001', message: 'Only 1 left of "Earbuds"' })
    renderCheckout()
    const user = await fillForm(TEST_CARD)
    await user.click(screen.getByRole('button', { name: /pay/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /pay/i })).toBeEnabled())
    expect(useCart.getState().lines).toHaveLength(1)
  })
})
