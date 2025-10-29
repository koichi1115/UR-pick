/**
 * Copy SQL files to dist directory after TypeScript compilation
 */
import { cpSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const srcDatabase = join(projectRoot, 'src', 'database');
const distDatabase = join(projectRoot, 'dist', 'database');

console.log('📋 Copying SQL files...');

try {
  // Ensure destination directory exists
  if (!existsSync(distDatabase)) {
    mkdirSync(distDatabase, { recursive: true });
  }

  // Copy migration files
  const srcMigrations = join(srcDatabase, 'migrations');
  const distMigrations = join(distDatabase, 'migrations');
  console.log(`  Migrations: ${srcMigrations} -> ${distMigrations}`);
  cpSync(srcMigrations, distMigrations, { recursive: true });

  // Copy reset-schema.sql
  const resetSrc = join(srcDatabase, 'reset-schema.sql');
  const resetDist = join(distDatabase, 'reset-schema.sql');
  console.log(`  Reset schema: ${resetSrc} -> ${resetDist}`);
  copyFileSync(resetSrc, resetDist);

  console.log('✅ SQL files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy SQL files:', error);
  process.exit(1);
}
