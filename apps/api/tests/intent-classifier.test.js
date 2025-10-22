import { describe, it, expect } from "vitest";
import { classifyIntent } from "../src/assistant/intent-classifier.js";

describe("Intent Detection – classifyIntent()", () => {
  const examples = {
    policy_question: [
      "What is your return policy?",
      "Do you refund damaged items?",
      "Tell me about shipping options.",
      "How long is the warranty?",
      "Can I exchange an item?"
    ],
    order_status: [
      "Where is my order?",
      "Track order 64f2b0a1f8c2a3a8b3f9e123",
      "Has my package shipped?",
      "When will my delivery arrive?",
      "Order status please"
    ],
    product_search: [
      "Find leather jackets",
      "Do you have sneakers?",
      "Search for wireless headphones",
      "Show me T-shirts",
      "Looking for gaming laptops"
    ],
    complaint: [
      "My order arrived broken",
      "The item I got is damaged",
      "Refund problem please",
      "Package missing parts",
      "Delivery was late"
    ],
    chitchat: [
      "Hello there",
      "Good morning!",
      "Thanks Nora",
      "Hey how are you?",
      "Good evening"
    ],
    off_topic: [
      "What’s the weather like?",
      "Did you watch the game?",
      "Who won the election?",
      "Play me a song",
      "Do you like pizza?"
    ],
    violation: [
      "You are stupid",
      "I hate you",
      "You’re an idiot",
      "Go to hell",
      "Shut up"
    ]
  };

  for (const [intent, phrases] of Object.entries(examples)) {
    it(`detects ${intent}`, () => {
      for (const text of phrases) {
        const res = classifyIntent(text);

        // Flexible match: intent or fallbackIntent
        const match =
          res.intent === intent ||
          res.fallbackIntent === intent;

        // Log diagnostic info for debugging
        if (!match) {
          console.warn(
            `⚠️ Mismatch for "${text}"\n` +
            `   → Got intent: ${res.intent}, fallback: ${res.fallbackIntent}, confidence: ${res.confidence}`
          );
        }

        // Accept low-confidence clarifications with correct fallback
        if (res.intent === "clarification_needed") {
          expect(res.fallbackIntent).toBe(intent);
        } else {
          expect(match).toBe(true);
        }

        // Confidence should always be a known label
        expect(["high", "medium", "low", "none"]).toContain(res.confidence);
      }
    });
  }

  it("handles empty text as off_topic", () => {
    for (const text of ["", "   ", "...", "???"]) {
      const res = classifyIntent(text);
      expect(res.intent).toBe("off_topic");
    }
  });

  it("detects 24-char hex order IDs", () => {
    const res = classifyIntent("Where is my order 64f2b0a1f8c2a3a8b3f9e123");
    expect(res.intent).toBe("order_status");
    expect(res.confidence).toBe("high");
    expect(res.matched).toContain("orderId");
  });

  it("handles mixed intent queries gracefully", () => {
    const res = classifyIntent("Can I return my broken item?");
    expect(
      ["complaint", "policy_question", "clarification_needed"]
    ).toContain(res.intent);
  });
});
