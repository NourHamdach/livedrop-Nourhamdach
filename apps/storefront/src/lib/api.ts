// ==============================
// Product Types & Cache
// ==============================
//src/lib/api.ts
import { OrderInfo } from '../types'
import { Product } from '../types'

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
  const detailedItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.id)
    if (!product) throw new Error(`Product with ID "${item.id}" not found.`)
    if (product.stockQty < item.qty)
      throw new Error(`Not enough stock for "${product.title}".`)

    return {
      id: product.id,
      title: product.title,
      price: product.price,
      qty: item.qty,
    }
  })

  updateStock(cart)

  // Compute total price safely
  const total = detailedItems.reduce((sum, i) => sum + i.price * i.qty, 0)

  // Create unique order ID
  const orderId = Math.random().toString(36).substring(2, 12).toUpperCase()
  orders[orderId] = { id: orderId, status: "Placed" }

  // Build a validated order record
  const newOrder = {
    id: orderId,
    items: detailedItems,
    total,
    date: new Date().toISOString(),
  }

  // Save cleanly to localStorage
  const existing = JSON.parse(localStorage.getItem("orders") || "[]")
  if (!Array.isArray(existing)) {
    console.warn("Corrupted order data in localStorage — resetting.")
  }
  const safeOrders = Array.isArray(existing) ? existing : []
  safeOrders.push(newOrder)
  localStorage.setItem("orders", JSON.stringify(safeOrders))

  // Simulated live status updates
  setTimeout(() => (orders[orderId].status = "Packed"), 3000)
  setTimeout(() => {
    orders[orderId].status = "Shipped"
    orders[orderId].carrier = "FastShip"
    orders[orderId].eta = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toLocaleDateString()
  }, 7000)
  setTimeout(() => (orders[orderId].status = "Delivered"), 15000)

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
