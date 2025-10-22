//storefront/src/types.ts
/** Product information used across the storefront */
export type Product = {
  id: string;
  title: string; // corresponds to backend 'name'
  description?: string;
  price: number;
  category?: string;
  tags: string[];
  image: string; // corresponds to backend 'imageUrl'
  stockQty: number; // corresponds to backend 'stock'
};

/** A single item within an order (from backend Order.items[]) */
export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

/** Full order record returned from backend */
export type Order = {
  _id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  carrier?: string;
  estimatedDelivery?: string; // Date in ISO format (converted to string)
  createdAt: string;
  updatedAt?: string;
};

/** Lightweight order info used for polling or tracking */
export type OrderInfo = {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  carrier?: string;
  eta?: string;
};

/** A single line inside the shopping cart */
export type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
};

/** Stored order record saved locally (simplified version of backend order) */
export type StoredOrder = {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
};

/** Generic FAQ or support question–answer pair */
export type QA = {
  qid: string;
  question: string;
  answer: string;
};

// ---------- Types ----------

export type DashboardBusiness = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number; // renamed from averageOrderValue to match backend
  ordersByStatus: Record<"PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED", number>;
};

export type DailyPoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

/** Matches /api/dashboard/performance */
export type DashboardPerformance = {
  apiLatencyMsP50: number;
  apiLatencyMsP95: number;
  sseActiveConnections: number;
  sampleSize?: number;
  lastUpdated?: string;
  failedRequestsCount24h?: number;
  failedRoutes?: Record<string, number>;
  hasCriticalErrors?: boolean;
};

/** Matches /api/dashboard/assistant-stats */
export type AssistantStats = {
  totalQueries: number;
  avgResponseMsP50: number;
  avgResponseMsP95: number;
  intentDistribution: Record<
    "policy_question" | "order_status" | "product_search" | "complaint" | "chitchat" | "off_topic" | "violation",
    number
  >;
  functionCalls: Record<"getOrderStatus" | "searchProducts" | "getCustomerOrders", number>;
};
