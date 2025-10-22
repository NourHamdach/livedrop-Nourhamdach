// apps/api/src/routes/dashboard.js
import express from "express";
import Order from "../models/order.model.js";
import AssistantLog from "../models/assistantLog.model.js";
import RequestLog from "../models/requestLog.model.js";
import { getActiveSSECount } from "../middleware/sseTracker.js"; // new util

const router = express.Router();

/* =========================================================
   1. BUSINESS METRICS
   ========================================================= */
router.get("/business-metrics", async (_req, res) => {
  try {
    const [data] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
          processing: { $sum: { $cond: [{ $eq: ["$status", "PROCESSING"] }, 1, 0] } },
          shipped: { $sum: { $cond: [{ $eq: ["$status", "SHIPPED"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
          ordersByStatus: {
            PENDING: "$pending",
            PROCESSING: "$processing",
            SHIPPED: "$shipped",
            DELIVERED: "$delivered",
          },
        },
      },
    ]);

    res.json(data || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      ordersByStatus: {},
    });
  } catch (err) {
    console.error("❌ Business metrics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================================================
   2. PERFORMANCE METRICS (from RequestLog + SSE tracker)
   ========================================================= */
/* =========================================================
   2. PERFORMANCE METRICS (with failure summary)
   ========================================================= */
/* =========================================================
   2. PERFORMANCE METRICS (from RequestLog + SSE tracker)
   ========================================================= */
router.get("/performance", async (_req, res) => {
  try {
    const recentLogs = await RequestLog.find()
      .sort({ timestamp: -1 })
      .limit(1000)
      .select("responseTimeMs statusCode route timestamp");

    const latencies = recentLogs.map((r) => r.responseTimeMs);
    const activeSSEConnections = getActiveSSECount();

    const sorted = latencies.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;

    // --- collect failure metrics
    const failed = recentLogs.filter((r) => r.statusCode >= 400);
    const grouped = {};
    for (const f of failed) {
      const key = `${f.route} [${f.statusCode}]`;
      grouped[key] = (grouped[key] || 0) + 1;
    }

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const failed24h = await RequestLog.countDocuments({
      statusCode: { $gte: 400 },
      timestamp: { $gte: last24h },
    });

    // any 500 errors in past hour → critical
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const criticalCount = await RequestLog.countDocuments({
      statusCode: { $gte: 500 },
      timestamp: { $gte: oneHourAgo },
    });

    res.json({
      apiLatencyMsP50: +p50.toFixed(2),
      apiLatencyMsP95: +p95.toFixed(2),
      sseActiveConnections: activeSSEConnections,
      failedRequestsCount24h: failed24h,
      failedRoutes: grouped,
      hasCriticalErrors: criticalCount > 0,
      sampleSize: latencies.length,
      lastUpdated: new Date(),
    });
  } catch (err) {
    console.error("❌ Performance metrics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



/* =========================================================
   3. ASSISTANT STATS (from AssistantLog)
   ========================================================= */
router.get("/assistant-stats", async (_req, res) => {
  try {
    const [summary] = await AssistantLog.aggregate([
      {
        $facet: {
          intents: [
            { $group: { _id: "$intent", count: { $sum: 1 } } },
            { $project: { _id: 0, intent: "$_id", count: 1 } },
          ],
          functionCalls: [
            { $unwind: { path: "$functionsCalled", preserveNullAndEmptyArrays: true } },
            { $group: { _id: "$functionsCalled", count: { $sum: 1 } } },
            { $project: { _id: 0, function: "$_id", count: 1 } },
          ],
          latency: [
            {
              $group: {
                _id: null,
                p50: { $avg: "$responseTimeMs" },
                p95: { $max: "$responseTimeMs" },
                totalQueries: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const intents = Object.fromEntries(summary.intents?.map(i => [i.intent, i.count]) || []);
    const functionCalls = Object.fromEntries(summary.functionCalls?.map(f => [f.function, f.count]) || []);
    const latency = summary.latency?.[0] || { p50: 0, p95: 0, totalQueries: 0 };

    res.json({
      totalQueries: latency.totalQueries,
      avgResponseMsP50: Math.round(latency.p50),
      avgResponseMsP95: Math.round(latency.p95),
      intentDistribution: intents,
      functionCalls,
      lastUpdated: new Date(),
    });
  } catch (err) {
    console.error("❌ Assistant stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
