// apps/api/src/routes/assistant.js
import express from "express";
import { assistantHandler } from "../assistant/engine.js";

const router = express.Router();

/**
 * POST /api/assistant
 * Handle queries to the support assistant
 */
router.post("/", async (req, res) => {
  try {
    const { input, context = {} } = req.body;
    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Missing or invalid input text." });
    }

    const response = await assistantHandler(input, context);
    res.json(response);
  } catch (err) {
    console.error("❌ Assistant route error:", err);
    res.status(500).json({ error: "Assistant failed", details: err.message });
  }
});

export default router;
