export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const badRequest = (message, details = null) => new ApiError(400, message, details);
export const unauthorized = (message, details = null) => new ApiError(401, message, details);
export const forbidden = (message, details = null) => new ApiError(403, message, details);
export const notFoundError = (message, details = null) => new ApiError(404, message, details);
