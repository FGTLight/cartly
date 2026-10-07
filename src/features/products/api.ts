import { supabase } from '@/lib/supabase'

import { escapeLike, PAGE_SIZE } from './filters'
import type { Category, Product, ProductFilters, ProductPage } from './types'

/** Shape of a `products` row as selected below. */
interface ProductRow {
  id: string
  slug: string
  name: string
  description: string
  brand: string | null
  price_cents: number
  compare_at_cents: number | null
  images: string[]
  stock: number
  rating: number
  active: boolean
  category: { slug: string; name: string } | null
}

const productColumns =
  'id, slug, name, description, brand, price_cents, compare_at_cents, ' +
  'images, stock, rating, active, category:categories(slug, name)'

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    brand: row.brand,
    category: row.category,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents,
    images: row.images ?? [],
    stock: row.stock,
    rating: Number(row.rating),
    active: row.active,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name')
    .order('name')
  if (error) throw error
  return data
}

/** One page of the catalog. Filtering, sorting and paging run in Postgres. */
export async function fetchProducts(filters: ProductFilters): Promise<ProductPage> {
  // `!inner` lets us filter products by the joined category slug.
  const columns = filters.category
    ? productColumns.replace('categories(', 'categories!inner(')
    : productColumns
  let query = supabase.from('products').select(columns, { count: 'exact' })

  if (filters.category) query = query.eq('category.slug', filters.category)
  if (filters.search) query = query.ilike('name', `%${escapeLike(filters.search)}%`)
  if (filters.minPrice !== null) {
    query = query.gte('price_cents', Math.round(filters.minPrice * 100))
  }
  if (filters.maxPrice !== null) {
    query = query.lte('price_cents', Math.round(filters.maxPrice * 100))
  }

  query = {
    newest: () => query.order('created_at', { ascending: false }),
    price_asc: () => query.order('price_cents', { ascending: true }),
    price_desc: () => query.order('price_cents', { ascending: false }),
    rating: () => query.order('rating', { ascending: false }),
  }[filters.sort]()

  const from = (filters.page - 1) * PAGE_SIZE
  const { data, error, count } = await query
    // Stable order inside equal prices / ratings, so pages never overlap.
    .order('id')
    .range(from, from + PAGE_SIZE - 1)
  if (error) throw error
  return {
    items: (data as unknown as ProductRow[]).map(toProduct),
    total: count ?? 0,
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(productColumns)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data ? toProduct(data as unknown as ProductRow) : null
}

/** Products of the same category, for the "You may also like" row. */
export async function fetchRelated(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category) return []
  const { data, error } = await supabase
    .from('products')
    .select(productColumns.replace('categories(', 'categories!inner('))
    .eq('category.slug', product.category.slug)
    .neq('id', product.id)
    .order('rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as unknown as ProductRow[]).map(toProduct)
}
