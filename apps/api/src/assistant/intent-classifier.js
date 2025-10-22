// src/assistant/intent-classifier.js
// ----------------------------------------------------
// Intent Classifier: Lightweight heuristic NLP engine
// ----------------------------------------------------

const COMPILED_PATTERNS = new Map();

// --- Core Configuration ---

const CONFIDENCE_THRESHOLD = 0.35; // The minimum *absolute* score to be considered a match.
const MULTI_MATCH_BOOST = 1.2;
const PHRASE_MATCH_BOOST = 1.25;
const HEX24 = /[a-f0-9]{24}/i;

// --- Contextual Boosts (moved from magic numbers) ---

const BOOSTS = Object.freeze({
  // Boost for high-urgency complaint phrases
  COMPLAINT_URGENCY_BOOST: 1.8,
  // Boost for policy questions using modal verbs ("can i", "if i", etc.)
  POLICY_MODAL_BOOST: 1.5,
  // Additive boost for general negative tone
  NEGATIVE_TONE_BOOST: 1.5,
});

// --- Intent Keywords & Priority ---

// Intent → keyword patterns with weights
// You can expand this list gradually based on chat logs.
const INTENT_KEYWORDS = Object.freeze({
  violation: [
    { kw: "i hate you", w: 3.0, phrase: true },
    { kw: "you're stupid", w: 2.8, phrase: true },
    { kw: "you are stupid", w: 2.8, phrase: true },
    { kw: "you're an idiot", w: 2.8, phrase: true },
    { kw: "you are an idiot", w: 2.8, phrase: true },
    { kw: "go to hell", w: 2.7, phrase: true },
    { kw: "shut up", w: 2.5, phrase: true },
    { kw: "fuck", w: 2.3 },
    { kw: "stupid", w: 1.5 },
    { kw: "idiot", w: 1.5 },
  ],

  policy_question: [
    { kw: "return policy", w: 3.0, phrase: true },
    { kw: "refund policy", w: 3.0, phrase: true },
    { kw: "shipping policy", w: 3.0, phrase: true },
    { kw: "warranty policy", w: 3.0, phrase: true },
    { kw: "can i return", w: 2.8, phrase: true },
    { kw: "can i refund", w: 2.8, phrase: true },
    { kw: "able to return", w: 2.7, phrase: true },
    { kw: "if i return", w: 2.6, phrase: true },
    { kw: "and return", w: 2.4, phrase: true },
    { kw: "policy", w: 2.2 },
    { kw: "shipping options", w: 2.0, phrase: true },
    { kw: "how long", w: 1.8, phrase: true },
    { kw: "delivery", w: 1.5 },
    { kw: "shipping", w: 1.4 },
    { kw: "privacy", w: 1.8 },
    { kw: "warranty", w: 1.8 },
    { kw: "refund", w: 1.7 },
    { kw: "return", w: 1.6 },
    { kw: "exchange", w: 1.5 },
    { kw: "store credit", w: 1.4, phrase: true },
  ],

  complaint: [
    { kw: "never arrived", w: 3.5, phrase: true },
    { kw: "didn't arrive", w: 3.5, phrase: true },
    { kw: "still waiting", w: 3.3, phrase: true },
    { kw: "haven't received", w: 3.2, phrase: true },
    { kw: "never got", w: 3.1, phrase: true },
    { kw: "damaged", w: 3.0 },
    { kw: "broken", w: 3.0 },
    { kw: "defective", w: 2.8 },
    { kw: "wrong item", w: 2.8, phrase: true },
    { kw: "missing item", w: 2.8, phrase: true },
    { kw: "not working", w: 2.6, phrase: true },
    { kw: "late", w: 2.0 },
    { kw: "missing", w: 1.8 },
    { kw: "disappointed", w: 1.7 },
    { kw: "unhappy", w: 1.7 },
    { kw: "issue with", w: 1.5, phrase: true },
    { kw: "problem with", w: 1.5, phrase: true },
  ],

  order_status: [
    { kw: "order status", w: 3.0, phrase: true },
    { kw: "where is my", w: 3.0, phrase: true },
    { kw: "where's my", w: 3.0, phrase: true },
    { kw: "track order", w: 3.0, phrase: true },
    { kw: "tracking number", w: 3.0, phrase: true },
    { kw: "delivery status", w: 2.8, phrase: true },
    { kw: "on the way", w: 2.5, phrase: true },
    { kw: "shipment on the way", w: 2.7, phrase: true },
    { kw: "is my shipment", w: 2.6, phrase: true },
    { kw: "tracking", w: 2.0 },
    { kw: "track", w: 1.8 },
    { kw: "my order", w: 1.7, phrase: true },
    { kw: "shipment", w: 1.6 },
    { kw: "order", w: 1.0 },
  ],

  product_search: [
    { kw: "looking for", w: 2.5, phrase: true },
    { kw: "show me", w: 2.3, phrase: true },
    { kw: "do you have", w: 2.3, phrase: true },
    { kw: "do you sell", w: 2.3, phrase: true },
    { kw: "find", w: 2.0 },
    { kw: "search", w: 2.0 },
    { kw: "browse", w: 1.8 },
    { kw: "catalog", w: 1.7 },
    { kw: "available", w: 1.4 },
    { kw: "stock", w: 1.4 },
  ],

  chitchat: [
    { kw: "hello", w: 3.0 },
    { kw: "hi there", w: 3.0, phrase: true },
    { kw: "hey there", w: 3.0, phrase: true },
    { kw: "good morning", w: 2.8, phrase: true },
    { kw: "good afternoon", w: 2.8, phrase: true },
    { kw: "good evening", w: 2.8, phrase: true },
    { kw: "how are you", w: 2.7, phrase: true },
    { kw: "thank you", w: 2.5, phrase: true },
    { kw: "thanks", w: 2.2 },
    { kw: "your name", w: 2.4, phrase: true },
    { kw: "who are you", w: 2.4, phrase: true },
    { kw: "are you a robot", w: 2.4, phrase: true },
    { kw: "who created", w: 2.3, phrase: true },
    { kw: "hi", w: 2.8 },
    { kw: "hey", w: 2.8 },
    { kw: "bye", w: 2.3 },
    { kw: "goodbye", w: 2.3 },
  ],

  off_topic: [
    { kw: "tell me a joke", w: 3.0, phrase: true },
    { kw: "tell me about", w: 2.5, phrase: true },
    { kw: "movie recommendation", w: 2.8, phrase: true },
    { kw: "music recommendation", w: 2.8, phrase: true },
    { kw: "joke", w: 2.3 },
    { kw: "movie", w: 1.8 },
    { kw: "music", w: 1.8 },
    { kw: "sports", w: 1.9 },
    { kw: "politics", w: 2.0 },
    { kw: "weather", w: 1.9 },
    { kw: "game", w: 1.6 },
    { kw: "recipe", w: 1.8 },
  ],
});

const PRIORITY = [
  "violation",
  "complaint",
  "policy_question",
  "order_status",
  "product_search",
  "chitchat",
  "off_topic",
];

// --- NLP Engine ---

/**
 * Normalizes text for matching.
 * (e.g., "You're stupid!" -> "youre stupid")
 */
function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

/**
 * Compile regex once and cache it.
 * Normalizes the keyword *before* creating the regex.
 */
function getCompiledPattern(kw, isPhrase) {
  const key = `${kw}:${isPhrase}`;
  if (!COMPILED_PATTERNS.has(key)) {
    // ⚠️ FIX: Normalize the keyword itself so it matches normalized input
    const normalizedKw = normalizeText(kw);
    const escaped = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = isPhrase
      ? new RegExp(escaped.replace(/\s+/g, "\\s+"), "i") // "return policy" -> /return\s+policy/i
      : new RegExp(`\\b${escaped}\\b`, "i"); // "stupid" -> /\bstupid\b/i

    COMPILED_PATTERNS.set(key, pattern);
  }
  return COMPILED_PATTERNS.get(key);
}

/**
 * Compute intent score for one intent.
 */
function computeIntentScore(q, terms) {
  let sum = 0;
  const matched = [];

  for (const { kw, w, phrase } of terms) {
    const pattern = getCompiledPattern(kw, phrase);
    if (pattern.test(q)) {
      let weight = w * (phrase ? PHRASE_MATCH_BOOST : 1);
      sum += weight;
      matched.push(kw);
    }
  }

  if (matched.length >= 3) sum *= MULTI_MATCH_BOOST;
  return { sum: parseFloat(sum.toFixed(2)), matched };
}

/**
 * Internal function to compute raw scores for all intents.
 */
function _computeAllScores(q) {
  const scores = {};
  const matchedTerms = {};

  for (const [intent, terms] of Object.entries(INTENT_KEYWORDS)) {
    const { sum, matched } = computeIntentScore(q, terms);
    scores[intent] = sum;
    matchedTerms[intent] = matched;
  }
  return { scores, matchedTerms };
}

/**
 * Classify user intent
 */
export function classifyIntent(text) {
  const q = normalizeText(text);

  if (!q) {
    return { intent: "off_topic", score: 0, matched: [], confidence: "none" };
  }

  // Quick path: detect order IDs
  if (HEX24.test(q) && /\b(order|track|status|where|shipment|delivery)\b/i.test(q)) {
    return { intent: "order_status", score: 1.0, matched: ["orderId"], confidence: "high" };
  }

  // 1. Get raw scores
  let { scores, matchedTerms } = _computeAllScores(q);

  // 2. Apply contextual boosts
  // Complaint emphasis
  if (matchedTerms.complaint?.some(m => ["never arrived", "didn't arrive", "still waiting"].includes(m))) {
    scores.complaint *= BOOSTS.COMPLAINT_URGENCY_BOOST;
  }

  // Policy boost
  if (matchedTerms.policy_question?.some(m => m.includes("return") || m.includes("refund"))) {
    if (/\b(can|if|able|may|would)\b/i.test(q)) {
      scores.policy_question *= BOOSTS.POLICY_MODAL_BOOST;
    }
  }

  // Tone-based violation detection
  if (/worst|terrible|awful|sucks|useless/i.test(q)) {
    scores.violation = (scores.violation || 0) + BOOSTS.NEGATIVE_TONE_BOOST;
  }

  // 3. Determine best intent based on priority
  let bestIntent = PRIORITY[0];
  for (const intent of PRIORITY) {
    if ((scores[intent] || 0) > (scores[bestIntent] || 0)) {
      bestIntent = intent;
    }
  }

  const bestScore = scores[bestIntent] || 0;

  // 4. Absolute threshold check
  // If the best score doesn't even meet the minimum, we're not confident at all.
  if (bestScore < CONFIDENCE_THRESHOLD) {
    return {
      intent: "clarification_needed",
      score: 0, // The relative score is meaningless if it's below threshold
      matched: matchedTerms[bestIntent],
      confidence: "low",
      fallbackIntent: bestIntent,
      allScores: scores,
    };
  }

  // 5. Calculate relative confidence score (winner's score / sum of all scores)
  // This provides a much more meaningful 0.0-1.0 score than the old `Math.min(1.0, bestScore)`.
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const relativeScore = (totalScore > 0) ? (bestScore / totalScore) : 0;

  let confidence = "low";
  if (relativeScore >= 0.80) confidence = "high"; // e.g., 'complaint' is 80% of all matched signal
  else if (relativeScore >= 0.55) confidence = "medium"; // e.g., 'complaint' is 55%

  return {
    intent: bestIntent,
    score: parseFloat(relativeScore.toFixed(2)),
    matched: matchedTerms[bestIntent],
    confidence,
    allScores: scores,
  };
}

/**
 * Helper to expose all *raw* intent scores (before boosts)
 */
export function getIntentScores(text) {
  const q = normalizeText(text);
  const { scores } = _computeAllScores(q);
  return scores;
}

/**
 * Extract potential Mongo-style order ID
 */
export function extractOrderId(text) {
  const match = String(text || "").match(HEX24);
  return match ? match[0] : null;
}

/**
 * Quick self-test utility
 */
export function testClassifier() {
  const tests = [
    ["What is your return policy?", "policy_question"],
    ["Where is my order 67428ab91c4e567890123456", "order_status"],
    ["I'm looking for blue jeans", "product_search"],
    ["My item arrived damaged", "complaint"],
    ["Hello, how are you?", "chitchat"],
    ["Can I dye my shirt and return it?", "policy_question"],
    ["I hate you", "violation"],
    ["You're an idiot", "violation"], // Test for normalization fix
    ["Tell me about movies", "off_topic"],
    ["My order never arrived", "complaint"],
    ["Is my shipment on the way?", "order_status"],
    ["Tell me a joke", "off_topic"],
    ["blah blah blah", "clarification_needed"], // Test for low confidence
  ];

  console.log("🧪 Running intent-classifier tests...\n");
  let passCount = 0;
  for (const [q, expected] of tests) {
    const result = classifyIntent(q);
    const pass = result.intent === expected;
    if (pass) {
      passCount++;
      console.log(`✅  PASS: "${q}" → ${result.intent} (Score: ${result.score}, Conf: ${result.confidence})`);
    } else {
      console.log(`❌  FAIL: "${q}" → [Expected: ${expected}, Got: ${result.intent}] (Score: ${result.score}, Conf: ${result.confidence})`);
    }
  }
  console.log(`\nTest complete: ${passCount}/${tests.length} passed.`);
}

if (process.env.NODE_ENV === "development") {
  globalThis.__testClassifier = testClassifier;
}