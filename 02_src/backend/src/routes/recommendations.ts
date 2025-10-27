import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendations.js';
import { validateRecommendationRequest } from '../middleware/validation.js';
import { strictRateLimiter } from '../middleware/security.js';

const router = Router();
const controller = new RecommendationController();

/**
 * Get product recommendations
 * POST /api/recommendations
 *
 * Request body:
 * {
 *   query: string,           // Search query (required)
 *   userId?: string,         // User ID for personalization (optional)
 *   maxResults?: number,     // Max number of results (1-20, default: 10)
 *   minPrice?: number,       // Minimum price filter (optional)
 *   maxPrice?: number        // Maximum price filter (optional)
 * }
 */
router.post(
  '/',
  strictRateLimiter,
  validateRecommendationRequest,
  controller.getRecommendations.bind(controller)
);

export default router;
