import mongoose from "mongoose";

const AssistantLogSchema = new mongoose.Schema(
  {
    // Request context
    query: { type: String, required: true, trim: true, maxlength: 500 },
    intent: {
      type: String,
      enum: [
        "policy_question",
        "order_status",
        "product_search",
        "complaint",
        "chitchat",
        "off_topic",
        "violation",
        "error",
      ],
      required: true,
      index: true,
    },
    functionsCalled: [{ type: String, index: true }],

    // Metrics
    responseTimeMs: { type: Number, default: 0, min: 0 },
    score: { type: Number, default: 1.0, min: 0, max: 1.0 },

    // Output snapshot
    response: {
      text: { type: String },
      citations: [{ type: String }],
      tone: { type: String },
    },

    // Debug + correlation
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    error: { type: String, default: null },

    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

// Auto-expire assistant logs after 14 days
AssistantLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

export default mongoose.model("AssistantLog", AssistantLogSchema);
