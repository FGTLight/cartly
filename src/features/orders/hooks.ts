import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/context'
import { productKeys } from '@/features/products/hooks'

import { fetchMyOrders, fetchOrder, placeOrder } from './api'

export const orderKeys = {
  all: ['orders'] as const,
  mine: (userId: string | undefined) => ['orders', 'mine', userId] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

export function useMyOrders() {
  const { session } = useAuth()
  const userId = session?.user.id
  return useQuery({
    queryKey: orderKeys.mine(userId),
    queryFn: fetchMyOrders,
    enabled: Boolean(userId),
  })
}

export const useOrder = (id: string) =>
  useQuery({ queryKey: orderKeys.detail(id), queryFn: () => fetchOrder(id) })

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      // Stock changed and there is a new order.
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
