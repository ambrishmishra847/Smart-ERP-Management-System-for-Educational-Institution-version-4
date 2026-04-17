import mongoose from "mongoose";

const payrollConfigSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    paymentCycle: {
      type: String,
      enum: ["monthly", "biweekly", "weekly"],
      default: "monthly",
    },
    effectiveFrom: { type: Date, required: true },
    bankName: String,
    accountNumber: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("PayrollConfig", payrollConfigSchema);
