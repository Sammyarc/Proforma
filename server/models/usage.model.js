import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: String,
    userId: { type: String, required: true },
    periodStart: Date,
    nextReset: Date,
    count: { type: Number, default: 0 },
    invoices: { type: [String], default: [] },
  },
  { timestamps: true },
);
export default mongoose.model("Usage", schema);
