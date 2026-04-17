import mongoose from "mongoose";

const payrollRunSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true },
    grossPay: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "processed", "released"],
      default: "draft",
    },
    remarks: String,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("PayrollRun", payrollRunSchema);
