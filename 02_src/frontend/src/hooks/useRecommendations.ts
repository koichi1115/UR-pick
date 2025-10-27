import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecommendationStore, useUserStore, useUIStore } from '../store';
import { getRecommendations } from '../api';
import type { RecommendationRequest } from '../api';

/**
 * レコメンデーション取得用カスタムフック
 */
export function useRecommendations() {
  const navigate = useNavigate();

  const { setQuery, setProducts, setLoading, setError } = useRecommendationStore();
  const { userId } = useUserStore();
  const { showNotification } = useUIStore();

  /**
   * レコメンデーションを取得してスワイプページへ遷移
   */
  const fetchRecommendations = useCallback(
    async (request: Omit<RecommendationRequest, 'userId'>) => {
      try {
        setLoading(true);
        setError(null);

        // クエリを保存
        setQuery(request.query);

        // APIリクエスト
        const response = await getRecommendations({
          ...request,
          userId: userId || undefined,
        });

        // 商品データを保存
        setProducts(response.data.products, response.data.strategy);

        // スワイプページへ遷移
        navigate('/swipe');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'レコメンデーションの取得に失敗しました';

        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    },
    [userId, setQuery, setProducts, setLoading, setError, showNotification, navigate]
  );

  return {
    fetchRecommendations,
  };
}
