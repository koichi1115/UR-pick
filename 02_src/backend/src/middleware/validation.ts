import { body, param, query, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { UserError } from '../utils/errors.js';

/**
 * Validate request and return errors if any
 */
export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: 'path' in err ? err.path : 'unknown',
      message: err.msg,
    }));

    const message = `Validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`;
    throw new UserError(message);
  }

  next();
};

/**
 * Validation rules for recommendation requests
 */
export const validateRecommendationRequest = [
  body('query')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Query is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Query must be between 1 and 500 characters'),

  body('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),

  body('maxResults')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max results must be between 1 and 20'),

  body('minPrice')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum price must be non-negative'),

  body('maxPrice')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum price must be non-negative'),

  validate,
];

/**
 * Validation rules for user ID parameter
 */
export const validateUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),

  validate,
];

/**
 * Validation rules for swipe recording
 */
export const validateSwipeRequest = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),

  body('productId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Product ID is required'),

  body('action')
    .isIn(['like', 'dislike'])
    .withMessage('Action must be "like" or "dislike"'),

  body('query')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Query is required'),

  validate,
];

/**
 * Validation rules for preference updates
 */
export const validatePreferencesUpdate = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),

  body('priceRange.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum price must be non-negative'),

  body('priceRange.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum price must be non-negative'),

  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),

  body('brands')
    .optional()
    .isArray()
    .withMessage('Brands must be an array'),

  validate,
];

/**
 * Validation rules for get swipes query
 */
export const validateGetSwipes = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),

  query('action')
    .optional()
    .isIn(['like', 'dislike'])
    .withMessage('Action must be "like" or "dislike"'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validate,
];
