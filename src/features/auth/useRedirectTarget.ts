import { useLocation } from 'react-router'

/** Where to go after signing in: back to the guarded page, or home. */
export function useRedirectTarget() {
  const state = useLocation().state as { from?: string } | null
  // Only same-app paths, never an absolute URL.
  return state?.from?.startsWith('/') && !state.from.startsWith('//') ? state.from : '/'
}
