import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    room: String,
  },
  { timestamps: true }
);

timetableSchema.index({ teacher: 1, day: 1, startTime: 1, endTime: 1 });
timetableSchema.index({ room: 1, day: 1, startTime: 1, endTime: 1 });
timetableSchema.index({ course: 1, subject: 1, day: 1, startTime: 1 });
timetableSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Timetable", timetableSchema);
