export interface Category {
  id: number
  slug: string
  name: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  brand: string | null
  category: Pick<Category, 'slug' | 'name'> | null
  /** Price in cents. */
  priceCents: number
  /** Original price in cents when on sale. */
  compareAtCents: number | null
  images: string[]
  stock: number
  rating: number
  active: boolean
}

export const sortOptions = {
  newest: 'Newest',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  rating: 'Top rated',
} as const

export type SortOption = keyof typeof sortOptions

/** Everything that decides which products the catalog shows. */
export interface ProductFilters {
  search: string
  category: string | null
  /** Dollars (as typed by the user). */
  minPrice: number | null
  maxPrice: number | null
  sort: SortOption
  page: number
}

export interface ProductPage {
  items: Product[]
  total: number
}
