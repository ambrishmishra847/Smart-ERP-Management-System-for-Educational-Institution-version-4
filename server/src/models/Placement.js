import mongoose from "mongoose";

const placementApplicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "selected", "rejected"],
      default: "applied",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const placementSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    roleTitle: { type: String, required: true },
    description: { type: String, required: true },
    location: String,
    packageLpa: Number,
    eligibility: String,
    deadline: { type: Date, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applications: [placementApplicationSchema],
  },
  { timestamps: true }
);

placementSchema.index({ companyName: 1, deadline: -1 });
placementSchema.index({ postedBy: 1, createdAt: -1 });
placementSchema.index({ "applications.student": 1 });
placementSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Placement", placementSchema);
