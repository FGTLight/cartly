import { ShieldX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState, Spinner } from '@/components/ui/feedback'

import { useAuth } from '../context'

/** Sends guests to /login and brings them back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

/**
 * UI guard only: the database enforces admin rights through RLS, so a user
 * who bypasses this still cannot read or change anything.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  return (
    <RequireAuth>
      {profile?.isAdmin ? (
        children
      ) : (
        <EmptyState
          icon={<ShieldX className="size-6" />}
          title="Admins only"
          description="Your account doesn't have access to this page."
          action={
            <Link to="/" className={buttonClass('secondary')}>
              Back to the store
            </Link>
          }
        />
      )}
    </RequireAuth>
  )
}
