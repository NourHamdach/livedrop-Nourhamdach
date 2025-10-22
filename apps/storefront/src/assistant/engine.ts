// --- src/assistant/engine.ts ---
import gtRaw from "./ground-truth.json"
import { getOrderStatus } from "../lib/api"

export type QA = { qid: string; question: string; answer: string }
type QAWithToks = QA & { toks: string[] }
export type SupportResult = {
  answer: string
  qid: string | null
  source: "order" | "faq" | "llm" | "fallback"
  meta?: { matchedQid?: string; confidence?: number }
}

// ---------- Config ----------
const BACKEND_URL ="http://localhost:5000"
const CONFIDENCE_THRESHOLD = 0.6
const MAX_QUERY_LEN = 800
const AGENT_TIMEOUT_MS = 15000
const RETRY_STATUS = new Set([429, 503])

// ---------- Tokenizer ----------
function tokenize(s: string) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
}

// ---------- Pre-tokenize Ground Truth ----------
const gt: QAWithToks[] = Array.isArray(gtRaw)
  ? gtRaw.map((item) => ({ ...item, toks: tokenize(item.question) }))
  : []

function rankFAQs(query: string) {
  const toks = tokenize(query)
  return gt
    .map((qa) => {
      const overlap = qa.toks.filter((t) => toks.includes(t)).length
      const confidence = qa.toks.length ? overlap / qa.toks.length : 0
      return { qa, overlap, confidence }
    })
    .sort((a, b) =>
      b.confidence !== a.confidence
        ? b.confidence - a.confidence
        : b.overlap - a.overlap
    )
}

// ---------- Groq backend call ----------
async function askGroqViaBackend(
  query: string,
  faqs: (QA & { confidence?: number })[],
  order?: string
): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS)

  try {
    const res = await fetch(`${BACKEND_URL}/api/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, faqs, order }),
      mode: "cors",
      signal: controller.signal,
    })

    const text = await res.text().catch(() => "")
    const data = (() => {
      try {
        return JSON.parse(text)
      } catch {
        return {}
      }
    })()
    return (data?.answer ?? "").trim() || null
  } catch (err) {
    console.error("SupportAPI/agent fetch error:", err)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------- Main logic ----------
export async function askSupport(query: string): Promise<SupportResult> {
  const cleanQuery = (query ?? "").trim().slice(0, MAX_QUERY_LEN)
  if (!cleanQuery) {
    return {
      answer:
        "Ask me about store policies or paste your order ID and I’ll check the status.",
      qid: null,
      source: "fallback",
    }
  }

  // --- 1) Detect order ID in query (10+ alphanumeric)
 const orderIdMatch = cleanQuery.match(/\b[A-Z0-9]{6,12}\b/i)
  console.log("Detected order ID:", orderIdMatch)
  let orderStatusData: any = null

  if (orderIdMatch) {
    const orderId = orderIdMatch[0].toUpperCase()
    try {
      const status = await getOrderStatus(orderId)
      if (status) orderStatusData = { ...status }
    } catch (err) {
      console.error("Order lookup failed:", err)
    }
  }

  // --- 2) Rank FAQs
const ranked = rankFAQs(cleanQuery)
const filteredFaqs = ranked.filter((r) => r.confidence >= CONFIDENCE_THRESHOLD)
const topFaqs = filteredFaqs.slice(0, 3).map((r) => ({
  ...r.qa,
  confidence: r.confidence,
}))
const best = ranked[0]
const bestConf = best?.confidence ?? 0

  // --- 3) Build order context (if any)
  let orderContext: string | undefined
  if (orderStatusData) {
    const masked = orderStatusData.id
    const parts = [
      `Order ${masked} — Status: ${orderStatusData.status}`,
      orderStatusData.carrier && `Carrier: ${orderStatusData.carrier}`,
      orderStatusData.eta && `ETA: ${orderStatusData.eta}`,
    ].filter(Boolean)
    orderContext = parts.join(" · ")
  }

  // --- 4) Always try LLM first (with order context if available)
  const llmAnswer = await askGroqViaBackend(cleanQuery, topFaqs, orderContext)

  if (llmAnswer) {
    const qid = bestConf >= CONFIDENCE_THRESHOLD ? best!.qa.qid : "llm"
    return {
      answer: llmAnswer,
      qid,
      source: "llm",
      meta: best
        ? { matchedQid: best.qa.qid, confidence: bestConf }
        : undefined,
    }
  }

  // --- 5) Fallback chain: order → FAQ → fallback
  if (orderContext) {
    return { answer: orderContext, qid: "order", source: "order" }
  }

  if (bestConf >= CONFIDENCE_THRESHOLD) {
    return {
      answer: best.qa.answer,
      qid: best.qa.qid,
      source: "faq",
      meta: { matchedQid: best.qa.qid, confidence: bestConf },
    }
  }

  return {
    answer:
      "I can only answer questions about our store policies or check order status.",
    qid: null,
    source: "fallback",
  }
}
