import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    program: { type: String, required: true },
    academicYear: { type: String, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    source: {
      type: String,
      enum: ["website", "social-media", "walk-in", "referral", "campaign"],
      default: "website",
    },
    documentsVerified: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["lead", "under-review", "verified", "accepted", "rejected"],
      default: "lead",
    },
    notes: String,
  },
  { timestamps: true }
);

admissionSchema.index({ status: 1, createdAt: -1 });
admissionSchema.index({ email: 1, academicYear: 1 });
admissionSchema.index({ studentName: 1 });
admissionSchema.index({ program: 1, academicYear: 1 });
admissionSchema.index({ institutionId: 1, campusId: 1, departmentId: 1 });

export default mongoose.model("Admission", admissionSchema);
