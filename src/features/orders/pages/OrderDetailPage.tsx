import { CircleCheck, PackageX } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/feedback'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { OrderDetails } from '../components/OrderDetails'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { formatDateTime, orderNumber } from '../format'
import { useOrder } from '../hooks'
import type { OrderStatus } from '../types'

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'paid', label: 'Paid' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
]

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null
  const reached = steps.findIndex((s) => s.status === status)
  return (
    <ol className="flex items-center gap-2" aria-label="Order progress">
      {steps.map((step, i) => (
        <li key={step.status} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              i <= reached ? 'bg-brand-600 text-white' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800',
            )}
            aria-hidden
          >
            {i + 1}
          </span>
          <span
            className={cn('text-sm', i <= reached ? 'font-medium' : 'text-zinc-500')}
            aria-current={i === reached ? 'step' : undefined}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <span
              className={cn(
                'h-0.5 flex-1 rounded',
                i < reached ? 'bg-brand-600' : 'bg-zinc-200 dark:bg-zinc-800',
              )}
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  )
}

export default function OrderDetailPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const justPlaced = params.has('placed')
  const { data: order, error, isPending, refetch } = useOrder(id)
  useDocumentTitle(order ? `Order ${orderNumber(order.id)}` : 'Order')

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isPending) return <Spinner />
  if (!order) {
    return (
      <EmptyState
        icon={<PackageX className="size-6" />}
        title="Order not found"
        action={
          <Link to="/orders" className={buttonClass('secondary')}>
            My orders
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {justPlaced && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl bg-brand-50 p-5 text-brand-700 dark:bg-brand-700/20 dark:text-brand-100"
        >
          <CircleCheck className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Thank you! Your order is confirmed.</p>
            <p className="text-sm">We'll let you know when it ships.</p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link to="/orders" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            ← My orders
          </Link>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            Order <span className="font-mono">{orderNumber(order.id)}</span>
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-zinc-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Link to="/shop" className={buttonClass('secondary')}>
          Continue shopping
        </Link>
      </div>
      <StatusTimeline status={order.status} />
      <OrderDetails order={order} />
    </div>
  )
}
