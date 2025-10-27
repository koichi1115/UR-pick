import type { Request, Response, NextFunction } from 'express';
import { ApiError, formatErrorResponse } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * Error handler middleware
 * Must be the last middleware in the chain
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error('Request error', {
    error: err.message,
    path: req.path,
    method: req.method,
    statusCode: err instanceof ApiError ? err.statusCode : 500,
  });

  // Determine if error is operational
  const isOperational = err instanceof ApiError ? err.isOperational : false;

  // If error is not operational, log full stack trace
  if (!isOperational) {
    logger.error('Non-operational error', err);
  }

  // Format error response
  const includeStack = config.server.nodeEnv === 'development';
  const errorResponse = formatErrorResponse(err, req.path, includeStack);

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    error: 'NotFound',
    message: 'The requested resource was not found',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}
