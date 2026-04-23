import User from "../models/User.js";
import { writeAuditLog } from "../utils/audit.js";
import { generateToken } from "../utils/generateToken.js";
import { getDefaultPermissions, getRoleLabel } from "../utils/constants.js";

export const login = async (req, res) => {
  const { identifier, password } = req.body;
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
  const user = await User.findOne({
    $or: [
      { username: normalizedIdentifier },
      { email: normalizedIdentifier },
      { rollNumber: normalizedIdentifier.toUpperCase() },
      { employeeId: normalizedIdentifier.toUpperCase() },
    ],
  }).select("+password");

  if (user?.lockUntil && user.lockUntil > new Date()) {
    return res.status(423).json({
      message: "Account temporarily locked due to repeated failed login attempts. Please try again later.",
    });
  }

  if (!user || !(await user.matchPassword(password))) {
    if (user) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      await writeAuditLog(req, {
        action: "auth.login.failed",
        entityType: "User",
        entityId: String(user._id),
        status: "failure",
        metadata: {
          identifier: normalizedIdentifier,
          failedLoginAttempts: user.failedLoginAttempts,
        },
      });
    }

    return res.status(401).json({ message: "Invalid credentials." });
  }

  if (user.isSuspended) {
    return res.status(403).json({
      message: user.suspensionReason
        ? `Account suspended. Reason: ${user.suspensionReason}`
        : "This account has been suspended. Please contact the ERP administrator.",
    });
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  await writeAuditLog(req, {
    action: "auth.login.success",
    entityType: "User",
    entityId: String(user._id),
    after: {
      lastLoginAt: user.lastLoginAt,
    },
  });

  res.json({
    token: generateToken({ id: user._id, role: user.role }),
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      roleLabel: getRoleLabel(user.role),
      permissions: user.permissions?.length ? user.permissions : getDefaultPermissions(user.role),
      department: user.department,
      className: user.className,
      rollNumber: user.rollNumber,
      employeeId: user.employeeId,
      isSuspended: user.isSuspended,
      suspensionReason: user.suspensionReason,
      mustChangePassword: user.mustChangePassword,
      mfaEnabled: user.mfaEnabled,
      scope: user.scope,
    },
  });
};

export const getProfile = async (req, res) => {
  res.json({
    ...req.user.toObject(),
    roleLabel: getRoleLabel(req.user.role),
    permissions: req.user.permissions?.length ? req.user.permissions : getDefaultPermissions(req.user.role),
  });
};
