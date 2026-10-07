import { PackageX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/feedback'
import { OrderDetails } from '@/features/orders/components/OrderDetails'
import { formatDateTime, orderNumber } from '@/features/orders/format'
import { useOrder } from '@/features/orders/hooks'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { StatusSelect } from '../components/StatusSelect'

export default function AdminOrderPage() {
  const { id = '' } = useParams()
  // RLS lets admins read any order, so the customer query works here too.
  const { data: order, error, isPending, refetch } = useOrder(id)
  useDocumentTitle(order ? `Order ${orderNumber(order.id)} · Admin` : 'Order · Admin')

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isPending) return <Spinner />
  if (!order) {
    return (
      <EmptyState
        icon={<PackageX className="size-6" />}
        title="Order not found"
        action={
          <Link to="/admin/orders" className={buttonClass('secondary')}>
            All orders
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link to="/admin/orders" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            ← Orders
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Order <span className="font-mono">{orderNumber(order.id)}</span>
          </h1>
          <p className="text-sm text-zinc-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          Status
          <StatusSelect order={order} />
        </label>
      </div>
      <OrderDetails order={order} />
    </div>
  )
}
