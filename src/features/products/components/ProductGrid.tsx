import { Skeleton } from '@/components/ui/feedback'

import type { Product } from '../types'
import { ProductCard } from './ProductCard'

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className={gridClass}>
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} eager={i < 4} />
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={gridClass} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          <Skeleton className="aspect-square" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  )
}
