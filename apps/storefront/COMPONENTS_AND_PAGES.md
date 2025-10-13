Storefront components and pages (updated)

This document summarizes the React components and pages currently present in `apps/storefront/src` after your recent edits. It is based on the live component and page sources in the repository.

Top-level structure
- `components/atoms/` — smallest UI primitives
- `components/molecules/` — composed UI widgets
- `components/organisms/` — larger UI sections
- `components/templates/` — page-level layout wrappers
- `pages/` — top-level route components

---

## Atoms

### `Button` — `components/atoms/Button.tsx`
- Purpose: Reusable button component with variants and sizes.
- Props:
  - Accepts all standard HTML button attributes (via React.ButtonHTMLAttributes).
  - `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'` (default: `primary`).
  - `size?: 'sm' | 'md' | 'lg'` (default: `md`).
  - `className?: string` to extend styles.
- Notes: Tailwind classes for rounded, focus rings, hover/active scales and shadows.

### `Image` — `components/atoms/Image.tsx`
- Purpose: Image element wrapper that lazy-loads and performs basic Unsplash URL optimization.
- Props:
  - `src: string`
  - `alt: string`
  - `width?: number` (default 300)
  - `height?: number` (default 300)
  - `className?: string`
- Notes: Applies object-fit styles and explicit width/height attributes; adjusts unsplash `w=` query param when present.

### `Input` — `components/atoms/Input.tsx`
- Purpose: Controlled text input with optional label, hint, error text and leading icon.
- Props:
  - All normal input props (via React.InputHTMLAttributes).
  - `label?: string`, `hint?: string`, `error?: string`, `icon?: React.ReactNode`.
- Notes: ForwardRef-enabled; displays visual error state when `error` is set.

### `Price` — `components/atoms/Price.tsx`
- Purpose: Render formatted currency values using project formatter.
- Props:
  - `value: number` (required)
  - `size?: 'sm' | 'md' | 'lg'` (default `md`)
  - `muted?: boolean`
  - `className?: string`
- Notes: Calls `formatCurrency` from `lib/format` to produce currency string.

---

## Molecules

### `ProductCard` — `components/molecules/ProductCard.tsx`
- Purpose: Small product preview card for grids and lists.
- Props:
  - `id: string`, `title: string`, `price: number`, `image: string`, `stockQty?: number`.
- Behavior:
  - Full card links to `/p/{id}`.
  - Quick-add button calls the store `add` function (via `useStore`) and prevents navigation when clicked.
  - Displays stock badges (`Out` / `Low`) and a brief "Added" state when an item is quick-added.
- Notes: Uses `Image`, `Price` and `Button` atoms; responsive image container with hover effects.

### `QuantityControl` — `components/molecules/QuantityControl.tsx`
- Purpose: Small increment/decrement control for numeric quantities.
- Props: `value: number`, `onChange: (n: number) => void`.
- Notes: Buttons are `ghost` variant and allow value `0` (calling code may treat `0` as removal).

---

## Organisms

### `CartLineItem` — `components/organisms/CartLineItem.tsx`
- Purpose: Cart row showing product info, quantity controls, subtotal and removal.
- Props:
  - `item: { id, title, price, qty, image? }`
  - `onChangeQty(id, qty)`, `onRemove(id)` callbacks.
- Notes: Uses `QuantityControl` to modify quantity and `formatCurrency` for price display.

### `SupportPanel` — `components/organisms/SupportPanel.tsx`
- Purpose: Chat-like support UI that interacts with the assistant engine.
- Behavior:
  - Maintains local chat history with messages from `user` and `bot`.
  - Sends queries to `askSupport` (from `assistant/engine`) and renders answers.
  - Shows a typing indicator and focuses the input on mount.
- Notes: Uses `Button` and `Input` atoms; navigates back with the header button.

---

## Templates

### `CatalogTemplate` — `components/templates/CatalogTemplate.tsx`
- Purpose: Simple page container used by the catalog page to center content and provide consistent padding.
- Props: `products: Product[]` and `children?: React.ReactNode`.

---

## Pages (routes)

These are the top-level route components inside `src/pages`.

### `Catalog` — `pages/catalog.tsx`
- Route: `/` (catalog listing)
- Purpose: Product browsing UI with search, tag filters and sort controls.
- Behavior:
  - Loads products with `listProducts()` (from `lib/api`).
  - Supports free-text search, tag filters and price sort (`asc` / `desc`).
  - Renders a grid of `ProductCard` components inside `CatalogTemplate`.

### `Product` — `pages/product.tsx`
- Route: `/p/:id` (product detail)
- Purpose: Detailed product page with image, description, price and add-to-cart action.
- Behavior:
  - Fetches product using `getProduct(id)` and falls back to `/404` when missing.
  - Adds product to cart via `useStore.add` and navigates to `/cart`.
  - Loads related products by tag using `listProducts()`.
  - Uses a `fallbackDescription` if the product description is empty.

### `Cart` — `pages/cart.tsx`
- Route: `/cart`
- Purpose: View and manage cart contents.
- Behavior:
  - Reads cart state from `useStore` and displays items via `CartLineItem`.
  - Allows clearing the cart, removing items and adjusting quantities.
  - Shows the cart total.

### `Checkout` — `pages/checkout.tsx`
- Route: `/checkout`
- Purpose: Demo checkout flow (no payment integration).
- Behavior (current):
  - Calls `placeOrder(items)`  to create an order and store to local storage  and navigates to `/order/{orderId}` on success.
   .
  - Displays errors with a `Retry` action (uses a `Button`), shows `Placing Order…` while processing, and exposes a "View My Orders" link which navigates to `/orders` (note: ensure `/orders` route exists if you rely on it).

### `OrderStatus` — `pages/order-status.tsx`
- Route: `/order/:id`
- Purpose: Visual order progress timeline (Placed → Packed → Shipped → Delivered).
- Behavior:
  - Polls `getOrderStatus(id)` every 2 seconds and uses localStorage as fallback for a stored order.
  - Renders a progress bar showing the current step and shows carrier/ETA when status is Shipped or Delivered.
  - Renders a `Back to Home` action (uses `Button` atom).

---

## Helpers and libs referenced
- `lib/api.ts` — network helpers (listProducts, getProduct, placeOrder, getOrderStatus).
- `lib/store.ts` — application cart store (used via `useStore`).
- `lib/format.ts` — formatting helpers (e.g. `formatCurrency`).
- `assistant/engine.ts` — support assistant logic used by `SupportPanel`.
- `types.ts` — shared types (pages/components import `Product` and other types from `../types` or `../../types`).



