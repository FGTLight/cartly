import { supabase } from '@/lib/supabase'

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/**
 * Creates the account. `full_name` is copied to `profiles` by the
 * `handle_new_user` trigger. Returns false when the project requires email
 * confirmation (no session yet).
 */
export async function signUp(fullName: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
    },
  })
  if (error) throw error
  return Boolean(data.session)
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
