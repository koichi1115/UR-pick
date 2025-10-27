import { create } from 'zustand';
import type { Product } from '../types';

/**
 * レコメンデーション状態の型定義
 */
interface RecommendationState {
  // 現在のクエリ
  currentQuery: string;

  // レコメンド商品リスト
  products: Product[];

  // 現在のインデックス（スワイプ中の商品位置）
  currentIndex: number;

  // ローディング状態
  isLoading: boolean;

  // エラー状態
  error: string | null;

  // レコメンデーション戦略（rule-based or llm-based）
  strategy: 'rule-based' | 'llm-based' | null;

  // Actions
  setQuery: (query: string) => void;
  setProducts: (products: Product[], strategy: 'rule-based' | 'llm-based') => void;
  nextProduct: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * レコメンデーション状態管理ストア
 */
export const useRecommendationStore = create<RecommendationState>((set) => ({
  currentQuery: '',
  products: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  strategy: null,

  setQuery: (query) => set({ currentQuery: query }),

  setProducts: (products, strategy) =>
    set({
      products,
      strategy,
      currentIndex: 0,
      error: null,
    }),

  nextProduct: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.products.length - 1),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () =>
    set({
      currentQuery: '',
      products: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
      strategy: null,
    }),
}));
