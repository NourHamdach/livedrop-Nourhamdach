// ==============================
// Product Types & Cache
// ==============================

export type Product = {
  id: string
  title: string
  price: number
  image: string
  tags: string[]
  stockQty: number
  description?: string
}

let productsCache: Product[] | null = null

// ==============================
// Product Listing & Fetching
// ==============================
export async function listProducts(): Promise<Product[]> {
  if (productsCache) return productsCache

  try {
    const res = await fetch('/mock-catalog.json')
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`)
    }

    const data = (await res.json()) as Product[]

    // Validate and normalize data
    productsCache = data.map((p) => ({
      ...p,
      description:
        p.description?.trim() ||
        'This thoughtfully designed product combines simplicity, functionality, and premium quality for everyday use.',
      tags: Array.isArray(p.tags) ? p.tags : [],
    }))

    return productsCache
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Unable to load products. Please try again later.')
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const list = await listProducts()
    const product = list.find((p) => p.id === id)
    return product ?? null
  } catch (error) {
    console.error(`Error fetching product with id "${id}":`, error)
    return null
  }
}

// ==============================
// Order Handling
// ==============================
export type OrderInfo = {
  id: string
  status: 'Placed' | 'Packed' | 'Shipped' | 'Delivered'
  carrier?: string
  eta?: string
}

const orders: Record<string, OrderInfo> = {}

// ==============================
// Internal: Stock Update Logic
// ==============================
function updateStock(cart: { id: string; qty: number }[]): void {
  if (!productsCache) return

  for (const item of cart) {
    const product = productsCache.find((p) => p.id === item.id)
    if (product) {
      product.stockQty = Math.max(product.stockQty - item.qty, 0)
    }
  }
}

// ==============================
// Place Order
// ==============================
export async function placeOrder(
  cart: { id: string; qty: number }[]
): Promise<{ orderId: string }> {
  const products = await listProducts()

  // Validate stock
  for (const item of cart) {
    const product = products.find((p) => p.id === item.id)
    if (!product) throw new Error(`Product with ID "${item.id}" not found.`)
    if (product.stockQty < item.qty)
      throw new Error(`Not enough stock for "${product.title}".`)
  }

  updateStock(cart)

  // Create order with unique ID
  const orderId = Math.random().toString(36).substring(2, 12).toUpperCase()
  orders[orderId] = { id: orderId, status: 'Placed' }

  // Persist in localStorage immediately
  const existing = JSON.parse(localStorage.getItem('orders') || '[]')
  existing.push({
    id: orderId,
    items: cart,
    date: new Date().toISOString(),
  })
  localStorage.setItem('orders', JSON.stringify(existing))

  // Simulated live status progression
  setTimeout(() => (orders[orderId].status = 'Packed'), 3000)
  setTimeout(() => {
    orders[orderId].status = 'Shipped'
    orders[orderId].carrier = 'FastShip'
    orders[orderId].eta = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toLocaleDateString()
  }, 7000)
  setTimeout(() => (orders[orderId].status = 'Delivered'), 15000)

  return { orderId }
}

/**
 * Get order status by ID — uses in-memory record first, then localStorage fallback.
 */
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
  let status: OrderInfo['status'] = 'Placed'
  let carrier: string | undefined
  let eta: string | undefined

  if (elapsed > 10000 && elapsed <= 20000) status = 'Packed'
  else if (elapsed > 20000 && elapsed <= 30000) {
    status = 'Shipped'
    carrier = 'FastShip'
    eta = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
  } else if (elapsed > 30000) {
    status = 'Delivered'
    carrier = 'FastShip'
    eta = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }

  return { id, status, carrier, eta }
}
