## Document 1: Shoplite User Registration Process

To create a Shoplite account, users visit the registration page and provide their email address, password, and basic profile information. Email verification is required within 24 hours of registration. Users can choose between buyer accounts (free) or seller accounts (requires business verification). Passwords must meet complexity rules: minimum 12 characters, at least one number, one uppercase letter, and one symbol. Multi‑factor authentication (MFA) is optional but recommended; SMS and authenticator‑app methods are supported. Username handles are unique platform‑wide and can be changed once every 90 days. Profile completion unlocks perks such as saved searches and personalized deals. Suspicious sign‑ups trigger a cool‑down and manual review. Account recovery requires email access plus a backup code or a verified phone number. Session timeouts are 30 minutes for web and 7 days for trusted devices. For minors, guardian consent is required in regions where applicable. Enterprise teams can request a consolidated billing profile after verification.

---

## Document 2: Product Search and Filtering

Shoplite’s search supports keyword, category, brand, and structured filters. Filters include price range with currency awareness, shipping speed, seller rating thresholds, stock availability, and attributes like color/size. Query understanding expands bare terms (e.g., “tee” to “t‑shirt”) and auto‑corrects common typos. Results default to “Relevance,” but users can sort by price, rating, or newest. Faceted filters update counts dynamically. Saved searches alert users when new items match criteria, using daily digests to reduce notification fatigue. On mobile, chip‑style filters keep context visible as users scroll. The search index updates within 60 seconds of inventory changes for top sellers and within 5 minutes for others. Banned terms and restricted items are filtered according to regional law. Search logs are anonymized for quality metrics like click‑through rate and add‑to‑cart rate. Developers can use the Search API with pagination and a maximum of 50 results per page to maintain latency.

---

## Document 3: Shopping Cart and Checkout

The Shoplite cart accepts items from multiple sellers and auto‑groups them by fulfillment method. Users can adjust quantities, save items for later, and apply one promo code per order. Taxes are estimated by shipping address and updated at payment step once the full address is confirmed. Shipping options show expected delivery windows based on SLA and carrier scans. Stock is soft‑reserved for 15 minutes after starting checkout to reduce oversells; for flash sales, reservation compresses to 5 minutes. Address book supports multiple addresses with nickname labels. The checkout supports guest mode, but coupon redemption requires login. Fraud signals (device fingerprint, velocity checks) may require step‑up verification. Digital goods are delivered instantly with license keys stored in the user vault. For partial shipments, each sub‑order gets its own tracking number. Email confirmations include a tax invoice PDF when applicable. If payment fails, the cart is restored and the user sees actionable error hints.

---

## Document 4: Payment Methods and Security

Shoplite supports major cards, Apple Pay/Google Pay, PayPal, and region‑specific wallets. PCI‑DSS Level 1 compliance is maintained; sensitive card data never touches Shoplite servers and is tokenized at the gateway. 3‑D Secure (2.0) is applied using risk‑based rules. Users can store payment tokens for one‑click checkout, protected by device binding and MFA. Refunds are processed to the original payment method; store credit is offered when card rails do not support immediate refunds. The platform monitors chargeback ratios per seller with tiered penalties. Payment webhooks implement idempotency keys to prevent double‑posting. Developers integrating the Payments API should sign requests with HMAC and rotate keys every 90 days. Security audits include quarterly ASV scans and annual penetration testing. Suspicious transactions trigger manual review queues and may delay shipment. For subscriptions, vaulted tokens are scoped per merchant and cannot be reused across sellers.

---

## Document 5: Order Tracking and Delivery

Customers can track orders via the Orders page, email links, or the mobile app’s push notifications. Tracking status flows through stages: Confirmed, Packed, Shipped, Out for Delivery, Delivered, or Exception (e.g., address issue). Each package includes carrier, tracking ID, latest scan time, and an estimated delivery date. Delivery estimates consider cutoff times and weekends; expedited options show narrowed windows. Failed delivery attempts automatically schedule re‑delivery when supported by the carrier. If no scans are recorded within 72 hours after label creation, the system nudges the seller to ship or cancels automatically depending on policy. Pickup‑point deliveries require a government‑issued ID. Buyers can reschedule delivery or change the pickup point before Out for Delivery stage. International shipments include customs status where available. Proof of delivery may include a signature or geotagged photo in regions where permitted.

---

## Document 6: Return and Refund Policies

Shoplite offers a 30‑day return window for most categories starting from the delivery date. Certain categories (perishables, intimate apparel, digital downloads) are final sale unless defective. Returns require a return authorization (RA) number, which buyers can request from the Orders page. Prepaid return labels are provided for domestic returns; international returns may require buyer‑paid shipping depending on policy. Items must be unused and in original packaging; serial‑numbered goods are verified upon receipt. Refunds are issued within 5 business days of warehouse confirmation. Exchanges are supported when inventory is available. Abuse prevention includes return rate monitoring and mis‑ship claims checks. For marketplace orders, sellers may set stricter policies, but not looser than Shoplite’s baseline. If the carrier marks a package as delivered but the buyer disputes, support follows a claims process requiring an affidavit and any available evidence.

---

## Document 7: Product Reviews and Ratings

Reviews can be left only by verified purchasers within 90 days of delivery. Ratings range from 1 to 5 stars and include optional text, photos, or videos. Shoplite uses an anti‑spam filter and human moderation. Sellers may reply publicly but cannot remove negative reviews; they can flag reviews that violate guidelines. The default sort is “Most Helpful,” calculated from recency, upvotes, and reviewer credibility. Review aggregation displays per‑attribute scores (fit, material quality) when sellers provide product attributes. Incentivized reviews must be disclosed and are weighted lower. Users can follow reviewers to see future posts. Offensive content is hidden pending review. Developers can access aggregated ratings via the Reviews API with caching recommended for high‑traffic pages. Attempts to game ratings (vote brigading) are rate‑limited and audited.

---

## Document 8: Seller Account Setup and Management

Sellers register via the Shoplite Seller Portal, providing business name, contact details, tax ID, and payout bank account. Business verification typically completes in 2–3 business days. KYC (Know Your Customer) checks include legal entity validation and beneficial‑owner screening. Once approved, sellers configure shipping templates, return addresses, and handling times. The dashboard presents order queues, cancellation rates, late shipment metrics, and buyer messages. Payouts are weekly by default, with daily payouts available for low‑risk sellers after 60 days. Policy violations (e.g., listing prohibited items) trigger warnings and potential suspension. Multi‑user access with roles allows staff accounts for operations, catalog, and support. Two‑factor authentication is enforced for admin roles. Sellers can set vacation mode to pause listings while preserving search rank. Bulk listing tools and a CSV importer help migrate catalogs.

---

## Document 9: Inventory Management for Sellers

Inventory can be managed via web UI, CSV imports, or Inventory API. Sellers define SKUs, barcodes, and variant attributes. Real‑time stock decrements on checkout prevent oversells; back‑in‑stock notifications collect waitlist emails. Low‑stock thresholds trigger alerts. For FBS (Fulfilled by Shoplite) inventory, inbound shipments require box content information and ASN (advanced shipment notice). Cycle counts reconcile discrepancies between physical and system stock. For bundled products, virtual SKUs map to component SKUs to ensure availability math is consistent. Out‑of‑stock items can be hidden or shown with an expected restock date. Auto‑archive kicks in after 90 days of zero stock and zero views. Sellers can bulk‑update prices with minimum/maximum guardrails to prevent errors.

---

## Document 10: Commission and Fee Structure

Shoplite charges a commission on each sale, varying by category from 5% to 15%, plus a flat $0.30 transaction fee. High‑risk categories may include additional risk surcharges. FBS storage fees are billed monthly by cubic foot; long‑term storage fees apply after 365 days. Advertising features (Sponsored Listings) bill per click with a second‑price auction model. Refund administration may incur a small fee to cover payment gateway costs. Sellers receive detailed monthly statements, downloadable as CSV. Disputed charges can be appealed within 30 days. Promotions funded by Shoplite do not affect the seller’s commission. Fee changes are announced with at least 30 days’ notice except in cases of legal or security urgency.

---

## Document 11: Customer Support Procedures

Support is available via chat, email, and phone, with priority queues for Plus members. The triage system categorizes tickets into payments, delivery, returns, account access, and policy. First‑response SLA is 4 hours for chat/email during business hours. Agents use internal tools to view order history, message logs, and fraud flags; sensitive fields are masked. Escalations go to specialized teams with target resolution times. Refund exceptions require supervisor approval. Support avoids making policy exceptions that could set precedents. For safety and harassment issues, a dedicated Trust & Safety team handles reports. Agents follow structured prompts to ensure consistent messaging and must link to policy documents in customer responses. Customer satisfaction (CSAT) surveys follow each contact, and QA audits a sample of interactions weekly.

---

## Document 12: Mobile App Features

The Shoplite mobile app offers personalized home feed, barcode scanning for price comparison, and offline carts that sync when connected. Push notifications cover price drops, back‑in‑stock, delivery updates, and abandoned carts. Biometric login simplifies authentication. In‑app chat connects buyers to sellers for product questions. The app uses a compact UI with bottom navigation: Home, Search, Cart, Orders, Profile. Native share sheets let users send product links. App updates are rolled out progressively to 10%, then 50%, then 100% to monitor crash rates. Background fetch updates order statuses even if the app is not foregrounded. Deep links open directly to product, cart, or order pages. Data usage is minimized with on‑device caching and compressed images.

---

## Document 13: API Documentation for Developers

Developers can access Shoplite APIs for Search, Orders, Inventory, and Reviews. Authentication uses OAuth 2.0 with scopes per API. Rate limits are per client ID: 100 requests/minute for standard and 500 requests/minute for partners. Webhooks are available for order events (created, shipped, refunded) and are signed with HMAC‑SHA256. SDKs are provided in JavaScript and Python with examples for pagination and retries. Error responses follow RFC 7807 problem+json with machine‑readable codes. Sandbox and production endpoints are separate; never use production credentials in test. Idempotency keys are required for write operations to avoid duplicate effects. API changelogs document deprecations with a 90‑day sunset. Support forums are moderated by Shoplite staff.

---

## Document 14: Security and Privacy Policies

Shoplite practices data minimization: collect only what is necessary, retain only as long as needed, and encrypt data at rest and in transit. Access controls follow least privilege and are reviewed quarterly. Audit logs are immutable and stored separately. Privacy choices include data export and account deletion within 30 days. Cookies respect Do Not Track where legally mandated. Third‑party processors undergo security review and contractual DPAs. Breach notifications follow legal timelines and include scope and mitigations. Children’s data is protected with heightened controls. Internal red‑team exercises test incident response. The platform supports bug bounty submissions with coordinated disclosure. For ML features, differential privacy may be applied to aggregate metrics.

---

## Document 15: Promotional Codes and Discounts

Shoplite supports percent‑off, amount‑off, and free‑shipping codes. Promo codes can be limited by category, seller, minimum spend, or first‑order only. Stacking is disabled; the best eligible discount is applied automatically. Expired codes are rejected with reasons. Abuse prevention checks velocity (codes per user per day) and linkage across devices. Sellers can fund coupons for their own catalog. Seasonal campaigns use controlled start/end times with the cart showing a countdown. Price‑slash promotions display the reference price and the discounted price with clear labeling. Developers should note that promotions are evaluated at checkout; cart totals may change after address confirmation if taxes or shipping rates shift.

