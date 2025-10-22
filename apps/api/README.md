# API (apps/api) — README

Quick-start and specifics for the API service in `apps/api`.

## Setup

Install dependencies and run locally:

```powershell
cd apps/api
npm ci
```

Create a `.env` with at least:
- `MONGODB_URI` (Atlas or local)
- `DB_NAME` (optional)
- `FRONTEND_URL` (for CORS)

## Scripts
- `npm run dev` — locally with `nodemon` (`src/server.js`)
- `npm start` — production start (note `server.js` listens only when `NODE_ENV !== 'test'`)
- `npm run test` — runs Vitest tests (tests use mongodb-memory-server)
- `npm run seed` — seed the database using `seed.js`

## Notes
- The server exports the Express `app` so tests can import it (Supertest). Avoid `process.exit()` in test-mode to prevent Vitest from failing.
- Order creation is transactional and supports `Idempotency-Key` header to dedupe retries.
- Health endpoint `/api/health` verifies DB connectivity.

## Deploy
See top-level `docs/DEPLOYMENT.md` for Render/Vercel/ngrok guidance.
