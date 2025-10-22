import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrdersByCustomer } from "../lib/api";
import { formatCurrency } from "../lib/format";
import { OrderInfo } from "../types";

type Order = {
  _id: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  status: OrderInfo["status"];
  createdAt: string;
};

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const customerId = localStorage.getItem("customerId");
        if (!customerId) {
          console.warn("No customer ID found — redirecting to login.");
          navigate("/login");
          return;
        }

        const data = await getOrdersByCustomer(customerId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h1>
        <p className="text-gray-500 animate-pulse">Loading your orders...</p>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 text-center animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h1>
        <p className="text-gray-500 mb-6">You have no past orders yet.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
        >
          Back to Catalog
        </button>
      </main>
    );
  }

  const getStatusClasses = (status: OrderInfo["status"]) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700";
      case "PENDING":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            to={`/order/${order._id}`}
            key={order._id}
            className="block border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition p-5"
          >
            <div className="flex justify-between items-start">
              {/* Left side */}
              <div>
                <p className="font-semibold text-gray-800">
                  Order #{order._id.slice(-6).toUpperCase()}
                </p>
                <p
                  className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${getStatusClasses(
                    order.status
                  )}`}
                >
                  {formatStatusLabel(order.status)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Right side */}
              <div className="text-right text-sm text-gray-600">
                <p className="font-semibold text-gray-800">
                  {formatCurrency(order.total)}
                </p>
                <p className="text-xs mt-1">
                  {order.items?.length || 0} item
                  {order.items?.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-indigo-700 hover:underline"
        >
          ← Back to Catalog
        </button>
      </div>
    </main>
  );
}
