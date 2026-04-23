import mongoose from "mongoose";

const aiRiskHistorySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    providerStatus: { type: String, enum: ["enabled", "fallback"], default: "fallback" },
    providerName: String,
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, enum: ["low", "moderate", "high", "critical"], required: true },
    metrics: {
      attendancePercentage: Number,
      totalClasses: Number,
      averageMarks: Number,
      recentAverageMarks: Number,
      resultCount: Number,
      markTrend: String,
      missingAssignments: Number,
      overdueAssignments: Number,
      submittedAssignments: Number,
      submissionPercentage: Number,
      pendingFees: Number,
      pendingFeeAmount: Number,
      weakestSubjects: [{ name: String, average: Number }],
    },
    factors: [{ label: String, severity: String }],
  },
  { timestamps: true }
);

aiRiskHistorySchema.index({ student: 1, createdAt: -1 });
aiRiskHistorySchema.index({ riskLevel: 1, createdAt: -1 });

export default mongoose.model("AiRiskHistory", aiRiskHistorySchema);
