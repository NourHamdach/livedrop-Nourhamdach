import React from 'react'
import { formatCurrency } from '../../lib/format'

type Props = {
  value: number
  size?: 'sm' | 'md' | 'lg'
  muted?: boolean
  className?: string
}

export default function Price({
  value,
  size = 'md',
  muted = false,
  className = '',
}: Props) {
  const sizeClass =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-2xl md:text-3xl'
      : 'text-base'

  const colorClass = muted ? 'text-gray-500' : 'text-gray-800'

  return (
    <span
      className={`font-semibold tracking-tight ${sizeClass} ${colorClass} ${className}`}
    >
      {formatCurrency(value)}
    </span>
  )
}
