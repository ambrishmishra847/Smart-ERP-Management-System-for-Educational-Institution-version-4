import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "leave", "remote"],
      default: "present",
    },
    checkIn: String,
    checkOut: String,
    remarks: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export default mongoose.model("StaffAttendance", staffAttendanceSchema);
