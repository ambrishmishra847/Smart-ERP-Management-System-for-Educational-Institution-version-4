import mongoose from "mongoose";

const hostelRoomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    block: { type: String, required: true },
    floor: String,
    roomType: { type: String, default: "standard" },
    capacity: { type: Number, default: 1 },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["available", "full", "maintenance"],
      default: "available",
    },
    notes: String,
  },
  { timestamps: true }
);

hostelRoomSchema.index({ block: 1, roomNumber: 1 });

export default mongoose.model("HostelRoom", hostelRoomSchema);
