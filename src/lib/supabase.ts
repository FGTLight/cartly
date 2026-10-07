import { createClient } from '@supabase/supabase-js'

import { env } from './env'

/**
 * Shared Supabase client. Only feature `api.ts` modules import it, so
 * components and tests never depend on the network layer directly.
 *
 * A placeholder URL keeps imports working when the app is not configured
 * yet; `main.tsx` shows a setup screen instead of making requests.
 */
export const supabase = createClient(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseKey || 'missing-key',
)
