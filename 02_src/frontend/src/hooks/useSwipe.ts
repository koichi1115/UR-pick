import { useCallback } from 'react';
import { useRecommendationStore, useUserStore, useUIStore } from '../store';
import { recordUserSwipe } from '../api';
import type { SwipeAction } from '../types';

/**
 * スワイプアクション用カスタムフック
 */
export function useSwipe() {
  const { currentQuery, products, currentIndex, nextProduct } = useRecommendationStore();
  const { userId, addSwipe } = useUserStore();
  const { showNotification } = useUIStore();

  /**
   * スワイプアクションを実行
   */
  const swipe = useCallback(
    async (action: SwipeAction) => {
      const currentProduct = products[currentIndex];

      if (!currentProduct) {
        return;
      }

      try {
        // ローカルに記録
        addSwipe(currentProduct.id, action);

        // 次の商品へ
        nextProduct();

        // バックエンドに記録（非同期、エラーは無視）
        if (userId) {
          recordUserSwipe(userId, {
            productId: currentProduct.id,
            action,
            query: currentQuery,
            product: {
              name: currentProduct.name,
              price: currentProduct.price,
              source: currentProduct.source,
              // category and brand would be added if available in product data
            },
          }).catch((error) => {
            console.error('Failed to record swipe:', error);
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'スワイプの記録に失敗しました';

        showNotification(errorMessage, 'error');
      }
    },
    [currentQuery, products, currentIndex, userId, addSwipe, nextProduct, showNotification]
  );

  /**
   * 「気に入った」アクション
   */
  const swipeRight = useCallback(() => {
    return swipe('like');
  }, [swipe]);

  /**
   * 「興味なし」アクション
   */
  const swipeLeft = useCallback(() => {
    return swipe('dislike');
  }, [swipe]);

  return {
    swipe,
    swipeRight,
    swipeLeft,
    currentProduct: products[currentIndex],
    hasMoreProducts: currentIndex < products.length - 1,
  };
}
