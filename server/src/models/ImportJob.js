import mongoose from "mongoose";

const importJobSchema = new mongoose.Schema(
  {
    target: { type: String, required: true, index: true },
    mode: { type: String, enum: ["preview", "commit"], default: "commit" },
    status: { type: String, enum: ["completed", "rolled-back"], default: "completed", index: true },
    fileName: { type: String, required: true },
    mimeType: String,
    totalRows: { type: Number, default: 0 },
    imported: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    validationErrorCount: { type: Number, default: 0 },
    preview: { type: Array, default: [] },
    errors: { type: Array, default: [] },
    rowDetails: { type: Array, default: [] },
    createdEntities: {
      type: [
        {
          entityType: String,
          entityId: String,
          summary: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
    },
    rollbackSummary: {
      rolledBackCount: { type: Number, default: 0 },
      missingCount: { type: Number, default: 0 },
      notes: [String],
    },
    rolledBackAt: Date,
    rolledBackBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
  },
  { timestamps: true }
);

importJobSchema.index({ target: 1, createdAt: -1 });
importJobSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ImportJob", importJobSchema);
