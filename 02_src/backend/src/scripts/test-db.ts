/**
 * Database Connection Test Script
 * Tests the connection to PostgreSQL and displays database information
 */
import { config } from 'dotenv';
import { testConnection, query, closePool } from '../utils/db.js';

// Load environment variables
config();

async function main() {
  console.log('=================================');
  console.log('Database Connection Test');
  console.log('=================================');

  // Display configuration
  console.log('\nConfiguration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'urpick'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);

  // Test connection
  console.log('\nTesting connection...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('\n❌ Connection failed!');
    await closePool();
    process.exit(1);
  }

  console.log('✅ Connection successful!');

  // Get database version
  try {
    console.log('\nDatabase Information:');
    const versionResult = await query<{ version: string }>('SELECT version()');
    console.log(`  Version: ${versionResult.rows[0]?.version.split(',')[0] || 'Unknown'}`);

    // Check if tables exist
    const tablesResult = await query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );

    console.log(`\nTables (${tablesResult.rowCount}):`);
    if (tablesResult.rowCount === 0) {
      console.log('  No tables found. Run schema.sql to create tables.');
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.tablename}`);
      });
    }

    // Get row counts
    if (tablesResult.rowCount > 0) {
      console.log('\nRow Counts:');

      for (const table of tablesResult.rows) {
        const countResult = await query<{ count: string }>(
          `SELECT COUNT(*) as count FROM ${table.tablename}`
        );
        console.log(`  ${table.tablename}: ${countResult.rows[0]?.count || '0'}`);
      }
    }

    console.log('\n=================================');
    console.log('✅ All tests passed!');
    console.log('=================================');
  } catch (error) {
    console.error('\n❌ Error during testing:');
    console.error(error);
    await closePool();
    process.exit(1);
  }

  await closePool();
}

main();
