import { useState } from 'react';
import { useRecommendations } from '../hooks';
import { useRecommendationStore } from '../store';
import { Button, Input, Card } from '../components/ui';
import './RequestPage.css';

/**
 * RequestPage - 商品リクエスト画面
 * ユーザーが商品検索クエリを入力してレコメンデーションをリクエスト
 */
export default function RequestPage() {
  const [query, setQuery] = useState('');
  const { isLoading } = useRecommendationStore();
  const { fetchRecommendations } = useRecommendations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    await fetchRecommendations({
      query: query.trim(),
      maxResults: 10,
    });
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="request-page">
      <div className="container">
        <h1 className="title">UR-pick</h1>
        <p className="subtitle">欲しいものを伝えてください</p>

        <Card variant="elevated" className="request-card">
          <form onSubmit={handleSubmit} className="request-form">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例: 高性能なワイヤレスイヤホン"
              disabled={isLoading}
              autoFocus
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              isLoading={isLoading}
              disabled={!query.trim()}
            >
              商品を探す
            </Button>
          </form>
        </Card>

        <div className="examples">
          <p className="examples-title">こんな検索ができます：</p>
          <div className="examples-list">
            <button
              type="button"
              className="example-item"
              onClick={() => handleExampleClick('在宅勤務用のおしゃれなデスクライト')}
            >
              在宅勤務用のおしゃれなデスクライト
            </button>
            <button
              type="button"
              className="example-item"
              onClick={() => handleExampleClick('初心者向けのコーヒーメーカー')}
            >
              初心者向けのコーヒーメーカー
            </button>
            <button
              type="button"
              className="example-item"
              onClick={() => handleExampleClick('プレゼント用の高級ボールペン')}
            >
              プレゼント用の高級ボールペン
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
