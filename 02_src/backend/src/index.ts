import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/index.js';
import {
  securityHeaders,
  apiRateLimiter,
  requestTimeout,
  sanitizeInput,
} from './middleware/security.js';
import { testConnection } from './utils/db.js';
import { logger } from './utils/logger.js';
import router from './routes/index.js';

/**
 * Initialize Express application
 */
const app = express();

/**
 * Middleware configuration
 */
// Security headers
app.use(securityHeaders);
app.use(requestTimeout(30000)); // 30 second timeout

// CORS
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

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
// Rate limiting for all API routes
app.use('/api', apiRateLimiter);
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
 * Graceful shutdown handler
 */
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Start server
 */
async function startServer() {
  try {
    validateConfig();

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database, exiting...');
      process.exit(1);
    }

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
