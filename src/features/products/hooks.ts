import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  fetchCategories,
  fetchProductBySlug,
  fetchProducts,
  fetchRelated,
} from './api'
import type { Product, ProductFilters } from './types'

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (slug: string) => ['products', 'detail', slug] as const,
  related: (id: string) => ['products', 'related', id] as const,
  categories: ['categories'] as const,
}

export const useCategories = () =>
  useQuery({
    queryKey: productKeys.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  })

export const useProducts = (filters: ProductFilters) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  })

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProductBySlug(slug),
  })

export const useRelatedProducts = (product: Product | null | undefined) =>
  useQuery({
    queryKey: productKeys.related(product?.id ?? ''),
    queryFn: () => fetchRelated(product!),
    enabled: Boolean(product),
  })
