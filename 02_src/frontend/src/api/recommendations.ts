import { post } from './client';
import type { Product } from '../types';

/**
 * レコメンデーションリクエストの型定義
 */
export interface RecommendationRequest {
  query: string;
  userId?: string;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * レコメンデーションレスポンスの型定義
 */
export interface RecommendationResponse {
  success: boolean;
  data: {
    products: Product[];
    strategy: 'rule-based' | 'llm-based';
    count: number;
  };
  meta: {
    processingTime: number;
    timestamp: string;
  };
}

/**
 * 商品レコメンデーションを取得
 * POST /api/recommendations
 */
export async function getRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  return post<RecommendationResponse>('/api/recommendations', request);
}
