import { SearchX } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { CategoryChips, SortAndPrice } from '../components/CatalogFilters'
import { Pagination } from '../components/Pagination'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import { defaultFilters, pageCount } from '../filters'
import { useCategories, useProducts } from '../hooks'
import { useCatalogFilters } from '../useCatalogFilters'

export default function CatalogPage() {
  const { filters, update } = useCatalogFilters()
  const { data, error, isPending, isPlaceholderData, refetch } = useProducts(filters)
  const { data: categories } = useCategories()
  const categoryName = categories?.find((c) => c.slug === filters.category)?.name

  const heading = filters.search
    ? `Results for “${filters.search}”`
    : (categoryName ?? 'All products')
  useDocumentTitle(heading)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
        {data && (
          <p className="text-sm text-zinc-500" aria-live="polite">
            {data.total} {data.total === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      <CategoryChips filters={filters} onChange={update} />
      <SortAndPrice filters={filters} onChange={update} />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <ProductGridSkeleton />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="No products found"
          description="Try a different search or remove some filters."
          action={<Button onClick={() => update(defaultFilters)}>Clear filters</Button>}
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
          <ProductGrid products={data.items} />
        </div>
      )}

      {data && (
        <Pagination
          page={filters.page}
          pages={pageCount(data.total)}
          onChange={(page) => update({ page })}
        />
      )}
    </div>
  )
}
