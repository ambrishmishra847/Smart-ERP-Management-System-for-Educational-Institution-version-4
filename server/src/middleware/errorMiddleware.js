import { ApiError } from "../utils/apiError.js";

export const notFound = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
    requestId: req.context?.requestId,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode =
    err instanceof ApiError
      ? err.statusCode
      : res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500;

  res.status(statusCode).json({
    message: err.message || "Server error",
    details: err instanceof ApiError ? err.details : undefined,
    requestId: req.context?.requestId,
  });
};
