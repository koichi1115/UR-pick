import { describe, it, expect } from '@jest/globals';
import {
  UserError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BusinessLogicError,
  SystemError,
  DatabaseError,
  ExternalApiError,
  formatErrorResponse,
} from '../utils/errors.js';

describe('Error Classes Tests', () => {
  describe('UserError', () => {
    it('should create error with correct status code', () => {
      const error = new UserError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('AuthenticationError', () => {
    it('should create error with default message', () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should create error with custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create error with default message', () => {
      const error = new AuthorizationError();

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('NotFoundError', () => {
    it('should create error with resource name', () => {
      const error = new NotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create error with correct status code', () => {
      const error = new BusinessLogicError('Invalid operation');

      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Invalid operation');
    });
  });

  describe('SystemError', () => {
    it('should create error with correct status code', () => {
      const error = new SystemError('Internal error');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal error');
    });
  });

  describe('DatabaseError', () => {
    it('should create error with database prefix', () => {
      const error = new DatabaseError('Connection failed');

      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('Database error: Connection failed');
    });
  });

  describe('ExternalApiError', () => {
    it('should create error with service name', () => {
      const error = new ExternalApiError('Claude', 'Rate limit exceeded');

      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('External API error (Claude): Rate limit exceeded');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format ApiError correctly', () => {
      const error = new UserError('Test error');
      const response = formatErrorResponse(error, '/api/test');

      expect(response).toHaveProperty('error', 'UserError');
      expect(response).toHaveProperty('message', 'Test error');
      expect(response).toHaveProperty('statusCode', 400);
      expect(response).toHaveProperty('path', '/api/test');
      expect(response).toHaveProperty('timestamp');
      expect(response).not.toHaveProperty('stack');
    });

    it('should include stack trace when requested', () => {
      const error = new UserError('Test error');
      const response = formatErrorResponse(error, undefined, true);

      expect(response).toHaveProperty('stack');
    });

    it('should format generic Error correctly', () => {
      const error = new Error('Generic error');
      const response = formatErrorResponse(error);

      expect(response).toHaveProperty('error', 'Error');
      expect(response).toHaveProperty('message', 'Generic error');
      expect(response).toHaveProperty('statusCode', 500);
    });
  });
});
