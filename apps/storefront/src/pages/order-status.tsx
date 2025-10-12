import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderStatus } from '../lib/api'

type OrderStatusData = {
  status: 'Placed' | 'Packed' | 'Shipped' | 'Delivered'
  carrier?: string
  eta?: string
}

export default function OrderStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<OrderStatusData | null>(null)

  function isOrderStatusData(obj: any): obj is OrderStatusData {
    const validStatuses: OrderStatusData['status'][] = ['Placed', 'Packed', 'Shipped', 'Delivered']
    return (
      obj &&
      typeof obj === 'object' &&
      validStatuses.includes(obj.status) &&
      (obj.carrier === undefined || typeof obj.carrier === 'string') &&
      (obj.eta === undefined || typeof obj.eta === 'string')
    )
  }

  // 🧠 Load fallback from localStorage in case API fails or user is offline
  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const found = savedOrders.find((o: any) => o.id === id)
    if (found && !status) {
      setStatus({ status: 'Placed' }) // default initial state for stored orders
    }
  }, [id, status])

  // 🔄 Poll API for live updates
  useEffect(() => {
    let mounted = true
    const interval = setInterval(async () => {
      try {
        const s = await getOrderStatus(id || '')
        if (mounted && isOrderStatusData(s)) {
          setStatus(s)
        }
      } catch (err) {
        console.warn('Failed to fetch status, using local data.')
      }
    }, 2000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [id])

  // 🚨 If order not found anywhere
  if (!status)
    return (
      <main className="max-w-xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 text-lg">Order not found or invalid ID.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 text-white transition"
        >
          Back to Home
        </button>
      </main>
    )

  const steps = ['Placed', 'Packed', 'Shipped', 'Delivered']
  const currentStep = steps.indexOf(status.status)

  return (
    <main className="max-w-xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-3xl font-display font-bold text-gray-800 mb-6">
        Order #{id?.slice(-4)}
      </h1>

      {/* Progress timeline */}
      <div className="relative mb-8">
        <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute top-4 left-6 h-1 bg-primary-600 rounded-full transition-all duration-700"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        <div className="flex justify-between relative z-10">
          {steps.map((step, idx) => {
            const active = idx <= currentStep
            return (
              <div key={step} className="flex flex-col items-center w-1/4">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold shadow-md transition-transform duration-300 ${
                    active
                      ? 'bg-primary-600 text-white scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    active ? 'text-primary-700' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-gray-700">
        <p className="text-lg font-semibold">
          Current status:{' '}
          <span className="text-primary-700">{status.status}</span>
        </p>

        {(status.status === 'Shipped' || status.status === 'Delivered') && (
          <div className="mt-4 space-y-1 text-sm">
            <div>
              <span className="font-medium text-gray-600">Carrier:</span>{' '}
              {status.carrier}
            </div>
            <div>
              <span className="font-medium text-gray-600">ETA:</span>{' '}
              {status.eta}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-primary-700 hover:underline"
        >
          ← Back to Catalog
        </button>
      </div>
    </main>
  )
}
