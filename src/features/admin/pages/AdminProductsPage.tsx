import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { Badge, ErrorState, Skeleton } from '@/components/ui/feedback'
import { controlClass } from '@/components/ui/styles'
import { Pagination } from '@/features/products/components/Pagination'
import { ProductImage } from '@/features/products/components/ProductImage'
import { LOW_STOCK } from '@/features/products/components/StockBadge'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { ADMIN_PAGE_SIZE } from '../api'
import { useAdminProducts, useDeleteProduct, useToggleProduct } from '../hooks'

export default function AdminProductsPage() {
  useDocumentTitle('Products · Admin')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const deferredSearch = useDeferredValue(search.trim())
  const { data, error, refetch, isPlaceholderData } = useAdminProducts(deferredSearch, page)
  const toggle = useToggleProduct()
  const remove = useDeleteProduct()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link to="/admin/products/new" className={buttonClass()}>
          <Plus className="size-4" aria-hidden />
          New product
        </Link>
      </div>

      <label className="relative max-w-sm">
        <span className="sr-only">Search products</span>
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name…"
          className={cn(controlClass, 'pl-9')}
        />
      </label>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <Skeleton className="h-96" />
      ) : (
        <div
          className={cn(
            'overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800',
            isPlaceholderData && 'opacity-60',
          )}
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={p.images[0]}
                        alt=""
                        className="size-10 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-800"
                      />
                      <span className="line-clamp-1 font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.priceCents)}</td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right tabular-nums',
                      p.stock <= LOW_STOCK && 'font-semibold text-amber-600',
                    )}
                  >
                    {p.stock}
                  </td>
                  <td className="px-4 py-3">
                    {p.active ? <Badge tone="brand">Active</Badge> : <Badge>Hidden</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className={buttonClass('ghost', 'icon', 'size-8')}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        className={buttonClass('ghost', 'icon', 'size-8')}
                        aria-label={p.active ? `Hide ${p.name}` : `Show ${p.name}`}
                        onClick={() => toggle.mutate({ id: p.id, active: !p.active })}
                      >
                        {p.active ? (
                          <EyeOff className="size-4" aria-hidden />
                        ) : (
                          <Eye className="size-4" aria-hidden />
                        )}
                      </button>
                      <button
                        type="button"
                        className={buttonClass('ghost', 'icon', 'size-8 hover:text-red-600')}
                        aria-label={`Delete ${p.name}`}
                        onClick={() => {
                          if (window.confirm(`Delete “${p.name}”? Past orders keep their copy.`)) {
                            remove.mutate(p.id)
                          }
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No products match “{deferredSearch}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <Pagination
          page={page}
          pages={Math.max(1, Math.ceil(data.total / ADMIN_PAGE_SIZE))}
          onChange={setPage}
        />
      )}
    </div>
  )
}
