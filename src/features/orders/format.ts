import type { OrderStatus } from './types'

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso))

/** Short, human-friendly order reference: `#A1B2C3D4`. */
export const orderNumber = (id: string) => `#${id.slice(0, 8).toUpperCase()}`

const statusLabels: Record<OrderStatus, string> = {
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const statusLabel = (status: OrderStatus) => statusLabels[status]
