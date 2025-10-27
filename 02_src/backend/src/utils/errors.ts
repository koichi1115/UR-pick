/**
 * Custom error classes for different error types
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * User Error (4xx) - Client-side errors
 * Used for invalid input, missing parameters, etc.
 */
export class UserError extends ApiError {
  constructor(message: string) {
    super(400, message);
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message);
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

/**
 * Business Logic Error (422) - Unprocessable Entity
 * Used for business rule violations
 */
export class BusinessLogicError extends ApiError {
  constructor(message: string) {
    super(422, message);
  }
}

/**
 * System Error (5xx) - Server-side errors
 * Used for database errors, external API failures, etc.
 */
export class SystemError extends ApiError {
  constructor(message: string, isOperational = true) {
    super(500, message, isOperational);
  }
}

/**
 * Database Error (503)
 */
export class DatabaseError extends ApiError {
  constructor(message: string) {
    super(503, `Database error: ${message}`);
  }
}

/**
 * External API Error (503)
 */
export class ExternalApiError extends ApiError {
  constructor(service: string, message: string) {
    super(503, `External API error (${service}): ${message}`);
  }
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  stack?: string;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  error: Error | ApiError,
  path?: string,
  includeStack = false
): ErrorResponse {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const errorName = error.name || 'Error';

  const response: ErrorResponse = {
    error: errorName,
    message: error.message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  if (path) {
    response.path = path;
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}
