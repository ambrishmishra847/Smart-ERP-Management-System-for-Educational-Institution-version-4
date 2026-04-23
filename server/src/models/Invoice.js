import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    vendorName: { type: String, required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["vendor", "maintenance", "technology", "utilities", "services"],
      default: "vendor",
    },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "overdue"],
      default: "pending",
    },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
