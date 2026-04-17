import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    academicYear: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    status: {
      type: String,
      enum: ["paid", "partial", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, academicYear: 1 });
feeSchema.index({ status: 1, dueDate: 1 });
feeSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Fee", feeSchema);
