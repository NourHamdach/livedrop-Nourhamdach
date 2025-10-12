# Storefront v1

A minimal, fast storefront that completes one journey:
**Catalog → Product → Cart → Checkout (stub) → Order Status**  
plus an **Ask Support** panel that answers strictly from local ground-truth Q&A and a mocked order-status API.  
Optionally, you can enable a Groq-backed support agent via `server/index.js`.

---

## Quick Start

### 0) Requirements
- Node 18+ and pnpm
- No API keys needed for offline mode

### 1) Install deps
```bash
pnpm install
