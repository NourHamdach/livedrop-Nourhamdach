

# 🚀 Deployment Guide
---

## 🍃 MongoDB Atlas Setup

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in.
2. Create a new **Project** and then a **Cluster** (free tier is fine for dev/testing).
3. Click **Database Access** → Add a database user (save username/password).
4. Click **Network Access** → Add IP Address → Allow access from anywhere (`0.0.0.0/0`) for dev, or restrict as needed.
5. Click **Clusters** → Connect → Choose "Connect your application" and copy the connection string (looks like `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`).
6. Use this string as your `MONGO_URI`/`MONGODB_URI` in backend env vars.

---
---

## 🤖 LLM Setup: /generate Endpoint (Colab Week 3)

To enable AI-powered support, you need a running LLM endpoint that exposes a `/generate` POST route.

**Option 1: Use the provided Week 3 Colab notebook**
1. Open the Week 3 Colab (see `notebooks/llm_deployment.ipynb`).
2. Run all cells or (Cell 1->Cell 2->Cell 5->pip install flask cors->Cell 8->Cell 10->Cell 11->Cell 12(recommended)). The notebook will start a small Flask server with a `/generate` endpoint.
3. Expose the Colab port using `ngrok` (see notebook instructions) or Colab's built-in public URL.
4. Copy the public `/generate` endpoint URL (e.g., `https://xxxx.ngrok.io/generate`).
5. Set this as `LLM_GENERATE_URL` in your backend environment.

**Option 2: Custom local server**
1. Run a local Flask/FastAPI server with a `/generate` POST endpoint that accepts `{ prompt }` and returns `{ text }`.
2. Use `ngrok http 5000` (or your port) to expose it.
3. Set `LLM_GENERATE_URL` to the public URL.


---
---

## 🔑 Environment Variables

**Backend (API):**

```env
PORT=3001
MONGO_URI=your-mongodb-connection-string
FRONTEND_URL=your-frontend-url
NODE_ENV=production
LLM_GENERATE_URL=https://xxxx.ngrok.io/generate  # (optional, for assistant)
```

**Frontend (Vercel):**

```env
VITE_BACKEND_URL=https://your-backend-url
```

---
---

## 🏠 How to Run Locally

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd livedrop-Nourhamdach
   ```
2. **Install dependencies:**
   ```bash
   cd apps/api && npm install
   cd ../storefront && npm install
   ```
3. **Set up your `.env` files** in both `apps/api` and `apps/storefront` as above.
4. **Start MongoDB** (Atlas or local, as configured).
5. **Run the backend:**
   ```bash
   cd apps/api
   npm run dev
   ```
6. **Run the frontend:**
   ```bash
   cd apps/storefront
   npm run dev
   ```
7. **(Optional) Start LLM server** (see LLM setup above).
8. Visit [http://localhost:5173](http://localhost:5173) (frontend) and [http://localhost:3001/api/health](http://localhost:3001/api/health) (backend health).

---

**LiveDrop URLs**
- Backend (Render): [https://livedrop-nourhamdach.onrender.com](https://livedrop-nourhamdach.onrender.com)  
- Frontend (Vercel): [https://livedrop-nourhamdach-nqw1-4k3m34oh0-nour-hamdachs-projects.vercel.app](https://livedrop-nourhamdach-nqw1-4k3m34oh0-nour-hamdachs-projects.vercel.app)

This document explains how to deploy both the **backend (API)** and **frontend (Storefront)** for the LiveDrop project.

---

## 🧠 Backend Deployment (Render or Railway)

### 📦 Prerequisites
- A GitHub repository containing your backend code (e.g., `apps/api`).
- Environment variables ready (e.g., `MONGO_URI`, `PORT`, etc.).
- A Node.js app with an entry file like `server.js` or `index.js`.

---

### 🚀 Deploy to **Render**

1. **Push your project to GitHub**
   ```bash
   git add .
   git commit -m "deploy: ready for render"
   git push origin main
````

2. **Go to** [https://render.com](https://render.com) → create a **new Web Service**.

3. **Connect GitHub repo** → select your project.

4. **Configure build & start commands:**

   * **Build command:**

     ```bash
     cd apps/api && npm install && npm run build
     ```
   * **Start command:**

     ```bash
     cd apps/api && npm start
     ```

5. **Set environment variables** under the “Environment” tab:

   ```env
   PORT=3001
   MONGO_URI=your-mongodb-connection-string
   FRONTEND_URL=your frontend-url
   NODE_ENV=production
   ```

6. Click **Deploy** — Render will automatically build and start your backend.

7. When complete, note your **Render URL**, for example:

   ```
   https://livedrop-api.onrender.com
   ```

---

## 🖥️ Frontend Deployment (Vercel)

### 📦 Prerequisites

* Your frontend (React/Vite) code inside `apps/storefront`.
* The backend API URL from Render/Railway (e.g., `https://livedrop-api.onrender.com`).

---

### 🚀 Deploy Steps

1. Go to [https://vercel.com](https://vercel.com) → sign in with GitHub.

2. Click **“Add New Project” → Import Git Repository**.

3. Select your project repository.

4. Configure project settings:

   * **Root directory:**

     ```
     apps/storefront
     ```
   * **Build command:**

     ```
     npm run build
     ```
   * **Output directory:**

     ```
     dist
     ```

5. Add your environment variable:

   ```env
   VITE_BACKEND_URL=https://livedrop-api.onrender.com
   ```

6. Click **Deploy** — Vercel will build and host your app.

7. Once deployed, your site will be live at something like:

   ```
   https://livedrop.vercel.app
   ```

---

## 🧩 Testing the Connection

After both deployments:

1. Visit your Vercel frontend URL.
2. Try actions that call the backend (e.g., fetching products, orders, assistant).
3. If the console shows a CORS error, enable CORS in your backend:

   ```js
   import cors from "cors";
   app.use(cors({ origin: "*" }));
   ```

---

## ✅ Summary

| Component    | Platform         | Example URL                                                            | Notes             |
| ------------ | ---------------- | ---------------------------------------------------------------------- | ----------------- |
| **Backend**  | Render / Railway | [https://livedrop-api.onrender.com](https://livedrop-api.onrender.com) | Node.js + MongoDB |
| **Frontend** | Vercel           | [https://livedrop.vercel.app](https://livedrop.vercel.app)             | React + Vite      |

---

**🎯 Done!**
 full-stack app is now live:
Frontend → **Vercel**
Backend → **Render/Railway**



