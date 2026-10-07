import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeProduct, renderWithProviders } from '@/test/utils'

import { fetchCategories, fetchProducts } from './api'
import CatalogPage from './pages/CatalogPage'

vi.mock('./api', () => ({ fetchProducts: vi.fn(), fetchCategories: vi.fn() }))

const mockedFetchProducts = vi.mocked(fetchProducts)

beforeEach(() => {
  vi.mocked(fetchCategories).mockResolvedValue([
    { id: 1, slug: 'laptops', name: 'Laptops' },
    { id: 2, slug: 'sunglasses', name: 'Sunglasses' },
  ])
})

describe('CatalogPage', () => {
  it('reads the filters from the URL', async () => {
    mockedFetchProducts.mockResolvedValue({ items: [makeProduct()], total: 1 })
    renderWithProviders(<CatalogPage />, { route: '/shop?q=buds&category=laptops&sort=rating' })

    expect(await screen.findByText('Wireless Earbuds')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Results for “buds”' })).toBeInTheDocument()
    expect(screen.getByText('1 product')).toBeInTheDocument()
    expect(mockedFetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'buds', category: 'laptops', sort: 'rating', page: 1 }),
    )
  })

  it('filters by category', async () => {
    const user = userEvent.setup()
    mockedFetchProducts.mockResolvedValue({ items: [makeProduct()], total: 1 })
    renderWithProviders(<CatalogPage />, { route: '/shop' })

    await user.click(await screen.findByRole('button', { name: 'Sunglasses' }))
    expect(await screen.findByRole('heading', { name: 'Sunglasses' })).toBeInTheDocument()
    expect(mockedFetchProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 'sunglasses' }),
    )
  })

  it('offers to clear filters when nothing matches', async () => {
    const user = userEvent.setup()
    mockedFetchProducts.mockResolvedValue({ items: [], total: 0 })
    renderWithProviders(<CatalogPage />, { route: '/shop?q=zzz' })

    await user.click(await screen.findByRole('button', { name: 'Clear filters' }))
    expect(mockedFetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ search: '' }))
  })

  it('pages through results', async () => {
    const user = userEvent.setup()
    mockedFetchProducts.mockResolvedValue({ items: [makeProduct()], total: 30 })
    renderWithProviders(<CatalogPage />, { route: '/shop' })

    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument()
    expect(mockedFetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
  })

  it('shows an error with retry', async () => {
    mockedFetchProducts.mockRejectedValue(new TypeError('Failed to fetch'))
    renderWithProviders(<CatalogPage />, { route: '/shop' })
    expect(await screen.findByText(/appear to be offline/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
