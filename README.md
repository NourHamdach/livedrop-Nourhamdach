# livedrop-Nourhamdach
**Links**
Diagram (Excalidraw): https://excalidraw.com/#json=xZHVNPpzllOErdrCA2fPv,lrhiBKeX_tpXQGvwXRLrrw)

**1) Explanation of the System**

The platform lets users follow creators and receive real‑time notifications when a drop goes live. Users can browse products, view live drops, and place orders. The system must handle high traffic when famous creators launch drops.

**Key challenges solved:**

Prevent overselling inventory when many users order at once.

Handle millions of followers for popular creators.

Send notifications quickly (within 2 seconds).

Keep reads fast (under 200ms) and orders reliable (under 500ms).

The design uses microservices, caching, and event streaming:

Microservices split responsibilities (User/Follow, Catalog, Orders, Notifications).

Redis cache handles stock counters and follower lists.

Kafka (or Pub/Sub) delivers events like drop.started or order.confirmed.

GraphQL API Gateway provides one public API for mobile/web clients.

**2)Caching Strategy
Cache Invalidation Patterns**

**_Write-Through Caching_**

Product updates immediately invalidate cache
New follows update both DB and Redis


**_Time-Based Expiration_**

Product details: 1 hour TTL
Follow relationships: 30 minutes TTL
Drop status: 30 seconds TTL during active drops


**_Event-Driven Invalidation**_

Kafka events trigger specific cache invalidations
WebSocket updates for real-time consistency

**3)Trade‑offs and Reasoning**

_**Microservices Architecture**_

Pro: Each service scales independently. Example: Order Service scales for flash sales, User & Follow Service scales for celebrity creators. Different databases can be used for different needs.

Con: Adds deployment and monitoring complexity. Accepted because the system must handle high load.

_**GraphQL Public API**_

Pro: Flexible for clients. Mobile app can fetch product and drop data in one request, saving network calls.

Con: Harder to set up and secure compared to REST.

_**Atomic Operations for Orders**_

Reasoning: Prevent overselling. Use database locking or Redis Lua script. Ensures only one order decreases stock at a time.

_**Idempotency Key**_

Reasoning: Prevents duplicate orders. Client sends unique key with order. If the key already exists, return existing order instead of creating a new one.

_**Message Queue (Decoupling)**_

Reasoning: Orders confirm quickly. Non-critical work (e.g., sending notifications) is offloaded to Kafka. This keeps order latency low and still delivers notifications in near real-time.
