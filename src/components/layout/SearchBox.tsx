import { Search } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

import { controlClass } from '@/components/ui/styles'
import { cn } from '@/lib/cn'

/** Submits to the catalog, keeping the selected category. */
export function SearchBox({ className }: { className?: string }) {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const id = useId()
  const current = pathname === '/shop' ? (params.get('q') ?? '') : ''
  const [term, setTerm] = useState(current)
  const [syncedFrom, setSyncedFrom] = useState(current)

  // Follow the URL (back button, "Clear filters").
  if (syncedFrom !== current) {
    setSyncedFrom(current)
    setTerm(current)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next = new URLSearchParams()
    const category = pathname === '/shop' ? params.get('category') : null
    if (category) next.set('category', category)
    if (term.trim()) next.set('q', term.trim())
    const query = next.toString()
    navigate(query ? `/shop?${query}` : '/shop')
  }

  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search products…"
        className={cn(controlClass, 'rounded-full pl-9')}
      />
    </form>
  )
}
