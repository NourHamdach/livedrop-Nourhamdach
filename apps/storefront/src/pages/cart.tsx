import React from 'react'
import { useStore } from '../lib/store'
import { formatCurrency } from '../lib/format'
import Button from '../components/atoms/Button'
import CartLineItem from '../components/organisms/CartLineItem'

export default function Cart() {
  const items = useStore((s) => s.items)
  const remove = useStore((s) => s.remove)
  const setQty = useStore((s) => s.setQty)
  const clear = useStore((s) => s.clear)

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Cart</h1>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p className="text-lg mb-2">Your cart is empty.</p>
          <a
            href="/"
            className="text-indigo-600 hover:underline font-medium"
          >
            Browse Products →
          </a>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onChangeQty={(id, qty) => setQty(id, qty)}
                onRemove={(id) => remove(id)}
              />
            ))}
          </div>

          {/* Cart Footer */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={clear}
              className="text-sm"
            >
              Clear Cart
            </Button>

            <div className="text-lg font-semibold text-gray-800">
              Total: {formatCurrency(total)}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
