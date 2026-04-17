import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: Date, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          default: "present",
        },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ course: 1, subject: 1, date: -1 });
attendanceSchema.index({ subject: 1, date: -1 });
attendanceSchema.index({ "records.student": 1, date: -1 });
attendanceSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Attendance", attendanceSchema);
