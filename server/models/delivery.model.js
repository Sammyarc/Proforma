import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: { type: String }, // One delivery job and one usage reservation per invoice.
    userId: { type: String, required: true, index: true },
    attachmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    state: {
      type: String,
      enum: ["prepared", "processing", "sending", "sent", "failed", "unknown"],
      default: "prepared",
    },
    leaseUntil: Date,
    leaseToken: String,
    attempts: { type: Number, default: 0 },
    nextAttemptAt: Date,
    periodKey: String,
    error: String,
    sentAt: Date,
  },
  { timestamps: true },
);
export default mongoose.model("Delivery", schema);
