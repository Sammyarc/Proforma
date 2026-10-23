import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    provider: { type: String, enum: ["paypal", "flutterwave"], required: true },
    reference: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    invoiceId: String,
    amountMinor: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, enum: ["USD"] },
    customerEmail: String,
    merchantId: String,
    approvalUrl: String,
    providerId: String,
    settlementId: String,
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: Date,
    appliedAt: Date,
    lastCheckedAt: Date,
  },
  { timestamps: true },
);
schema.index(
  { provider: 1, providerId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerId: { $type: "string" } },
  },
);
schema.index(
  { provider: 1, settlementId: 1 },
  {
    unique: true,
    partialFilterExpression: { settlementId: { $type: "string" } },
  },
);
export default mongoose.model("Checkout", schema);
