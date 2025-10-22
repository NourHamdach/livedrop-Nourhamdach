// apps/api/src/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB, getDB } from "./db.js";


// Route modules
import assistantRoute from "./routes/assistant.js";
import customers from "./routes/customers.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import analytics from "./routes/analytics.js";
import dashboard from "./routes/dashboard.js";
import { requestLogger } from "./middleware/requestLogger.js";

dotenv.config();

const app = express();

// --- Middleware ---
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",   // ✅ add this line
    ],
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(requestLogger); // ✅ Global request logging middleware

// --- Health check ---
app.get("/api/health", async (_req, res) => {
  try {
    const db = getDB(); // imported now
    await db.command({ ping: 1 });
    res.status(200).json({
      ok: true,
      database: "connected",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({
      ok: false,
      database: "disconnected",
      error: err.message,
    });
  }
});

// --- Routes ---
app.use("/api/customers", customers);
app.use("/api/products", products);
app.use("/api/orders", orders);
app.use("/api/assistant", assistantRoute);
 app.use("/api/analytics", analytics);
app.use("/api/dashboard", dashboard);

// --- Fallback 404 ---
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// --- Conditional startup (only in non-test envs) ---
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 8080;
  (async () => {
    try {
      await connectDB();
      app.listen(port, () =>
        console.log(`✅ API server running on http://localhost:${port}`)
      );
    } catch (err) {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  })();
}

// ✅ Export app for Supertest
export default app;
