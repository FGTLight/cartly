import { statusLabel } from '@/features/orders/format'
import { type Order, orderStatuses, type OrderStatus } from '@/features/orders/types'
import { cn } from '@/lib/cn'

import { useUpdateOrderStatus } from '../hooks'

export function StatusSelect({ order, className }: { order: Order; className?: string }) {
  const update = useUpdateOrderStatus()
  return (
    <select
      aria-label={`Status of order ${order.id.slice(0, 8)}`}
      value={update.isPending ? update.variables.status : order.status}
      disabled={update.isPending}
      onChange={(e) => update.mutate({ id: order.id, status: e.target.value as OrderStatus })}
      className={cn(
        'rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900',
        className,
      )}
    >
      {orderStatuses.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  )
}
