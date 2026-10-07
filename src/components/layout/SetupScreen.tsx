import { Settings } from 'lucide-react'

/** Shown instead of the app when `.env.local` is missing. */
export function SetupScreen({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-5 px-6 py-12">
      <span className="w-fit rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
        <Settings className="size-6" aria-hidden />
      </span>
      <h1 className="text-2xl font-bold tracking-tight">Connect Cartly to Supabase</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        These environment variables are missing:
      </p>
      <ul className="flex flex-col gap-1 font-mono text-sm">
        {missing.map((name) => (
          <li key={name} className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-900">
            {name}
          </li>
        ))}
      </ul>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
        <li>
          Copy <code className="font-mono">.env.example</code> to{' '}
          <code className="font-mono">.env.local</code>.
        </li>
        <li>
          Fill in the Project URL and publishable key from Supabase → Project Settings → API
          Keys.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </main>
  )
}
