// apps/api/tests/identity.test.js
import { describe, it, expect } from "vitest";
import { assistantHandler } from "../src/assistant/engine.js";

describe("Assistant Identity & Personality", () => {
  it("has a human-like name (not ChatGPT/Llama)", async () => {
    const res = await assistantHandler("What's your name?");
    expect(res.text).toMatch(/nora/i);
    expect(res.text).not.toMatch(/chatgpt|llama|openai|meta|anthropic/i);
  });

  it("responds naturally to 'Are you a robot?'", async () => {
    const res = await assistantHandler("Are you a robot?");
    expect(res.text).toMatch(/support|team|specialist|assistant/i);
    expect(res.text).not.toMatch(/language model|ai|artificial/i);
  });

  it("references the company/team when asked who created it", async () => {
    const res = await assistantHandler("Who created you?");
    expect(res.text).toMatch(/store|team|company|support/i);
    expect(res.text).not.toMatch(/openai|meta|anthropic/i);
  });
});
