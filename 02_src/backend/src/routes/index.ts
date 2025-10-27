import { Router } from 'express';
import healthRouter from './health.js';
import recommendationsRouter from './recommendations.js';

/**
 * Main router configuration
 */
const router = Router();

// Health check routes
router.use('/health', healthRouter);

// Recommendation routes
router.use('/recommendations', recommendationsRouter);

// TODO: Add more routes
// router.use('/swipes', swipesRouter);
// router.use('/affiliate-link', affiliateLinkRouter);

export default router;
