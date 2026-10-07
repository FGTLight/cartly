import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/cn'

interface QuantityStepperProps {
  value: number
  max: number
  onChange: (value: number) => void
  label: string
  size?: 'sm' | 'md'
}

export function QuantityStepper({ value, max, onChange, label, size = 'md' }: QuantityStepperProps) {
  const button = cn(
    'flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-40',
    'disabled:hover:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800',
    size === 'sm' ? 'size-8' : 'size-10',
  )
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700"
    >
      <button
        type="button"
        className={cn(button, 'rounded-l-lg')}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={cn(button, 'rounded-r-lg')}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
