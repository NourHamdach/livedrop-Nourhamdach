import { performance } from "perf_hooks";
import RequestLog from "../models/requestLog.model.js";

/**
 * Express middleware to log request details and response metrics.
 * Automatically captures method, route, statusCode, latency, etc.
 */
export function requestLogger(req, res, next) {
  const start = performance.now();
  const chunks = [];

  // Capture JSON responses
  const originalJson = res.json;
  res.json = function (body) {
    chunks.push(body);
    return originalJson.call(this, body);
  };

  res.on("finish", async () => {
    const responseTimeMs = Math.round(performance.now() - start);
    try {
      await RequestLog.create({
        method: req.method,
        route: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs,
        requestBody: sanitize(req.body),
        queryParams: req.query,
        responseBody: sanitize(chunks[0]),
        ip: req.ip,
      });
    } catch (err) {
      console.warn("⚠️ Failed to persist request log:", err.message);
    }
  });

  next();
}

// Redact sensitive fields before logging
function sanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clean = { ...obj };
  for (const key of Object.keys(clean)) {
    if (/password|token|authorization/i.test(key)) clean[key] = "[REDACTED]";
  }
  return clean;
}
