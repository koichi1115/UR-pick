-- UR-pick Platform Database Schema
-- Created: 2025-10-27
-- Description: Initial database schema for UR-pick platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. users テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'ユーザー情報';
COMMENT ON COLUMN users.user_id IS 'ユーザーID（UUIDv4）';
COMMENT ON COLUMN users.created_at IS '作成日時';
COMMENT ON COLUMN users.updated_at IS '更新日時';
COMMENT ON COLUMN users.last_login_at IS '最終ログイン日時';

-- ====================================
-- 2. swipe_history テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS swipe_history (
    swipe_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    product_source VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
    swiped_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for swipe_history
CREATE INDEX IF NOT EXISTS idx_swipe_history_user_swiped
    ON swipe_history(user_id, swiped_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipe_history_user_direction
    ON swipe_history(user_id, direction);

COMMENT ON TABLE swipe_history IS 'ユーザーのスワイプ履歴';
COMMENT ON COLUMN swipe_history.swipe_id IS 'スワイプID（自動採番）';
COMMENT ON COLUMN swipe_history.user_id IS 'ユーザーID';
COMMENT ON COLUMN swipe_history.product_id IS '商品ID（アフィリエイトサイトの商品ID）';
COMMENT ON COLUMN swipe_history.product_name IS '商品名';
COMMENT ON COLUMN swipe_history.product_source IS '商品の出典（amazon, rakuten, yahoo）';
COMMENT ON COLUMN swipe_history.direction IS 'スワイプ方向（left or right）';
COMMENT ON COLUMN swipe_history.swiped_at IS 'スワイプ日時';

-- ====================================
-- 3. purchase_history テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS purchase_history (
    purchase_id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    product_source VARCHAR(50) NOT NULL,
    affiliate_url TEXT NOT NULL,
    transitioned_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_history
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_transitioned
    ON purchase_history(user_id, transitioned_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_history_product
    ON purchase_history(product_id);

COMMENT ON TABLE purchase_history IS 'ユーザーの購買遷移履歴';
COMMENT ON COLUMN purchase_history.purchase_id IS '購買遷移ID（自動採番）';
COMMENT ON COLUMN purchase_history.user_id IS 'ユーザーID（未認証の場合はNULL）';
COMMENT ON COLUMN purchase_history.product_id IS '商品ID';
COMMENT ON COLUMN purchase_history.product_name IS '商品名';
COMMENT ON COLUMN purchase_history.product_source IS '商品の出典（amazon, rakuten, yahoo）';
COMMENT ON COLUMN purchase_history.affiliate_url IS 'アフィリエイトURL';
COMMENT ON COLUMN purchase_history.transitioned_at IS '遷移日時';

-- ====================================
-- 4. user_preferences テーブル
-- ====================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- GIN index for JSONB
CREATE INDEX IF NOT EXISTS idx_user_preferences_jsonb
    ON user_preferences USING GIN (preferences);

COMMENT ON TABLE user_preferences IS 'ユーザーの嗜好情報';
COMMENT ON COLUMN user_preferences.user_id IS 'ユーザーID';
COMMENT ON COLUMN user_preferences.preferences IS '嗜好情報（JSON形式）';
COMMENT ON COLUMN user_preferences.updated_at IS '更新日時';

-- ====================================
-- Sample Data (for development)
-- ====================================
-- Uncomment to insert sample data
-- INSERT INTO users (user_id) VALUES
--     ('00000000-0000-0000-0000-000000000001'),
--     ('00000000-0000-0000-0000-000000000002');
