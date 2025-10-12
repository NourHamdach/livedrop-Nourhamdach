import React from 'react'
import Button from '../atoms/Button'

type Props = {
  value: number
  onChange: (n: number) => void
}

export default function QuantityControl({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(Math.max(0, value - 1))} // allow 0
        className="w-8 h-8 rounded-full text-lg font-bold text-gray-700 hover:bg-gray-100"
        aria-label="Decrease quantity"
      >
        −
      </Button>

      <div className="min-w-[24px] text-center text-gray-800 font-medium select-none">
        {value}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full text-lg font-bold text-gray-700 hover:bg-gray-100"
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  )
}
