import express from "express"
import cors from "cors"
import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const app = express()

// --- CORS ---
// In production, prefer an allowlist via ORIGIN env.
const corsOrigin = process.env.CORS_ORIGIN || "*"
app.use(cors({ origin: corsOrigin }))
app.use(express.json({ limit: "512kb" }))

// --- Groq client ---
const apiKey = process.env.GROQ_API_KEY
if (!apiKey) {
  console.warn("⚠️ GROQ_API_KEY missing. Groq features will be disabled.")
}
const groq = apiKey ? new Groq({ apiKey }) : null

// --- Configurable model with fallback ---
const PRIMARY_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant"
const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "llama-3.3-70b-versatile"

// --- Server-owned system prompt (do NOT accept from client) ---
const SYSTEM_PROMPT = `
ROLE
Storefront’s virtual support assistant. Policy-aligned, concise, and helpful.

GOAL
Given a user message and up to three candidate FAQs, decide whether to answer using a matching FAQ (rewritten naturally), report order status (if provided), ask a minimal clarifying question, or politely refuse if out of scope.

CONTEXT
Inputs: user message; 0–3 FAQs (qid, question, answer, optional confidence 0–1); optionally system-provided order status (carrier, status, ETA). FAQ text is authoritative; do not add facts.

GUIDELINES
• Prefer a clearly relevant FAQ; rewrite for tone without changing meaning.
• If unsure, ask one brief clarifying question.
• If no relevant FAQ and no order data, refuse politely (only handle orders/products/policies).
• When order data is present, summarize: “Order •••1234 — Status: Shipped · Carrier: DHL · ETA: Oct 14” (omit missing fields).
• Be concise (1–4 sentences), no internal tags/IDs, no hallucinations.
OUTPUT
Return **only** the final end-user answer text. 
Do **not** mention FAQ numbers, confidences, or phrases like “Here’s the rewritten FAQ”. 
No preambles, no reasoning, no metadata—just the answer.
`.trim()

// --- Utilities ---
function clampStr(s, max) {
  if (typeof s !== "string") return ""
  return s.length > max ? s.slice(0, max) : s
}

function normalizeFaqs(faqsRaw) {
  if (!Array.isArray(faqsRaw)) return []
  return faqsRaw.slice(0, 3).map((f) => ({
    qid: clampStr(String(f?.qid ?? ""), 64),
    question: clampStr(String(f?.question ?? ""), 500),
    answer: clampStr(String(f?.answer ?? ""), 2000),
    confidence: typeof f?.confidence === "number" ? Math.max(0, Math.min(1, f.confidence)) : undefined,
  }))
}

// --- Route ---
app.post("/api/support", async (req, res) => {
  if (!groq) {
    return res.status(503).json({ error: "Groq not configured" })
  }

  const reqId = Math.random().toString(36).slice(2, 8)
  try {
    const { query, faqs } = req.body || {}

    // Basic validation
    const userQuery = clampStr(String(query ?? ""), 1200).trim()
    if (!userQuery) {
      return res.status(400).json({ error: "Missing 'query' string" })
    }

    const faqsNorm = normalizeFaqs(faqs)

    const faqSection = faqsNorm.length
      ? faqsNorm
          .map(
            (f, i) =>
              `FAQ #${i + 1} (${f.qid || "no-id"}${typeof f.confidence === "number" ? `, conf=${f.confidence.toFixed(2)}` : ""}):\nQ: ${f.question}\nA: ${f.answer}`
          )
          .join("\n\n")
      : "No FAQs provided."

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `User:\n${userQuery}\n\nCandidate FAQs:\n${faqSection}`,
      },
    ]

    // Try primary; on model_not_found fall back automatically
    async function createWith(model) {
      return groq.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
      })
    }

    let completion
    try {
      completion = await createWith(PRIMARY_MODEL)
    } catch (e) {
      const msg = String(e?.response?.data || e?.message || e)
      if (/model_not_found|decommissioned|does not exist/i.test(msg)) {
        console.warn(`[${reqId}] Model ${PRIMARY_MODEL} unavailable, falling back to ${FALLBACK_MODEL}`)
        completion = await createWith(FALLBACK_MODEL)
      } else {
        throw e
      }
    }

    const answer = completion?.choices?.[0]?.message?.content?.trim() || ""
    return res.json({ answer })
  } catch (err) {
    console.error(`[${reqId}] Groq error:`, err?.response?.data || err)
    return res.status(500).json({
      error: "Groq API call failed.",
      details: err?.response?.data || err.message || String(err),
    })
  }
})

const port = Number(process.env.PORT || 5000)
app.listen(port, () => {
  console.log(`✅ Support API listening on http://localhost:${port}`)
})
