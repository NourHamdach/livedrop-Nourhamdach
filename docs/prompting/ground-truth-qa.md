### Q01: How do I create a seller account on Shoplite?

**Expected retrieval context:** Document 8: Seller Account Setup and Management

**Authoritative answer:** To create a seller account, visit the Shoplite Seller Portal, provide business details including tax ID and payout account, and complete KYC. Business verification typically completes in 2–3 business days before you can list products.

**Required keywords in LLM response:** ["seller registration", "business verification", "2–3 business days"]

**Forbidden content:** ["instant approval", "no verification required", "personal accounts"]

### Q02: What are Shoplite’s return policies and how do I track my order status?

**Expected retrieval context:** Document 6: Return and Refund Policies + Document 5: Order Tracking and Delivery

**Authoritative answer:** Shoplite provides a 30‑day return window (from delivery) with an RA number required, and you can track orders through the Orders page or app with status updates like Shipped and Out for Delivery. Combine the RA process with order‑tracking details to guide the user.

**Required keywords in LLM response:** ["30‑day return window", "order tracking", "return authorization"]

**Forbidden content:** ["no returns accepted", "lifetime returns"]

### Q03: Does Shoplite support Apple Pay and how are payments secured?

**Expected retrieval context:** Document 4: Payment Methods and Security

**Authoritative answer:** Yes. Shoplite supports major cards and wallets like Apple Pay/Google Pay. Payments are tokenized and processed under PCI‑DSS Level 1. Risk‑based 3‑D Secure may be applied, and stored tokens are protected by device binding and MFA.

**Required keywords in LLM response:** ["Apple Pay", "PCI‑DSS", "3‑D Secure"]

**Forbidden content:** ["stores full card numbers", "no encryption"]

### Q04: How long are items reserved in the cart during checkout?

**Expected retrieval context:** Document 3: Shopping Cart and Checkout

**Authoritative answer:** Stock is soft‑reserved for 15 minutes during normal checkout, and 5 minutes during flash sales to reduce oversells.

**Required keywords in LLM response:** ["soft‑reserved", "15 minutes", "flash sales"]

**Forbidden content:** ["no reservation", "24 hours hold"]

### Q05: Who pays for return shipping on international orders?

**Expected retrieval context:** Document 6: Return and Refund Policies

**Authoritative answer:** International returns may require the buyer to pay for return shipping, depending on policy and category.

**Required keywords in LLM response:** ["international returns", "buyer‑paid shipping"]

**Forbidden content:** ["free returns always", "seller always pays"]

### Q06: Can sellers reply to negative reviews?

**Expected retrieval context:** Document 7: Product Reviews and Ratings

**Authoritative answer:** Yes. Sellers may publicly reply to reviews, but they cannot remove negative reviews. They can flag guideline violations for moderation.

**Required keywords in LLM response:** ["reply publicly", "cannot remove", "flag violations"]

**Forbidden content:** ["secretly edit reviews", "delete bad reviews at will"]

### Q07: What documents are needed for business verification?

**Expected retrieval context:** Document 8: Seller Account Setup and Management

**Authoritative answer:** KYC checks require legal entity details, beneficial‑owner information, tax ID, and a payout bank account. Verification is typically 2–3 business days.

**Required keywords in LLM response:** ["KYC", "beneficial owner", "tax ID"]

**Forbidden content:** ["social media profile only", "no verification"]

### Q08: How can I bulk‑upload inventory?

**Expected retrieval context:** Document 9: Inventory Management for Sellers

**Authoritative answer:** Use CSV imports or the Inventory API to bulk‑upload SKUs, variants, and barcodes. Guardrails prevent price errors.

**Required keywords in LLM response:** ["CSV import", "Inventory API", "SKUs"]

**Forbidden content:** ["email support file", "manual only"]

### Q09: What is the commission fee structure?

**Expected retrieval context:** Document 10: Commission and Fee Structure

**Authoritative answer:** Commissions range from 5% to 15% depending on category plus a $0.30 transaction fee, with risk surcharges in some categories and monthly storage fees for FBS.

**Required keywords in LLM response:** ["5% to 15%", "$0.30 transaction fee", "risk surcharges"]

**Forbidden content:** ["flat 0%", "hidden fees undisclosed"]

### Q10: How are delivery estimates determined?

**Expected retrieval context:** Document 5: Order Tracking and Delivery

**Authoritative answer:** Estimates incorporate carrier SLAs, scan events, cutoff times, and weekends. Expedited options present narrowed windows.

**Required keywords in LLM response:** ["carrier scans", "cutoff times", "expedited"]

**Forbidden content:** ["always exact date", "guaranteed time to the minute"]

### Q11: Can I change the pickup point after ordering?

**Expected retrieval context:** Document 5: Order Tracking and Delivery

**Authoritative answer:** Yes, buyers can change the pickup point before the order reaches the Out for Delivery stage.

**Required keywords in LLM response:** ["change the pickup point", "before Out for Delivery"]

**Forbidden content:** ["change anytime after delivery", "no changes allowed ever"]

### Q12: How does Shoplite handle data privacy?

**Expected retrieval context:** Document 14: Security and Privacy Policies

**Authoritative answer:** Shoplite encrypts data in transit and at rest, follows least‑privilege access, maintains immutable audit logs, and offers data export and deletion within policy timelines.

**Required keywords in LLM response:** ["encrypt", "least privilege", "audit logs"]

**Forbidden content:** ["no encryption", "public logs"]

### Q13: Are promotional codes stackable?

**Expected retrieval context:** Document 15: Promotional Codes and Discounts

**Authoritative answer:** Promo stacking is disabled; the best eligible discount is applied automatically. Codes can be limited by category, seller, or minimum spend.

**Required keywords in LLM response:** ["no stacking", "best eligible discount", "limitations"]

**Forbidden content:** ["infinite stacking", "hidden discounts"]

### Q14: What happens if payment webhook is delivered twice?

**Expected retrieval context:** Document 4: Payment Methods and Security

**Authoritative answer:** Payment webhooks use idempotency keys; duplicate notifications are safely ignored by the backend processing.

**Required keywords in LLM response:** ["idempotency keys", "duplicate", "webhooks"]

**Forbidden content:** ["double charge", "process twice"]

### Q15: Do reviews require a purchase?

**Expected retrieval context:** Document 7: Product Reviews and Ratings

**Authoritative answer:** Yes. Only verified purchasers can review, within 90 days of delivery.

**Required keywords in LLM response:** ["verified purchasers", "90 days"]

**Forbidden content:** ["open to everyone", "no time limit"]

### Q16: What rate limits apply to the public APIs?

**Expected retrieval context:** Document 13: API Documentation for Developers

**Authoritative answer:** Standard clients: 100 requests/min; partners: 500 requests/min. Write operations require idempotency keys. OAuth scopes control access.

**Required keywords in LLM response:** ["100 requests/min", "500 requests/min", "OAuth scopes"]

**Forbidden content:** ["unlimited", "no auth"]

### Q17: Can I enable vacation mode as a seller?

**Expected retrieval context:** Document 8: Seller Account Setup and Management

**Authoritative answer:** Yes. Sellers can enable vacation mode to pause listings without losing search rank.

**Required keywords in LLM response:** ["vacation mode", "pause listings", "search rank"]

**Forbidden content:** ["delete all listings", "rank penalty guaranteed"]

### Q18: How are bundles managed in inventory?

**Expected retrieval context:** Document 9: Inventory Management for Sellers

**Authoritative answer:** Bundles use virtual SKUs that map to components; availability derives from component stock to prevent overselling.

**Required keywords in LLM response:** ["virtual SKUs", "components", "availability"]

**Forbidden content:** ["random stock", "bundles ignore components"]

### Q19: How are customer support SLAs defined?

**Expected retrieval context:** Document 11: Customer Support Procedures

**Authoritative answer:** First response for chat/email is targeted within 4 business hours; escalations route to specialized teams with defined resolution targets.

**Required keywords in LLM response:** ["first‑response SLA", "4 hours", "escalations"]

**Forbidden content:** ["instant response 24/7 guaranteed", "no SLA"]

### Q20: What safeguards exist against coupon abuse?

**Expected retrieval context:** Document 15: Promotional Codes and Discounts

**Authoritative answer:** Velocity checks limit redemptions per user/device, and campaigns enforce start/end windows with countdowns. Stacking is disabled.

**Required keywords in LLM response:** ["velocity checks", "start/end windows", "no stacking"]

**Forbidden content:** ["unlimited redemptions", "stack everything"]
