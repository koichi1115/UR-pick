import { post } from './client';
import type { SwipeAction } from '../types';

/**
 * スワイプリクエストの型定義
 */
export interface SwipeRequest {
  userId: string;
  productId: string;
  action: SwipeAction;
  query: string;
}

/**
 * スワイプレスポンスの型定義
 */
export interface SwipeResponse {
  success: boolean;
  data: {
    swipeId: string;
  };
}

/**
 * スワイプアクションを記録
 * POST /api/swipes
 *
 * Note: このエンドポイントは将来の実装予定
 */
export async function recordSwipe(request: SwipeRequest): Promise<SwipeResponse> {
  return post<SwipeResponse>('/api/swipes', request);
}
