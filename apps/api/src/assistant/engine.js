// apps/api/src/assistant/engine.js
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";
import AssistantLog from "../models/assistantLog.model.js";
import { classifyIntent } from "./intent-classifier.js";
import registry from "./function-registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_PATH = path.resolve(__dirname, "../../docs");
const GROUND_TRUTH_PATH = path.join(DOCS_PATH, "ground-truth.json");
const PROMPTS_PATH = path.join(DOCS_PATH, "prompts.yaml");

// ---------- Load configuration ----------
function loadSafeJSON(filePath, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    console.warn(`⚠️ Could not load ${path.basename(filePath)}`);
    return fallback;
  }
}

function loadSafeYAML(filePath, fallback = {}) {
  try {
    return yaml.load(fs.readFileSync(filePath, "utf-8")) || fallback;
  } catch {
    console.warn(`⚠️ Could not load ${path.basename(filePath)}`);
    return fallback;
  }
}

let groundTruth = loadSafeJSON(GROUND_TRUTH_PATH);
let promptsConfig = loadSafeYAML(PROMPTS_PATH);

// ---------- Utilities ----------
function sanitizeInput(str) {
  return String(str ?? "")
    .replace(/[${}<>;]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function applyNeverSayFilters(text) {
  if (typeof text !== "string") text = String(text ?? "");
  const filters = promptsConfig.never_say;
  if (!Array.isArray(filters)) return text;
  return filters.reduce((t, banned) => {
    const regex = new RegExp(banned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return t.replace(regex, "");
  }, text).trim();
}

// ---------- Identity shortcuts ----------
function handleIdentityQuery(q) {
  const query = q.toLowerCase();
  const idCfg = promptsConfig.identity || {};
  if (query.includes("your name"))
    return idCfg.nameResponse || `I’m ${idCfg.name || "Nora"}, your ${idCfg.role || "Support Specialist"}.`;
  if (query.includes("are you a robot"))
    return idCfg.robotResponse || "Not exactly — I'm here to help with your orders and store questions.";
  if (query.includes("who created"))
    return idCfg.createdByResponse || "I was created by the Storefront development team.";
  return null;
}

// ---------- Policy matching ----------
function findRelevantPolicies(userQuery) {
  const query = sanitizeInput(userQuery).toLowerCase();
  const categoryKeywords = {
    returns: ["return", "refund", "exchange", "money back"],
    shipping: ["ship", "shipping", "delivery", "carrier", "eta", "track", "tracking"],
    warranty: ["warranty", "guarantee"],
    privacy: ["privacy", "personal data", "data"],
    payment: ["payment", "card", "charge", "billing"],
    taxes: ["tax", "duty", "duties"],
    giftcards: ["gift card", "giftcard"],
    discounts: ["promo", "discount", "coupon"],
    preorder: ["preorder", "pre-order"],
    cancellations: ["cancel", "modify order"],
  };

  const match = Object.entries(categoryKeywords).find(([_, kws]) =>
    kws.some((kw) => query.includes(kw))
  );
  return match ? groundTruth.filter((p) => p.category === match[0]) : [];
}

// ---------- Citation validation ----------
function validateCitations(text) {
  const pattern = /\[([A-Za-z]+[0-9.]+)\]/g;
  const found = [];
  let m;
  while ((m = pattern.exec(text)) !== null) found.push(m[1]);
  const valid = found.filter((id) => groundTruth.some((p) => p.id === id));
  const invalid = found.filter((id) => !valid.includes(id));
  return { isValid: invalid.length === 0, validCitations: valid, invalidCitations: invalid };
}

// ---------- LLM proxy ----------
async function maybeGenerateWithLLM(prompt) {
  const url = process.env.LLM_GENERATE_URL;
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    console.log("Sending to LLM:", { prompt, max_tokens: 500 });
    const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify({ prompt, max_tokens: 500 }),
  signal: controller.signal,
});
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn("⚠️ LLM /generate non-200:", res.status);
      return null;}
    const data = await res.json();
    return typeof data.text === "string" ? data.text.trim() : null;
  } catch (err) {
    console.warn("⚠️ LLM /generate failed:", err.message);
    return null;
  }
}

// ---------- Prompt builder ----------
function buildPrompt(intent, groundedText, userQuery) {
  const id = promptsConfig.identity || {};
  const cfg = promptsConfig.intents?.[intent] || {};
  const tone = cfg.tone || "neutral";
  const pre = cfg.preface ? `${cfg.preface}\n\n` : "";
  const post = cfg.postnote ? `\n\n${cfg.postnote}` : "";
  const guidelines = (promptsConfig.guidelines || []).map((g) => `- ${g}`).join("\n");
  const userPart = userQuery ? `User asked: "${userQuery}"\n\n` : "";

  return `
You are ${id.name || "Nora"}, ${id.role || "Support Specialist"}.
Personality: ${id.personality || "helpful and concise"}.
Tone: ${tone}
Guidelines:
${guidelines}

${pre}${userPart}${groundedText}${post}
`.trim();
}

// ---------- Extract orderId ----------
function extractOrderId(q, ctx) {
  const match = q.match(/([a-f0-9]{24})/i);
  return match ? match[0] : ctx.orderId || ctx.order_id || null;
}

// ---------- Main handler ----------
export async function assistantHandler(input, context = {}) {
  const start = performance.now();
  const query = sanitizeInput(input);
  const { intent, score } = classifyIntent(query);
  const functionsCalled = [];
  const idResponse = handleIdentityQuery(query);
  if (idResponse) {
    return await logAndReturn(query, "chitchat", idResponse, [], start, context, score);
  }

  let text = "";
  let citations = [];

  try {
    switch (intent) {
      case "policy_question": {
        const policies = findRelevantPolicies(query);
        if (!policies.length) {
          text = promptsConfig.intents?.policy_question?.refusal ||
            "I couldn’t find a related policy. Could you clarify what you meant?";
          break;
        }
        const grounded = policies
          .slice(0, 2)
          .map((p) => `${p.answer} [${p.id}]`)
          .join("\n\n");
        citations = policies.map((p) => p.id);
        const llmText = await maybeGenerateWithLLM(buildPrompt(intent, grounded, query));
        text = applyNeverSayFilters(llmText || grounded);
        break;
      }

      
case "order_status": {
  const orderId = extractOrderId(query, context);
  if (!orderId) {
    text = "Please provide your order ID so I can check its status.";
    break;
  }

  const res = await registry.execute("getOrderStatus", {
    orderId,
    customerId: context.customerId,
  });
  functionsCalled.push("getOrderStatus");

  // FIX: Check if res exists before accessing properties
  if (!res || res.error) {
    text = res?.error === "Access denied"
      ? "You don't have permission to view this order."
      : "I couldn't find that order. Please double-check your ID.";
  } else {
    const raw = `Order ${res.orderId} is ${res.status} with ${res.carrier || "unknown"}.
Estimated delivery: ${res.estimatedDelivery ? new Date(res.estimatedDelivery).toDateString() : "unknown"}.`;

    const llmText = await maybeGenerateWithLLM(buildPrompt("order_status", raw, query));
    text = llmText || raw;
  }
  break;
}


      // WITH THIS:
case "product_search": {
  const results = await registry.execute("searchProducts", { query, limit: 5 });
  functionsCalled.push("searchProducts");
  
  // FIX: Check if results exists and is an array
  if (!results || !Array.isArray(results) || results.length === 0) {
    text = `I couldn't find products matching "${query}." Try another keyword or category.`;
  } else {
    const list = results.map((p) => `• ${p.name} — $${p.price}`).join("\n");
    const llmText = await maybeGenerateWithLLM(buildPrompt(intent, list, query));
    text = llmText || `I found ${results.length} matching products:\n${list}`;
  }
  break;
}
      case "complaint":
        text =
          promptsConfig.intents?.complaint?.preface ||
          "I'm really sorry to hear that. Please share your order ID and describe what went wrong.";
        break;

      case "chitchat":
        text =
          promptsConfig.identity?.greeting ||
          "Hi! I'm Nora, your Storefront Support Specialist. How can I help you today?";
        break;

      case "off_topic":
        text =
          promptsConfig.intents?.off_topic?.refusal ||
          "I’m here to help with orders, returns, and store policies. Could you ask something related?";
        break;

      case "violation":
        text =
          promptsConfig.intents?.violation?.refusal ||
          "I can’t continue this conversation. Please use respectful language.";
        break;

      default:
        text = "I'm not sure how to help with that. Could you rephrase?";
    }

    const citationReport = validateCitations(text);
    return await logAndReturn(query, intent, text, functionsCalled, start, context, score, citationReport);
  } catch (err) {
    console.error("❌ Assistant handler error:", err);
    return await logAndReturn(query, "error", "Something went wrong. Please try again later.", functionsCalled, start, context, score, null, err);
  }
}

// ---------- Logging ----------
async function logAndReturn(query, intent, text, functionsCalled, start, context, score, citationReport = { validCitations: [] }, error = null) {
  const responseTimeMs = Math.max(0, performance.now() - start || 0);
  const logDoc = {
    query,
    intent: String(intent),
    functionsCalled,
    responseTimeMs,
    score: score || 1.0,
    response: {
      text,
      citations: citationReport?.validCitations || [],
      tone: promptsConfig?.intents?.[intent]?.tone || "neutral",
    },
    customerId: context.customerId || null,
    error: error?.message || null,
  };

  // Non-blocking logging (don’t await)
  AssistantLog.create(logDoc).catch((e) => console.warn("⚠️ Log failure:", e.message));

  return {
    text: applyNeverSayFilters(text),
    intent,
    score: logDoc.score,
    citations: logDoc.response.citations,
    tone: logDoc.response.tone,
    functionsCalled,
    responseTimeMs,
  };
}

export default assistantHandler;
export { registry };
