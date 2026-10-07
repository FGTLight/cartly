import { LayoutDashboard, Package, Receipt } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

import { RequireAdmin } from '@/features/auth/components/guards'
import { cn } from '@/lib/cn'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
]

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <div className="flex flex-col gap-6">
        <nav
          aria-label="Admin"
          className="-mx-4 flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 dark:border-zinc-800"
        >
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium',
                  isActive
                    ? 'border-brand-600 text-brand-700 dark:text-brand-500'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </RequireAdmin>
  )
}
