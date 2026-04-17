import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    marksObtained: { type: Number, required: true },
    grade: String,
    feedback: String,
    publishedAt: Date,
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, createdAt: -1 });
resultSchema.index({ exam: 1, student: 1 }, { unique: true });
resultSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Result", resultSchema);
