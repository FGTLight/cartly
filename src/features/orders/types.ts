export const orderStatuses = ['paid', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof orderStatuses)[number]

export interface ShippingAddress {
  full_name: string
  address: string
  city: string
  postal_code: string
  country: string
}

export interface OrderItem {
  id: number
  productId: string | null
  productName: string
  productImage: string | null
  unitPriceCents: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  subtotalCents: number
  shippingCents: number
  totalCents: number
  shipping: ShippingAddress
  paymentLast4: string
  createdAt: string
  items: OrderItem[]
  /** Only loaded in the admin list. */
  customerName?: string | null
}
