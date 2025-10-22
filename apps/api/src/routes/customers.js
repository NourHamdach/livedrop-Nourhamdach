//apps/api/src/routes/customers.js
import { Router } from "express";
import Customer from "../models/customer.model.js";

const router = Router();

/**
 * GET /api/customers?email=user@example.com
 * Simple customer lookup by email (no authentication)
 */
router.get("/", async (req, res) => {
  try {
    const email = (req.query.email || "").toLowerCase();
    if (!email) return res.status(400).json({ error: "Email query param required" });

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer by email:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/customers/:id
 * Retrieve full customer profile by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
