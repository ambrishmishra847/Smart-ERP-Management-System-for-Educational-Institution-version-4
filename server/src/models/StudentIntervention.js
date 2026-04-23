import mongoose from "mongoose";

const studentInterventionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      enum: ["counseling", "parent-contact", "remedial-plan", "attendance-followup", "fee-followup", "academic-review"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "closed"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "moderate",
    },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    nextFollowUpAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

studentInterventionSchema.index({ student: 1, status: 1, createdAt: -1 });

export default mongoose.model("StudentIntervention", studentInterventionSchema);
