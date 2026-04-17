import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    credits: { type: Number, default: 3 },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
  },
  { timestamps: true }
);

subjectSchema.index({ course: 1, teacher: 1 });
subjectSchema.index({ teacher: 1, createdAt: -1 });
subjectSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Subject", subjectSchema);
