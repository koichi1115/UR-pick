-- UR-pick Test Seed Data
-- This file contains sample data for testing and development

-- Clear existing data
TRUNCATE TABLE swipes, recommendation_history, products_cache, users RESTART IDENTITY CASCADE;

-- Insert test users
INSERT INTO users (id, preferred_price_min, preferred_price_max, preferred_categories, preferred_brands, swipe_count, last_active_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 1000, 10000, ARRAY['electronics', 'audio'], ARRAY['Sony', 'Bose'], 0, CURRENT_TIMESTAMP),
    ('22222222-2222-2222-2222-222222222222', 5000, 50000, ARRAY['home', 'furniture'], ARRAY['IKEA', 'Muji'], 3, CURRENT_TIMESTAMP),
    ('33333333-3333-3333-3333-333333333333', NULL, NULL, NULL, NULL, 10, CURRENT_TIMESTAMP - INTERVAL '7 days');

-- Insert sample swipes for user 3 (experienced user)
INSERT INTO swipes (user_id, product_id, query, action, product_name, product_price, product_source, created_at)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'test-product-1', '高性能なワイヤレスイヤホン', 'like', 'Sony WF-1000XM5', 35000, 'rakuten', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-2', '高性能なワイヤレスイヤホン', 'dislike', 'Generic Earbuds', 3000, 'yahoo', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-3', '在宅勤務用のデスクライト', 'like', 'BenQ ScreenBar Plus', 15000, 'amazon', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-4', '在宅勤務用のデスクライト', 'like', 'Xiaomi Desk Lamp', 5000, 'rakuten', CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-5', 'コーヒーメーカー', 'dislike', 'Basic Coffee Maker', 4000, 'yahoo', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-6', 'コーヒーメーカー', 'like', 'Nespresso Vertuo', 20000, 'rakuten', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-7', '高級ボールペン', 'like', 'Montblanc Meisterstück', 50000, 'rakuten', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-8', '高級ボールペン', 'like', 'Parker Sonnet', 12000, 'yahoo', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-9', '高級ボールペン', 'dislike', 'Cheap Pen', 500, 'yahoo', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333', 'test-product-10', 'ワイヤレスマウス', 'like', 'Logitech MX Master 3', 12000, 'rakuten', CURRENT_TIMESTAMP);

-- Update swipe count for user 3
UPDATE users SET swipe_count = 10 WHERE id = '33333333-3333-3333-3333-333333333333';

-- Insert sample products cache
INSERT INTO products_cache (id, name, price, description, image_url, source, affiliate_url, rating, review_count, expires_at)
VALUES
    ('test-product-1', 'Sony WF-1000XM5', 35000, '業界最高クラスのノイズキャンセリング性能を誇るワイヤレスイヤホン', 'https://example.com/sony-wf1000xm5.jpg', 'rakuten', 'https://example.com/affiliate/sony', 4.8, 1234, CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    ('test-product-3', 'BenQ ScreenBar Plus', 15000, 'モニターに取り付けるデスクライト。省スペースで明るい', 'https://example.com/benq-screenbar.jpg', 'amazon', 'https://example.com/affiliate/benq', 4.5, 456, CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    ('test-product-6', 'Nespresso Vertuo', 20000, '簡単操作で本格的なコーヒーを楽しめるカプセル式コーヒーメーカー', 'https://example.com/nespresso.jpg', 'rakuten', 'https://example.com/affiliate/nespresso', 4.6, 789, CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- Insert recommendation history
INSERT INTO recommendation_history (user_id, query, strategy, product_count, processing_time, product_ids)
VALUES
    ('11111111-1111-1111-1111-111111111111', '高性能なワイヤレスイヤホン', 'rule-based', 10, 1234, ARRAY['prod1', 'prod2', 'prod3', 'prod4', 'prod5', 'prod6', 'prod7', 'prod8', 'prod9', 'prod10']),
    ('33333333-3333-3333-3333-333333333333', 'ワイヤレスマウス', 'llm-based', 8, 2567, ARRAY['prod11', 'prod12', 'prod13', 'prod14', 'prod15', 'prod16', 'prod17', 'prod18']);

-- Display summary
SELECT 'Users created:' AS summary, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Swipes created:', COUNT(*) FROM swipes
UNION ALL
SELECT 'Products cached:', COUNT(*) FROM products_cache
UNION ALL
SELECT 'Recommendations tracked:', COUNT(*) FROM recommendation_history;
