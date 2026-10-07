import { Badge, type BadgeTone } from '@/components/ui/feedback'

import { statusLabel } from '../format'
import type { OrderStatus } from '../types'

const tones: Record<OrderStatus, BadgeTone> = {
  paid: 'info',
  shipped: 'warning',
  delivered: 'brand',
  cancelled: 'danger',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={tones[status]}>{statusLabel(status)}</Badge>
}
