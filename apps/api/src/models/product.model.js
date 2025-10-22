// apps/api/src/models/product.model.js
import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  tags: [String],
  imageUrl: String,
  stock: { type: Number, default: 0 }
});

export default mongoose.model("Product", ProductSchema);

