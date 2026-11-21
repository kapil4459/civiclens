export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const badRequest = (message = 'Bad request', details) =>
  new ApiError(400, message, details);

export const notFoundError = (message = 'Resource not found') =>
  new ApiError(404, message);

export const internalError = (message = 'Internal server error') =>
  new ApiError(500, message);
