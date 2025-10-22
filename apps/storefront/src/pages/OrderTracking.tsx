import React, { useEffect, useState } from "react";
import { subscribeToOrderStream } from "../lib/api";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";

interface OrderTrackingProps {
  orderId: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!orderId || !/^[a-f\d]{24}$/i.test(orderId)) {
      setError("Invalid order reference.");
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let active = true;

    try {
      unsubscribe = subscribeToOrderStream(
        orderId,
        (data) => {
          if (!active || !data?.status) return;

          const newStatus = data.status as OrderStatus;
          setStatus(newStatus);
          setIsConnected(true);
          setError(null);

          // Stop reconnection attempts once delivered
          if (newStatus === "DELIVERED" && unsubscribe) {
            console.log("Order delivered — closing SSE connection.");
            unsubscribe();
            setIsConnected(false);
          }
        },
        (err) => {
          if (!active) return;
          console.warn("SSE connection lost:", err);
          setIsConnected(false);
          setError("Lost connection to live updates. Retrying...");
        }
      );
    } catch (err) {
      console.error("Error connecting to SSE:", err);
      setError("Unable to connect to live updates.");
      setIsConnected(false);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [orderId]);

  if (error) {
    return (
      <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-gray-500 text-center py-3 animate-pulse">
        Loading order status…
      </div>
    );
  }

  const getStatusClass = (s: OrderStatus) => {
    switch (s) {
      case "DELIVERED":
        return "bg-green-200 text-green-800";
      case "SHIPPED":
        return "bg-blue-200 text-blue-800";
      case "PROCESSING":
        return "bg-amber-200 text-amber-800";
      case "PENDING":
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
      <span
        className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${getStatusClass(
          status
        )}`}
      >
        {status}
      </span>
      {!isConnected && status !== "DELIVERED" && (
        <p className="text-xs text-gray-400 italic mt-1">
          Attempting to reconnect…
        </p>
      )}
    </div>
  );
}
