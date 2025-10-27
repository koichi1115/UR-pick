import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, testConnection } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migrations
 */
async function migrate() {
  console.log('🔄 Starting database migration...');

  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to database. Migration aborted.');
    process.exit(1);
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
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}

export { migrate };
