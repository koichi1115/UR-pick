import { Pool, PoolConfig } from 'pg';
import { logger } from './logger.js';

/**
 * Database configuration from environment variables
 */
const dbConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'urpick',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

/**
 * PostgreSQL connection pool
 */
export const pool = new Pool(dbConfig);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    logger.info('Attempting database connection', {
      host: process.env.DATABASE_URL ? 'using DATABASE_URL' : process.env.DB_HOST,
      database: process.env.DATABASE_URL ? 'using DATABASE_URL' : process.env.DB_NAME,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connection successful', {
      timestamp: result.rows[0].now,
    });

    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error,
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      DB_HOST_set: !!process.env.DB_HOST,
    });
    return false;
  }
}

/**
 * Execute a query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Query executed', {
      text,
      duration,
      rows: result.rowCount,
    });

    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    logger.error('Query failed', {
      text,
      error,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Patch the client to track and log queries
  client.query = (...args: any[]) => {
    // @ts-ignore
    return query(...args);
  };

  client.release = () => {
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
}

/**
 * Close all database connections
 */
export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
