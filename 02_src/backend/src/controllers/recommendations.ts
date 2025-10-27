import type { Request, Response, NextFunction } from 'express';
import { RecommendationEngine } from '../services/recommendation/index.js';
import type { RecommendationRequest } from '../services/recommendation/index.js';
import { UserError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Recommendation controller
 */
export class RecommendationController {
  private engine: RecommendationEngine;

  constructor() {
    this.engine = new RecommendationEngine();
  }

  /**
   * Get product recommendations
   * POST /api/recommendations
   */
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, userId, maxResults, minPrice, maxPrice } = req.body;

      // Validate request
      if (!query || typeof query !== 'string') {
        throw new UserError('Query parameter is required and must be a string');
      }

      if (query.trim().length === 0) {
        throw new UserError('Query cannot be empty');
      }

      if (maxResults && (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 20)) {
        throw new UserError('maxResults must be a number between 1 and 20');
      }

      // Build request
      const request: RecommendationRequest = {
        query: query.trim(),
        userId,
        maxResults: maxResults || 10,
        minPrice,
        maxPrice,
      };

      logger.info('Recommendation request', request);

      // Generate recommendations
      const result = await this.engine.recommend(request);

      // Return response
      res.json({
        success: true,
        data: {
          products: result.products,
          strategy: result.strategy,
          count: result.products.length,
        },
        meta: {
          processingTime: result.processingTime,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
