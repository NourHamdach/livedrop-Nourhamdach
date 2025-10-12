import React from 'react'
import QuantityControl from '../molecules/QuantityControl'
import Button from '../atoms/Button'
import { formatCurrency } from '../../lib/format'

type Props = {
  item: {
    id: string
    title: string
    price: number
    qty: number
    image?: string
  }
  onChangeQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
}

export default function CartLineItem({ item, onChangeQty, onRemove }: Props) {
  const subtotal = item.price * item.qty

  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-gray-200 last:border-0 animate-fadeIn">
      {/* Product info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {item.image && (
          <div className="w-20 h-20 flex-shrink-0 relative overflow-hidden rounded-lg bg-gray-50">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        <div className="truncate">
          <div className="font-medium text-gray-900 truncate">
            {item.title}
          </div>
          <div className="text-sm text-gray-500">
            {formatCurrency(item.price)}
          </div>
        </div>
      </div>

      {/* Quantity and subtotal */}
      <div className="flex items-center gap-6">
        <QuantityControl
          value={item.qty}
          onChange={(n) => {
            if (n === 0) onRemove(item.id) // remove item entirely if qty = 0
            else onChangeQty(item.id, n)
          }}
        />

        <div className="text-sm font-semibold text-gray-800 min-w-[80px] text-right">
          {formatCurrency(subtotal)}
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-sm px-3 py-1"
        >
          Remove
        </Button>
      </div>
    </div>
  )
}
