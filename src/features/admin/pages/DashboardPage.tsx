import { DollarSign, type LucideIcon, Receipt, TriangleAlert, Users } from 'lucide-react'
import { Link } from 'react-router'

import { ErrorState, Skeleton } from '@/components/ui/feedback'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { formatDate, orderNumber } from '@/features/orders/format'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { useAllOrders, useStats } from '../hooks'

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-700/20">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  useDocumentTitle('Admin')
  const stats = useStats()
  const recent = useAllOrders(null, 1, 5)

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      {stats.error ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.data ? (
            <>
              <StatCard icon={DollarSign} label="Revenue" value={formatPrice(stats.data.revenueCents)} />
              <StatCard icon={Receipt} label="Orders" value={String(stats.data.ordersCount)} />
              <StatCard icon={Users} label="Customers" value={String(stats.data.customersCount)} />
              <StatCard
                icon={TriangleAlert}
                label="Low stock (≤ 5)"
                value={String(stats.data.lowStockCount)}
              />
            </>
          ) : (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
          )}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        </div>
        {recent.error ? (
          <ErrorState error={recent.error} onRetry={() => recent.refetch()} />
        ) : !recent.data ? (
          <Skeleton className="h-48" />
        ) : recent.data.items.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {recent.data.items.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="font-mono text-sm font-semibold">{orderNumber(order.id)}</span>
                  <span className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {order.customerName ?? 'Customer'} · {formatDate(order.createdAt)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <span className="w-24 text-right font-semibold">{formatPrice(order.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
