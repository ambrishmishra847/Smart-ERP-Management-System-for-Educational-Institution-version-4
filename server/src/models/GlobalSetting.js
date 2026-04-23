import mongoose from "mongoose";

const globalSettingSchema = new mongoose.Schema(
  {
    institutionName: { type: String, default: "Smart ERP Institute" },
    shortName: { type: String, default: "Smart ERP" },
    contactEmail: String,
    contactPhone: String,
    website: String,
    address: String,
    academicSession: String,
    campusName: String,
    timezone: { type: String, default: "Asia/Calcutta" },
    announcementFooter: String,
    defaultStudentPassword: { type: String, default: "Student@123" },
    defaultFeeAmount: { type: Number, default: 0 },
    defaultFeeDueDays: { type: Number, default: 30 },
    maintenanceMode: { type: Boolean, default: false },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("GlobalSetting", globalSettingSchema);
