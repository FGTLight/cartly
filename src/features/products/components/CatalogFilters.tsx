import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { InputField, SelectField } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

import { useCategories } from '../hooks'
import { type ProductFilters, type SortOption, sortOptions } from '../types'

interface CatalogFiltersProps {
  filters: ProductFilters
  /** Called with the changed keys; the page resets to 1. */
  onChange: (patch: Partial<ProductFilters>) => void
}

export function CategoryChips({ filters, onChange }: CatalogFiltersProps) {
  const { data: categories = [] } = useCategories()
  const chip = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors',
      active
        ? 'border-brand-600 bg-brand-600 text-white'
        : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500',
    )
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Categories">
      <button
        type="button"
        className={chip(!filters.category)}
        aria-pressed={!filters.category}
        onClick={() => onChange({ category: null })}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          type="button"
          className={chip(filters.category === c.slug)}
          aria-pressed={filters.category === c.slug}
          onClick={() => onChange({ category: c.slug })}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}

/** Sort + price range. Price is applied on submit, not on every keystroke. */
export function SortAndPrice({ filters, onChange }: CatalogFiltersProps) {
  const [min, setMin] = useState(filters.minPrice?.toString() ?? '')
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? '')
  const [syncedFrom, setSyncedFrom] = useState(filters)

  // Follow back/forward navigation (state derived from props during render).
  if (syncedFrom.minPrice !== filters.minPrice || syncedFrom.maxPrice !== filters.maxPrice) {
    setSyncedFrom(filters)
    setMin(filters.minPrice?.toString() ?? '')
    setMax(filters.maxPrice?.toString() ?? '')
  }

  const minValue = min === '' ? null : Number(min)
  const maxValue = max === '' ? null : Number(max)
  const invalid = minValue !== null && maxValue !== null && minValue > maxValue

  const applyPrice = (event: FormEvent) => {
    event.preventDefault()
    if (!invalid) onChange({ minPrice: minValue, maxPrice: maxValue })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <form onSubmit={applyPrice} className="flex items-end gap-2" noValidate>
        <InputField
          label="Min $"
          type="number"
          inputMode="decimal"
          min={0}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-24"
        />
        <InputField
          label="Max $"
          type="number"
          inputMode="decimal"
          min={0}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          error={invalid ? 'Max < min' : undefined}
          className="w-24"
        />
        <Button type="submit" variant="secondary" disabled={invalid}>
          Apply
        </Button>
      </form>
      <SelectField
        label="Sort by"
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value as SortOption })}
        className="sm:ml-auto sm:w-52"
      >
        {Object.entries(sortOptions).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectField>
    </div>
  )
}
