import { ShoppingBag } from 'lucide-react'
import type { ReactNode } from 'react'

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-2xl bg-brand-600 p-3 text-white">
          <ShoppingBag className="size-6" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">{footer}</p>
    </div>
  )
}
