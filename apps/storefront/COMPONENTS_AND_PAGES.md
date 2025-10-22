Storefront components and pages (updated)

Last updated: 2025-10-22

Notes: The `SupportPanel` organism integrates with the backend assistant via `POST /api/assistant`. The assistant returns structured responses including `intent`, `text`, `functionsCalled`, and optional `citations` used to render policy snippets.

Last updated: 2025-10-22

Changelog:
- 2025-10-22: Added last-updated header and clarified SupportPanel behavior for assistant integration.

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
  - Input is a controlled `Input` atom and sends messages via the `askSupport` helper which returns `{ answer, qid }`.
  - Displays bot answers and attaches a `qid` when returned; shows an empty-state prompt when there are no messages.
- Notes: Uses `Button` and `Input` atoms; navigates back with the header button.

---

## Pages (routes)

### `Support` — `src/pages/Support.tsx`
- Route: `/support` (expected)
- Purpose: Full-page support chat with a scrolling history and message composer.
- Behavior:
  - Uses local state for messages and `fetch` to call the backend assistant at `POST ${VITE_BACKEND_URL || http://localhost:3001}/api/assistant`.
  - Sends `{ input, context: { customerId } }` where `customerId` is read from `localStorage`.
  - Renders messages similarly to `SupportPanel` (user aligned right, bot left). Bot message text is taken from `data.text` returned by the assistant.
  - Gracefully handles network errors and shows a friendly failure message from the bot.
  - Auto-scrolls when new messages are added and supports sending on Enter (no shift).

Notes: The repo contains both an embedded organism (`SupportPanel`) suitable for composition inside other pages and a full-page `Support` route that directly calls the backend API. Keep these two components in sync regarding message UIs and behavior.

---

## Templates

### `CatalogTemplate` — `components/templates/CatalogTemplate.tsx`
- Purpose: Simple page container used by the catalog page to center content and provide consistent padding.
- Props: `products: Product[]` and `children?: React.ReactNode`.

---

## Pages

Below are the top-level pages under `apps/storefront/src/pages` and their current behavior.

### `Catalog` — `src/pages/catalog.tsx`
- Route: `/`
- Purpose: Product listing and discovery UI.
- Behavior:
  - Loads products via `listProducts()` and maintains local loading/error states.
  - Provides free-text search (tokenized), tag filters (collected from product tags), and price sort (`asc` | `desc`).
  - Shows explicit empty and error states with retry actions.
  - Renders product grid using `ProductCard` inside `CatalogTemplate`.

### `Product` — `src/pages/product.tsx`
- Route: `/p/:id`
- Purpose: Product detail page.
- Behavior:
  - Fetches the product via `getProduct(id)` and falls back to `/404` when not found.
  - Renders image, price (`Price` atom), description (uses `fallbackDescription` when empty), stock badge, and an Add to Cart CTA.
  - Adds to cart via `useStore.add` and navigates to `/cart`.
  - Loads related products by tag using `listProducts()`.

### `Cart` — `src/pages/cart.tsx`
- Route: `/cart`
- Purpose: View and manage current cart contents.
- Behavior:
  - Reads cart items from `useStore` and renders `CartLineItem` for each.
  - Provides actions to change quantity, remove items, clear cart, and shows cart total.
  - Empty state links back to catalog.

### `Checkout` — `src/pages/checkout.tsx`
- Route: `/checkout`
- Purpose: Demo checkout flow (no real payments).
- Behavior:
  - Requires the user to be signed in (checks `localStorage.customerId`), otherwise navigates to `/login`.
  - Generates/persists an idempotency key and calls `placeOrder(customerId, items, key)`.
  - On success clears the cart and navigates to `/order/{orderId}`.
  - Shows processing and retry UI; surfaces server error messages when present.

### `Order` — `src/pages/order.tsx`
- Route: `/order/:id`
- Purpose: Show a single order's details and live tracking.
- Behavior:
  - Loads the order with `getOrder(id, customerId)` (customerId from localStorage) and handles missing customer or order with friendly errors.
  - Renders order summary, itemized totals and delivery info (carrier, ETA).
  - Embeds `OrderTracking` for SSE-based live status updates.

### `Orders` — `src/pages/orders.tsx`
- Route: `/orders`
- Purpose: List all orders for the signed-in customer.
- Behavior:
  - Loads orders via `getOrdersByCustomer(customerId)` and redirects to `/login` when `customerId` is missing.
  - Displays summarized cards linking to individual order pages; empty state points back to catalog.

### `OrderTracking` — `src/pages/OrderTracking.tsx`
- Component (used by `Order` page)
- Purpose: SSE-based live order status UI.
- Behavior:
  - Subscribes to `/api/orders/:id/stream` via a `subscribeToOrderStream` helper.
  - Updates status badges (PENDING → PROCESSING → SHIPPED → DELIVERED), handles reconnection attempts and shows an error banner if SSE fails.

### `Support` — `src/pages/Support.tsx`
- Route: `/support` (site-level support page)
- Purpose: Full-page support chat interface that talks to the backend assistant.
- Behavior:
  - Uses `fetch` to POST `{ input, context: { customerId } }` to `${VITE_BACKEND_URL || 'http://localhost:3001'}/api/assistant`.
  - Appends user and bot messages into local state, auto-scrolls, and supports sending on Enter.
  - Shows friendly network error messages and graceful fallback text when the assistant is unavailable.

### `UserLogin` — `src/pages/UserLogin.tsx`
- Route: `/login`
- Purpose: Lightweight email-based sign-in.
- Behavior:
  - Calls `signInByEmail(email)` which returns a customer and then redirects to home. Basic loading and error states are supported.

### `AdminDashboard` — `src/pages/AdminDashboard.tsx`
- Route: `/admin` (assumed)
- Purpose: Admin monitoring and analytics dashboard.
- Behavior:
  - Fetches dashboard data (`fetchDashboardBusiness`, `fetchDailyRevenue`, `fetchDashboardPerformance`, `fetchAssistantStats`) and polls every 30s.
  - Renders multiple metric cards, charts (using `recharts`), assistant analytics, and system health (reads `/api/health`).
  - Shows critical alert banner when backend reports errors.

---

## Helpers and libs referenced
- `lib/api.ts` — network helpers (listProducts, getProduct, placeOrder, getOrderStatus).
- `lib/store.ts` — application cart store (used via `useStore`).
- `lib/format.ts` — formatting helpers (e.g. `formatCurrency`).
- `assistant/engine.ts` — support assistant logic used by `SupportPanel`.
- `types.ts` — shared types (pages/components import `Product` and other types from `../types` or `../../types`).



