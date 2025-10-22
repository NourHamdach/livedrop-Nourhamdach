// src/lib/api.ts
// use built-in crypto.randomUUID() to avoid requiring the 'uuid' package
import { Product, Order,OrderInfo,DashboardBusiness,DashboardPerformance,DailyPoint,AssistantStats } from "../types";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";
let productsCache: Product[] | null = null;
export async function signInByEmail(email: string) {
  try {
    const normalized = email.trim().toLowerCase();

    // Try to find existing customer
    let res = await fetch(`${API_BASE}/customers?email=${encodeURIComponent(normalized)}`);

    if (res.status === 404) {
      // Not found → try to create a new one
      console.log("Customer not found, creating new one...");
      res = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, name: normalized.split("@")[0] }),
      });
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Sign-in failed (${res.status})`);
    }

    const customer = await res.json();

    // Store securely (lightweight demo)
    localStorage.setItem("customerId", customer._id);
    sessionStorage.setItem("customerEmail", customer.email);

    return customer;
  } catch (error) {
    console.error("Error signing in:", error);
    throw new Error("Unable to sign in. Please try again later.");
  }
}

export async function listProducts(): Promise<Product[]> {
   if (productsCache) return productsCache;

  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);

    // Backend returns { total, page, limit, results: [...] }
    const data = await res.json();

    // ✅ normalize backend fields to frontend Product type
    const items = data.results || data; // handle both paginated & flat responses
    productsCache = items.map((p: any) => ({
      id: p._id,
      title: p.name,
      description: p.description || "",
      price: p.price,
      category: p.category,
      tags: Array.isArray(p.tags) ? p.tags : [],
      image: p.imageUrl || "/placeholder.png", // ✅ Fix: map imageUrl → image
      stockQty: p.stock ?? 0,
    }));

    return productsCache ?? [];
   } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Unable to load products. Please try again later.");
  }}

    export async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch product: ${res.statusText}`);
    const p = await res.json();

    // ✅ normalize single product
    return {
      id: p._id,
      title: p.name,
      description: p.description || "",
      price: p.price,
      category: p.category,
      tags: Array.isArray(p.tags) ? p.tags : [],
      image: p.imageUrl || "/placeholder.png", // ✅ Fix here too
      stockQty: p.stock ?? 0,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// ==============================
// Place Order
// ==============================

export async function placeOrder(
  customerId: string,
  cart: { id: string; title: string; price: number; qty: number }[],
  idempotencyKey?: string
): Promise<{ orderId: string }> {
  if (!customerId) throw new Error("Missing customer ID");
  if (!Array.isArray(cart) || cart.length === 0)
    throw new Error("Cart is empty");

  const payload = {
    customerId,
    items: cart.map((item) => ({
      productId: item.id,
      name: item.title,
      price: item.price,
      quantity: item.qty,
    })),
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    carrier: "LebanonPost",
  };

  // use the provided key (stable per checkout)
  const key =
    idempotencyKey ||
    (globalThis.crypto?.randomUUID?.() ??
      Date.now().toString(36) + Math.random().toString(36).slice(2));

  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 409) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || "Insufficient stock for one or more items.");
  }
  if (res.status === 404) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || "Product or customer not found.");
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to place order: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return { orderId: data._id || data.orderId };
}


// ==============================
// Get Order Status
// ==============================
export async function getOrder(
  id: string,
  customerId: string
): Promise<Order | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/${id}?customerId=${customerId}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch order: ${res.statusText}`);
    }

    // ✅ Return the full backend order shape
    return (await res.json()) as Order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function getOrdersByCustomer(
  customerId: string
): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/orders?customerId=${customerId}`);
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch orders: ${res.statusText}`);
    }

    return await res.json(); // returns an array of orders
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return [];
  }
}


export function subscribeToOrderStream(
  orderId: string,
  onMessage: (data: { status: string }) => void,
  onError?: (error: any) => void
): () => void {
  if (!orderId) throw new Error("Order ID is required for SSE subscription");

  let eventSource: EventSource | null = null;
  let retryDelay = 2000;
  let stopReconnect = false;

  const connect = () => {
    if (stopReconnect) return; // Don't reconnect after delivery or cleanup

    try {
      eventSource = new EventSource(`${API_BASE}/orders/${orderId}/stream`, {
        withCredentials: false, // set true if auth/session cookies are used
      });

      eventSource.addEventListener("status", (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        onMessage(data);
        retryDelay = 2000; // reset delay after success

        // Stop reconnect loop if delivered
        if (data.status === "DELIVERED") {
          stopReconnect = true;
          eventSource?.close();
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.warn("SSE connection error:", event);
        if (onError) onError(event);
        eventSource?.close();

        if (!stopReconnect) {
          retryDelay = Math.min(retryDelay * 2, 30000); // exponential backoff
          setTimeout(connect, retryDelay);
        }
      });
    } catch (err) {
      console.error("SSE connect failed:", err);
      if (!stopReconnect) {
        retryDelay = Math.min(retryDelay * 2, 30000);
        setTimeout(connect, retryDelay);
      }
    }
  };

  connect();

  return () => {
    console.log("Closing order SSE stream");
    stopReconnect = true;
    eventSource?.close();
  };
}

const orders: Record<string, OrderInfo> = {}
export function getOrderStatus(id: string): OrderInfo | null {
  if (!id) return null

  // 1️⃣ Check in-memory live record first
  if (orders[id]) return orders[id]

  // 2️⃣ Then try to load from localStorage
  const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
  const found = savedOrders.find((o: any) => o.id === id)
  if (!found) return null

  // 3️⃣ Simulate timeline progression for stored orders
  const elapsed = Date.now() - new Date(found.date).getTime()
  let status: OrderInfo['status'] = 'PENDING'
  let carrier: string | undefined
  let eta: string | undefined

  if (elapsed > 10000 && elapsed <= 20000) status = 'PROCESSING'
  else if (elapsed > 20000 && elapsed <= 30000) {
    status = 'SHIPPED'
    carrier = 'FastShip'
    eta = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
  } else if (elapsed > 30000) {
    status = 'DELIVERED'
    carrier = 'FastShip'
    eta = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }

  return { id, status, carrier, eta }
}





export async function fetchDashboardBusiness(signal?: AbortSignal): Promise<DashboardBusiness> {
  const res = await fetch(`${API_BASE}/dashboard/business-metrics`, { signal });
  if (!res.ok) throw new Error(`business-metrics ${res.status}`);
  const data = await res.json();
  return {
    totalRevenue: data.totalRevenue ?? 0,
    totalOrders: data.totalOrders ?? 0,
    avgOrderValue: data.avgOrderValue ?? data.averageOrderValue ?? 0,
    ordersByStatus: data.ordersByStatus ?? {},
  };
}

export async function fetchDailyRevenue(params: { from?: string; to?: string }, signal?: AbortSignal): Promise<DailyPoint[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/analytics/daily-revenue?${qs}`, { signal });
  if (!res.ok) throw new Error(`daily-revenue ${res.status}`);
  return res.json();
}


export async function fetchDashboardPerformance(signal?: AbortSignal): Promise<DashboardPerformance> {
  const res = await fetch(`${API_BASE}/dashboard/performance`, { signal });
  if (!res.ok) throw new Error(`performance ${res.status}`);
  return res.json();
}


export async function fetchAssistantStats(signal?: AbortSignal): Promise<AssistantStats> {
  const res = await fetch(`${API_BASE}/dashboard/assistant-stats`, { signal });
  if (!res.ok) throw new Error(`assistant-stats ${res.status}`);
  return res.json();
}
