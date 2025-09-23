# Touchpoints

Detailed specs for the two AI features we’ll prototype first.

---

## 1. Support Assistant

### Problem
Customers ask simple but high-volume questions (returns, shipping, order status). Agents waste time on these instead of solving complex cases. We need an assistant that answers instantly, stays grounded in our FAQ + order API, and escalates only when needed.

### Happy Path (Support Assistant with caching + escalation)

1. **User types a question** in the chat.  
2. **Gateway service normalizes** the query (lowercased, trimmed, PII removed).
3.  Orchestration agent classifies intent:
   - If intent = FAQ → check cache → retrieval → LLM.
   - If intent = Order tracking (order ID detected) → call Order API → combine with FAQ if relevant.
   - If intent = Mixed (FAQ + order) → do both: retrieve FAQ chunks + call Order API → merge context → LLM.
   - If none applies or low RAG score → escalate to human.
_**in more details:**_
 **Cache check (FAQs only for security):**  
   - If query matches a cached FAQ → return cached answer.
   - **Notes** Order-specific queries (with order ID) are **never cached in global**.
   - Per-user cache (keyed userID:orderID) may be used for short TTL (3–10 min) order queries to avoid duplicate API calls.
 If no cache hit, run vector search over FAQ (top 3–4 chunks).  
   - Check similarity scores.  
   - If best match < threshold (e.g., 0.75) → **escalate to human immediately** (don’t call LLM).  
   - If above threshold → use chunks in prompt. 
 **If order ID present** → call order-status API (always fresh).  
   - If API call fails after retrying multiple time → **escalate to human** or redirect to order history page.  
 **Combine FAQ chunks + API output** into a grounded prompt.  
**Call LLM** to generate response.  
   - If LLM errors or times out → **escalate to human**.  
 **Stream reply** to user with citations.  
**Collect quick feedback**.  
**Escalation:**  
    - User explicitly requests escalation.  
    - Confidence score <0.6.  
    - No valid response from cache, retrieval, API, or LLM.  
    → **Create helpdesk ticket + transcript for human agent**. 


### Guardrails
- Sources: FAQ markdown + order-status API only.  
- Context limit: ≤1,500 tokens.  
- Out-of-scope: politely refuse and escalate.  

### Human-in-the-Loop
- Triggers: low confidence (<0.6), repeated, explicit escalation.  
- Creates ticket with transcript in helpdesk.  
- SLA: Tier-1 agent reply within 24 hours.  

**Latency budget:** 
- The **p95 target** is 1,200 ms.
- The budget is split as follows: RAG retrieval (100 ms),
- LLM API call (1,000 ms), and UI rendering (100 ms).
- A **30% cache hit rate** is assumed for common queries.

### Fallbacks
- LLM call fails →prompt message to the user to try again or connect with a human agent.
- API fails → redirect to order history page or escalate to human agent.

### PII Handling
- Only redacted query text + order ID (if provided) sent.  
- Logs store hashed queries + doc IDs, not raw PII.  

### Metrics
- Containment (resolved by bot): target 80–85%  
- Helpfulness (total feedback): target 75%+  
- Ticket rate reduction: 15–20% fewer tickets  

### Feasibility
FAQ doc + order-status API already exist. Next step: prototype with Llama 3.1 8B and test against top 20 support queries.

---

## 2. Smart Search Suggestions

### Problem
Search only matches exact prefixes. Typos and synonyms (“womn runing sho”) return nothing, leading to abandonment. Smarter autocomplete should guide shoppers faster to the right items.

### Happy Path
1. User types into search bar.  
2. Cache check: if miss, run Redis prefix search.  
3. Run semantic vector search over 10k SKUs.  
4. For rare queries, call LLM to rewrite.  
5. Merge + rank results.  
6. Show top 5 suggestions.
7. Log interaction

### Guardrails
- Source: SKU titles, tags, categories only.  
- Context cap: ≤300 tokens.  
- no general queries

### Human-in-the-Loop
Product team reviews weekly if CTR drops <10%.

### Latency Budget (≤300 ms p95)
- Cache: ~40 ms  
- Prefix search: ~50 ms  
- Vector search: ~70 ms  
- LLM rewrite (rare only): ≤100 ms  
- Merge: ~30 ms  

### Fallbacks
 If the LLM call fails or times out, the system falls back to the standard keyword-based search function.

### PII Handling
 No PII is handled. Search queries are generic and logged for analytics purposes only.

### Metrics
- Suggestion CTR: >25%  
- search success
- Revenue per search session

### Feasibility
 Product API exists. Use Llama 3.1 8B Instruct via OpenRouter + local embeddings (sentence-transformers). Prototype: static suggestions first.
