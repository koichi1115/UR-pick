-- Reset database schema
-- WARNING: This will drop all existing tables and data

-- Drop tables in reverse order (dependencies first)
DROP TABLE IF EXISTS recommendation_history CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS products_cache CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
