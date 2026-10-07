import { ChevronRight, PackageX, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/components/ui/styles'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { FREE_SHIPPING_FROM_CENTS, MAX_QUANTITY } from '@/features/cart/pricing'
import { useCart, useCartQuantity } from '@/features/cart/store'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { ImageGallery } from '../components/ImageGallery'
import { Price } from '../components/Price'
import { ProductGrid } from '../components/ProductGrid'
import { Rating } from '../components/Rating'
import { StockBadge } from '../components/StockBadge'
import { useProduct, useRelatedProducts } from '../hooks'
import type { Product } from '../types'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, error, isPending, refetch } = useProduct(slug)
  useDocumentTitle(product?.name)

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isPending) return <ProductSkeleton />
  if (!product) {
    return (
      <EmptyState
        icon={<PackageX className="size-6" />}
        title="Product not found"
        description="It may have been removed or the link is wrong."
        action={
          <Link to="/shop" className={buttonClass()}>
            Browse products
          </Link>
        }
      />
    )
  }
  // Remount when navigating between products so the quantity resets.
  return <ProductDetails key={product.id} product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const add = useCart((s) => s.add)
  const openDrawer = useCart((s) => s.openDrawer)
  const inCart = useCartQuantity(product.id)
  const available = Math.min(product.stock, MAX_QUANTITY) - inCart
  const [quantity, setQuantity] = useState(1)
  // Never offer more than what is left after the units already in the cart.
  const qty = Math.min(quantity, Math.max(1, available))
  const { data: related = [] } = useRelatedProducts(product)

  const addToCart = () => {
    add(product, qty)
    setQuantity(1)
    toast.success(`${product.name} added to cart`, {
      action: { label: 'View cart', onClick: openDrawer },
    })
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-zinc-500">
          <Link to="/shop" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="size-4" aria-hidden />
              <Link
                to={`/shop?category=${product.category.slug}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <ImageGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-5">
            {product.brand && (
              <p className="text-sm uppercase tracking-wide text-zinc-500">{product.brand}</p>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <Rating value={product.rating} />
              <StockBadge stock={product.stock} />
            </div>
            <Price
              priceCents={product.priceCents}
              compareAtCents={product.compareAtCents}
              size="lg"
            />
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>

            {product.stock > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <QuantityStepper
                  label="Quantity"
                  value={qty}
                  max={Math.max(1, available)}
                  onChange={setQuantity}
                />
                <Button size="lg" className="flex-1" disabled={available <= 0} onClick={addToCart}>
                  {available <= 0 ? 'Max quantity in cart' : 'Add to cart'}
                </Button>
              </div>
            )}
            {inCart > 0 && (
              <p className="text-sm text-zinc-500">
                {inCart} in your cart ·{' '}
                <button type="button" className="text-brand-600 underline" onClick={openDrawer}>
                  View cart
                </button>
              </p>
            )}

            <ul className="mt-2 grid gap-3 border-t border-zinc-200 pt-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <li className="flex items-center gap-3">
                <Truck className="size-5 text-brand-600" aria-hidden />
                Free shipping on orders over {formatPrice(FREE_SHIPPING_FROM_CENTS)}
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw className="size-5 text-brand-600" aria-hidden />
                30-day returns
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-brand-600" aria-hidden />
                Demo checkout: no real charges
              </li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2" role="status" aria-label="Loading product">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
