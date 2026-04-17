import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getDefaultPermissions, ROLES_LIST } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES_LIST, required: true },
    permissions: [{ type: String }],
    avatar: String,
    phone: String,
    department: String,
    className: String,
    rollNumber: String,
    employeeId: String,
    parentEmail: String,
    institutionId: String,
    campusId: String,
    departmentId: String,
    academicSession: String,
    batchId: String,
    section: String,
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,
    suspendedAt: Date,
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    mustChangePassword: { type: Boolean, default: false },
    passwordChangedAt: Date,
    mfaEnabled: { type: Boolean, default: false },
    scope: {
      institution: String,
      campus: String,
      department: String,
      className: String,
      section: String,
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) {
    if (!this.permissions?.length || this.isModified("role")) {
      this.permissions = getDefaultPermissions(this.role);
    }
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = new Date();
  if (!this.permissions?.length || this.isModified("role")) {
    this.permissions = getDefaultPermissions(this.role);
  }
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ rollNumber: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ className: 1, section: 1 });
userSchema.index({ department: 1 });
userSchema.index({ institutionId: 1, campusId: 1, departmentId: 1 });
userSchema.index({ academicSession: 1, batchId: 1, section: 1 });
userSchema.index({ isSuspended: 1, role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
