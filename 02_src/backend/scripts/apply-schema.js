/**
 * Apply database schema to Railway PostgreSQL
 * Run with: node scripts/apply-schema.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applySchema() {
  // Database URL from command line or environment
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is required');
    console.error('Usage: node scripts/apply-schema.js <DATABASE_URL>');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Required for Railway
    },
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Read schema file
    const schemaPath = join(__dirname, '..', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema file loaded');

    // Apply schema
    console.log('Applying schema...');
    await client.query(schema);
    console.log('✓ Schema applied successfully');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n✓ Tables created:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
