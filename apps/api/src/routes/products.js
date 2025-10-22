//apps/api/src/routes/products.js
import { Router } from "express";
import Product from "../models/product.model.js";

const router = Router();

/**
 * GET /api/products?search=&tag=&sort=&page=&limit=
 * Supports filtering, tag matching, sorting, and pagination
 */
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      tag = "",
      sort = "asc",
      page = 1,
      limit = 20
    } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (tag) query.tags = tag;

    const products = await Product.find(query)
      .sort({ price: sort === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      results: products
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/products
 * Add a new product to the database
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, tags, imageUrl, stock } = req.body;

    if (!name || !price)
      return res.status(400).json({ error: "Name and price are required" });

    const product = await Product.create({
      name,
      description,
      price,
      category,
      tags,
      imageUrl,
      stock
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
