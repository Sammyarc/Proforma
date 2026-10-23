import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    revision: { type: Number, default: 0 },
    lifecycle: {
      type: String,
      enum: ["draft", "locked", "sent"],
      default: "draft",
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);
export default mongoose.model("Draft", schema);
