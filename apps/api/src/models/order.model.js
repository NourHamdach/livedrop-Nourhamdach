// apps/api/src/models/order.model.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items: [OrderItemSchema],
  total: Number,
  status: { type: String, enum: ["PENDING","PROCESSING","SHIPPED","DELIVERED"], default: "PENDING" },
  carrier: String,
  estimatedDelivery: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  meta: {
  idempotencyKey: { type: String, index: true, sparse: true },
}
});

export default mongoose.model("Order", OrderSchema);
