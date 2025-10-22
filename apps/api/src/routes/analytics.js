// apps/api/src/routes/analytics.js
import express from "express";
import Order from "../models/order.model.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [summary] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          orderCount: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
        },
      },
    ]);
    res.json(summary || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/analytics/daily-revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns [{ date, revenue, orderCount }]
 */
router.get("/daily-revenue", async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date("1970-01-01");
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const results = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: { $round: ["$revenue", 2] },
          orderCount: 1,
        },
      },
    ]);

    res.json(results);
  } catch (err) {
    console.error("❌ Analytics daily revenue error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/analytics/dashboard-metrics
 * Returns summary of total revenue, total orders, avg order value
 */
router.get("/dashboard-metrics", async (_req, res) => {
  try {
    const [summary] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
        },
      },
    ]);

    res.json(summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });
  } catch (err) {
    console.error("❌ Dashboard metrics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
