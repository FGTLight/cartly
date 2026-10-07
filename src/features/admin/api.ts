import { toOrder } from '@/features/orders/api'
import type { Order, OrderStatus } from '@/features/orders/types'
import { toProduct } from '@/features/products/api'
import { escapeLike } from '@/features/products/filters'
import type { Product } from '@/features/products/types'
import { supabase } from '@/lib/supabase'

export const ADMIN_PAGE_SIZE = 20

export interface AdminStats {
  revenueCents: number
  ordersCount: number
  customersCount: number
  lowStockCount: number
}

export async function fetchStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_stats').single()
  if (error) throw error
  const row = data as Record<string, number | string>
  return {
    // bigint columns may arrive as strings.
    revenueCents: Number(row.revenue_cents),
    ordersCount: Number(row.orders_count),
    customersCount: Number(row.customers_count),
    lowStockCount: Number(row.low_stock_count),
  }
}

const productColumns =
  'id, slug, name, description, brand, price_cents, compare_at_cents, ' +
  'images, stock, rating, active, category_id, category:categories(slug, name)'

export interface AdminProduct extends Product {
  categoryId: number | null
}

/** All products, including inactive ones (RLS lets admins see them). */
export async function fetchAdminProducts(
  search: string,
  page: number,
): Promise<{ items: AdminProduct[]; total: number }> {
  let query = supabase.from('products').select(productColumns, { count: 'exact' })
  if (search) query = query.ilike('name', `%${escapeLike(search)}%`)
  const from = (page - 1) * ADMIN_PAGE_SIZE
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id')
    .range(from, from + ADMIN_PAGE_SIZE - 1)
  if (error) throw error
  const rows = data as unknown as (Parameters<typeof toProduct>[0] & { category_id: number | null })[]
  return {
    items: rows.map((r) => ({ ...toProduct(r), categoryId: r.category_id })),
    total: count ?? 0,
  }
}

export async function fetchAdminProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select(productColumns)
    .eq('id', id)
    .maybeSingle()
  if (error?.code === '22P02') return null
  if (error) throw error
  if (!data) return null
  const row = data as unknown as Parameters<typeof toProduct>[0] & { category_id: number | null }
  return { ...toProduct(row), categoryId: row.category_id }
}

export interface ProductInput {
  name: string
  slug: string
  description: string
  brand: string | null
  categoryId: number | null
  priceCents: number
  compareAtCents: number | null
  stock: number
  images: string[]
  active: boolean
}

const toRow = (p: ProductInput) => ({
  name: p.name,
  slug: p.slug,
  description: p.description,
  brand: p.brand,
  category_id: p.categoryId,
  price_cents: p.priceCents,
  compare_at_cents: p.compareAtCents,
  stock: p.stock,
  images: p.images,
  active: p.active,
})

/** Inserts when `id` is null, otherwise updates. Returns the id. */
export async function saveProduct(id: string | null, input: ProductInput): Promise<string> {
  const query = id
    ? supabase.from('products').update(toRow(input)).eq('id', id).select('id').single()
    : supabase.from('products').insert(toRow(input)).select('id').single()
  const { data, error } = await query
  if (error?.code === '23505') throw new Error('Another product already uses this slug.')
  if (error) throw error
  return data.id as string
}

export async function setProductActive(id: string, active: boolean) {
  const { error } = await supabase.from('products').update({ active }).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string) {
  // Past orders keep their snapshot; order_items.product_id becomes null.
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

const MAX_IMAGE_BYTES = 3 * 1024 * 1024
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** Uploads to the `product-images` bucket and returns the public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type]
  if (!ext) throw new Error('Use a JPEG, PNG or WebP image.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be 3 MB or smaller.')
  const path = `${crypto.randomUUID()}.${ext}`
  const bucket = supabase.storage.from('product-images')
  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
  })
  if (error) throw error
  return bucket.getPublicUrl(path).data.publicUrl
}

const orderColumns =
  'id, user_id, status, subtotal_cents, shipping_cents, total_cents, shipping, ' +
  'payment_last4, created_at, order_items(id, product_id, product_name, product_image, ' +
  'unit_price_cents, quantity)'

/** Customer names, looked up separately (orders reference auth.users). */
async function withCustomerNames(orders: Order[]): Promise<Order[]> {
  const ids = [...new Set(orders.map((o) => o.userId))]
  if (ids.length === 0) return orders
  const { data, error } = await supabase.from('profiles').select('id, full_name').in('id', ids)
  if (error) throw error
  const names = new Map(data.map((p) => [p.id as string, p.full_name as string | null]))
  return orders.map((o) => ({ ...o, customerName: names.get(o.userId) ?? null }))
}

export async function fetchAllOrders(
  status: OrderStatus | null,
  page: number,
  pageSize = ADMIN_PAGE_SIZE,
): Promise<{ items: Order[]; total: number }> {
  let query = supabase.from('orders').select(orderColumns, { count: 'exact' })
  if (status) query = query.eq('status', status)
  const from = (page - 1) * pageSize
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)
  if (error) throw error
  const orders = (data as unknown as Parameters<typeof toOrder>[0][]).map(toOrder)
  return { items: await withCustomerNames(orders), total: count ?? 0 }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}
