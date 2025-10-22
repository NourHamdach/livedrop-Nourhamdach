// apps/api/src/routes/orders.js
import { Router } from "express";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { sseSetup } from "../middleware/sseTracker.js";
// global.activeSSEConnections = global.activeSSEConnections || 0;

const router = Router();

// // Utility to send Server-Sent Events
// function sendSSE(res, event, data) {
//   res.write(`event: ${event}\n`);
//   res.write(`data: ${JSON.stringify(data)}\n\n`);
// }

/**
 * POST /api/orders
 * Create a new order
 */
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, items, total, carrier } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    if (!customerId || !Array.isArray(items) || typeof total !== "number") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    // 1️⃣ Verify customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // 2️⃣ Check for existing order with same idempotency key (for retries)
    if (idempotencyKey) {
      const existing = await Order.findOne({ "meta.idempotencyKey": idempotencyKey });
      if (existing) {
        console.log(`♻️ Duplicate request ignored (order ${existing._id})`);
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json(existing);
      }
    }

    // 3️⃣ Validate stock and adjust
    const updatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Decrease stock
      product.stock -= item.quantity;
      await product.save({ session });

      updatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // 4️⃣ Create order atomically
    const order = await Order.create(
      [
        {
          customerId,
          items: updatedItems,
          total,
          carrier: carrier || "LebanonPost",
          status: "PENDING",
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          meta: { idempotencyKey: idempotencyKey || null },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log(`✅ Order ${order[0]._id} created successfully`);
    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Error creating order:", err.message);
    if (err.message.startsWith("Insufficient stock")) {
      return res.status(409).json({ error: err.message });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
/**
 * GET /api/orders/:id
 * Retrieve a specific order
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId } = req.query;

    if (!customerId)
      return res.status(400).json({ error: "Customer ID query param required" });

    const order = await Order.findOne({ _id: id, customerId });
    if (!order)
      return res
        .status(404)
        .json({ error: "Order not found or does not belong to this customer" });

    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/orders?customerId=:customerId
 * Retrieve all orders for a specific customer
 */
router.get("/", async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId)
      return res.status(400).json({ error: "customerId query param required" });

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ error: "Customer not found" });

    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching customer orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/orders/:id/stream
 * Server-Sent Events endpoint simulating order status updates
 */
router.get("/:id/stream", sseSetup, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.sendSSE("error", { message: "Invalid order ID" });
    return res.end();
  }

  const order = await Order.findById(id);
  if (!order) {
    res.sendSSE("error", { message: "Order not found" });
    return res.end();
  }

  res.sendSSE("status", { status: order.status });

  const flow = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  let idx = flow.indexOf(order.status);
  while (idx < flow.length - 1) {
    await new Promise((r) => setTimeout(r, 20000));
    idx++;
    order.status = flow[idx];
    await order.save();
    res.sendSSE("status", { status: order.status });
  }

  res.end();
});
export default router;
