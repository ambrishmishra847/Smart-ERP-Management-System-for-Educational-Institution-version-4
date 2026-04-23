import mongoose from "mongoose";

const hostelMaintenanceSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "HostelRoom" },
    title: { type: String, required: true },
    issueType: { type: String, default: "general" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    assignedTo: String,
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolutionNotes: String,
  },
  { timestamps: true }
);

hostelMaintenanceSchema.index({ status: 1, priority: 1, createdAt: -1 });

export default mongoose.model("HostelMaintenance", hostelMaintenanceSchema);
