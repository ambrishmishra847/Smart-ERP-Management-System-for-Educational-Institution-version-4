import mongoose from "mongoose";

const hostelGatePassSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "HostelRoom" },
    passType: {
      type: String,
      enum: ["day", "night", "weekend", "medical", "emergency"],
      default: "day",
    },
    reason: { type: String, required: true },
    outDateTime: { type: Date, required: true },
    expectedReturnAt: { type: Date, required: true },
    returnedAt: Date,
    status: {
      type: String,
      enum: ["pending", "approved", "out", "returned", "rejected"],
      default: "pending",
    },
    approvalNotes: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

hostelGatePassSchema.index({ student: 1, outDateTime: -1 });
hostelGatePassSchema.index({ status: 1, expectedReturnAt: 1 });

export default mongoose.model("HostelGatePass", hostelGatePassSchema);
