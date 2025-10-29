import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, testConnection } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migrations
 * @param closePoolAfter - Whether to close the connection pool after migration (default: false for app startup)
 * @param resetSchema - Whether to reset (drop) existing schema before migration (default: false)
 */
async function migrate(closePoolAfter = false, resetSchema = false) {
  console.log('🔄 Starting database migration...');

  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to database. Migration aborted.');
    throw new Error('Database connection failed');
  }

  try {
    // Reset schema if requested
    if (resetSchema) {
      console.log('⚠️  Resetting database schema (dropping all tables)...');
      const resetPath = join(__dirname, 'reset-schema.sql');
      const resetSql = await readFile(resetPath, 'utf-8');
      await pool.query(resetSql);
      console.log('✅ Schema reset completed');
    }

    // Read migration file
    const migrationPath = join(__dirname, 'migrations', '001_init_schema.sql');
    const sql = await readFile(migrationPath, 'utf-8');

    // Execute migration
    console.log('📝 Executing migration: 001_init_schema.sql');
    await pool.query(sql);

    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (closePoolAfter) {
      await pool.end();
    }
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate(true).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { migrate };
