import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    academicYear: { type: String, required: true },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    description: String,
    materials: [
      {
        title: String,
        type: {
          type: String,
          enum: ["pdf", "youtube", "ppt", "word", "link"],
          default: "link",
        },
        url: String,
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

courseSchema.index({ teacher: 1, academicYear: 1 });
courseSchema.index({ department: 1, academicYear: 1 });
courseSchema.index({ students: 1 });
courseSchema.index({ institutionId: 1, campusId: 1, departmentId: 1, academicSession: 1 });

export default mongoose.model("Course", courseSchema);
