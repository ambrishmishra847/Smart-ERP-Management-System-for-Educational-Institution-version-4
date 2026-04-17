import mongoose from "mongoose";

const financeTransactionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["fee", "vendor", "payroll", "expense", "adjustment"],
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: { type: Number, required: true },
    transactionDate: { type: Date, required: true },
    reference: String,
    relatedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    relatedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("FinanceTransaction", financeTransactionSchema);
