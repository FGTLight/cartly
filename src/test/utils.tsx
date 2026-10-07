import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { AuthContext, type AuthState } from '@/features/auth/context'
import type { Product } from '@/features/products/types'

export const signedIn: AuthState = {
  session: { user: { id: 'user-1', email: 'ada@example.com' } } as AuthState['session'],
  profile: { id: 'user-1', fullName: 'Ada Lovelace', isAdmin: false },
  loading: false,
}

export const signedOut: AuthState = { session: null, profile: null, loading: false }

interface Options {
  route?: string
  /** Route pattern the element is mounted at (for useParams). */
  path?: string
  auth?: AuthState
  /** Extra routes, e.g. redirect targets. */
  routes?: Record<string, ReactElement>
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '*', auth = signedOut, routes = {} }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthContext value={auth}>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path} element={ui} />
              {Object.entries(routes).map(([p, element]) => (
                <Route key={p} path={p} element={element} />
              ))}
            </Routes>
          </MemoryRouter>
        </AuthContext>
      </QueryClientProvider>,
    ),
  }
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    slug: 'wireless-earbuds',
    name: 'Wireless Earbuds',
    description: 'Great sound.',
    brand: 'Sonic',
    category: { slug: 'mobile-accessories', name: 'Accessories' },
    priceCents: 2500,
    compareAtCents: null,
    images: ['https://example.com/earbuds.png'],
    stock: 10,
    rating: 4.5,
    active: true,
    ...overrides,
  }
}
