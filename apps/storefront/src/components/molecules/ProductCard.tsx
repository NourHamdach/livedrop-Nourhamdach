//storefront/src/components/molecules/ProductCard.tsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Image from '../atoms/Image'
import Price from '../atoms/Price'
import Button from '../atoms/Button'
import { useStore } from '../../lib/store'

type Props = {
  id: string
  title: string
  price: number
  image: string
  stockQty?: number
}

export default function ProductCard({ id, title, price, image, stockQty = 0 }: Props) {
  const add = useStore((s) => s.add)
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation() // prevent Link click
    e.preventDefault()  // prevent navigation
    if (stockQty <= 0) return
    add({ id, title, image, price, qty: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 w-full max-w-[160px]">
      <Link to={`/p/${id}`} className="block">
        <div className="relative">
          {/* Fixed-size image container */}
          <div className="w-[200px] h-[200px] mx-auto flex items-center justify-center bg-gray-50 relative overflow-hidden">
            <Image
              src={image}
              alt={title}
              className="object-contain w-[200px] h-[200px] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Stock status badges */}
          {stockQty <= 0 ? (
            <div className="absolute top-1 left-1 bg-white/90 text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow-sm">
              Out
            </div>
          ) : stockQty < 5 ? (
            <div className="absolute top-1 left-1 bg-amber-400/90 text-amber-900 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow-sm">
              Low
            </div>
          ) : null}

          {/* Add button */}
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300">
            <Button
              onClick={handleAdd}
              disabled={stockQty <= 0}
              className={`px-2 py-1 text-[10px] font-medium shadow-sm rounded text-white transition-transform duration-300 hover:scale-105 active:scale-95 ${
                added ? 'bg-green-500' : 'bg-primary'
              } disabled:bg-gray-400`}
            >
              {added ? '✓ Added' : 'Quick add'}
            </Button>
          </div>
        </div>

        {/* Title and price */}
        <div className="p-2">
          <h3 className="font-medium text-xs text-gray-900 truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="mt-0.5 flex items-center justify-between">
            <Price value={price} className="text-xs font-semibold text-gray-900" />
            {stockQty > 0 && <div className="text-[10px] text-gray-500">{stockQty}</div>}
          </div>
        </div>
      </Link>
    </article>
  )
}
