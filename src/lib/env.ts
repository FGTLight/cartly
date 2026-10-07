/** Build-time configuration from `.env.local` (see `.env.example`). */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
}

/** Names of the variables that are missing. */
export const missingEnv = [
  !env.supabaseUrl && 'VITE_SUPABASE_URL',
  !env.supabaseKey && 'VITE_SUPABASE_PUBLISHABLE_KEY',
].filter((v): v is string => Boolean(v))
