// --- engine.ts ---
import gtRaw from "./ground-truth.json"
import { getOrderStatus } from "../lib/api"

export type QA = { qid: string; question: string; answer: string }
type QAWithToks = QA & { toks: string[] }
type QuestionScore = { qa: QAWithToks; overlap: number; confidence: number }
export type SupportResult = {
  answer: string
  qid: string | null
  source: "order" | "faq" | "llm" | "fallback"
  meta?: { matchedQid?: string; confidence?: number }
}

// ---------- Config ----------
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
const CONFIDENCE_THRESHOLD = 0.6
const MAX_QUERY_LEN = 800
const AGENT_TIMEOUT_MS = 15000
const RETRY_STATUS = new Set([429, 503])

// ---------- Tokenizer ----------
export function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
}

// ---------- Pre-tokenize ground truth ----------
const gt: QAWithToks[] = Array.isArray(gtRaw)
  ? (gtRaw as QA[]).map((item) => ({ ...item, toks: tokenize(item.question) }))
  : []

function scoreQuestion(queryToks: string[], qa: QAWithToks): QuestionScore {
  const overlap = qa.toks.filter((t) => queryToks.includes(t)).length
  const confidence = qa.toks.length ? overlap / qa.toks.length : 0
  return { qa, overlap, confidence }
}

function rankFAQs(query: string) {
  const toks = tokenize(query)
  // primary: confidence desc; tie-break 1: overlap desc; tie-break 2: question length asc
  return gt
    .map((qa) => scoreQuestion(toks, qa))
    .sort((a, b) =>
      b.confidence !== a.confidence
        ? b.confidence - a.confidence
        : b.overlap !== a.overlap
        ? b.overlap - a.overlap
        : a.qa.question.length - b.qa.question.length
    )
}

// ---------- Backend proxy to LLM (agent decides) ----------
export type FAQCandidate = QA & { confidence?: number }

async function askGroqViaBackend(
  query: string,
  faqs: FAQCandidate[]
): Promise<string | null> {
  // small retry for transient errors
  const attempt = async (): Promise<{ ok: boolean; answer?: string; status?: number; text?: string }> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS)
    try {
      const res = await fetch(`${BACKEND_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, faqs }),
        mode: "cors",
        signal: controller.signal,
      })
      const text = await res.text().catch(() => "")
      if (!res.ok) return { ok: false, status: res.status, text }
      // safe parse
      const data = (() => {
        try { return JSON.parse(text) } catch { return {} }
      })()
      const answer = (data?.answer ?? "").trim()
      return { ok: true, answer }
    } catch (err) {
      console.error("SupportAPI/agent fetch error:", err)
      return { ok: false }
    } finally {
      clearTimeout(timeout)
    }
  }

  const first = await attempt()
  if (first.ok) return first.answer || null
  if (first.status && RETRY_STATUS.has(first.status)) {
    // tiny backoff
    await new Promise((r) => setTimeout(r, 200))
    const second = await attempt()
    if (second.ok) return second.answer || null
  }
  if (first.text) console.error("SupportAPI/agent failure:", first.text)
  return null
}

// ---------- Public entry ----------
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

  // 1) Order detection
  const orderIdMatch = cleanQuery.match(/\b[A-Z0-9]{10,}\b/i)
  if (orderIdMatch) {
    try {
      const orderId = orderIdMatch[0].toUpperCase()
      const status = await getOrderStatus(orderId)
      if (status) {
        const maskedId = "•••" + orderId.slice(-4)
        const parts = [
          `Order ${maskedId} — Status: ${status.status}`, // capital S + label
          status.carrier ? `Carrier: ${status.carrier}` : "",
          status.eta ? `ETA: ${status.eta}` : "",         // "ETA" to match test

        ].filter(Boolean)
        return { answer: parts.join(" · "), qid: "order", source: "order" }
      }
    } catch (err) {
      console.error("SupportAPI/order lookup failed:", err)
      // continue
    }
  }

  // 2) Retrieve FAQ candidates (early exit if GT is empty)
  const ranked = rankFAQs(cleanQuery)
  const topFaqs: FAQCandidate[] = ranked.slice(0, 3).map((s) => ({
    qid: s.qa.qid,
    question: s.qa.question,
    answer: s.qa.answer,
    confidence: s.confidence,
  }))

  const best = ranked[0]
  const bestConf = best?.confidence ?? 0

  // 3) Delegate to agent (LLM) — even with empty faqs, agent will refuse/clarify
  const llmAnswer = await askGroqViaBackend(cleanQuery, topFaqs)
  if (llmAnswer) {
    // safer qid tagging: only attribute to best when it's actually strong
    const qid = bestConf >= CONFIDENCE_THRESHOLD ? best!.qa.qid : "llm"
    return {
      answer: llmAnswer,
      qid,
      source: "llm",
      meta: best ? { matchedQid: best.qa.qid, confidence: bestConf } : undefined,
    }
  }

  // 4) Fallback to local best if strong enough
  if (bestConf >= CONFIDENCE_THRESHOLD) {
    return {
      answer: best.qa.answer,
      qid: best.qa.qid,
      source: "faq",
      meta: { matchedQid: best.qa.qid, confidence: bestConf },
    }
  }

  // 5) Final refusal
  return {
    answer:
      "I can only answer questions about our store policies or check order status.",
    qid: null,
    source: "fallback",
  }
}
