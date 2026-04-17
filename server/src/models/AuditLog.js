import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRole: String,
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    requestId: { type: String, index: true },
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ["success", "failure"], default: "success", index: true },
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ entityType: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ actor: 1, timestamp: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
