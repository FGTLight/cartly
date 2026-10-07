import { AlertTriangle, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'

import { Button } from './Button'

export function Spinner({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex justify-center py-16', className)}>
      <Loader2 className="size-8 animate-spin text-brand-600" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800', className)}
    />
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800">{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-sm text-sm text-zinc-500">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle className="size-6 text-red-500" />}
      title="Couldn't load this"
      description={errorMessage(error)}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  )
}

const badgeTones = {
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100',
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
}

export type BadgeTone = keyof typeof badgeTones

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
