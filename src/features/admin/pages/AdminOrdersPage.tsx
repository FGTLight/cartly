import { Link, useSearchParams } from 'react-router'

import { ErrorState, Skeleton } from '@/components/ui/feedback'
import { statusLabel } from '@/features/orders/format'
import { formatDateTime, orderNumber } from '@/features/orders/format'
import { orderStatuses, type OrderStatus } from '@/features/orders/types'
import { Pagination } from '@/features/products/components/Pagination'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { ADMIN_PAGE_SIZE } from '../api'
import { StatusSelect } from '../components/StatusSelect'
import { useAllOrders } from '../hooks'

export default function AdminOrdersPage() {
  useDocumentTitle('Orders · Admin')
  const [params, setParams] = useSearchParams()
  const rawStatus = params.get('status')
  const status = orderStatuses.includes(rawStatus as OrderStatus) ? (rawStatus as OrderStatus) : null
  const page = Math.max(1, Number(params.get('page')) || 1)
  const { data, error, refetch, isPlaceholderData } = useAllOrders(status, page)

  const go = (next: { status?: OrderStatus | null; page?: number }) => {
    const s = next.status === undefined ? status : next.status
    const p = next.page ?? 1
    const query = new URLSearchParams()
    if (s) query.set('status', s)
    if (p > 1) query.set('page', String(p))
    setParams(query)
  }

  const tab = (active: boolean) =>
    cn(
      'rounded-full px-3 py-1 text-sm',
      active
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
    )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        <button type="button" className={tab(!status)} aria-pressed={!status} onClick={() => go({ status: null })}>
          All
        </button>
        {orderStatuses.map((s) => (
          <button
            key={s}
            type="button"
            className={tab(status === s)}
            aria-pressed={status === s}
            onClick={() => go({ status: s })}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

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
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data.items.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-mono font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {orderNumber(order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.customerName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatPrice(order.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect order={order} />
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    No orders here yet.
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
          onChange={(p) => go({ page: p })}
        />
      )}
    </div>
  )
}
