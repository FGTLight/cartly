import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

import { AuthContext, type AuthState, type Profile } from './context'

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, is_admin')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data && { id: data.id, fullName: data.full_name, isAdmin: data.is_admin }
}

const profileKey = (userId: string | undefined) => ['profile', userId] as const

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoaded(true)
    })
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      setSessionLoaded(true)
      // Orders and admin data belong to the previous user.
      if (event === 'SIGNED_OUT') queryClient.removeQueries({ queryKey: ['orders'] })
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const userId = session?.user.id
  const profile = useQuery({
    queryKey: profileKey(userId),
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  })

  const value: AuthState = {
    session,
    profile: profile.data ?? null,
    loading: !sessionLoaded || (Boolean(userId) && profile.isPending),
  }
  return <AuthContext value={value}>{children}</AuthContext>
}
