// apps/api/tests/function-calling.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { assistantHandler, registry } from "../src/assistant/engine.js";

describe("Assistant Function Calling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls getOrderStatus for order queries", async () => {
    // Mock successful order lookup
    registry.execute = vi.fn().mockResolvedValue({
      status: "DELIVERED",
      carrier: "DHL",
      estimatedDelivery: "2025-10-21",
    });

    const res = await assistantHandler(
      "Check my order 123456789012345678901234",
      { customerId: "c1" }
    );

    expect(registry.execute).toHaveBeenCalledWith("getOrderStatus", {
      orderId: expect.stringMatching(/[a-f0-9]{24}/i),
      customerId: "c1",
    });
    expect(res.text).toContain("DELIVERED");
  });

  it("calls searchProducts for product queries", async () => {
    registry.execute = vi.fn().mockResolvedValue([
      { name: "Laptop", price: 999 },
      { name: "Mouse", price: 30 },
    ]);

    const res = await assistantHandler("find laptop");

    expect(registry.execute).toHaveBeenCalledWith("searchProducts", {
      query: "find laptop",
      limit: 5,
    });
    expect(res.text).toContain("Laptop");
    expect(res.text).toContain("Mouse");
  });

  it("answers policy question using knowledge base (no function call)", async () => {
    registry.execute = vi.fn();

    const res = await assistantHandler("What is your return policy?");
    expect(registry.execute).not.toHaveBeenCalled();

    // Must cite a policy ID from any category
    expect(res.text).toMatch(
      /\[(returns|shipping|warranty|privacy|payment|taxes)[0-9.]+\]/i
    );
  });
});
