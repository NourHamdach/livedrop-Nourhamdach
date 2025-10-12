# 🛍️ Storefront Setup Guide

Welcome to **Storefront**, a fast and minimal e-commerce web app built with **React**, **Vite**, **TailwindCSS**, and **Vitest** for testing.
This guide will help you set up the project and run it effectively, both client-side and server-side.

-----

## ⚙️ Prerequisites

Before you start, ensure you have the following installed:

  - **Node.js** (v18 or higher)
  - **pnpm** (recommended package manager)
  -
-----

## 📦 Installation

1.  Clone the repository:

    ```bash
    git clone <your_repo_url>
    cd apps/storefront
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

    **🧩 Tip:** Make sure you run `pnpm install` inside the `apps/storefront` folder, not the project root.

-----

## 🚀 Running the Frontend (Client-Side Only)

Run the app locally using mock data (`mock-catalog.json` and `ground-truth.json`):

```bash
pnpm dev
```

The app will be available at:

`http://localhost:5173`

You can now browse products, add items to the cart, simulate checkout, and use the **Ask Support** panel (local mode).

-----

## 🔌 Running with Backend (Groq Integration)

The backend allows the **Ask Support AI** to decide whether to:

  - Use a ground-truth FAQ,
  - Check an order ID, or
  - Refuse the query.

### 1\. Configure Environment Variables

Create a file named **`.env`** inside `apps/storefront

```

### 2\. Start the Backend

Run the backend server:

```bash
node server/index.js
```

This will start a support API on:

`http://localhost:5000`

### 3\. Connect Frontend to Backend

You have two options:

**Option A — Use Vite Proxy (Recommended)**

In `apps/storefront/vite.config.ts`, make sure you have:

```typescript
server: {
  port: 5173,
  proxy: { '/api': 'http://localhost:5000' }
}
```

Then run:

```bash
pnpm dev
```

**Option B — Use .env Variable**

In `apps/storefront/.env`:

```
VITE_BACKEND_URL=http://localhost:5000
```

Then run:

```bash
pnpm dev
```

-----

## 🏗️ Build and Preview

To create an optimized production build:

```bash
pnpm build
```

## 🧪 Running Tests (Vitest + Testing Library)

Run unit and integration tests:

```bash
pnpm test
```

To run in watch mode (auto re-run when files change):

```bash
pnpm test -- --watch
```

✅ Tests include coverage for **Catalog**, **Product**, **Cart**, and **Ask Support** components.

-----

## 📚 Storybook (UI Component Explorer)

Storybook lets you view and test components in isolation.

Start Storybook:

```bash
pnpm storybook
```

Open:

`http://localhost:6006`


-----

## 🧠 Support Agent Behavior

  - Uses only `ground-truth.json` and `getOrderStatus()` from `api.ts`
  - Detects order IDs using regex: `/[A-Z0-9]{10,}/`
  - If confidence is low → refuses politely
  - Masks personal info (only last 4 digits shown)
  - Always includes citation `[Qxx]` or `[order]`


-----

## 🧰 Useful Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server |
| `pnpm build` | Build production version |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Vitest tests |
| `pnpm storybook` | Launch Storybook UI |
| `pnpm build-storybook` | Build static Storybook site |

-----

## 🧾 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `ERR_CONNECTION_REFUSED` | Backend not running. Start it with `node server/index.js`. |
| `404 for /mock-catalog.json` | Ensure file exists in `public/`. |
| `Model decommissioned error` | Update `MODEL` in `.env` (e.g., `llama-3.3-8b-instant`). |
| `Tests fail` | Check `vitest.config.ts` → ensure `environment: "jsdom"`. |

-----

## 🎯 Summary

To run Storefront smoothly:

1.  Install dependencies with `pnpm install`
2.  Start frontend using `pnpm dev`
3.  (Optional) Start backend using `node server/index.js`
4.  Run tests with `pnpm test`
5.  Explore components in Storybook with `pnpm storybook`

That’s it\! You’re ready to use Storefront — a clean, modular, and AI-augmented e-commerce demo. 🛒

