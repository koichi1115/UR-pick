import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, testConnection } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migrations
 * @param closePoolAfter - Whether to close the connection pool after migration (default: false for app startup)
 */
async function migrate(closePoolAfter = false) {
  console.log('🔄 Starting database migration...');

  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to database. Migration aborted.');
    throw new Error('Database connection failed');
  }

  try {
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
