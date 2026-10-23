import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    billingAddress: { type: String, default: "" },
    notes: { type: String, default: "" },
    archived: { type: Boolean, default: false },
    revision: { type: Number, default: 1 },
  },
  { timestamps: true },
);
schema.index({ userId: 1, email: 1 }, { unique: true });
schema.index({ userId: 1, archived: 1, name: 1 });
export default mongoose.model("Client", schema);
