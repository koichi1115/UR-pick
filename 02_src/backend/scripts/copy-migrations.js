/**
 * Copy SQL migration files to dist directory after TypeScript compilation
 */
import { cpSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const srcMigrations = join(projectRoot, 'src', 'database', 'migrations');
const distMigrations = join(projectRoot, 'dist', 'database', 'migrations');

console.log('📋 Copying migration files...');
console.log(`  From: ${srcMigrations}`);
console.log(`  To: ${distMigrations}`);

try {
  // Ensure destination directory exists
  if (!existsSync(join(projectRoot, 'dist', 'database'))) {
    mkdirSync(join(projectRoot, 'dist', 'database'), { recursive: true });
  }

  // Copy migration files
  cpSync(srcMigrations, distMigrations, { recursive: true });

  console.log('✅ Migration files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy migration files:', error);
  process.exit(1);
}
