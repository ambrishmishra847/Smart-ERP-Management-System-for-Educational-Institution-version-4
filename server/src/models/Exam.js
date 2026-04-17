import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    examDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    examType: {
      type: String,
      enum: ["quiz", "midterm", "practical", "final"],
      default: "midterm",
    },
    room: String,
  },
  { timestamps: true }
);

examSchema.index({ course: 1, subject: 1, examDate: 1 });
examSchema.index({ examType: 1, examDate: 1 });
examSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Exam", examSchema);
