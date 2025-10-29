-- UR-pick Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- User preferences
    preferred_price_min INTEGER,
    preferred_price_max INTEGER,
    preferred_categories TEXT[],
    preferred_brands TEXT[],

    -- Metadata
    swipe_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Product snapshot (for analytics)
    product_name TEXT,
    product_price INTEGER,
    product_source VARCHAR(50),

    -- Index for efficient queries
    CONSTRAINT swipes_user_product_unique UNIQUE (user_id, product_id)
);

-- Products cache table (optional - for caching frequently accessed products)
CREATE TABLE IF NOT EXISTS products_cache (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image_url TEXT,
    source VARCHAR(50) NOT NULL CHECK (source IN ('amazon', 'rakuten', 'yahoo')),
    affiliate_url TEXT NOT NULL,
    rating DECIMAL(3, 2),
    review_count INTEGER,

    -- Cache metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Raw data from API (JSONB for flexibility)
    raw_data JSONB
);

-- Recommendation history table
CREATE TABLE IF NOT EXISTS recommendation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    strategy VARCHAR(20) NOT NULL CHECK (strategy IN ('rule-based', 'llm-based')),
    product_count INTEGER NOT NULL,
    processing_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Store product IDs for analysis
    product_ids TEXT[]
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at);
CREATE INDEX IF NOT EXISTS idx_swipes_action ON swipes(action);
CREATE INDEX IF NOT EXISTS idx_products_cache_source ON products_cache(source);
CREATE INDEX IF NOT EXISTS idx_products_cache_expires_at ON products_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_user_id ON recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_created_at ON recommendation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_cache_updated_at ON products_cache;
CREATE TRIGGER update_products_cache_updated_at
    BEFORE UPDATE ON products_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON TABLE swipes IS 'User swipe actions on products';
COMMENT ON TABLE products_cache IS 'Cache for product data from affiliate APIs';
COMMENT ON TABLE recommendation_history IS 'History of recommendations generated';

COMMENT ON COLUMN users.swipe_count IS 'Total number of swipes by this user (used for strategy selection)';
COMMENT ON COLUMN swipes.action IS 'like or dislike';
COMMENT ON COLUMN recommendation_history.strategy IS 'rule-based or llm-based';
