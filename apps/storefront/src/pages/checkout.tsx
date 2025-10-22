import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { placeOrder } from "../lib/api";
import { formatCurrency } from "../lib/format";
import Button from "../components/atoms/Button";

export default function Checkout() {
  const items = useStore((s) => s.items);
  const clear = useStore((s) => s.clear);
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function handlePlace() {
    if (items.length === 0) return;

    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      setError("You must sign in before placing an order.");
      return navigate("/login");
    }
       // If first click → generate a key
    const key =
      idempotencyKey ??
      (globalThis.crypto?.randomUUID?.() ??
        Date.now().toString(36) + Math.random().toString(36).slice(2));
    setIdempotencyKey(key);


    setError("");
    setIsProcessing(true);

    try {
     const res = await placeOrder(customerId, items, key);
      

      clear(); // empty cart after placing
      navigate(`/order/${res.orderId}`, { replace: true });
    } catch (e) {
      console.error("Order placement failed:", e);
      setError(e instanceof Error ? e.message : "Failed to place order");
      setIsProcessing(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 font-display">
        Checkout
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePlace}
            className="ml-4 text-primary-600 hover:underline"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Your cart is empty.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{it.title}</span>
                <span className="text-sm text-gray-500">
                  Qty: {it.qty} × {formatCurrency(it.price)}
                </span>
              </div>
              <div className="font-semibold text-gray-700">
                {formatCurrency(it.price * it.qty)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex flex-col items-end">
        {items.length > 0 && (
          <>
            <div className="text-lg font-semibold text-gray-800">
              Total: {formatCurrency(total)}
            </div>
            <button
              onClick={handlePlace}
              disabled={isProcessing}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50"
            >
              {isProcessing ? "Placing Order…" : "Place Order"}
            </button>
          </>
        )}

        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate("/orders")}
          className="mt-3 text-sm text-indigo-600 hover:underline"
        >
          View My Orders →
        </Button>

        <p className="text-xs text-gray-500 mt-2">
          * No payment required — this is a demo checkout.
        </p>
      </div>
    </main>
  );
}
