import { Router } from 'express';
import { testConnection } from '../database/index.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', async (_req, res) => {
  let dbConnected = false;

  try {
    dbConnected = await testConnection();
  } catch (error) {
    // Database connection failed, but health check should still respond
    console.error('Health check: Database connection failed', error);
  }

  // Always return 200 OK so Railway doesn't kill the container
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    database: {
      connected: dbConnected,
    },
  });
});

export default router;
