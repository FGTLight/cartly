import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { Product } from '@/features/products/types'

import { MAX_QUANTITY } from './pricing'

/** A snapshot of the product taken when it was added to the cart. */
export interface CartLine {
  productId: string
  slug: string
  name: string
  image: string | null
  priceCents: number
  /** Stock when added; the server re-checks it at checkout. */
  stock: number
  quantity: number
}

interface CartState {
  lines: CartLine[]
  drawerOpen: boolean
  add: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const limit = (quantity: number, stock: number) =>
  Math.max(1, Math.min(quantity, stock, MAX_QUANTITY))

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      add: (product, quantity = 1) =>
        set(({ lines }) => {
          const existing = lines.find((l) => l.productId === product.id)
          if (existing) {
            return {
              lines: lines.map((l) =>
                l === existing
                  ? {
                      ...l,
                      // Refresh the snapshot, the price may have changed.
                      priceCents: product.priceCents,
                      stock: product.stock,
                      quantity: limit(l.quantity + quantity, product.stock),
                    }
                  : l,
              ),
            }
          }
          return {
            lines: [
              ...lines,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0] ?? null,
                priceCents: product.priceCents,
                stock: product.stock,
                quantity: limit(quantity, product.stock),
              },
            ],
          }
        }),
      setQuantity: (productId, quantity) =>
        set(({ lines }) => ({
          lines: lines.map((l) =>
            l.productId === productId ? { ...l, quantity: limit(quantity, l.stock) } : l,
          ),
        })),
      remove: (productId) =>
        set(({ lines }) => ({ lines: lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: 'cartly-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // The drawer state is UI only.
      partialize: ({ lines }) => ({ lines }),
    },
  ),
)

/** Quantity already in the cart for one product (0 if none). */
export const useCartQuantity = (productId: string) =>
  useCart((s) => s.lines.find((l) => l.productId === productId)?.quantity ?? 0)
