import AuditLog from "../models/AuditLog.js";

export const writeAuditLog = async (req, payload) => {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      actorRole: req.user?.role,
      requestId: req.context?.requestId,
      ipAddress: req.context?.ipAddress,
      userAgent: req.context?.userAgent,
      ...payload,
    });
  } catch (error) {
    console.error("Audit log write failed", error);
  }
};
