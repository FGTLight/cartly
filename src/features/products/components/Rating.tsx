import { Star } from 'lucide-react'

export function Rating({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400"
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
      <span aria-hidden>{value.toFixed(1)}</span>
    </span>
  )
}
