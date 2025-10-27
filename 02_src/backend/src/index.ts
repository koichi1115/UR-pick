import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/index.js';
import { logger } from './utils/logger.js';
import router from './routes/index.js';

/**
 * Initialize Express application
 */
const app = express();

/**
 * Middleware configuration
 */
app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

/**
 * Root endpoint
 */
app.get('/', (_req, res) => {
  res.json({
    message: 'UR-pick Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      recommendations: '/api/recommendations',
      swipes: '/api/swipes',
      affiliateLink: '/api/affiliate-link',
    },
  });
});

/**
 * API routes
 */
app.use('/api', router);

/**
 * 404 handler (must be after all routes)
 */
app.use(notFoundHandler);

/**
 * Error handler (must be last)
 */
app.use(errorHandler);

/**
 * Start server
 */
function startServer() {
  try {
    validateConfig();

    const port = config.server.port;
    app.listen(port, () => {
      logger.info(`Server started on http://localhost:${port}`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
      logger.info(`CORS origin: ${config.server.corsOrigin}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

export default app;
