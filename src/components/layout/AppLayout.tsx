import { Suspense, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'

import { Spinner } from '@/components/ui/feedback'
import { CartDrawer } from '@/features/cart/components/CartDrawer'

import { Header } from './Header'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

const YEAR = new Date().getFullYear()

function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {YEAR} Cartly · A demo store: no real payments or deliveries.
        </p>
        <nav aria-label="Footer" className="flex gap-5">
          <Link to="/shop" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Shop
          </Link>
          <Link to="/orders" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Orders
          </Link>
          <a
            href="https://github.com/FGTLight/cartly"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Source code
          </a>
        </nav>
      </div>
    </footer>
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
