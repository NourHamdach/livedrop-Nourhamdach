// apps/api/src/models/customer.model.js
import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Customer", CustomerSchema);
