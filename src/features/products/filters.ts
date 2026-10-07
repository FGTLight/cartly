import { type ProductFilters, type SortOption, sortOptions } from './types'

export const PAGE_SIZE = 12

export const defaultFilters: ProductFilters = {
  search: '',
  category: null,
  minPrice: null,
  maxPrice: null,
  sort: 'newest',
  page: 1,
}

function positiveNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Reads the filters from the URL, so catalog views can be shared and the
 * back button works. Invalid values fall back to the defaults.
 */
export function filtersFromParams(params: URLSearchParams): ProductFilters {
  const sort = params.get('sort')
  const page = Number(params.get('page'))
  return {
    search: params.get('q')?.trim() ?? '',
    category: params.get('category') || null,
    minPrice: positiveNumber(params.get('min')),
    maxPrice: positiveNumber(params.get('max')),
    sort: sort && sort in sortOptions ? (sort as SortOption) : 'newest',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Writes only non-default values, keeping URLs short. */
export function filtersToParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice !== null) params.set('min', String(filters.minPrice))
  if (filters.maxPrice !== null) params.set('max', String(filters.maxPrice))
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

/** Escapes `%` and `_` so a search for "50%" is not a wildcard. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`)
}

export const pageCount = (total: number) =>
  Math.max(1, Math.ceil(total / PAGE_SIZE))
