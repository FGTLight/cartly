import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { orderKeys } from '@/features/orders/hooks'
import type { OrderStatus } from '@/features/orders/types'
import { productKeys } from '@/features/products/hooks'
import { errorMessage } from '@/lib/errors'

import {
  deleteProduct,
  fetchAdminProduct,
  fetchAdminProducts,
  fetchAllOrders,
  fetchStats,
  type ProductInput,
  saveProduct,
  setProductActive,
  updateOrderStatus,
} from './api'

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  products: (search: string, page: number) => ['admin', 'products', search, page] as const,
  product: (id: string) => ['admin', 'product', id] as const,
  // Under `orders` so a new order or a status change refreshes every list.
  orders: (status: OrderStatus | null, page: number) =>
    ['orders', 'admin', status, page] as const,
}

export const useStats = () => useQuery({ queryKey: adminKeys.stats, queryFn: fetchStats })

export const useAdminProducts = (search: string, page: number) =>
  useQuery({
    queryKey: adminKeys.products(search, page),
    queryFn: () => fetchAdminProducts(search, page),
    placeholderData: keepPreviousData,
  })

export const useAdminProduct = (id: string | null) =>
  useQuery({
    queryKey: adminKeys.product(id ?? ''),
    queryFn: () => fetchAdminProduct(id!),
    enabled: Boolean(id),
  })

export const useAllOrders = (status: OrderStatus | null, page: number, pageSize?: number) =>
  useQuery({
    queryKey: [...adminKeys.orders(status, page), pageSize],
    queryFn: () => fetchAllOrders(status, page, pageSize),
    placeholderData: keepPreviousData,
  })

/** Everything that shows products or stats is stale after a change. */
function useInvalidateCatalog() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] })
    queryClient.invalidateQueries({ queryKey: productKeys.all })
  }
}

export function useSaveProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: ({ id, input }: { id: string | null; input: ProductInput }) =>
      saveProduct(id, input),
    onSuccess: invalidate,
  })
}

export function useToggleProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setProductActive(id, active),
    onSuccess: (_, { active }) => {
      invalidate()
      toast.success(active ? 'Product is visible in the store' : 'Product hidden from the store')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateCatalog()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate()
      toast.success('Product deleted')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats })
      toast.success('Order status updated')
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
