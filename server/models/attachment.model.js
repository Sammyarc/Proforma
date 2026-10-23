import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    draftId: { type: String, required: true },
    revision: { type: Number, required: true },
    filename: { type: String, required: true },
    content: { type: Buffer, required: true, select: false },
    expiresAt: Date,
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("Attachment", schema);
