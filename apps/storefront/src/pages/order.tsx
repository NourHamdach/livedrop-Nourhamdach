import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder } from "../lib/api";
import { formatCurrency } from "../lib/format";
import Button from "../components/atoms/Button";
import OrderTracking from "./OrderTracking";
import { Order } from "../types"; // ✅ use the shared backend-aligned type

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const customerId = localStorage.getItem("customerId");
        if (!id || !customerId) {
          setError("Missing order or customer information.");
          return;
        }

        const res = await getOrder(id, customerId);
        if (!res) {
          setError("Order not found.");
          return;
        }

        setOrder(res); // ✅ now correctly typed
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to fetch order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  // ⏳ Loading state
  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 animate-pulse">Loading order details…</p>
      </main>
    );
  }

  // ❌ Error or no data
  if (error || !order) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-600 mb-4">{error || "Order not found."}</p>
        <Button variant="secondary" onClick={() => navigate("/orders")}>
          Back to My Orders
        </Button>
      </main>
    );
  }

  // ✅ Render full order details
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-3xl font-display font-bold text-gray-800 mb-6">
        Order #{order._id}
      </h1>

      {/* 🔴 Live tracking with SSE */}
      <div className="mb-8">
        <OrderTracking orderId={order._id} />
      </div>

      {/* 📦 Order Summary */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Order Summary
        </h2>

        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center py-2"
            >
              <div className="text-sm text-gray-700">
                {item.name} × {item.quantity}
              </div>
              <div className="text-sm font-medium text-gray-800">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-right text-lg font-semibold text-gray-800">
          Total: {formatCurrency(order.total)}
        </div>
      </div>

      {/* 🚚 Delivery Info */}
      {(order.carrier || order.estimatedDelivery) && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-700 mb-6">
          {order.carrier && (
            <p>
              <span className="font-medium text-gray-600">Carrier:</span>{" "}
              {order.carrier}
            </p>
          )}
          {order.estimatedDelivery && (
            <p>
              <span className="font-medium text-gray-600">Estimated Delivery:</span>{" "}
              {new Date(order.estimatedDelivery).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* 🔙 Navigation */}
      <div className="text-center">
        <Button variant="secondary" onClick={() => navigate("/orders")}>
          ← Back to My Orders
        </Button>
      </div>
    </main>
  );
}
