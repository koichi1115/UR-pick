# UR-pick Platform

AIレコメンデーション型リクエストベースECサービス - Decision Fatigueを解消する「商品がないECサイト」

## プロジェクト概要

UR-pickは、従来のECサイトが抱える「選択疲れ（Decision Fatigue）」を解消する新しい形のショッピングプラットフォームです。膨大な商品カタログを排除し、ユーザーのリクエストに基づいてAIが厳選した5〜10件の商品のみをTinder型スワイプUIで提示します。

### ターゲットユーザー
- 高齢者（60歳以上）
- 忙しい共働き夫婦（30-40代）
- 選択に疲れた全世代

### 主な特徴
- **Decision Fatigueの解消**: 5〜10件に厳選された商品提示
- **Tinder型UI**: 直感的なスワイプ操作で3〜5倍のコンバージョン率
- **Claude Sonnet 4.5**: 高精度なAIレコメンデーション
- **Apple級のUX**: ミニマルで美しいデザイン

## プロジェクト構造

```
UR-pick/
├── 02_src/                # ソースコード
│   ├── frontend/          # React TypeScript フロントエンド
│   └── backend/           # Node.js Express TypeScript バックエンド
├── 04_tests/              # テストコード
│   ├── frontend/          # フロントエンドテスト
│   └── backend/           # バックエンドテスト
├── .kiro/                 # Kiro仕様管理
│   └── specs/             # 仕様ドキュメント
└── CLAUDE.md              # Claude Code設定
```

## 技術スタック

### フロントエンド
- React 18+ with TypeScript
- Vite (ビルドツール)
- React Router (ルーティング)
- React Spring (アニメーション)
- React Use Gesture (ジェスチャー処理)

### バックエンド
- Node.js with TypeScript
- Express (Webフレームワーク)
- PostgreSQL 15+ (データベース)
- Claude Sonnet 4.5 API (AIレコメンデーション)

### 外部API
- Amazon Product Advertising API
- 楽天市場API
- Yahoo!ショッピングAPI

## セットアップ

### 前提条件
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. データベースのセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベースを作成
CREATE DATABASE urpick;

# スキーマを作成
\i 02_src/backend/schema.sql
```

### 2. バックエンドのセットアップ

```bash
cd 02_src/backend
npm install
cp .env.example .env

# .envファイルを編集して以下を設定：
# - ANTHROPIC_API_KEY: Claude APIキー（必須）
# - DB_PASSWORD: PostgreSQLパスワード（必須）
# - RAKUTEN_APPLICATION_ID: 楽天アプリID（必須）
# - RAKUTEN_AFFILIATE_ID: 楽天アフィリエイトID（必須）
# - YAHOO_CLIENT_ID: Yahoo!クライアントID（必須）
# - AMAZON_*: Amazon PA-API認証情報（オプション）

npm run build
npm run dev
```

バックエンドは http://localhost:3000 で起動します。

### 3. フロントエンドのセットアップ

```bash
cd 02_src/frontend
npm install

# 環境変数は既に設定済み（.env）
npm run dev
```

フロントエンドは http://localhost:5173 で起動します。

### 4. 動作確認

1. ブラウザで http://localhost:5173 を開く
2. 検索ボックスに欲しい商品を入力（例: 「高性能なワイヤレスイヤホン」）
3. スワイプUIで商品を評価
4. 詳細ボタンで商品情報を確認
5. 購入ボタンでアフィリエイトリンクに遷移

## 開発コマンド

### フロントエンド
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint実行
npm run format       # Prettier実行
```

### バックエンド
```bash
npm run dev          # 開発サーバー起動（ホットリロード）
npm run build        # TypeScriptビルド
npm run start        # プロダクション起動
npm run lint         # ESLint実行
npm run format       # Prettier実行
```

## API エンドポイント

### Health Check
- `GET /api/health` - サーバーの状態確認

### Recommendations
- `POST /api/recommendations` - 商品レコメンデーションを取得

**リクエストボディ:**
```json
{
  "query": "高性能なワイヤレスイヤホン",
  "userId": "user-id-optional",
  "maxResults": 10,
  "minPrice": 1000,
  "maxPrice": 50000
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "strategy": "llm-based",
    "count": 10
  },
  "meta": {
    "processingTime": 1234,
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

## レコメンデーション戦略

### ルールベース推薦（新規ユーザー）
- スワイプ数が5回未満のユーザーに適用
- 商品スコアリング:
  - ベーススコア (30%): 評価、レビュー数、価格
  - クエリマッチ (40%): キーワード一致度
  - パーソナライゼーション (30%): ユーザー設定

### LLMベース推薦（リピートユーザー）
- スワイプ数が5回以上のユーザーに適用
- ルールベースで事前フィルタリング（上位30件）
- Claude APIでコンテキストを考慮した選択
- ユーザーの好みを学習してパーソナライズ

## ドキュメント

- [要件定義書](.kiro/specs/ur-pick-platform/requirements.md)
- [技術設計書](.kiro/specs/ur-pick-platform/design.md)
- [実装タスク](.kiro/specs/ur-pick-platform/tasks.md)

## ライセンス

ISC
