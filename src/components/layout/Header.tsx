import { LayoutDashboard, LogOut, Package, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { toast } from 'sonner'

import { buttonClass } from '@/components/ui/styles'
import { signOut } from '@/features/auth/api'
import { useAuth } from '@/features/auth/context'
import { useCart } from '@/features/cart/store'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'

import { SearchBox } from './SearchBox'
import { ThemeToggle } from './ThemeToggle'

function CartButton() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  const openDrawer = useCart((s) => s.openDrawer)
  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      <ShoppingCart className="size-5" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

function AccountMenu() {
  const { session, profile } = useAuth()
  const { pathname } = useLocation()
  // The page the menu was opened on: navigating elsewhere closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenOn(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!session) {
    return (
      <Link to="/login" className={buttonClass('ghost', 'sm')}>
        <User className="size-4" aria-hidden />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    )
  }

  const item =
    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800'
  const name = profile?.fullName || session.user.email

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 hover:ring-2 hover:ring-brand-500/40 dark:bg-brand-700/30 dark:text-brand-100"
        aria-label="Account menu"
      >
        {(name ?? '?').charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-3 pt-1 pb-3 dark:border-zinc-800">
            <p className="truncate text-sm font-medium">{profile?.fullName ?? 'My account'}</p>
            <p className="truncate text-xs text-zinc-500">{session.user.email}</p>
          </div>
          <div className="flex flex-col pt-2">
            <Link to="/orders" className={item}>
              <Package className="size-4" aria-hidden />
              My orders
            </Link>
            {profile?.isAdmin && (
              <Link to="/admin" className={item}>
                <LayoutDashboard className="size-4" aria-hidden />
                Admin
              </Link>
            )}
            <button
              type="button"
              className={cn(item, 'text-red-600')}
              onClick={async () => {
                try {
                  await signOut()
                  toast.success('Signed out')
                } catch (error) {
                  toast.error(errorMessage(error))
                }
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { profile } = useAuth()
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors',
      isActive ? 'text-brand-600' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
    )

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="rounded-lg bg-brand-600 p-1.5 text-white">
            <ShoppingBag className="size-4" aria-hidden />
          </span>
          Cartly
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>
          <NavLink to="/orders" className={navClass}>
            Orders
          </NavLink>
          {profile?.isAdmin && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <SearchBox className="ml-auto hidden w-full max-w-xs sm:block" />
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <ThemeToggle />
          <CartButton />
          <AccountMenu />
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <SearchBox />
      </div>
    </header>
  )
}
