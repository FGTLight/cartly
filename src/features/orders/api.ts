import { supabase } from '@/lib/supabase'

import type { Order, OrderStatus, ShippingAddress } from './types'

interface OrderRow {
  id: string
  user_id: string
  status: OrderStatus
  subtotal_cents: number
  shipping_cents: number
  total_cents: number
  shipping: ShippingAddress
  payment_last4: string
  created_at: string
  order_items: {
    id: number
    product_id: string | null
    product_name: string
    product_image: string | null
    unit_price_cents: number
    quantity: number
  }[]
}

const orderColumns =
  'id, user_id, status, subtotal_cents, shipping_cents, total_cents, shipping, ' +
  'payment_last4, created_at, order_items(id, product_id, product_name, product_image, ' +
  'unit_price_cents, quantity)'

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    shipping: row.shipping,
    paymentLast4: row.payment_last4,
    createdAt: row.created_at,
    items: [...row.order_items]
      .sort((a, b) => a.id - b.id)
      .map((i) => ({
        id: i.id,
        productId: i.product_id,
        productName: i.product_name,
        productImage: i.product_image,
        unitPriceCents: i.unit_price_cents,
        quantity: i.quantity,
      })),
  }
}

export interface PlaceOrderInput {
  items: { productId: string; quantity: number }[]
  shipping: ShippingAddress
  paymentLast4: string
}

/**
 * Creates the order in one transaction. The database looks up prices,
 * checks and decrements stock, and computes the totals; we only send
 * product ids and quantities.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<string> {
  const { data, error } = await supabase.rpc('place_order', {
    items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    shipping: input.shipping,
    payment_last4: input.paymentLast4,
  })
  if (error) throw error
  return data as string
}

/** The signed-in user's orders (RLS filters them), newest first. */
export async function fetchMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(orderColumns)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as unknown as OrderRow[]).map(toOrder)
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(orderColumns)
    .eq('id', id)
    .maybeSingle()
  // An id that is not a UUID is simply "not found".
  if (error?.code === '22P02') return null
  if (error) throw error
  return data ? toOrder(data as unknown as OrderRow) : null
}
