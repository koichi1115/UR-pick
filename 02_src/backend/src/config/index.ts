import dotenv from 'dotenv';

dotenv.config();

/**
 * Server configuration
 */
export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'urpick',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
  },
  amazon: {
    accessKey: process.env.AMAZON_ACCESS_KEY || '',
    secretKey: process.env.AMAZON_SECRET_KEY || '',
    partnerTag: process.env.AMAZON_PARTNER_TAG || '',
  },
  rakuten: {
    appId: process.env.RAKUTEN_APP_ID || '',
  },
  yahoo: {
    clientId: process.env.YAHOO_CLIENT_ID || '',
    clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
  },
};

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const requiredVars = ['CLAUDE_API_KEY'];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Some features may not work properly.');
  }
}
