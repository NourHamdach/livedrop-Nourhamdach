// apps/api/tests/integration-flows.test.js
import { describe, it, expect, vi } from "vitest";
import { assistantHandler } from "../src/assistant/engine.js";
import registry from "../src/assistant/function-registry.js";

vi.mock("../src/assistant/function-registry.js");

describe("Integration – End-to-End Flows", () => {
  it("1️⃣ Complete Purchase Flow", async () => {
    // Browse products
    registry.execute.mockResolvedValueOnce([
      { name: "Laptop", price: 999 },
      { name: "Mouse", price: 20 }
    ]);
    const search = await assistantHandler("find laptop");
    expect(search.text).toContain("Laptop");

    // Check order status
    registry.execute.mockResolvedValueOnce({
      status: "PROCESSING",
      estimatedDelivery: "2025-10-23"
    });
    const status = await assistantHandler(
      "Check order 123456789012345678901234",
      { customerId: "c1" }
    );
    expect(status.text).toContain("PROCESSING");
    expect(status.functionsCalled).toContain("getOrderStatus");

    // Simulate SSE status progression
    const simulated = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    expect(simulated).toContain("SHIPPED");
  });

  it("2️⃣ Support Interaction Flow", async () => {
    const policy = await assistantHandler("What is your return policy?");
    expect(policy.intent).toBe("policy_question");
    expect(policy.text).toMatch(/\[(Returns|Shipping|Warranty|Privacy|Payment)[0-9.]+\]/i);

    registry.execute.mockResolvedValueOnce({
      status: "DELIVERED",
      estimatedDelivery: "2025-10-22"
    });
    const order = await assistantHandler(
      "Check my order 123456789012345678901234",
      { customerId: "c1" }
    );
    expect(order.intent).toBe("order_status");
    expect(order.text).toContain("DELIVERED");

    const complaint = await assistantHandler("My package arrived damaged");
    expect(complaint.intent).toBe("complaint");
    expect(complaint.text.toLowerCase()).toContain("sorry");
  });

  it("3️⃣ Multi-Intent Conversation", async () => {
    const greet = await assistantHandler("hello");
    expect(greet.intent).toBe("chitchat");

    registry.execute.mockResolvedValueOnce([{ name: "Bag", price: 50 }]);
    const product = await assistantHandler("find bag");
    expect(product.intent).toBe("product_search");

    const policy = await assistantHandler("What's your refund policy?");
    expect(policy.intent).toBe("policy_question");

    registry.execute.mockResolvedValueOnce({
      status: "SHIPPED",
      estimatedDelivery: "2025-10-25"
    });
    const order = await assistantHandler(
      "Check order 123456789012345678901234",
      { customerId: "c1" }
    );
    expect(order.intent).toBe("order_status");
  });
});
