# API Flow and Endpoints

This document captures the current, concrete behaviour of the API implemented in `apps/api`.

## Environment variables
- `MONGODB_URI` / `MONGODB_URI_TEST`
- `DB_NAME` / `DB_NAME_TEST`
- `FRONTEND_URL` (CORS origin)
- `LLM_GENERATE_URL` (optional)

## Health
- GET /api/health — pings the DB and returns connection status.

## Products
- GET /api/products
  - Query: `search`, `tag`, `sort` (`asc`|`desc`), `page`, `limit`
  - Response: { total, page, limit, results: Product[] }

- GET /api/products/:id — returns product or 404

- POST /api/products — create product (requires `name` and `price`)

## Customers
- GET /api/customers?email=... — lookup by email
- GET /api/customers/:id — fetch customer

## Orders
- POST /api/orders
  - Body: { customerId, items: [{ productId, quantity }], total, carrier? }
  - Uses Mongoose transactions to decrement stock and create the order.
  - Supports `Idempotency-Key` header to dedupe retries.
  - Responses: 201 created, 400 validation error, 404 not found, 409 conflict (stock).

- GET /api/orders/:id?customerId=... — fetch order (customerId required)
- GET /api/orders?customerId=... — list orders for customer
- GET /api/orders/:id/stream — SSE endpoint that simulates status updates (PENDING → PROCESSING → SHIPPED → DELIVERED)

## Analytics
- GET /api/analytics — totalRevenue, orderCount, avgOrderValue
- GET /api/analytics/daily-revenue?from=&to= — daily rows
- GET /api/analytics/dashboard-metrics — summary metrics

## Assistant (Support)
- POST /api/assistant { input: string, context?: object }
  - Returns { text, intent, score, citations, tone, functionsCalled, responseTimeMs }
  - Internal behaviour (see `src/assistant/engine.js`): intent classification, identity shortcuts, policy grounding (uses `docs/ground-truth.json`), optional LLM proxy, and function registry calls.

## Function registry
- Functions exported by `src/assistant/function-registry.js`: `getOrderStatus`, `searchProducts`, `getCustomerOrders`.
- Tests frequently spy on `registry.execute(name, args)` to assert calls from the assistant.

## Safety
- `src/db.js` will throw if a test environment appears to point to a production DB; `clearDB()` prevents destructive operations in production.
