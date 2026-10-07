import { ChevronRight, Package } from 'lucide-react'
import { Link } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback'
import { ProductImage } from '@/features/products/components/ProductImage'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { formatDate, orderNumber } from '../format'
import { useMyOrders } from '../hooks'

export default function OrdersPage() {
  useDocumentTitle('My orders')
  const { data: orders, error, isPending, refetch } = useMyOrders()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My orders</h1>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading orders">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title="No orders yet"
          description="When you place an order, it will show up here."
          action={
            <Link to="/shop" className={buttonClass()}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => {
            const count = order.items.reduce((n, i) => n + i.quantity, 0)
            return (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <ProductImage
                        key={item.id}
                        src={item.productImage}
                        alt=""
                        className="size-12 rounded-full border-2 border-white dark:border-zinc-900"
                      />
                    ))}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {orderNumber(order.id)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-zinc-500">
                      {formatDate(order.createdAt)} · {count} {count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <span className="font-semibold">{formatPrice(order.totalCents)}</span>
                  <ChevronRight className="size-5 text-zinc-400" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
