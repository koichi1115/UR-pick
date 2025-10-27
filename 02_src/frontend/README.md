# UR-pick Frontend

React 18+ TypeScript フロントエンドアプリケーション

## ディレクトリ構造

```
src/
├── api/                    # API クライアント
│   └── client.ts           # 汎用APIリクエスト関数
├── components/             # Reactコンポーネント
│   ├── atoms/              # 最小単位のコンポーネント（ボタン、入力等）
│   ├── molecules/          # atomsを組み合わせたコンポーネント
│   ├── organisms/          # 機能単位のコンポーネント（カード、フォーム等）
│   └── pages/              # ページコンポーネント
├── hooks/                  # カスタムReact Hooks
├── services/               # ビジネスロジック
├── types/                  # TypeScript型定義
│   ├── product.ts          # 商品関連の型
│   ├── swipe.ts            # スワイプ関連の型
│   └── index.ts            # 型の集約エクスポート
└── utils/                  # ユーティリティ関数
```

## 主要な依存関係

- **React 19**: UIライブラリ
- **React Router**: ページルーティング
- **React Spring**: 物理ベースのアニメーション（スワイプUI）
- **React Use Gesture**: タッチ/マウスジェスチャー処理
- **Vite**: 高速ビルドツール

## 環境変数

`.env`ファイルで設定:

```
VITE_API_BASE_URL=http://localhost:3000
```

## 開発

```bash
npm run dev          # 開発サーバー起動（http://localhost:5173）
npm run build        # プロダクションビルド
npm run lint         # ESLint実行
npm run format       # Prettier実行
```

## 設計原則

- **Atomic Design**: コンポーネントをatoms/molecules/organisms/pagesに分類
- **Type Safety**: 全てのコンポーネントにTypeScript型定義
- **60fps Animation**: React Springによるスムーズなスワイプアニメーション
