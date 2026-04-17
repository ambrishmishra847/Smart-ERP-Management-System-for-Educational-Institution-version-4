import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: {
      type: [String],
      default: ["super-admin", "teacher", "student"],
    },
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    section: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

announcementSchema.index({ audience: 1, createdAt: -1 });
announcementSchema.index({ author: 1, createdAt: -1 });
announcementSchema.index({ priority: 1, createdAt: -1 });
announcementSchema.index({ institutionId: 1, campusId: 1, departmentId: 1 });

export default mongoose.model("Announcement", announcementSchema);
