import {
  ArrowRight,
  Dumbbell,
  Glasses,
  Headphones,
  Lamp,
  Laptop,
  type LucideIcon,
  RotateCcw,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
} from 'lucide-react'
import { Link } from 'react-router'

import { buttonClass } from '@/components/ui/styles'
import { ErrorState } from '@/components/ui/feedback'
import { FREE_SHIPPING_FROM_CENTS } from '@/features/cart/pricing'
import { formatPrice } from '@/lib/money'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import { defaultFilters } from '../filters'
import { useCategories, useProducts } from '../hooks'
import type { SortOption } from '../types'

const categoryIcons: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  'mobile-accessories': Headphones,
  'mens-shirts': Shirt,
  'womens-dresses': Sparkles,
  sunglasses: Glasses,
  'sports-accessories': Dumbbell,
  'home-decoration': Lamp,
}

export default function HomePage() {
  useDocumentTitle(undefined)
  const { data: categories = [] } = useCategories()

  return (
    <div className="flex flex-col gap-16">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-700 px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="relative z-10 flex max-w-xl flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-100">
            New season, new gear
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Everything you need, one cart away.
          </h1>
          <p className="text-lg text-brand-50/90">
            Phones, laptops, fashion and more. Free shipping on orders over{' '}
            {formatPrice(FREE_SHIPPING_FROM_CENTS)}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className={buttonClass('secondary', 'lg', 'border-0')}>
              Shop now
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/shop?sort=price_asc"
              className={buttonClass('ghost', 'lg', 'text-white hover:bg-white/10 dark:text-white')}
            >
              <Tag className="size-4" aria-hidden />
              Best prices
            </Link>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 right-32 size-72 rounded-full bg-brand-500/40 blur-3xl"
        />
      </section>

      <ul className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Truck, title: 'Fast delivery', text: '2–4 business days' },
          { icon: RotateCcw, title: 'Easy returns', text: '30 days, no questions asked' },
          { icon: ShieldCheck, title: 'Secure checkout', text: 'Demo store, no real charges' },
        ].map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <Icon className="size-6 shrink-0 text-brand-600" aria-hidden />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-zinc-500">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      {categories.length > 0 && (
        <section className="flex flex-col gap-5" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-2xl font-bold tracking-tight">
            Shop by category
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => {
              const Icon = categoryIcons[c.slug] ?? Tag
              return (
                <li key={c.slug}>
                  <Link
                    to={`/shop?category=${c.slug}`}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 font-medium transition-colors hover:border-brand-500 hover:text-brand-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:text-brand-500"
                  >
                    <span className="rounded-xl bg-brand-50 p-2 text-brand-600 dark:bg-brand-700/20">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    {c.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <ProductRow title="Top rated" sort="rating" />
      <ProductRow title="New arrivals" sort="newest" />
    </div>
  )
}

function ProductRow({ title, sort }: { title: string; sort: SortOption }) {
  const { data, error, isPending, refetch } = useProducts({ ...defaultFilters, sort })
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link
          to={sort === 'newest' ? '/shop' : `/shop?sort=${sort}`}
          className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <ProductGrid products={data.items.slice(0, 8)} />
      )}
    </section>
  )
}
