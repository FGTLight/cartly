import type { Session } from '@supabase/supabase-js'
import { createContext, use } from 'react'

export interface Profile {
  id: string
  fullName: string | null
  isAdmin: boolean
}

export interface AuthState {
  session: Session | null
  profile: Profile | null
  /** True until the stored session (and its profile) have been read. */
  loading: boolean
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
