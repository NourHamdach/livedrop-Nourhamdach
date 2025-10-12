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
type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Delivered'

interface OrderInfo {
  status: OrderStatus
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
    if (!product) {
      throw new Error(`Product with ID "${item.id}" not found.`)
    }
    if (product.stockQty < item.qty) {
      throw new Error(`Not enough stock for "${product.title}".`)
    }
  }

  updateStock(cart)

  // Create order with unique ID
  const orderId = Math.random().toString(36).substring(2, 12).toUpperCase()
  orders[orderId] = { status: 'Placed' }

  // Simulated status progression
  setTimeout(() => (orders[orderId].status = 'Packed'), 1000)
  setTimeout(() => {
    orders[orderId].status = 'Shipped'
    orders[orderId].carrier = 'FastShip'
    orders[orderId].eta = '2025-10-20'
  }, 2000)
  setTimeout(() => (orders[orderId].status = 'Delivered'), 8000)

  return { orderId }
}

// ==============================
// Get Order Status
// ==============================
export function getOrderStatus(id: string): OrderInfo | null {
  return orders[id] ?? null
}
