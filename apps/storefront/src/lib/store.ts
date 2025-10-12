import { create } from 'zustand'

/**
 * Represents a single cart item
 */
export type CartItem = {
  id: string
  title: string
  price: number
  qty: number
  image?: string  
}

/**
 * Global cart store type
 */
type State = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  getTotal: () => number
}

/**
 * Helper — safely loads cart items from localStorage
 */
const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Zustand store definition
 */
export const useStore = create<State>()((set, get) => ({
  items: loadCart(),

  add: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
          ),
        }
      }
      return { items: [...state.items, item] }
    }),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  setQty: (id, qty) =>
    set((state) => {
      // If quantity is 0 or less → remove the item
      if (qty <= 0) {
        return { items: state.items.filter((i) => i.id !== id) }
      }
      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, qty } : i
        ),
      }
    }),

  clear: () => {
    localStorage.removeItem('cart')
    set({ items: [] })
  },

  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}))

/**
 * Persist cart to localStorage whenever items change.
 * Handles both saving and clearing automatically.
 */
useStore.subscribe((state) => {
  try {
    if (state.items.length === 0) {
      localStorage.removeItem('cart')
    } else {
      localStorage.setItem('cart', JSON.stringify(state.items))
    }
  } catch {
    // Ignore storage write errors (e.g., Safari private mode)
  }
})
