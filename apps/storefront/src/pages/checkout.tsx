import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { placeOrder } from '../lib/api'
import { formatCurrency } from '../lib/format'

export default function Checkout() {
  const items = useStore((s) => s.items)
  const clear = useStore((s) => s.clear)
  const navigate = useNavigate()

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const [error, setError] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)

  // If cart is empty and not processing order, redirect to cart
  React.useEffect(() => {
  if (isProcessing) return // don't redirect mid-checkout

  if (items.length === 0) {
    try {
      // 🧠 Check if there are past orders in localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')

      if (savedOrders.length > 0) {
        // 🕓 Get the most recent order
        const lastOrder = savedOrders[savedOrders.length - 1]
        navigate(`/order/${lastOrder.id}`)
        return
      }
    } catch {
      // ignore JSON errors
    }

    // 🛒 No cart items & no past orders → go back to cart
    navigate('/cart')
  }
}, [items.length, isProcessing, navigate])

  async function handlePlace() {
  if (items.length === 0) return
  setError('')
  setIsProcessing(true)

  try {
    const res = await placeOrder(items)

    // 🧠 Create an order record
    const order = {
      id: res.orderId,
      items,
      total,
      date: new Date().toISOString(),
    }

    // 🗄️ Save to localStorage
    const existing = JSON.parse(localStorage.getItem('orders') || '[]')
    existing.push(order)
    localStorage.setItem('orders', JSON.stringify(existing))

    // ✅ Clear cart & redirect
    clear()
    navigate(`/order/${res.orderId}`, { replace: true })
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Failed to place order')
    setIsProcessing(false)
  }
}


  return (
    <main className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 font-display">
        Checkout
      </h1>

      {/* Error handling with retry guidance */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
          <button
            onClick={handlePlace}
            className="ml-4 text-primary-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cart Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Your cart is empty.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{it.title}</span>
                <span className="text-sm text-gray-500">
                  Qty: {it.qty} × {formatCurrency(it.price)}
                </span>
              </div>
              <div className="font-semibold text-gray-700">
                {formatCurrency(it.price * it.qty)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals + CTA */}
      {items.length > 0 && (
        <div className="mt-6 flex flex-col items-end">
          <div className="text-lg font-semibold text-gray-800">
            Total: {formatCurrency(total)}
          </div>

          <button
            onClick={handlePlace}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Place your order"
          >
            Place Order
          </button>

          <p className="text-xs text-gray-500 mt-2">
            * No payment required — this is a demo checkout.
          </p>
        </div>
      )}
    </main>
  )
}
