// apps/storefront/src/types.ts

/** Product information used across the storefront */
export type Product = {
    id: string
  title: string
  price: number
  image: string
  tags: string[]
  stockQty: number
  description?: string
}

/** Order status tracking information */
export type OrderInfo = {
  id: string
  status: 'Placed' | 'Packed' | 'Shipped' | 'Delivered'
  carrier?: string
  eta?: string
}

/** A single line inside an order or the shopping cart */
export type CartItem = {
  id: string
  title: string
  price: number
  qty: number
  image?: string
}

/** Stored order record saved in localStorage */
export type StoredOrder = {
  id: string
  items: CartItem[]
  total: number
  date: string
}

/** Generic FAQ or support question–answer pair */
export type QA = {
  qid: string
  question: string
  answer: string
}
