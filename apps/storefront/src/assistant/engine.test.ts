// apps/storefront/src/assistant/engine.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// 1) Mock ground-truth data used by engine.ts
vi.mock("./ground-truth.json", () => ({
  default: [
    { qid: "RETURNS", question: "What is your return policy?", answer: "You can return items within 14 days." },
    { qid: "TRACK",   question: "How do I track my order?",   answer: "Use your order ID on the Order Status page." },
    { qid: "SHIP",    question: "Do you ship internationally?", answer: "Yes, we ship worldwide." },
  ],
}))

// 2) Mock lib/api for order status
vi.mock("../lib/api", () => ({
  getOrderStatus: vi.fn(),
}))
import { getOrderStatus } from "../lib/api"

// 3) Import the function under test (after mocks)
import { askSupport } from "./engine"

// 4) Test helpers to stub fetch (the backend /api/support)
function mockFetchOnce(body: any, ok = true, status = 200, statusText = "OK") {
  (globalThis as any).fetch = vi.fn().mockResolvedValueOnce({
    ok,
    status,
    statusText,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response)
}

function mockFetchErrorOnce(status = 500, statusText = "Internal Server Error", body = { error: "Boom" }) {
  (globalThis as any).fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response)
}

describe("askSupport()", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // sensible default env
    ;(import.meta as any).env = {
      ...((import.meta as any).env || {}),
      VITE_BACKEND_URL: "http://localhost:5000",
    }
  })

  afterEach(() => {
    // remove any mock fetch to avoid cross-test bleed
    ;(globalThis as any).fetch = undefined
  })

  it("returns a friendly nudge for empty input", async () => {
    const res = await askSupport("")
    expect(res.source).toBe("fallback")
    expect(res.answer.toLowerCase()).toContain("ask me about store policies")
  })

  it("detects order ID and returns summarized status", async () => {
    ;(getOrderStatus as any).mockResolvedValueOnce({
      status: "Shipped",
      carrier: "DHL",
      eta: "Oct 14",
    })
    const res = await askSupport("Check order ABCDEFGHIJ1 please")
    expect(getOrderStatus).toHaveBeenCalled()
    expect(res.source).toBe("order")
    expect(res.answer).toContain("Status: Shipped")
    expect(res.answer).toContain("Carrier: DHL")
    expect(res.answer).toContain("ETA: Oct 14")
  })

  it("falls back to best FAQ when LLM backend 500s and confidence > 0.6", async () => {
    // Simulate backend error
    mockFetchErrorOnce(500, "Internal Server Error", { error: "Groq API call failed." })
    const res = await askSupport("How can I track my package?")
    // With our mocked FAQ list, token overlap should make TRACK best (>0.6)
    expect(res.source).toBe("faq")
    expect(res.qid).toBe("TRACK")
    expect(res.answer).toBe("Use your order ID on the Order Status page.")
  })

  it("uses LLM agent answer when backend returns ok", async () => {
    mockFetchOnce({ answer: "You can return any item within 14 days of delivery." })
    const res = await askSupport("What's your return policy?")
    expect(res.source).toBe("llm")
    expect(res.answer).toBe("You can return any item within 14 days of delivery.")
    // The engine sends top FAQs; verify fetch called with that payload shape
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = (globalThis.fetch as any).mock.calls[0]
    expect(url).toMatch(/\/api\/support$/)
    const body = JSON.parse(init.body)
    expect(typeof body.query).toBe("string")
    expect(Array.isArray(body.faqs)).toBe(true)
    expect(body.faqs.length).toBeGreaterThan(0)
    expect(body.faqs[0]).toHaveProperty("qid")
    expect(body.faqs[0]).toHaveProperty("answer")
    expect(body.faqs[0]).toHaveProperty("confidence")
  })

  it("refuses politely when no FAQ is relevant and LLM fails", async () => {
    mockFetchErrorOnce(500, "Internal Server Error", { error: "Groq API call failed." })
    const res = await askSupport("Give me stock tips?")
    expect(res.source).toBe("fallback")
    expect(res.answer.toLowerCase()).toContain("only answer")
  })

  it("handles order lookup failure and proceeds to retrieval", async () => {
    ;(getOrderStatus as any).mockRejectedValueOnce(new Error("network down"))
    mockFetchOnce({ answer: "We ship worldwide to most regions." })
    const res = await askSupport("do you ship internationally?")
    expect(res.source).toBe("llm")
    expect(res.answer.toLowerCase()).toContain("ship worldwide")
  })
})
