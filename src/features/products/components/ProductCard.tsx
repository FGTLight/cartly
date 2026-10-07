import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/feedback'
import { useCart, useCartQuantity } from '@/features/cart/store'
import { discountPercent } from '@/lib/money'

import type { Product } from '../types'
import { Price } from './Price'
import { ProductImage } from './ProductImage'
import { Rating } from './Rating'

export function ProductCard({ product, eager }: { product: Product; eager?: boolean }) {
  const add = useCart((s) => s.add)
  const inCart = useCartQuantity(product.id)
  const discount = discountPercent(product.priceCents, product.compareAtCents)
  const soldOut = product.stock === 0
  const maxedOut = inCart >= product.stock

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          eager={eager}
          className="aspect-square transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {discount > 0 && <Badge tone="brand">−{discount}%</Badge>}
          {soldOut && <Badge tone="danger">Sold out</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {product.brand ?? product.category?.name}
        </p>
        <h3 className="line-clamp-2 font-medium leading-snug">
          {/* The stretched link makes the whole card clickable. */}
          <Link
            to={`/products/${product.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price
            priceCents={product.priceCents}
            compareAtCents={product.compareAtCents}
            showDiscount={false}
          />
          <Button
            size="icon"
            variant="secondary"
            // Above the stretched link.
            className="relative z-10 shrink-0"
            disabled={soldOut || maxedOut}
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              add(product)
              toast.success(`${product.name} added to cart`)
            }}
          >
            <ShoppingCart className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  )
}
