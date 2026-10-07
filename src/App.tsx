import { lazy } from 'react'
import { Route, Routes } from 'react-router'

import { AppLayout } from '@/components/layout/AppLayout'
import NotFoundPage from '@/components/layout/NotFoundPage'
import { RequireAuth } from '@/features/auth/components/guards'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import CartPage from '@/features/cart/pages/CartPage'
import CatalogPage from '@/features/products/pages/CatalogPage'
import HomePage from '@/features/products/pages/HomePage'
import ProductPage from '@/features/products/pages/ProductPage'

// Checkout, account and admin pages are split into their own chunks.
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'))
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'))
const AdminLayout = lazy(() => import('@/features/admin/pages/AdminLayout'))
const DashboardPage = lazy(() => import('@/features/admin/pages/DashboardPage'))
const AdminProductsPage = lazy(() => import('@/features/admin/pages/AdminProductsPage'))
const ProductFormPage = lazy(() => import('@/features/admin/pages/ProductFormPage'))
const AdminOrdersPage = lazy(() => import('@/features/admin/pages/AdminOrdersPage'))
const AdminOrderPage = lazy(() => import('@/features/admin/pages/AdminOrderPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<CatalogPage />} />
        <Route path="products/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireAuth>
              <OrderDetailPage />
            </RequireAuth>
          }
        />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
