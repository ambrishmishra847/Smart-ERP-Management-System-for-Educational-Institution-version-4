import mongoose from "mongoose";

const syllabusProgressSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unitTitle: { type: String, required: true },
    plannedHours: { type: Number, default: 0 },
    completedHours: { type: Number, default: 0 },
    completionPercent: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "delayed"],
      default: "not-started",
    },
    targetDate: Date,
    notes: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("SyllabusProgress", syllabusProgressSchema);
