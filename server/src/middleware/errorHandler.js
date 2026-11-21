import { ApiError } from '../utils/ApiError.js';
import env from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : 'Internal server error';

  // Mongoose / MongoDB error mapping
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    err.isOperational = true;
    err.details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format';
    err.isOperational = true;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate record';
    err.isOperational = true;
  } else if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError' || err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    message = 'Database unavailable';
    err.isOperational = true;
  }

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(env.nodeEnv === 'development' && !err.isOperational && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
