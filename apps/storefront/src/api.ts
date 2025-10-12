import { Product } from './types'

// Extend window with our global productsCache
declare global {
  interface Window {
    productsCache: {
      [key: string]: Product & { quantity: number }
    }
  }
}

/**
 * List all available products with current stock levels
 */
export async function listProducts(): Promise<Product[]> {
  try {
    // First try to get products from cache
    if (window.productsCache && Object.keys(window.productsCache).length > 0) {
      return Object.values(window.productsCache).map(product => ({
        ...product,
        stockQty: product.quantity // Use quantity from cache
      }))
    }
    
    // Fallback to mock data if cache is empty
    const response = await fetch('/mock-catalog.json')
    const products = await response.json()
    return products // Use mock data as is, it already has stockQty
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}