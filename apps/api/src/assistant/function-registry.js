// apps/api/src/assistant/function-registry.js
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";

class FunctionRegistry {
  constructor() {
    this.fns = new Map();
  }

  register(name, schema, handler) {
    if (!name || typeof handler !== "function") {
      throw new Error("register(name, schema, handler) requires valid args");
    }
    this.fns.set(name, { schema, handler });
  }

  getAllSchemas() {
    const out = {};
    for (const [name, { schema }] of this.fns.entries()) out[name] = schema;
    return out;
  }

  async execute(name, args) {
    const entry = this.fns.get(name);
    if (!entry) throw new Error(`No function registered: ${name}`);
    try {
      return await entry.handler(args || {});
    } catch (err) {
      console.error(`❌ FunctionRegistry: ${name} failed →`, err.message);
      throw err;
    }
  }
}

const registry = new FunctionRegistry();

// --- Real model-based handlers ---
registry.register(
  "getOrderStatus",
  { name: "getOrderStatus", params: { orderId: "string", customerId: "string" } },
  async ({ orderId, customerId }) => {
    const order = await Order.findOne({ _id: orderId, customerId }).lean();
    if (!order) return { error: "Order not found" };
    return {
      orderId,
      status: order.status,
      carrier: order.carrier || "unknown",
      estimatedDelivery: order.estimatedDelivery || null,
    };
  }
);

registry.register(
  "searchProducts",
  { name: "searchProducts", params: { query: "string", limit: "number" } },
  async ({ query, limit = 5 }) => {
    const q = (query || "").trim();
    if (!q) return [];

    // Extract significant words (ignore short/common ones)
    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2 && !["find", "search", "product", "show", "me", "for"].includes(t));

    if (tokens.length === 0) {
      console.log("⚠️ No valid search tokens found in query:", q);
      return [];
    }

    // Create regex array
    const regexArray = tokens.map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    console.log("🔍 Search tokens:", tokens);

    // Match if any keyword appears in name, description, category, or tags
    const results = await Product.find({
      $or: [
        { name: { $in: regexArray } },
        { description: { $in: regexArray } },
        { category: { $in: regexArray } },
        { tags: { $in: regexArray } },
      ],
    })
      .limit(limit)
      .lean();

    console.log("📦 Found products:", results.length);

    return results.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      stockQty: p.stock ?? 0,
    }));
  }
);


registry.register(
  "getCustomerOrders",
  { name: "getCustomerOrders", params: { email: "string" } },
  async ({ email }) => {
    const customer = await Customer.findOne({ email }).lean();
    if (!customer) return { error: "Customer not found" };
    return await Order.find({ customerId: customer._id }).lean();
  }
);

export default registry;
export { registry };
