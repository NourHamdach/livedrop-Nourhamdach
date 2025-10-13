import React from 'react'
import { Product } from '../../types'

type Props = {
  products: Product[]
  children?: React.ReactNode
}

export default function CatalogTemplate({ products, children }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  )
}
