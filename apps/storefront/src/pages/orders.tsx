import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getOrderStatus } from "../lib/api"
import { formatCurrency } from "../lib/format"
import { StoredOrder, OrderInfo } from "../types"

export default function OrdersList() {
  const [orders, setOrders] = useState<(StoredOrder & Partial<OrderInfo>)[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const saved: StoredOrder[] = JSON.parse(localStorage.getItem("orders") || "[]")

      // Enrich each stored order with live status info
      const enriched = saved.map((order) => {
        const statusInfo = getOrderStatus(order.id)
        return {
          ...order,
          status: statusInfo?.status ?? "Placed",
          carrier: statusInfo?.carrier,
          eta: statusInfo?.eta,
        }
      })

      setOrders(enriched.reverse()) // newest first
    } catch (err) {
      console.error("Failed to load orders:", err)
      setOrders([])
    }
  }, [])

  if (orders.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h1>
        <p className="text-gray-500 mb-6">You have no past orders yet.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg transition"
        >
          Back to Catalog
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((o) => (
          <Link
            to={`/order/${o.id}`}
            key={o.id}
            className="block border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">
                  Order #{o.id}
                </p>
                <p
                  className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${
                    o.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : o.status === "Shipped"
                      ? "bg-blue-100 text-blue-700"
                      : o.status === "Packed"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {o.status}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(o.date).toLocaleString()}
                </p>
              </div>

              <div className="text-right text-sm text-gray-500">
                <p className="font-semibold text-gray-700">
                  {formatCurrency(o.total)}
                </p>
                {o.carrier && (
                  <div>
                    <span className="font-medium text-gray-600">Carrier:</span>{" "}
                    {o.carrier}
                  </div>
                )}
                {o.eta && (
                  <div>
                    <span className="font-medium text-gray-600">ETA:</span>{" "}
                    {o.eta}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/checkout")}
          className="text-sm text-primary-700 hover:underline"
        >
          ← Back to Checkout
        </button>
      </div>
    </main>
  )
}
