import { Router } from 'express';
import healthRouter from './health.js';
import recommendationsRouter from './recommendations.js';
import usersRouter from './users.js';

/**
 * Main router configuration
 */
const router = Router();

// Health check routes
router.use('/health', healthRouter);

// User routes
router.use('/users', usersRouter);

// Recommendation routes
router.use('/recommendations', recommendationsRouter);

export default router;
