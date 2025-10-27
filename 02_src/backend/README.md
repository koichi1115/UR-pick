# UR-pick Backend

Node.js Express TypeScript バックエンドAPI

## ディレクトリ構造

```
src/
├── config/                 # 設定ファイル
│   └── index.ts            # 環境変数管理
├── controllers/            # リクエストハンドラー
├── middleware/             # Expressミドルウェア
├── models/                 # データモデル
├── routes/                 # APIルーティング
├── services/               # ビジネスロジック
├── types/                  # TypeScript型定義
│   ├── product.ts          # 商品関連の型
│   ├── swipe.ts            # スワイプ関連の型
│   └── index.ts            # 型の集約エクスポート
├── utils/                  # ユーティリティ関数
└── index.ts                # アプリケーションエントリーポイント
```

## 主要な依存関係

- **Express**: Webフレームワーク
- **PostgreSQL (pg)**: データベースクライアント
- **@anthropic-ai/sdk**: Claude APIクライアント
- **dotenv**: 環境変数管理
- **cors**: CORS設定

## 環境変数

`.env`ファイルで設定:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=urpick
DB_USER=postgres
DB_PASSWORD=your_password

# Claude API
CLAUDE_API_KEY=your_claude_api_key_here

# Amazon Product Advertising API
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_PARTNER_TAG=your_partner_tag

# Rakuten API
RAKUTEN_APP_ID=your_rakuten_app_id

# Yahoo Shopping API
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## データベース

### セットアップ

1. PostgreSQL 15+をインストール
2. データベースを作成: `createdb urpick`
3. `.env`ファイルに接続情報を設定
4. マイグレーションを実行: `npm run migrate`

### コマンド

```bash
npm run migrate      # データベースマイグレーション実行
npm run db:test      # データベース接続テスト
```

### データベーススキーマ

- `users`: ユーザー情報
- `swipe_history`: スワイプ履歴
- `purchase_history`: 購買遷移履歴
- `user_preferences`: ユーザー嗜好情報（JSONB）

詳細は `src/database/migrations/001_init_schema.sql` を参照。

## 開発

```bash
npm run dev          # 開発サーバー起動（ホットリロード）
npm run build        # TypeScriptビルド
npm run start        # プロダクション起動
npm run lint         # ESLint実行
npm run format       # Prettier実行
```

## APIエンドポイント

### ヘルスチェック
```
GET /api/health
```

### 商品レコメンデーション
```
POST /api/recommendations
Body: { query: string }
```

### スワイプ記録
```
POST /api/swipes
Body: { userId: string, productId: string, direction: 'left' | 'right' }
```

### アフィリエイトリンク生成
```
POST /api/affiliate-link
Body: { productId: string, source: 'amazon' | 'rakuten' | 'yahoo' }
```

## 設計原則

- **RESTful API**: REST原則に従ったAPI設計
- **Type Safety**: 全ての関数にTypeScript型定義
- **Error Handling**: 統一されたエラーレスポンス形式
- **Logging**: 構造化ログ（JSON形式）
