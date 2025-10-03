# RAG System Evaluation

## Retrieval Quality Tests (10 tests)

| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I create a seller account on Shoplite? | Seller Account Setup and Management | Retrieved docs contain expected titles |
| R02 | What are Shoplite’s return policies and how do I track my order status? | Return and Refund Policies; Order Tracking and Delivery | Retrieved docs are relevant to question |
| R03 | Does Shoplite support Apple Pay and how are payments secured? | Payment Methods and Security | Retrieved docs contain expected titles |
| R04 | How long are items reserved in the cart during checkout? | Shopping Cart and Checkout | Retrieved docs are relevant to question |
| R05 | Who pays for return shipping on international orders? | Return and Refund Policies | Retrieved docs contain expected titles |
| R06 | Can sellers reply to negative reviews? | Product Reviews and Ratings | Retrieved docs contain expected titles |
| R07 | What documents are needed for business verification? | Seller Account Setup and Management | Retrieved docs are relevant to question |
| R08 | How can I bulk‑upload inventory? | Inventory Management for Sellers | Retrieved docs contain expected titles |
| R09 | What is the commission fee structure? | Commission and Fee Structure | Retrieved docs are relevant to question |
| R10 | What safeguards exist against coupon abuse? | Promotional Codes and Discounts | Retrieved docs contain expected titles |

## Response Quality Tests (15 tests)

| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-------------------|
| Q01 | How do I create a seller account on Shoplite? | ["seller registration","business verification","2–3 business days"] | ["instant approval"] | Direct answer with citation |
| Q02 | What are Shoplite’s return policies and how do I track my order status? | ["30‑day return window","order tracking","return authorization"] | ["lifetime returns"] | Multi-source synthesis |
| Q03 | Does Shoplite support Apple Pay and how are payments secured? | ["Apple Pay","PCI‑DSS","3‑D Secure"] | ["stores full card numbers"] | Direct answer with citation |
| Q04 | How long are items reserved in the cart? | ["soft‑reserved","15 minutes","flash sales"] | ["24 hours hold"] | Direct answer with citation |
| Q05 | Who pays for international return shipping? | ["international returns","buyer‑paid shipping"] | ["free returns always"] | Direct answer with citation |
| Q06 | Can sellers reply to negative reviews? | ["reply publicly","cannot remove","flag violations"] | ["delete bad reviews at will"] | Direct answer |
| Q07 | Documents for business verification? | ["KYC","beneficial owner","tax ID"] | ["no verification"] | Direct answer |
| Q08 | Bulk‑upload inventory methods? | ["CSV import","Inventory API","SKUs"] | ["manual only"] | Direct answer |
| Q09 | Commission fee structure? | ["5% to 15%","$0.30 transaction fee","risk surcharges"] | ["flat 0%"] | Direct answer |
| Q10 | Delivery estimates logic? | ["carrier scans","cutoff times","expedited"] | ["guaranteed time to the minute"] | Direct answer |
| Q11 | Change pickup point after ordering? | ["change the pickup point","before Out for Delivery"] | ["change anytime after delivery"] | Direct answer |
| Q12 | Data privacy measures? | ["encrypt","least privilege","audit logs"] | ["no encryption"] | Direct answer |
| Q13 | Are promotional codes stackable? | ["no stacking","best eligible discount","limitations"] | ["infinite stacking"] | Direct answer |
| Q14 | Duplicate webhook deliveries? | ["idempotency keys","duplicate","webhooks"] | ["process twice"] | Direct answer |
| Q15 | Review eligibility window? | ["verified purchasers","90 days"] | ["open to everyone"] | Direct answer with citation |

## Edge Case Tests (5 tests)

| Test ID | Scenario | Expected Response Type |
|---------|----------|----------------------|
| E01 | Question not in knowledge base | Refusal with explanation |
| E02 | Ambiguous question | Clarification request |
| E03 | Conflicting snippets retrieved | Ask for confirmation / present both options |
| E04 | Low-similarity retrieval (< threshold) | Refusal with explanation |
| E05 | Security/policy-violating request | Policy-compliant refusal with citation |