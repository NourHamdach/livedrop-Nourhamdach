// apps/storefront/src/lib/router.tsx
import React, { Suspense } from 'react'
import { ShoppingCart, MessageSquare } from 'lucide-react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import { useStore } from './store'
import Button from '../components/atoms/Button'
import Image from '../components/atoms/Image'

// Lazy pages
const Catalog = React.lazy(() => import('../pages/catalog'))
const Product = React.lazy(() => import('../pages/product'))
const Cart = React.lazy(() => import('../pages/cart'))
const Checkout = React.lazy(() => import('../pages/checkout'))
const OrderStatus = React.lazy(() => import('../pages/order-status'))
const OrdersList = React.lazy(() => import('../pages/orders'))

const SupportPanel = React.lazy(() => import('../components/organisms/SupportPanel'))

function Layout() {
  const count = useStore((s) => s.items.reduce((a, b) => a + b.qty, 0))
  const nav = useNavigate()

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-gray-900 bg-gradient-to-b from-gray-50 via-white to-gray-100 overflow-visible">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition group"
          >
            <img
              src="/image.png"
              alt="Storefront logo"
              className="w-[160px] h-[160px] object-contain transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/fallback-logo.svg'
                target.alt = 'Fallback logo'
              }}
            />
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <div className="relative w-full max-w-sm">
              <input
                placeholder="Search products (e.g. 'hoodie')"
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md bg-white/90 text-sm"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
                />
              </svg>
            </div>
          </div>

          {/* Cart + Checkout + Support Buttons */}
          <nav className="flex flex-col items-center gap-3">
            {/* 🛒 Cart Button with count beside icon */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => nav('/cart')}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition"
            >
              <ShoppingCart className="w-7 h-6 text-gray-800" />
              {count > 0 && (
                <span className="text-sm font-semibold text-indigo-600">
                  {count}
                </span>
              )}
            </Button>

            {/* Checkout + Support Buttons */}
            <div className="flex flex-col gap-2 items-center">
              <Button
                variant="secondary"
                size="md"
                onClick={() => nav('/checkout')}
                className="w-28"
              >
                Checkout
              </Button>

              <Button
                onClick={() => nav('/support')}
                aria-label="Open support chat"
                className="w-28 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 rounded-lg shadow-md transition"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Support</span>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 animate-[fadeIn_0.5s_ease-in-out]">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="relative border-t bg-white/80 backdrop-blur-md mt-6">
        <div className="max-w-7xl mx-auto py-6 px-4 text-sm text-gray-500">
          <p>© 2025 Storefront Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex flex-col justify-center items-center h-screen text-gray-600">
            <Image
              src="/image.png"
              alt="Loading logo"
              width={48}
              height={48}
              className="animate-spin mb-4"
            />
            <span className="text-sm font-medium">
              Loading your experience…
            </span>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Catalog />} />
            <Route path="p/:id" element={<Product />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:id" element={<OrderStatus />} />
          </Route>
          <Route path="orders" element={<OrdersList />} />


          {/* ✅ Support Page Route */}
          <Route path="/support" element={<SupportPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
