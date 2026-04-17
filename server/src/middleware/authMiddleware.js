import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getDefaultPermissions, hasPermission } from "../utils/constants.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found." });
    }

    if (req.user.isSuspended) {
      return res.status(403).json({
        message: req.user.suspensionReason
          ? `Account suspended. Reason: ${req.user.suspensionReason}`
          : "This account has been suspended. Please contact the ERP administrator.",
      });
    }

    if (!req.user.permissions?.length) {
      req.user.permissions = getDefaultPermissions(req.user.role);
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }

    next();
  };

export const authorizePermission =
  (...permissions) =>
  (req, res, next) => {
    const allowed = permissions.some((permission) => hasPermission(req.user, permission));

    if (!allowed) {
      return res.status(403).json({ message: "Insufficient permissions." });
    }

    next();
  };
