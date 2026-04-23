import mongoose from "mongoose";

const approvalItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    requestType: {
      type: String,
      enum: ["budget", "leave", "payroll", "procurement", "academic"],
      required: true,
    },
    department: { type: String, required: true },
    amount: { type: Number, default: 0 },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalItem", approvalItemSchema);
