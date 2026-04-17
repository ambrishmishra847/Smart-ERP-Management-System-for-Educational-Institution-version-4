import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: String,
    submittedAt: Date,
    grade: Number,
    feedback: String,
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    attachments: [String],
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

assignmentSchema.index({ teacher: 1, dueDate: 1 });
assignmentSchema.index({ course: 1, subject: 1, dueDate: 1 });
assignmentSchema.index({ "submissions.student": 1 });
assignmentSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Assignment", assignmentSchema);
