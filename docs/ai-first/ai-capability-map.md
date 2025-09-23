# AI Capability Map for ShopLite

We mapped out several AI features that could impact ShopLite. Each was rated for risk, latency, and cost. Two were chosen for near-term implementation because they directly move business KPIs (conversion, support load) and are feasible with current data and APIs.

| Capability              | Intent (user)                               | Inputs (this sprint)            | Risk (1–5) | p95 ms | Est. cost/action | Fallback                    | Selected |
|--------------------------|----------------------------------------------|---------------------------------|------------|--------|------------------|-----------------------------|:-------:|
| AI Support Assistant     | Quick answers to FAQs or order status        | FAQ doc, order ID, user query   | 3          | 1200   | ~$0.018           | Link to FAQ + contact form  | yes |
| Smart Search Suggestions | Smarter product search while typing          | Catalog (10k SKUs), query text  | 2          | 300    | ~$0.009           | Standard DB lookup          | yes|
| Personalized Recs        | Suggest items based on browsing/purchase history | SKU + session/order history     | 4          | 500    | N/A (self-hosted model) | Show “popular items” widget | No  |
| Review Summarization     | Summarize pros/cons from product reviews     | Product reviews                 | 3          | 2000   | ~$0.020           | Show full review list       |  No |

---

### Why these two?
We’choose to start with the **Support Assistant** and **Smart Search Suggestions**. They directly reduce **support tickets** and increase **conversion rate**, two of our most important metrics. Both can be built with data we already have (FAQ doc, order API, SKU catalog),using lightweight RAG or simple search pipelines, and both have low integration risk and clear fallback paths. Recommendations(need model training on our own data) and review summaries are valuable longer-term projects, but not as quick to prove.
