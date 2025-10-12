### 1. ProductCard
**Prompt Objective:**  
Request a modular, responsive product card component displaying product image, title, price, and stock information, with a quick-add capability integrated into the global cart store.

**Prompt Design Rationale:**  
Emphasize reusable structure and minimal cognitive load for users. Visual consistency and micro-interaction feedback were prioritized.

**Resulting Implementation:**  
`ProductCard.tsx`  
- TailwindCSS-based component with fixed 200×200 image container.  
- Dynamic stock badges: “Out”, “Low”, or hidden for available items.  
- Smooth hover and scale transitions.  
- Integrated Zustand store actions for adding and updating cart items.

---

### 2. Catalog
**Prompt Objective:**  
Scaffold a catalog page supporting responsive product grids, search, tag-based filtering, and sort functionality.

**Prompt Design Rationale:**  
Optimize for browsing efficiency and adaptability. Ensure grid responsiveness: 2 columns on mobile, 3 on larger screens. Maintain accessible input and dropdown controls.

**Resulting Implementation:**  
`Catalog.tsx`  
- Implements search and tag filtering using `useMemo`.  
- Includes compact sort dropdown with adaptive padding.  
- Grid layout: `grid-cols-2 sm:grid-cols-3`.  
- Dynamic rendering of `ProductCard` components with graceful spacing.

---

### 3. ProductPage
**Prompt Objective:**  
Develop a responsive product detail page displaying product image, description, pricing, and related items.

**Prompt Design Rationale:**  
Ensure clear information hierarchy and maintain visual continuity with `ProductCard`. Related products should reuse shared catalog logic.

**Resulting Implementation:**  
`ProductPage.tsx`  
- Responsive layout (`flex-col md:flex-row`).  
- Large preview image container with scaling on hover.  
- Integrated “Add to Cart” button with Zustand state update.  
- Related product section using grouped rendering of `ProductCard` instances.

---

### 4. Checkout
**Prompt Objective:**  
Implement a checkout flow displaying the cart summary, total computation, and order placement logic that persists order data locally.

**Prompt Design Rationale:**  
Mimic real-world checkout systems while maintaining local-first reliability.  
Include post-order redirection logic based on cart and stored order state.

**Resulting Implementation:**  
`Checkout.tsx`  
- Lists all cart items with subtotal and total.  
- Calls `placeOrder()` and stores order data in `localStorage`.  
- Clears the cart post-order completion.  
- Conditional navigation:
  - Empty cart → `/cart`  
  - Empty cart with stored order → `/order/:id`

---

### 5. OrderStatus
**Prompt Objective:**  
Generate an order status tracker reflecting state transitions (Placed → Packed → Shipped → Delivered) with periodic polling.

**Prompt Design Rationale:**  
Enable user-visible feedback for simulated logistics events. Support offline continuity via localStorage order retrieval.

**Resulting Implementation:**  
`OrderStatus.tsx`  
- Periodic polling of `getOrderStatus()`.  
- Timeline visualization with progress bar percentage based on current step.  
- Status persistence across reloads via localStorage fallback.  
- Displays carrier and ETA information when available.

---

### 6. SupportPanel
**Prompt Objective:**  
Scaffold a user-facing support chat interface accessible from the application header.

**Prompt Design Rationale:**  
Implement as a self-contained overlay with non-intrusive visual behavior. Ensure accessibility and usability consistency.

**Resulting Implementation:**  
`SupportPanel.tsx`  
- Floating chat overlay toggled by button.  
- Disabled background scrolling while active.  
- Includes message list, input field, and send button.  
- Styled with TailwindCSS and Lucide icons for clarity.

---

### 7. AppRouter
**Prompt Objective:**  
Establish centralized routing for all major application views using React Router with lazy-loaded components.

**Prompt Design Rationale:**  
Reduce bundle size through dynamic imports while maintaining consistent layout and global navigation.

**Resulting Implementation:**  
`AppRouter.tsx`  
- Uses `React.lazy` and `Suspense` for deferred page loading.  
- Defines routes for catalog, product, cart, checkout, order, and support.  
- Wraps content in a shared layout component with sticky header and footer.  
- Incorporates animated loading screen for UX consistency.

---

### 8. Store (Zustand)
**Prompt Objective:**  
Design a global cart state management system with persistent storage and controlled mutation behavior.

**Prompt Design Rationale:**  
Avoid dependency-heavy middleware; use explicit subscription to maintain full control of synchronization and cleanup.

**Resulting Implementation:**  
`lib/store.ts`  
- Custom Zustand store managing `items`, `add`, `remove`, `setQty`, `clear`, and `getTotal`.  
- Manual subscription syncing with `localStorage`.  
- Automatic cleanup when cart is cleared.  
- Guarantees persistence between sessions.

---

### 9. API Simulation
**Prompt Objective:**  
Simulate server-side order management, including order creation, stock validation, and progressive delivery status.

**Prompt Design Rationale:**  
Provide a realistic local development environment without external dependencies. Enable smooth integration with UI components for demonstration purposes.

**Resulting Implementation:**  
`lib/api.ts`  
- `placeOrder()`: Validates stock, assigns unique order ID, updates stock quantities, and persists order data.  
- `getOrderStatus()`: Returns order status dynamically based on elapsed time, simulating backend logistics progression.  
- Reads and writes order data to `localStorage` for persistence across sessions.
