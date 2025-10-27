# UR-pick Database Documentation

## スキーマ概要

UR-pickは、PostgreSQL 14+を使用してユーザーデータ、スワイプ履歴、商品キャッシュを管理します。

### テーブル一覧

1. **users** - ユーザープロファイルと設定
2. **swipes** - ユーザーのスワイプアクション履歴
3. **products_cache** - アフィリエイトAPIからの商品キャッシュ
4. **recommendation_history** - レコメンデーション履歴

## データベースのセットアップ

### 方法1: 自動スクリプト使用（Windows）

```bash
cd 02_src/backend
scripts\init-db.bat
```

### 方法2: 自動スクリプト使用（Linux/Mac）

```bash
cd 02_src/backend
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

### 方法3: 手動セットアップ

```bash
# 1. PostgreSQLに接続
psql -U postgres

# 2. データベースを作成
CREATE DATABASE urpick;

# 3. データベースに接続
\c urpick

# 4. スキーマを実行
\i schema.sql

# 5. (オプション) テストデータを挿入
\i seed.sql
```

## データベース管理コマンド

### npmスクリプト

```bash
# データベース接続テスト
npm run db:test

# スキーマの初期化（既存のテーブルがあれば上書き）
npm run db:init

# テストデータのシード
npm run db:seed
```

### 直接SQLコマンド

```bash
# スキーマのみ実行
psql -h localhost -p 5432 -U postgres -d urpick -f schema.sql

# シードデータ挿入
psql -h localhost -p 5432 -U postgres -d urpick -f seed.sql
```

## テーブル詳細

### users テーブル

ユーザーのプロファイルと設定を保存します。

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    preferred_price_min INTEGER,
    preferred_price_max INTEGER,
    preferred_categories TEXT[],
    preferred_brands TEXT[],
    swipe_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**重要なカラム:**
- `swipe_count`: レコメンデーション戦略の選択に使用（5回未満: rule-based、5回以上: llm-based）
- `preferred_*`: パーソナライゼーションに使用

### swipes テーブル

ユーザーのスワイプアクション（like/dislike）を記録します。

```sql
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    product_name TEXT,
    product_price INTEGER,
    product_source VARCHAR(50),
    CONSTRAINT swipes_user_product_unique UNIQUE (user_id, product_id)
);
```

**制約:**
- `swipes_user_product_unique`: 同じユーザーが同じ商品を複数回スワイプできない

### products_cache テーブル

アフィリエイトAPIからの商品データをキャッシュします（オプション）。

```sql
CREATE TABLE products_cache (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image_url TEXT,
    source VARCHAR(50) NOT NULL CHECK (source IN ('amazon', 'rakuten', 'yahoo')),
    affiliate_url TEXT NOT NULL,
    rating DECIMAL(3, 2),
    review_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    raw_data JSONB
);
```

**用途:**
- API呼び出しの削減
- 頻繁にアクセスされる商品の高速読み込み
- オフライン分析

### recommendation_history テーブル

生成されたレコメンデーションの履歴を記録します。

```sql
CREATE TABLE recommendation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    strategy VARCHAR(20) NOT NULL CHECK (strategy IN ('rule-based', 'llm-based')),
    product_count INTEGER NOT NULL,
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    product_ids TEXT[]
);
```

**分析用途:**
- パフォーマンス監視（processing_time）
- A/Bテスト（strategy別の効果測定）
- ユーザー行動分析

## インデックス

パフォーマンス最適化のために以下のインデックスが設定されています：

```sql
-- Swipes
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_created_at ON swipes(created_at);
CREATE INDEX idx_swipes_action ON swipes(action);

-- Products cache
CREATE INDEX idx_products_cache_source ON products_cache(source);
CREATE INDEX idx_products_cache_expires_at ON products_cache(expires_at);

-- Recommendation history
CREATE INDEX idx_recommendation_history_user_id ON recommendation_history(user_id);
CREATE INDEX idx_recommendation_history_created_at ON recommendation_history(created_at);

-- Users
CREATE INDEX idx_users_last_active_at ON users(last_active_at);
```

## よくあるクエリ例

### ユーザーの「いいね」した商品を取得

```sql
SELECT
    s.product_id,
    s.product_name,
    s.product_price,
    s.product_source,
    s.created_at
FROM swipes s
WHERE s.user_id = 'user-uuid-here'
  AND s.action = 'like'
ORDER BY s.created_at DESC
LIMIT 10;
```

### ユーザーの好みを分析

```sql
SELECT
    product_source,
    COUNT(*) as like_count,
    AVG(product_price) as avg_price
FROM swipes
WHERE user_id = 'user-uuid-here'
  AND action = 'like'
GROUP BY product_source;
```

### レコメンデーションのパフォーマンス統計

```sql
SELECT
    strategy,
    COUNT(*) as request_count,
    AVG(processing_time) as avg_time,
    AVG(product_count) as avg_products
FROM recommendation_history
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY strategy;
```

## メンテナンス

### キャッシュのクリーンアップ

期限切れの商品キャッシュを削除：

```sql
DELETE FROM products_cache
WHERE expires_at < CURRENT_TIMESTAMP;
```

### 古いレコメンデーション履歴の削除

90日以上前のレコメンデーション履歴を削除：

```sql
DELETE FROM recommendation_history
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
```

## トラブルシューティング

### 接続エラー

```bash
# PostgreSQLが起動しているか確認
pg_isready -h localhost -p 5432

# 接続テストスクリプトを実行
npm run db:test
```

### パフォーマンス問題

```sql
-- スロークエリを確認
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- テーブルサイズを確認
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## バックアップとリストア

### バックアップ

```bash
# データベース全体をバックアップ
pg_dump -h localhost -U postgres -d urpick > backup.sql

# テーブルのみバックアップ（データなし）
pg_dump -h localhost -U postgres -d urpick --schema-only > schema_backup.sql

# データのみバックアップ
pg_dump -h localhost -U postgres -d urpick --data-only > data_backup.sql
```

### リストア

```bash
# バックアップからリストア
psql -h localhost -U postgres -d urpick < backup.sql
```
