import mongoose from "mongoose";

const parentCommunicationSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["appointment", "attendance", "fees", "result", "discipline", "general"],
      default: "general",
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    preferredDate: Date,
    status: {
      type: String,
      enum: ["open", "in-review", "responded", "closed"],
      default: "open",
    },
    responseMessage: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    respondedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

parentCommunicationSchema.index({ parent: 1, createdAt: -1 });
parentCommunicationSchema.index({ student: 1, status: 1 });

export default mongoose.model("ParentCommunication", parentCommunicationSchema);
