import mongoose from "mongoose";

const RequestLogSchema = new mongoose.Schema(
  {
    method: String,                  // "GET", "POST", etc.
    route: String,                   // e.g. "/api/orders/123"
    statusCode: Number,              // 200, 404, 500, etc.
    responseTimeMs: Number,          // total latency for the request
    requestBody: mongoose.Schema.Types.Mixed,  // safe subset of req.body
    queryParams: mongoose.Schema.Types.Mixed,  // req.query snapshot
    responseBody: mongoose.Schema.Types.Mixed, // safe subset of response
    ip: String,                      // client IP
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Auto-expire logs older than 7 days (optional)
RequestLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.model("RequestLog", RequestLogSchema);
