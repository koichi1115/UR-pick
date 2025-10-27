import { Router } from 'express';
import { testConnection } from '../database/index.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', async (_req, res) => {
  try {
    const dbConnected = await testConnection();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
      database: {
        connected: dbConnected,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
      database: {
        connected: false,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
