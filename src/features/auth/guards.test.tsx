import { screen } from '@testing-library/react'
import { useLocation } from 'react-router'

import { renderWithProviders, signedIn, signedOut } from '@/test/utils'

import { RequireAdmin, RequireAuth } from './components/guards'

function LoginProbe() {
  const state = useLocation().state as { from?: string } | null
  return <p>Login page, back to {state?.from}</p>
}

describe('RequireAuth', () => {
  it('sends guests to login, remembering where they were going', () => {
    renderWithProviders(
      <RequireAuth>
        <p>Secret</p>
      </RequireAuth>,
      { route: '/orders?page=2', path: '/orders', auth: signedOut, routes: { '/login': <LoginProbe /> } },
    )
    expect(screen.getByText('Login page, back to /orders?page=2')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })

  it('renders the page for signed-in users', () => {
    renderWithProviders(
      <RequireAuth>
        <p>Secret</p>
      </RequireAuth>,
      { auth: signedIn },
    )
    expect(screen.getByText('Secret')).toBeInTheDocument()
  })

  it('waits while the session is loading', () => {
    renderWithProviders(
      <RequireAuth>
        <p>Secret</p>
      </RequireAuth>,
      { auth: { ...signedOut, loading: true } },
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('RequireAdmin', () => {
  it('blocks customers', () => {
    renderWithProviders(
      <RequireAdmin>
        <p>Dashboard</p>
      </RequireAdmin>,
      { auth: signedIn },
    )
    expect(screen.getByText('Admins only')).toBeInTheDocument()
  })

  it('lets admins in', () => {
    renderWithProviders(
      <RequireAdmin>
        <p>Dashboard</p>
      </RequireAdmin>,
      { auth: { ...signedIn, profile: { ...signedIn.profile!, isAdmin: true } } },
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
