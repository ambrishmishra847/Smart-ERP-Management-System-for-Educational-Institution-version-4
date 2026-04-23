import mongoose from "mongoose";

const transportAllocationSchema = new mongoose.Schema(
  {
    route: { type: mongoose.Schema.Types.ObjectId, ref: "TransportRoute", required: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stop: { type: String, required: true },
    seatNumber: String,
    shift: { type: String, default: "morning-evening" },
    feeStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["active", "waitlisted", "inactive"],
      default: "active",
    },
    notes: String,
  },
  { timestamps: true }
);

transportAllocationSchema.index({ route: 1, rider: 1 }, { unique: true });
transportAllocationSchema.index({ status: 1, feeStatus: 1 });

export default mongoose.model("TransportAllocation", transportAllocationSchema);
