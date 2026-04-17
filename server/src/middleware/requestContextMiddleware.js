import crypto from "crypto";

export const requestContext = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();

  req.context = {
    requestId,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") || "unknown",
    startedAt: new Date(),
  };

  res.setHeader("x-request-id", requestId);
  next();
};
